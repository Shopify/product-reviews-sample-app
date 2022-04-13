import "isomorphic-fetch";
import { nanoid } from "nanoid";
import { METAFIELD_NAMESPACE } from "../../../constants";
import { PRODUCT_METAFIELD_CREATE } from "../../../graphql";
import { generateShopifyProductGid } from "../../../utilities/metafields";

export const addReview = async (client, payload) => {
  const {
    product_id: productId,
    review: { rating, author, email, title, body },
  } = payload;

  // We need to validate and sanitize the user input
  const review = {
    id: nanoid(),
    rating,
    title,
    body,
    name: author,
    email,
    created_at: new Date(),
    state: "unpublished",
  };

  // Create metafield for the draft review and attach it to the given product
  await client.mutate({
    mutation: PRODUCT_METAFIELD_CREATE,
    variables: {
      input: {
        id: generateShopifyProductGid(productId),
        metafields: [
          {
            key: review.id,
            namespace: METAFIELD_NAMESPACE.privateReviews,
            value: JSON.stringify(review),
            type: "json",
          },
        ],
      },
    },
  });
};
