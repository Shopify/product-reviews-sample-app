# Post-Purchase Checkout Extensions

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

## Authenticate

Run `shopify login` command. If you have multiple accounts add `--shop` flag like this, to specify development store on which you'll test, like this: `shopify login --shop=your-shop-name.myshopify.com`.

Command will give you authentication URL that you need to open in the browser. Once it authenticates you can return to Terminal where you ran initial CLI command.

Make sure you are logged in by running the Shopify CLI command

```bash
shopify login --shop=your-test-shop-name.myshopify.com
```

## Register the Post-Purchase Checkout Extension to your app

```bash
cd checkout-extension && touch .env
```

Add the following environment variables to the `.env` to connect the extension to your app:

```
# Your app's API Key. You can find this in your partner dashboard or copy it from the node app .env
SHOPIFY_API_KEY=1234
# Your app's API. Secret You can find this in your partner dashboard or copy it from the node app .env
SHOPIFY_API_SECRET=abcdefg
# This can be whatever you want
EXTENSION_TITLE=my-checkout-extension
```

### Install dependencies

From the extension root folder, install the dependencies:

```bash
npm install
```

### Update the `embeddedAppHost` variable

In the `src/index.js` file the variable `embeddedAppHost` is currently hardcoded. This needs to be updated to reflect the URL that `ngrok` generated.

## Register the extension

Register the extension by running the Shopify CLI command

```bash
shopify extension register
```

## Push the extension

_This will build and compile a production version and push it to the Shopify CDN. (You should see that a build folder has been created with your minified code inside)._

```bash
shopify extension push
```

You should now see the extension in your app page in your Partner Dashboard under _Extensions_ > _<Your Checkout Name>_.

## Publish the extension

Once your Theme App Extension code is ready for public use, push the latest code, head to _Extensions > Online Store > Post Check App Extensions_ under your App, click on the extension name, then click _Create Version_ button and once new version appears in your versions list simply click _Publish_ next to it.

## Enable the Post Checkout extension

One final step is to enable the checkout extension from the Store's admin settings. To do that, go to the _Store Admin Settings_ > _Checkout_ and select the extension you created.

![Checkout menu](images/pc-menu.png)

## Verify the Post Checkout extension

> :question: You'll need to setup your test store to accept _test_ orders. [Follow this short doc](https://help.shopify.com/en/manual/checkout-settings/test-orders)

To verify the post checkout extension is working add a product from the store to your cart and check out. Pay using a bogus gateway and when the order is placed you'll be prompted to leave a rating and review.

> :exclamation: The extension will only be triggered when a product that **has a price** is purchased. It will not work with a free product.

![post checkout working](images/post-checkout-final.png)

## Further information

- [CLI Extension Commands](https://shopify.dev/apps/tools/cli/extension-commands)
- [Extension Versioning](https://shopify.dev/apps/app-extensions#app-extension-versioning)

## Scaffolding New Checkout Extensions

The Shopify CLI will scaffold the extension when you run `shopify create extension --type=CHECKOUT_POST_PURCHASE --name="checkout-extension"`. This should be done inside your embedded app, so that the extension is built as a subdirectory.

## Additional Resources

[Post-Purchase Checkout Extension Documentation](https://shopify.dev/apps/checkout/post-purchase)
