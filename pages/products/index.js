import { useState, useMemo } from "react";
import {
  Page,
  Layout,
  Card,
  ResourceList,
  Heading,
  Thumbnail,
  EmptyState,
  Filters,
} from "@shopify/polaris";
import { ImageMajor } from "@shopify/polaris-icons";
import { ResourcePicker } from "@shopify/app-bridge-react";
import { useRouter } from "next/router";
import { Rating } from "components";
import { useProducts } from "hooks";
import { extractIdFromGid } from "utilities/metafields";

const renderItem = ({ id, name, url, media, avgRating }) => {
  let ratingToShow = 0;
  try {
    ratingToShow = JSON.parse(avgRating?.value).value;
  } catch (e) {
    console.log(
      "Publish a review of",
      name,
      "to have the average review show."
    );
  }

  return (
    <ResourceList.Item
      id={id}
      url={url}
      media={media}
      accessibilityLabel={`View details for ${name}`}
    >
      <Heading element="h2">{name}</Heading>
      <Rating value={ratingToShow} />
    </ResourceList.Item>
  );
};

/**
 * This page is accessed via '/products'
 * Next.js has a file-system based router
 * See https://nextjs.org/docs/routing/introduction for more information
 */
const Products = () => {
  const router = useRouter();
  const { id } = router.query;
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  // Read more about Shopify API search syntax at https://shopify.dev/concepts/about-apis/search-syntax
  const [queryValue, setQueryValue] = useState("");
  const { products, loading } = useProducts({ query: queryValue });

  // router.{method} is explicitly a client-side method and SSR would crash without this window check.
  if (id) {
    if (typeof window === "object") {
      // redirect to specific product if its id is present in query params of page
      router.replace(`${router.pathname}/${id}`);
    }

    // prevents "flashing" of products list
    return null;
  }

  const onSelection = ({ selection = [] }) => {
    /**
     * `selection` is always an array.
     * We have `selectMultiple: false`, so we know we can just grab
     * the item at index 0, since there is only 1 item.
     */
    const productDetails = selection[0];
    setIsPickerOpen(false);
    const productId = extractIdFromGid(productDetails.id);
    router.push(`/products/${productId}/create-review`);
  };

  const items = useMemo(() => {
    return products.map(({ id, title, featuredImage, avgRatingMetafield }) => ({
      id,
      name: title,
      url: `products/${extractIdFromGid(id)}`,
      media: (
        <Thumbnail
          source={featuredImage?.originalSrc || ImageMajor}
          alt={title}
        />
      ),
      avgRating: avgRatingMetafield,
    }));
  }, [products]);

  /**
   * The content of the `emptyState` prop gets displayed when the `items` prop is empty.
   * If no `emptyState` is defined, a default "No {resourceName} found" message will show.
   *
   * Here we show the default if the search query returns no results, but a custom message
   * if there are simply no products with reviews yet.
   */
  const emptyStateMarkup = useMemo(() => {
    if (queryValue) return;

    return (
      <EmptyState
        heading="You don't have any products with reviews yet"
        image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
      >
        <p>
          Once you have products with reviews they will display on this page.
        </p>
      </EmptyState>
    );
  }, [queryValue]);

  return (
    <Page
      title="Reviewed Products"
      primaryAction={{
        content: "Create Review",
        onAction: () => setIsPickerOpen(true),
      }}
    >
      <ResourcePicker
        resourceType="Product"
        showVariants={false}
        selectMultiple={false}
        open={isPickerOpen}
        onSelection={onSelection}
        onCancel={() => setIsPickerOpen(false)}
        initialQuery={queryValue}
        actionVerb="select"
      />
      <Layout>
        <Layout.Section>
          <Card>
            <ResourceList
              resourceName={{ singular: "product", plural: "products" }}
              showHeader
              emptyState={emptyStateMarkup}
              items={items}
              renderItem={renderItem}
              loading={loading}
              filterControl={
                <Filters
                  filters={[]}
                  queryValue={queryValue}
                  onQueryChange={setQueryValue}
                  onQueryClear={() => setQueryValue(null)}
                />
              }
            />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default Products;
