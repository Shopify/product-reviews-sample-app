import { useQuery } from "@apollo/react-hooks";
import { useMemo } from "react";
import { GET_PRODUCT_BY_ID_QUERY } from "../graphql";

export const useProduct = (productId) => {
  const { data, loading, error } = useQuery(GET_PRODUCT_BY_ID_QUERY, {
    variables: { productId },
    fetchPolicy: "network-only",
  });

  return useMemo(() => ({ product: data?.product, loading, error }), [
    data,
    loading,
    error,
  ]);
};
