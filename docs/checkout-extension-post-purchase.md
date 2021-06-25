# Checkout Extension Post-Purchase

Post-Purchase Checkout Extensions allow merchants to display an additional page between the checkout payment page and the thank-you page, prompting the customer to complete some additional action. In the case of this app, the extension asks the customer to submit a review for the product they just bought.

If you create a post-purchase checkout extension for your app, it will provide an option to display this additional page to any customer of a store that has your app installed.

If you want to test the Post-Purchase Checkout Extension locally, you must run it separately. Please note this is only necessary when testing locally, since the published extensions are hosted by Shopify.

## Table of contents

- [Checkout Extension Post-Purchase](#checkout-extension-post-purchase)
  - [Running the checkout extension locally](#running-the-checkout-extension-locally)
    - [Install dependencies](#install-dependencies)
    - [Set up environment](#set-up-environment)
    - [Start the server](#start-the-server)
    - [Set up the browser extension](#set-up-the-browser-extension)
  - [Publishing](#publishing)
  - [Scaffolding New Checkout Extensions](#scaffolding-new-checkout-extensions)
  - [Additional Resources](#additional-resources)

## Running the checkout extension locally

### Install dependencies

From the extension root folder, install the dependencies:

```
$ cd checkout-extension && npm install
```

### Set up environment

Make sure that you have a `.env` file at the root of the extension folder, with the following values:

```
SHOPIFY_API_KEY={Your app's API Key. You can find this in your partner dashboard}
SHOPIFY_API_SECRET={Your app's API Secret. You can find this in your partner dashboard}
EXTENSION_TITLE={This can be anything you like}
```

### Start the server

Start the server by running:

```
$ shopify extension serve
```

You must also make sure the associated embedded app is running locally (and authenticated) so that it can handle any API calls.

To start the embedded app, run `shopify node serve` from the project root.

Note: The `embeddedAppHost` in `src/index.js` is currently hardcoded. This needs to be updated to reflect your own app host, so it can handle API requests from the extension.

A verification link will be printed in the terminal the first time you run the embedded app server. Open it in your browser to authenticate.

### Set up the browser extension

- Download and install the [Chrome](https://cdn.shopify.com/static/checkout-post-purchase/dev-browser-extension/chrome-0.1.0-latest.zip?shpxid=53fe25c1-A7E7-4AD4-721F-FF5528560F1B) or [Firefox](https://cdn.shopify.com/static/checkout-post-purchase/dev-browser-extension/firefox-0.1.0-latest.xpi?shpxid=53fe25c1-A7E7-4AD4-721F-FF5528560F1B) browser extension, which automatically updates the checkout URLs with the script needed to load the extension after a purchase is made.

- Open the extension and fill in the input fields:

  - `Script URL` - This is the ngrok URL that prints to the console when you run `shopify extension serve` in the extension folder
  - `API Key` - This is your app API key. It's the same one as in your `.env` (`SHOPIFY_API_KEY`)

- You should now see the extension page when completing a checkout in your dev store. It will appear as an additional step between the Payment page and the Thank-you page.

Notes:

- If you see a 500 server error on the payment page where the checkout extension calls the `ShouldRender` hook, it could be that the extension is trying to make API calls to your local app server and it's not running/authenticated. To fix this just go to your app in your store admin and reload to make sure that its running/authenticated.

## Publishing

When your extension is ready to go live, you must publish it to Shopify using the CLI, where it will be bundled and served as a static asset.

Currently this is not automated, so although you may have deployed the embedded app somewhere, you still need to publish the extension separately via the Shopify CLI.

Steps for publishing:

1. Before publishing the extension, check your code to make sure that any API requests to your app are directed to its production domain.

2. Inside the extension root folder, login and answer the prompts. If you have multiple accounts add a `--shop` flag, to specify a development store on which you'll test your extension while it's in draft mode:

   ```
   $ cd checkout-extension && shopify login --shop=your-shop-name.myshopify.com
   ```

3. Register the extension. This connects the extension to your app.

   ```
   $ shopify extension register
   ```

4. Push the extension. This will build and compile a production version and push it to the Shopify CDN. (You should see that a build folder has been created with your minified code inside).

   ```
   $ shopify extension push
   ```

5. Visit the url that was output in the terminal. It should look something like:

   ```
   https://partners.shopify.com/<your-partner-id>/apps/<your-app-id>/extensions/post_purchase/<extension-id-from-checkout-extension-env-file>
   ```

   You will also now see your checkout extension in your Partner dashboard on your app's Extensions page, under the "Checkout" tab.

   Enable the development store preview so that you can test it in your dev store, and disable your browser extension if it is still enabled from earlier local testing. Complete a checkout in your store to ensure everything is working as expected.

6. If you are ready to make your extension live to any merchant with your app installed, click `Create version` from the Partner dashboardlink in Step 5.
   - Select minor or major.
   - Click `Publish` next to the version.

Further information:

- [CLI Extension Commands](https://shopify.dev/tutorials/shopify-app-cli-extension-commands).
- [Extension Versioning](https://shopify.dev/docs/app-extensions?locale=en#app-extension-versioning)

## Scaffolding New Checkout Extensions

The Shopify CLI will scaffold the extension when you run `shopify create extension --type=CHECKOUT_POST_PURCHASE --name="checkout-extension"`. This should be done inside your embedded app, so that the extension is built as a subdirectory.

## Additional Resources

[Post-Purchase Checkout Extension Documentation](https://shopify.dev/apps/checkout/post-purchase)
