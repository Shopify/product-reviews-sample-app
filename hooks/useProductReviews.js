import { useQuery } from "@apollo/react-hooks";
import { useMemo } from "react";
import { METAFIELD_NAMESPACE } from "../constants";
import { GET_PRODUCT_METAFIELDS_QUERY } from "../graphql";
import { getNodesFromConnections } from "../utilities/graphql";

export const useProductReviews = ({ productId, state = "published" }) => {
  const namespace =
    state === "published"
      ? METAFIELD_NAMESPACE.publicReviews
      : METAFIELD_NAMESPACE.privateReviews;

  const { data, loading, refetch } = useQuery(GET_PRODUCT_METAFIELDS_QUERY, {
    variables: { productId, namespace },
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  });

  const reviews = useMemo(() => {
    if (!data) {
      return [];
    }

    const nodes = getNodesFromConnections(data.product.metafields);

    return nodes.map((node) => ({ ...node, value: JSON.parse(node.value) }));
  }, [data]);

  return { reviews, loading, refetch };
};
