import gql from "graphql-tag";

/**
 * This mutation adds a new metafield to a specific
 * product
 */
export const PRODUCT_METAFIELD_CREATE = gql`
  mutation ProductMetafieldCreate($input: ProductInput!) {
    productUpdate(input: $input) {
      userErrors {
        field
        message
      }
    }
  }
`;
