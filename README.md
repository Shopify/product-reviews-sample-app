# Product Reviews Sample App

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE.md)

This sample app was built as a reference for how Shopify Developer tools can be used together to create a fully functional application.

The example we chose to showcase is an app which facilitates review creation for products in a Shopify store.

It makes use of Metafields as a way to store the reviews, which means it requires no database.

The app is comprised of the following elements:

1. An **embedded node app** with displays an admin UI for managing product reviews (publishing, unpublishing, deleting, etc)
2. A **theme app extension** which enables a merchant to include review information on their storefront, using **App Blocks**. Including:
   - Detailed product reviews per product, including a form where customers can submit new reviews.
   - An overall product rating, calculated using the average of all published reviews.
3. A **post-purchase checkout extension**, which prompts users to submit a review directly after making a purchase.

## Limitations

We've this app to to inspire the next generation of apps developed for Shopify merchants. When learning from this code, keep in mind:

1. This is a sample app, not a production ready app.
2. Metafields are going to be a much bigger part of the platform and will support building production apps with a lot of data. For now, we recommend metafields for simpler data for apps.

## App developer requirements

- We recommend going through the entirety of our [Build a Shopify App with Node and React](https://shopify.dev/tutorials/build-a-shopify-app-with-node-and-react) guide to get familiar with how our tooling works.
- If you don’t have one, [create a Shopify partner account](https://partners.shopify.com/signup).
- If you don’t have one, [create a Development store](https://help.shopify.com/en/partners/dashboard/development-stores#create-a-development-store) where you can install and test your app.
- In the Partner dashboard, [create a new app](https://help.shopify.com/en/api/tools/partner-dashboard/your-apps#create-a-new-app). You’ll need this app’s API credentials during the setup process.

<!-- Make sure this section is in sync with docs/README.md -->

## Getting started

You can follow our [getting started guide](docs/getting-started.md), which will provide instructions on how to to setup and run the Product Reviews sample application.

- [Getting started](docs/getting-started.md)

  - [Install dependencies](docs/getting-started.md#install-dependencies)
  - [Connect to an embedded app in your Partner account](docs/getting-started.md#connect-to-an-embedded-app-in-your-partner-account)
  - [Start the server](docs/getting-started.md#start-the-server)
  - [Update App's Allowed redirection URL(s) configuration](docs/getting-started.md#update-apps-allowed-redirection-urls-configuration)
  - [Install the app in your test store](docs/getting-started.md#install-the-app-in-your-test-store)
  - [Set up the App Proxy extension](docs/getting-started.md#set-up-the-app-proxy-extension)
  - [Verify if the embedded app is running](docs/getting-started.md#verify-if-the-embedded-app-is-running)
  - [Register the Theme app extension to your app](docs/getting-started.md#register-the-theme-app-extension-to-your-app)
  - [Set up theme support detection for the Getting Started page](docs/getting-started.md#set-up-theme-support-detection-for-the-getting-started-page)
  - [Register the Post-Purchase Checkout Extension to your app](docs/getting-started.md#register-the-post-purchase-checkout-extension-to-your-app)
  - [[Optional] Add an admin link for your app](docs/getting-started.md#optional-add-an-admin-link-for-your-app)

- [Theme App Extension](docs/theme-app-extension.md)

  - [Authenticate](docs/theme-app-extension.md#authenticate)
  - [Create an extension](docs/theme-app-extension.md#create-an-extension)
  - [Register an extension](docs/theme-app-extension.md#register-an-extension)
  - [Push the extension](docs/theme-app-extension.md#push-the-extension)
  - [Publish](docs/theme-app-extension.md#publish)
  - [Common errors](docs/theme-app-extension.md#common-errors)

- [Checkout Extension Post-Purchase](docs/checkout-extension-post-purchase.md)

  - [Running the checkout extension locally](docs/checkout-extension-post-purchase.md#running-the-checkout-extension-locally)
    - [Install dependencies](docs/checkout-extension-post-purchase.md#install-dependencies)
    - [Set up environment](docs/checkout-extension-post-purchase.md#set-up-environment)
    - [Start the server](docs/checkout-extension-post-purchase.md#start-the-server)
    - [Set up the browser extension](docs/checkout-extension-post-purchase.md#set-up-the-browser-extension)
  - [Publishing](docs/checkout-extension-post-purchase.md#publishing)
  - [Scaffolding New Checkout Extensions](docs/checkout-extension-post-purchase.md#scaffolding-new-checkout-extensions)
  - [Additional Resources](docs/checkout-extension-post-purchase.md#additional-resources)

- [Technical details](docs/technical-details/README.md)
  - [Authentication](docs/technical-details/authentication.md)
  - [Data layer](docs/technical-details/data-layer.md)
  - [Review creation](docs/technical-details/review-creation.md)
  - [Product average rating calculation](docs/technical-details/product-average-rating-calc.md)
  - [Publishing / Unpublishing reviews](docs/technical-details/publishing-reviews.md)

## Tools Used

### GraphQL

Shopify APIs have previously been available through REST, but more recently the Admin API was made available through GraphQL. Unlike REST APIs, which use multiple endpoints to return large sets of data, GraphQL uses a single endpoint with fields that can be queried to specify the data you need. This generally improves the speed of your app because it’s not asking for data it doesn’t intend to use.

_for more information on the GraphQL Admin API, [check out our reference guide](https://shopify.dev/docs/admin-api/graphql/reference)._

### App Bridge

Shopify App Bridge lets you embed your app directly inside the Shopify Admin. It offers React component wrappers for some actions, and is directly integrated with Polaris components. It offers a consistent experience for merchants, whether it’s on the web or in the Shopify Mobile app for iOS or Android.

_for more information on App Bridge, [check out our reference guide](https://shopify.dev/tools/app-bridge)._

### Metafields

Metafields represent custom metadata attached to a resource (for example, a shop or a product). Metafields can be sorted into namespaces and are composed of keys, values, and value types. They can be used as a data layer to create and store a small amount of information relating to Shopify resources.

_for more information on Metafields, [check out our guide](https://shopify.dev/tutorials/manage-metafields-with-graphql-admin-api)._

### Theme App Extensions - App Blocks

[Theme app extensions](https://shopify.dev/apps/online-store/theme-app-extensions) let you extend themes via app blocks. App blocks are liquid files that contain code, a schema and static resource dependencies (CSS, JS). They can be added to existing theme sections or as full-width content on the page. App blocks can also be reordered, removed and configured by merchants directly from the theme editor. Theme app extensions do not modify a theme’s code, are served by Shopify, and can be cleanly uninstalled without leaving ghost code behind.

### Checkout Extension - Post-Purchase

Post-purchase checkout extensions give developers and Plus merchants the ability to add post-purchase interactions directly into the Shopify checkout. A post-purchase page displays a customizable UI to a buyer after their order is confirmed, but before the thank you page.

## Contributing

For help on setting up the repository locally, building, testing and contributing please see [CONTRIBUTING.md](CONTRIBUTING.md).

## Code of conduct

All developers who wish to contribute through code or issues, please first read our [Code of Conduct](CODE_OF_CONDUCT.md).

## License

Copyright © 2018 Shopify. See [LICENSE](LICENSE.md) for further details.
