# Review creation

Reviews are scoped by product and have their own metafield instance. Metafields must have a unique key and we use the [nanoid](https://github.com/ai/nanoid) package to generate unique identifiers (collision odds can be calculated using the following tool https://zelark.github.io/nano-id-cc/).

We created the `[POST] /api/reviews` REST endpoint that receives requests coming from the online-store to create unpublished reviews and for that we leverage the [App Proxy extension](https://shopify.dev/apps/online-store/app-proxies).

An app proxy is a setting that Shopify apps can use to route requests from a shop’s domain to any url of the app’s choosing. When proxying a request, Shopify sends a signature query param that can then be used by the receiving app to verify that the request was in-fact sent by Shopify ([how to verify Shopify’s digital signature](https://shopify.dev/apps/online-store/app-proxies#calculate-a-digital-signature)) and therefore we can secure that endpoint. It can also aid us on preventing any [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) issues.

## Flow

- We will have a write review form being rendered in the online store.
- Once submitted, a POST request containing the form filled data will be sent to `{store_url}/{subpath_prefix}/{sub_path}/api/reviews`.
- Shopify will proxy this request to our application including the signature and shop query params.
- We will verify the given signature and if valid we will process the request and create the draft review.

---

We also added a way to [create reviews](/pages/products/[id]/create-review.js) from within the embedded app to showcase the usage of key components like the [Shopify App Bridge ResourcePicker](https://shopify.dev/apps/tools/app-bridge/actions/resourcepicker) and to aid us testing the sample app as we moved along.
