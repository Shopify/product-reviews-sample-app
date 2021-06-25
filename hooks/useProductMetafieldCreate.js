import { useMutation } from "@apollo/react-hooks";
import { useCallback } from "react";
import { PRODUCT_METAFIELD_CREATE } from "../graphql";

export const useProductMetafieldCreate = () => {
  const [createProductMetafieldMutation] = useMutation(
    PRODUCT_METAFIELD_CREATE
  );

  return useCallback(
    async ({ productId, metafield }, options = {}) => {
      const mutationResult = await createProductMetafieldMutation({
        variables: { input: { id: productId, metafields: [metafield] } },
        ...options,
      });
      const { data } = mutationResult;
      const userErrors = data?.productUpdate?.userErrors;

      if (userErrors?.length) {
        throw userErrors;
      }

      return mutationResult;
    },
    [createProductMetafieldMutation]
  );
};
