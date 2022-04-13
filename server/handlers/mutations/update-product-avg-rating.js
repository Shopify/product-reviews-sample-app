import "isomorphic-fetch";
import { gql } from "apollo-boost";
import { METAFIELD_DELETE, PRODUCT_METAFIELD_CREATE } from "../../../graphql";
import {
  METAFIELD_KEY,
  METAFIELD_NAMESPACE,
  MAX_RATING,
  MIN_RATING,
} from "../../../constants";

const GET_PRODUCT_AVG_RATING_METAFIELD = gql`
  query GetProductAvgRatingMetafield($productId: ID!) {
    product(id: $productId) {
      avgRatingMetafield: metafield(
        namespace: "${METAFIELD_NAMESPACE.standardRating}",
        key: "${METAFIELD_KEY.ratings}"
      ) {
        id
        key
        namespace
        value
        type
      }
    }
  }
`;

export const updateProductAvgRating = async (client, productId, avgRating) => {
  const { data } = await client.query({
    query: GET_PRODUCT_AVG_RATING_METAFIELD,
    variables: { productId },
  });

  const ogMetafieldId = data?.product?.avgRatingMetafield?.id;

  // We skip the original metafield deletion in case it doesn't exist
  if (ogMetafieldId) {
    await client.mutate({
      mutation: METAFIELD_DELETE,
      variables: { input: { id: ogMetafieldId } },
    });
  }

  await client.mutate({
    mutation: PRODUCT_METAFIELD_CREATE,
    variables: {
      input: {
        id: productId,
        metafields: [
          {
            namespace: METAFIELD_NAMESPACE.standardRating,
            key: METAFIELD_KEY.ratings,
            value: JSON.stringify({
              value: avgRating,
              scale_min: MIN_RATING,
              scale_max: MAX_RATING,
            }),
            type: "json",
          },
        ],
      },
    },
  });
};
