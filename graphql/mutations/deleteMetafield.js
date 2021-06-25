import gql from "graphql-tag";

/**
 * This mutation deletes a metafield from any resource.
 * The metafield is located by its id.
 */
export const METAFIELD_DELETE = gql`
  mutation MetafieldDelete($input: MetafieldDeleteInput!) {
    metafieldDelete(input: $input) {
      deletedId
      userErrors {
        field
        message
      }
    }
  }
`;
