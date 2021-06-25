import { useCallback } from "react";
import { useMetafieldDelete } from "./useMetafieldDelete";
import { useProductMetafieldCreate } from "./useProductMetafieldCreate";

export const useProductMetafieldUpdate = () => {
  const deleteMetafield = useMetafieldDelete();
  const createProductMetafield = useProductMetafieldCreate();

  return useCallback(
    async ({ productId, ogMetafieldId, metafield }, options = {}) => {
      await deleteMetafield({ id: ogMetafieldId });
      await createProductMetafield({ productId, metafield }, options);
    },
    [deleteMetafield, createProductMetafield]
  );
};
