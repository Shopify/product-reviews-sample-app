import gql from "graphql-tag";

/**
 * For the purpose of this sample app we are only returning the first 10
 * published or unpublished reviews.
 *
 * In a real app it is recommended to use pagination.
 * More details can be found here: https://shopify.dev/concepts/graphql/pagination
 */
export const GET_PRODUCT_METAFIELDS_QUERY = gql`
  query GetProductMetafields($productId: ID!, $namespace: String!) {
    product(id: $productId) {
      id
      metafields(namespace: $namespace, first: 10) {
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
