import { useMutation } from "@apollo/react-hooks";
import { useCallback } from "react";
import { METAFIELD_DELETE } from "../graphql";

/**
 * We can delete a metafield directly from any resource
 * as long as we have the metafield id.
 */
export const useMetafieldDelete = () => {
  const [deleteMetafieldMutation] = useMutation(METAFIELD_DELETE);

  return useCallback(
    async ({ id }, options = {}) => {
      const mutationResult = await deleteMetafieldMutation({
        variables: { input: { id } },
        ...options,
      });
      const { data } = mutationResult;
      const userErrors = data?.metafieldDelete?.userErrors;

      if (userErrors?.length) {
        throw userErrors;
      }

      return mutationResult;
    },
    [deleteMetafieldMutation]
  );
};
