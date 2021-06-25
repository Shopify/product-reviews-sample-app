import async from "async";
import Shopify from "@shopify/shopify-api";
import {
  createClient,
  getProductQueueMessages,
  deleteQueueMessages,
  getProductRatings,
  updateProductRatings,
  updateProductAvgRating,
} from "../handlers";
import {
  calculateProductRatings,
  calculateWeightedAverageRating,
} from "../utilities";
import { MESSAGE_TYPE } from "../../constants";

// An in-memory queue was used as an example here.
// This should be replaced with your preferred background processing strategy
const jobQueue = async.queue(performProductUpdateOperations, 1);

export function enqueueProductUpdateJob(shop, product) {
  jobQueue.push({ shop, product });
}

// In this sample application, the "products/update" webhook call is used
// to trigger the product average rating calculation
export async function performProductUpdateOperations(
  { shop, product },
  callback
) {
  const { admin_graphql_api_id: productGid, id: productId } = product;

  const session = await Shopify.Utils.loadOfflineSession(shop);
  const client = createClient(session.shop, session.accessToken);

  // We emulate how a message broker works.
  // Here we retrieve all messages/events that were dispatched for a
  // given product regarding publishing, unpublishing or deleting.
  const messages = await getProductQueueMessages(client, productGid);
  const ratingUpdateMessages = getRatingUpdateMessages(messages);

  if (ratingUpdateMessages.length > 0) {
    // We first fetch the product ratings.
    // It has the following structure: {1: {weight: 1, total: 1}, 2: {weight: 2, total: 6}, ...}
    const ratings = await getProductRatings(client, productGid);
    // We calculate new ratings based on the rating update messages
    const newRatings = calculateProductRatings(ratingUpdateMessages, ratings);
    // And, based on the ratings, a new average rating is calculated
    const newAverageRating = calculateWeightedAverageRating(newRatings);

    // Both product ratings and product average rating metafields can now be updated
    await updateProductRatings(client, productGid, newRatings);
    await updateProductAvgRating(client, productGid, newAverageRating);
  }

  // Queue messages will be deleted after they are processed
  await deleteQueueMessages(client, messages);
  callback();
}

// Returns all messages that qualify for product average rating recalculation.
// Each message contains a type ("review_published", "review_unpublished" or "review_deleted")
// and a snapshot of the review at the time the event was triggered
function getRatingUpdateMessages(messages) {
  return messages.filter((message) => {
    const {
      value: {
        type,
        data: { review_snapshot: reviewSnapshot },
      },
    } = message;

    const isPublishedDelete =
      MESSAGE_TYPE.reviewDeleted === type &&
      reviewSnapshot.state === "published";

    const publishOrUnpublish = [
      MESSAGE_TYPE.reviewPublished,
      MESSAGE_TYPE.reviewUnpublished,
    ].includes(type);

    return isPublishedDelete || publishOrUnpublish;
  });
}
