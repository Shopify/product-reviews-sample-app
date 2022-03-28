import { useCallback, useMemo } from "react";
import {
  Page,
  Layout,
  Thumbnail,
  Card,
  Stack,
  TextStyle,
  TextContainer,
} from "@shopify/polaris";
import { find } from "lodash";
import { useRouter } from "next/router";
import { generateShopifyProductGid } from "../../../utilities/metafields";
import { ReviewList, Rating, ProductInfoSkeleton } from "components";
import {
  useDeleteReviews,
  useProductReviews,
  usePublishReviews,
  useUnpublishReviews,
  useProduct,
} from "hooks";
import { ROUTES } from "../../../constants";

/**
 * This page is accessible via `/products/:id`
 * and displays all of the reviews for a single product
 */
const ProductReviews = () => {
  const { push, query } = useRouter();
  /**
   * The `state` query param is used to set the active tab.
   * We default to "published".
   */
  const { id: productId, state = "published" } = query;
  /**
   * We must make the graphQL query using the shopify Gid (e.g: gid://shopify/Product/12345)
   * So we first format the id in the query string using our utility function
   * and use this to fetch the product data we want to diplay (thumbnail image and title)
   */
  const shopifyProductGid = generateShopifyProductGid(productId);
  const { product, loading: productLoading, error } = useProduct(
    shopifyProductGid
  );

  /**
   * Fetch the reviews by productId and state
   * E.g: all published reviews for the product with id = '12345'
   * We do this as a separate query from the one above, so we don't have to fetch the
   * product info again and again each time we update the reviews.
   *
   * The `refetchReviews` function allows us to query the data again
   * after publishing/unpublishing/deleting,
   * to dynamically update the page with the latest review list.
   */
  const {
    reviews,
    refetch: refetchReviews,
    loading: reviewsLoading,
  } = useProductReviews({
    productId: shopifyProductGid,
    state,
  });

  const { publishAll, loading: publishing } = usePublishReviews();
  const { unpublishAll, loading: unpublishing } = useUnpublishReviews();
  const { deleteAll, loading: deleting } = useDeleteReviews();

  const handleBulkAction = useCallback(
    async (ids, bulkAction) => {
      const reviewMetafields = ids.map((id) => find(reviews, { id }));
      await bulkAction({ productId: shopifyProductGid, reviewMetafields });
      await refetchReviews();
    },
    [reviews, shopifyProductGid, refetchReviews]
  );

  /**
   * These actions are needed by the child `<ReviewList />` component.
   * The format matches the prop type expected by the Polaris `<ResourceList />`
   * https://polaris.shopify.com/components/lists-and-tables/resource-list/bulkActions
   */
  const bulkActions = useMemo(() => {
    const unpublishAction = {
      content: "Unpublish Selected",
      onAction: (ids) => handleBulkAction(ids, unpublishAll),
    };
    const publishAction = {
      content: "Publish Selected",
      onAction: (ids) => handleBulkAction(ids, publishAll),
    };

    return [
      state === "published" ? unpublishAction : publishAction,
      {
        content: "Delete Selected",
        onAction: (ids) => handleBulkAction(ids, deleteAll),
      },
    ];
  }, [state, unpublishAll, publishAll, deleteAll, handleBulkAction]);

  const handleTabChange = useCallback(
    (newState) => {
      push({
        pathname: `/products/${productId}`,
        query: { state: newState },
      });
    },
    [push, productId]
  );

  const productInfoMarkup = useMemo(() => {
    if (productLoading)
      return (
        <Layout.Section>
          <Card sectioned>
            <ProductInfoSkeleton />
          </Card>
        </Layout.Section>
      );

    if (error)
      return (
        <Layout.Section>
          <Card sectioned>
            <p>{error.message}</p>
          </Card>
        </Layout.Section>
      );

    const productThumbnailUrl = product?.featuredImage?.originalSrc || "";
    let avgRating = 0;
    try {
      avgRating = JSON.parse(product?.avgRatingMetafield?.value).value;
    } catch (e) {
      console.log(
        "averageRating not yet set, this is expected, you must approve reviews first."
      );
    }

    return (
      <Layout.Section>
        <Card
          title={product.title}
          sectioned
          actions={[
            {
              content: "Create Review",
              url: `/products/${productId}/create-review`,
            },
          ]}
        >
          <Stack alignment="center">
            <Stack.Item>
              {/**
               * Setting the alt tag to an empty string means to screenreader will ignore it
               * This is the standard when the image is decorative and
               * does not convey any additional information
               * https://www.w3.org/WAI/test-evaluate/preliminary/#images
               */}
              <Thumbnail source={productThumbnailUrl} alt="" />
            </Stack.Item>
            <Stack.Item>
              <TextContainer spacing="tight">
                <TextStyle variation="strong">Overall Rating</TextStyle>
                <Rating value={avgRating} />
              </TextContainer>
            </Stack.Item>
          </Stack>
        </Card>
      </Layout.Section>
    );
  }, [productLoading, error, product]);

  return (
    <Page
      title="Sample Reviews"
      breadcrumbs={[
        {
          url: ROUTES.products,
          accessibilityLabel: "Go back to previous page",
        },
      ]}
    >
      <Layout>
        {productInfoMarkup}
        <Layout.Section>
          <Card>
            <ReviewList
              state={state}
              reviews={reviews}
              loading={reviewsLoading}
              processing={publishing || unpublishing || deleting}
              onTabChange={handleTabChange}
              bulkActions={bulkActions}
            />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default ProductReviews;
