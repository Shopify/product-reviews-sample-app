# Authentication

In order to keep transactions on Shopify’s platform safe and secure, all apps connecting with our APIs must authenticate when making API calls.

When a token is created, we can choose between two different access modes:

- [Online access](https://shopify.dev/apps/auth#online-access): tokens with online access mode are linked to an individual user on a store, where the access token's lifespan matches the lifespan of the user's web session. This type of access mode is meant to be used when a user is interacting with your app through the web, or when an app must respect an individual user's permission level.
- [Offline access](https://shopify.dev/apps/auth#offline-access): tokens with offline access mode are meant for long term access to a store, where no user interaction is involved. Offline access mode is ideal for background work in response to webhooks, or for maintenance work in backgrounded jobs.

This sample application is using the two authentication access modes simultaneously, the online access mode is mainly used as means of authentication within the embedded app and ensures we can continue to use the GraphQL Proxy utility provided by [@shopify/shopify-api](https://www.npmjs.com/package/@shopify/shopify-api) package and the offline access mode is adopted so we can make requests to the Shopify Admin API while handling webhooks or requests coming from the storefront or checkout post-purchase extension.
