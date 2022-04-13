import { useCallback, useState } from "react";
import { METAFIELD_NAMESPACE } from "../constants";
import { useProduceProductMessage } from "./useProduceProductMessage";
import { useProductMetafieldUpdate } from "./useProductMetafieldUpdate";

export const usePublishReviews = () => {
  const [loading, setLoading] = useState(false);
  const { produceReviewPublishedMessage } = useProduceProductMessage();
  const updateProductMetafield = useProductMetafieldUpdate();

  const publishReview = useCallback(
    async ({ productId, reviewMetafield }) => {
      await produceReviewPublishedMessage({ productId, reviewMetafield });
      await updateProductMetafield({
        productId,
        ogMetafieldId: reviewMetafield.id,
        metafield: {
          key: reviewMetafield.key,
          namespace: METAFIELD_NAMESPACE.publicReviews,
          value: JSON.stringify({
            ...reviewMetafield.value,
            state: "published",
          }),
          type: reviewMetafield.type,
        },
      });
    },
    [produceReviewPublishedMessage, updateProductMetafield]
  );

  const publishAll = useCallback(
    async ({ productId, reviewMetafields }) => {
      setLoading(true);

      try {
        await Promise.all(
          reviewMetafields.map((reviewMetafield) =>
            publishReview({ productId, reviewMetafield })
          )
        );
      } catch (err) {
        console.error(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [publishReview]
  );

  return { publishAll, loading };
};
