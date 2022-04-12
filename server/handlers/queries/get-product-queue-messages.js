import "isomorphic-fetch";
import { gql } from "apollo-boost";
import { METAFIELD_NAMESPACE } from "../../../constants";

const GET_PRODUCT_QUEUE_MESSAGES = gql`
  query GetProductEnqueuedMessages($productId: ID!) {
    product(id: $productId) {
      metafields(
        namespace: "${METAFIELD_NAMESPACE.messages}", 
        reverse: true, 
        first: 10
      ) {
        edges {
          node {
            id
            key
            value
            type
          }
        }
      }
    }
  }
`;

// Returns the first 10 messages enqueued for a given product.
// Each message contains a type ("review_published", "review_unpublished" or "review_deleted")
// and a snapshot of the review at the time the event was triggered.
export const getProductQueueMessages = async (client, productId) => {
  return client
    .query({
      query: GET_PRODUCT_QUEUE_MESSAGES,
      variables: { productId },
    })
    .then((response) => {
      const { data } = response;

      // We map the metafield nodes and already JSON.parse the content inside the value field
      return data.product.metafields.edges.map(({ node }) => ({
        ...node,
        value: JSON.parse(node.value),
      }));
    });
};
