import { useQuery } from "@apollo/react-hooks";
import { useMemo } from "react";
import { GET_PRODUCTS_QUERY } from "../graphql";
import { getNodesFromConnections } from "../utilities/graphql";

export const useProducts = ({ query = "" } = {}) => {
  const { data, loading } = useQuery(GET_PRODUCTS_QUERY, {
    variables: { query },
    fetchPolicy: "network-only",
  });

  const products = useMemo(() => {
    if (!data) {
      return [];
    }

    const nodes = getNodesFromConnections(data.products);

    return nodes
      .map((node) => ({
        ...node,
        // Average rating value is stored within a Product's public metafield
        avgRating: node?.avgRatingMetafield?.value,
        hasReviews: Boolean(
          [
            ...getNodesFromConnections(node.publicReviews),
            ...getNodesFromConnections(node.privateReviews),
          ].length
        ),
      }))
      .filter((node) => node.hasReviews);
  }, [data]);

  return useMemo(() => ({ products, loading }), [products, loading]);
};
