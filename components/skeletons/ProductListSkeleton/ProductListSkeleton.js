import {
  Card,
  SkeletonBodyText,
  SkeletonThumbnail,
  Stack,
} from "@shopify/polaris";

const ProductItemSkeleton = () => {
  return (
    <Card.Section>
      <Stack>
        <SkeletonThumbnail />
        <Stack.Item fill>
          <SkeletonBodyText lines={2} />
        </Stack.Item>
      </Stack>
    </Card.Section>
  );
};

export const ProductListSkeleton = ({ productCount }) => (
  <>
    {Array.from({ length: productCount }).map((_item, i) => (
      <ProductItemSkeleton key={i} />
    ))}
  </>
);
