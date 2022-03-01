import { useState, useEffect, useCallback } from "react";
import {
  extend,
  render,
  useExtensionInput,
  BlockStack,
  Button,
  CalloutBanner,
  Image,
  Text,
  TextBlock,
  Layout,
  FormLayout,
  Form,
  TextField,
  View,
  InlineStack,
  Radio,
} from "@shopify/post-purchase-ui-extensions-react";
import { FormLayoutGroup } from "@shopify/post-purchase-ui-extensions";

function createUrl(shop, endpoint) {
  /**
   * NOTE: This should reflect your app's ngrok URL (if running locally)
   * or the url of your production app (if pushing/publishing the extension)
   */
  const embeddedAppHost = "https://your-app-host.com";
  return `${embeddedAppHost}/${endpoint}?shop=${shop}`;
}

async function getProduct({ shopDomain, lineItems, referenceId, token }) {
  const url = createUrl(shopDomain, "api/post-purchase/get-product");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      product_id: lineItems[0].product.id,
      reference_id: referenceId,
      token,
    }),
  });
  const product = await res.json();

  return product;
}

/**
 * This `ShouldRender` hook gets called on the last page of the checkout, where the customer enters their credit card data.
 * We must return the object `{ render: true/false }` which will determine if the post-checkout page gets rendered once the purchase is made.
 * If we return `{ render: false }`, the customer will see the "Thank-you" page directly.
 * If we return `{ render: true }`, the post-checkout page is shown as an intermediary page before the "Thank-you" page.
 * This can be used to conditionally render the page, however in our case we want to show it to every customer.
 *
 * In this hook we also have the opportunity to gather information about the product(s) being purchased
 * We can store the product data in the built in `storage` we have access to as one of the callback arguments.
 * In our case, we want to fetch and store the product details so we can display the product image on the next page.
 * We store it by calling `storage.update(data)`
 */
extend(
  "Checkout::PostPurchase::ShouldRender",
  async ({
    inputData: {
      initialPurchase: { lineItems, referenceId },
      token,
      shop: { domain: shopDomain },
    },
    storage,
  }) => {
    /**
     * Here we make a request to the endpoint we created in our main app, where the product details will be fetched by id.
     * The product id can be pulled off of the inputData callback argument: `lineItems[0].product.id`
     * (Note that we only care about prompting a product review for the first product in the checkout, as this is just a sample app)
     *
     * We can not make the product detail request directly in the extension because of CORS. Our main app backend is set up to handle this,
     * and will authenticate and proxy the request to the admin API.
     *
     * In the request body we pass in the productId, as well as the referenceId and token (necessary for authentication).
     * The `shop` param is also required for authentication, but we already have this in the query string (see `createUrl` function).
     */
    const product = await getProduct({
      shopDomain,
      lineItems,
      referenceId,
      token,
    });
    await storage.update(product);

    return { render: true };
  }
);

/**
 * This `Render` hook gets called if `'Checkout::PostPurchase::ShouldRender'` returns `{ render: true }`
 * Here we tell it to render our `<App/>` component. This will be displayed as an iframe inside the post-checkout page.
 */
render("Checkout::PostPurchase::Render", () => <App />);

