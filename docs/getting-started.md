# Getting started

Before you start running the Product Reviews sample app, you'll need to perform the instructions below.

## Table of contents

- [Getting started](#getting-started)
  - [Requirements](#requirements)
  - [Install dependencies](#install-dependencies)
  - [Connect to an embedded app in your Partner account](#connect-to-an-embedded-app-in-your-partner-account)
  - [Start the server](#start-the-server)
  - [Update App's Allowed redirection URL(s) configuration](#update-apps-allowed-redirection-urls-configuration)
  - [Install the app in your test store](#install-the-app-in-your-test-store)
  - [Set up the App Proxy extension](#set-up-the-app-proxy-extension)
  - [Verify if the embedded app is running](#verify-if-the-embedded-app-is-running)
  - [Register the Theme app extension to your app](#register-the-theme-app-extension-to-your-app)
  - [Set up theme support detection for the Getting Started page](#set-up-theme-support-detection-for-the-getting-started-page)
  - [Register the Post-Purchase Checkout Extension to your app](#register-the-post-purchase-checkout-extension-to-your-app)
  - [[Optional] Add an admin link for your app](#optional-add-an-admin-link-for-your-app)

## Requirements

- Ensure to install the [Shopify App CLI](https://shopify.dev/tools/cli).
- Use [ngrok](https://ngrok.com), in order to create a secure tunnel to your app running on your localhost.

## Install dependencies

Install the dependencies by running `npm install`.

## Connect to an embedded app in your Partner account

- Visit your [Partner Account dashboard](https://partners.shopify.com/organizations), go to the "Apps" page and click "Create App".
- Select "Public App", and choose a name for your app.
- In the `App URL` field just enter any url for now (e.g: `https://localhost:3000/`), as this will be automatically updated in the next step.
- Do the same for `Allowed redirection URL(s)`, except add `/auth/callback` to the path like so: `https://localhost:3000/auth/callback`.
- Click "Create App" to confirm.

In the terminal, complete the following steps:

- Run `shopify login` (optionally pass in the `--shop=YOUR_SHOP` flag to specify your test store)
- Open the printed url in the browser to authenticate.
- Next, run `shopify node connect` to connect to the newly created app. You will be prompted to answer the following questions:
  - `To which app does this project belong?` (Select the app you just created in your partner account dashboard).
  - `Which development store would you like to use?` (This will only appear if you did not use the `--shop` flag above).

This step automatically creates a `.env` file in the project root, with `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `SHOP` and `SCOPES` values. The `SHOPIFY_API_KEY` and `SHOPIFY_API_SECRET` can also be found in your app settings in your Partner account. `SCOPES` are set to default values. See [here](https://shopify.dev/docs/admin-api/access-scopes) for the list of scope options.

## Start the server

Start the server by running `shopify node serve`, and answer the prompts:

- `Do you want to convert <your-store>.myshopify.com to a development store?`
  This allows you to install a draft app in your test store.
  ❗️ **NOTE:** the store can not be converted back to a live store once you do this
- `Do you want to update your application url?` Choose "yes".

This step will automatically add the `HOST` to your .env, which matches the url of the `ngrok` tunnel which has been created for you.

## Update App's Allowed redirection URL(s) configuration

Go back to your _Partner Account dashboard_ > _Apps_ > _your App_ > _App setup_. The `App URL` should now match the tunnel url. You will need to manually update the urls in the `Allowed redirection URL(s)`, to support the online/offline access modes we have set up in this app:

```
{YOUR_TUNNEL_URL}/offline/auth/callback
{YOUR_TUNNEL_URL}/online/auth/callback
{YOUR_TUNNEL_URL}/auth/callback (replace the dummy value from step 2)
```

And then click "Save".

## Install the app in your test store

Go back to the terminal and you will see that there was a url printed after you ran `shopify node serve`. Visit this url, where you will be prompted to install the app on your test store.

Before you start building your app, you'll need to perform the steps below.

```
https://{YOUR_TUNNEL_URL}/auth?shop={YOUR_SHOP}
```

## Set up the App Proxy extension

To configure the App Proxy extension follow the steps below.

- Follow the steps listed in [Display dynamic store data with app proxies - Add an app proxy](https://shopify.dev/tutorials/display-dynamic-store-data-with-app-proxies#add-an-app-proxy).
- Set the Sub path field to `prapp`.
- Set the Proxy Url field to `{YOUR_TUNNEL_URL/api}`.
- Click Save.

## Verify if the embedded app is running

Verify that the embedded app is running by navigating to _your test shop admin page_ > _apps_ > your_new_app.

## Register the Theme app extension to your app

- Create a `.env` file in the root of the `theme-app-extension` folder  
  Note: if you were creating a new extension this would get automatically generated, but since we are registering an existing one we must create it ourselves.

  ```
  $ cd theme-app-extension && touch .env
  ```

- Add the following environment variables to the `.env` to connect the extension to your app:

  ```
  SHOPIFY_API_KEY={Your app's API Key. You can find this in your partner dashboard}
  SHOPIFY_API_SECRET={Your app's API. Secret You can find this in your partner dashboard}
  EXTENSION_TITLE={This can be anything you like}
  ```

- Make sure you are logged in by running `shopify login --shop=your-test-shop-name.myshopify.com`
- Register the extension by running `shopify extension register`.
- Push the extension by running ` shopify extension push`
- You should now see the extension in your app page in your Partner Dashboard under _Extensions_ > _Online Store_.

## Set up theme support detection for the Getting Started page

- Add `read_themes` to the `SCOPES` variable your main app `.env` file. This is needed so the app can check if a merchant's theme supports App Blocks.
- Add a new variable `THEME_APP_EXTENSION_UUID` to your app's `.env` (in the project root). Set the value to the same as `EXTENSION_UUID` in `theme-app-extension/.env`. This will allow the app to check which blocks have already been added to the merchant's Product Pages using the theme editor.
- Add a Navigation Link to the `/getting-started` route via the Partner Dashboard: App Setup > Embedded App (Manage) > Navigation (Configure) > Add Navigation Link

## Register the Post-Purchase Checkout Extension to your app

- Follow the same process as with the Theme app extension ([Register the Theme app extension to your app](#register-the-theme-app-extension-to-your-app)), but from inside the `checkout-extension` folder.
- You should now see the extension in your app page in your Partner Dashboard under Extensions > Checkout.

## [Optional] Add an admin link for your app

To add a deep link to the app from the product detail admin pages, follow these steps:

- Go to your partner dashboard and select this app and click `Extensions`
- Under `Extensions` select `Admin links` and click `Add Link`
- You'll be presented with the form. Add `{YOUR_TUNNEL_URL/products}` as a link and select `Product details` from `Page show link` dropdown.
- Set `Link label` text - this will be link text in product details page that will link to `{YOUR_TUNNEL_URL/products}`.
- Click Save.

This works by adding product id to the link query(`?id={product_id}`) which then is used to redirect from `/products` to `products/{id}`.

❗️ **NOTE:** If you skip this step, everything will still work as intended, just no product reviews link will be available in the product details admin pages.
