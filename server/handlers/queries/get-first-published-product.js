import { gql } from "apollo-boost";
import { getNodesFromConnections } from "../../../utilities/graphql";

export const GET_FIRST_PUBLISHED_PRODUCT_QUERY = gql`
  query GetFirstPublishedProduct {
    products(first: 1, query: "published_status:published") {
      edges {
        node {
          id
          title
          handle
        }
      }
    }
  }
`;

export const getFirstPublishedProduct = (client) => {
  return client
    .query({ query: GET_FIRST_PUBLISHED_PRODUCT_QUERY })
    .then((response) => {
      return getNodesFromConnections(response.data.products)?.[0];
    });
};