export function App() {
  /**
   * We use the `useExtensionInput` hook to grab the storage data we saved in the previous page,
   * and use it to show some information about the product.
   * `useExtensionInput` also gives us important `inputData` needed for authenticating API requests,
   * such as `token`, `referenceId` and `shopDomain`.
   */
  const {
    done,
    storage: { initialData },
    inputData: {
      initialPurchase: { lineItems, referenceId },
      token,
      shop: { domain: shopDomain },
    },
  } = useExtensionInput();

  const [progress, setProgress] = useState(null);
  const [author, setAuthor] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState("5");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const ratingOptions = ["1", "2", "3", "4", "5"];

  const [loading, setLoading] = useState(!initialData?.productId);
  const [error, setError] = useState(null);
  const [data, setData] = useState(initialData || {});

  const fetchProduct = useCallback(async () => {
    setLoading(true);

    try {
      const response = await getProduct({
        shopDomain,
        lineItems,
        referenceId,
        token,
      });

      setData(response);
    } catch {
      setError("Failed to load product info 😱");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!data?.productId) {
      fetchProduct();
    }
  }, [data]);

  async function submitReview() {
    setProgress("SUBMITTING");
    const review = {
      product_id: data.productId,
      review: {
        rating,
        author,
        email,
        title,
        body,
      },
    };

    /**
     * Now we make a request the endpoint in our main app, which creates a new review.
     * This is the same endpoint that's used when a customer submits a review from the storefront (product detail page).
     * In the request body we pass in the form data, as well as the referenceId and token (necessary for authentication).
     * The `shop` param is also required for authenticating, but we already have this in the query string (see `createUrl` function).
     */
    const url = createUrl(shopDomain, "api/post-purchase/reviews");
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...review,
        reference_id: referenceId,
        token,
      }),
    });

    /**
     * We call the `done` function when we are ready to move on to the "Thank-you" page.
     * This function comes from the `useExtensionInput` hook.
     */
    done();
  }

  function declineReview() {
    setProgress("DECLINING");
    /**
     * No action is required, so we call the `done` function to move on to the "Thank-you" page.
     */
    done();
  }

  if (loading) {
    return (
      <BlockStack spacing="loose" alignment="center">
        <Text size="medium">Loading Product...</Text>
      </BlockStack>
    );
  }

  if (error) {
    return (
      <BlockStack spacing="loose" alignment="center">
        <Text size="medium">{error}</Text>
      </BlockStack>
    );
  }

  return (
    /**
     * We must use components from the `post-purchase-ui-extensions-react` packages, since they are designed to
     * work inside the post-checkout iframe. If we try to use regular html elements, an error with be thrown.
     */
    <BlockStack spacing="loose">
      <CalloutBanner title="This is a sample">
        <Text size="medium">Share your feedback about {data.productTitle}</Text>
      </CalloutBanner>
      <Layout
        media={[
          { viewportSize: "small", sizes: [1, 0, 1], maxInlineSize: 0.9 },
          { viewportSize: "medium", sizes: [532, 0, 1], maxInlineSize: 420 },
          { viewportSize: "large", sizes: [560, 38, 340] },
        ]}
      >
        <View padding="base">
          <BlockStack alignment="center">
            <TextBlock size="xlarge">
              Wow - {`"${data.productTitle}"`} already arrived!
            </TextBlock>
            <TextBlock size="large">
              Aren&apos;t those new delivery drones awesome?
            </TextBlock>
            {data.productImageURL.length !== 0 && (
              <Image
                description="product photo"
                source={data.productImageURL}
              />
            )}
          </BlockStack>
        </View>
        <Form>
          <View padding="base">
            <FormLayout>
              <BlockStack alignment="center">
                <TextBlock subdued>
                  Your feedback will be published to help future customers
                </TextBlock>
              </BlockStack>
              <FormLayoutGroup>
                <TextField
                  label="Name"
                  value={author}
                  onChange={setAuthor}
                  type="text"
                />
                <TextField
                  label="Email"
                  value={email}
                  onChange={setEmail}
                  type="text"
                />
              </FormLayoutGroup>
              <TextField
                label="Title"
                value={title}
                onChange={setTitle}
                type="text"
              />
              <TextField
                label="Comment"
                value={body}
                onChange={setBody}
                type="text"
                multiline
              />
              <BlockStack alignment="center">
                <Text>Rating</Text>
                <InlineStack>
                  {ratingOptions.map((option) => (
                    <Radio
                      key={option}
                      name="rating"
                      value={rating === option}
                      onChange={() => setRating(option)}
                    >
                      {option}
                    </Radio>
                  ))}
                </InlineStack>
              </BlockStack>
              <View padding="base">
                <BlockStack>
                  <Button
                    onPress={submitReview}
                    disabled={progress !== null}
                    loading={progress === "SUBMITTING"}
                  >
                    Submit Review
                  </Button>
                  <Button
                    onPress={declineReview}
                    subdued
                    disabled={progress !== null}
                    loading={progress === "DECLINING"}
                  >
                    No Thanks
                  </Button>
                </BlockStack>
              </View>
            </FormLayout>
          </View>
        </Form>
      </Layout>
    </BlockStack>
  );
}
