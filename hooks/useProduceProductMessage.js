import { nanoid } from "nanoid";
import { useCallback, useMemo } from "react";
import { MESSAGE_TYPE, METAFIELD_NAMESPACE } from "../constants";
import { useProductMetafieldCreate } from "./useProductMetafieldCreate";

export const useProduceProductMessage = () => {
  const createProductMetafield = useProductMetafieldCreate();

  const produceProductMessage = useCallback(
    async (type, { productId, reviewMetafield }) => {
      return createProductMetafield({
        productId,
        metafield: {
          namespace: METAFIELD_NAMESPACE.messages,
          key: nanoid(),
          value: JSON.stringify({
            type,
            data: { review_snapshot: reviewMetafield.value },
          }),
          type: "json",
        },
      });
    },
    [createProductMetafield]
  );

  const produceReviewPublishedMessage = useMemo(
    () => produceProductMessage.bind(null, MESSAGE_TYPE.reviewPublished),
    [produceProductMessage]
  );

  const produceReviewUnpublishedMessage = useMemo(
    () => produceProductMessage.bind(null, MESSAGE_TYPE.reviewUnpublished),
    [produceProductMessage]
  );

  const produceReviewDeletedMessage = useMemo(
    () => produceProductMessage.bind(null, MESSAGE_TYPE.reviewDeleted),
    [produceProductMessage]
  );

  return {
    produceReviewPublishedMessage,
    produceReviewUnpublishedMessage,
    produceReviewDeletedMessage,
  };
};
