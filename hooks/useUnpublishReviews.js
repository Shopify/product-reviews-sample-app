import { useCallback, useState } from "react";
import { METAFIELD_NAMESPACE } from "../constants";
import { useProductMetafieldUpdate } from "./useProductMetafieldUpdate";
import { useProduceProductMessage } from "./useProduceProductMessage";

export const useUnpublishReviews = () => {
  const [loading, setLoading] = useState(false);
  const { produceReviewUnpublishedMessage } = useProduceProductMessage();
  const updateProductMetafield = useProductMetafieldUpdate();

  const unpublishReview = useCallback(
    async ({ productId, reviewMetafield }) => {
      await produceReviewUnpublishedMessage({ productId, reviewMetafield });
      await updateProductMetafield({
        productId,
        ogMetafieldId: reviewMetafield.id,
        metafield: {
          key: reviewMetafield.key,
          namespace: METAFIELD_NAMESPACE.privateReviews,
          value: JSON.stringify({
            ...reviewMetafield.value,
            state: "unpublished",
          }),
          type: reviewMetafield.type,
        },
      });
    },
    [produceReviewUnpublishedMessage, updateProductMetafield]
  );

  const unpublishAll = useCallback(
    async ({ productId, reviewMetafields }) => {
      setLoading(true);

      try {
        await Promise.all(
          reviewMetafields.map((reviewMetafield) =>
            unpublishReview({ productId, reviewMetafield })
          )
        );
      } catch (err) {
        console.error(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [unpublishReview]
  );

  return { unpublishAll, loading };
};
