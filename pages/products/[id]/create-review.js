import { Page, Layout, Thumbnail, Stack, TextStyle } from "@shopify/polaris";
import { useRouter } from "next/router";
import { generateShopifyProductGid } from "../../../utilities/metafields";
import { useMemo } from "react";
import { useProduct } from "hooks";

import { ReviewForm, ProductInfoSkeleton } from "components";

/**
 * This page is accessed via '/products/:id/create-review
 */
const CreateReview = () => {
  const { query, back } = useRouter();
  const { id: productId } = query;
  const shopifyProductGid = generateShopifyProductGid(productId);
  const { product, loading: productLoading, error } = useProduct(
    shopifyProductGid
  );
  const productInfoMarkup = useMemo(() => {
    if (productLoading) return <ProductInfoSkeleton />;
    if (error)
      return <TextStyle variation="negative">{error.message}</TextStyle>;

    if (product) {
      const imageURL = product.featuredImage?.originalSrc;
      return (
        <Stack alignment="center">
          {/**
           * Setting the alt tag to an empty string means to screenreader will ignore it
           * This is the standard when the image is decorative and
           * does not convey any additional information
           * https://www.w3.org/WAI/test-evaluate/preliminary/#images
           */}
          {imageURL && <Thumbnail source={imageURL} alt="" />}
          <TextStyle variation="strong">
            You are reviewing: "{product.title}"
          </TextStyle>
        </Stack>
      );
    } else {
      return (
        <TextStyle variation="subdued">Product details not available</TextStyle>
      );
    }
  }, [productLoading, error, product]);

  return (
    <Page
      title="New Draft Review"
      breadcrumbs={[
        {
          onAction: back,
          accessibilityLabel: "Go back to previous page",
        },
      ]}
    >
      <Layout>
        <Layout.Section>
          <ReviewForm productInfo={productInfoMarkup} productId={productId} />
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default CreateReview;
