import { useCallback, useState } from "react";
import { useMetafieldDelete } from "./useMetafieldDelete";
import { useProduceProductMessage } from "./useProduceProductMessage";

export const useDeleteReviews = () => {
  const [loading, setLoading] = useState(false);
  const deleteMetafield = useMetafieldDelete();
  const { produceReviewDeletedMessage } = useProduceProductMessage();

  const deleteReview = useCallback(
    async ({ productId, reviewMetafield }) => {
      await produceReviewDeletedMessage({ productId, reviewMetafield });
      await deleteMetafield({ id: reviewMetafield.id });
    },
    [produceReviewDeletedMessage, deleteMetafield]
  );

  const deleteAll = useCallback(
    async ({ productId, reviewMetafields }) => {
      setLoading(true);

      try {
        await Promise.all(
          reviewMetafields.map((reviewMetafield) =>
            deleteReview({ productId, reviewMetafield })
          )
        );
      } catch (err) {
        console.error(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [deleteReview]
  );

  return { deleteAll, loading };
};
