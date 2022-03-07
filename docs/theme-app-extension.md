# Theme App Extension

Theme App Extensions allow you to extend a theme by adding App Blocks to it. Theme App extensions are tied together with an app, so in order to build a theme app extension you need to have an app to register the extension under. **An app can have only one theme app extension. Once registered it cannot be unregistered**

We recommend to keep all of your app extensions in the same repository as the embedded app. When using the CLI to generate an extension, it will create a dedicated directory it. For this reason it is advised to simply run the `shopify extension create` commands from the root directory of your project.

To create Theme App Extension follow these steps below.

## Table of contents

- [Theme App Extension](#theme-app-extension)
  - [Table of contents](#table-of-contents)
  - [Authenticate](#authenticate)
  - [Create an extension](#create-an-extension)
  - [Register an extension](#register-an-extension)
  - [Push the extension](#push-the-extension)
  - [Publish](#publish)
  - [Common errors](#common-errors)
  - [FAQ](#faq)

## Register the theme extension to your app

Create a `.env` file in the root of the `theme-app-extension` folder

> :question: If you were creating a new extension this would get automatically generated, but since we are registering an existing one we must create it ourselves.
>
> :book: For more information refer to the [theme app extension framework file structure](https://shopify.dev/apps/online-store/theme-app-extensions/extensions-framework#file-structure).

```bash
cd theme-app-extension && touch .env
```

Add the following environment variables to the `.env` to connect the extension to your app:

```
# Your app's API Key. You can find this in your partner dashboard
SHOPIFY_API_KEY=1234
# Your app's API. Secret You can find this in your partner dashboard
SHOPIFY_API_SECRET=abcdefg
# This can be whatever you want
EXTENSION_TITLE=my-theme-extension
```

## Authenticate

Run `shopify login` command. If you have multiple accounts add `--shop` flag like this, to specify development store on which you'll test, like this: `shopify login --shop=your-shop-name.myshopify.com`.

Command will give you authentication URL that you need to open in the browser. Once it authenticates you can return to Terminal where you ran initial CLI command.

Make sure you are logged in by running the Shopify CLI command

```bash
shopify login --shop=your-test-shop-name.myshopify.com
```

## Register an extension

_Run `shopify extension register` to register your Theme App Extension under your app. It will then appear in your Shopify Partners dashboard under your App \_Extensions > Online Store > Theme App Extensions_. From there you can enable 'DEVELOPMENT STORE PREVIEW' while you are building your extension. When you are ready to release your theme app extension create you can release versions or publish/unpublish them in the same spot. Until published other merchants won't be able to use those versions of the extension.\_

Register the extension by running the Shopify CLI command

```bash
shopify extension register
```

## Push the extension

From this point you can either push existing sample code of Theme App Extension to make it available for new version creation and also usage in development stores, or you can first modify/create your blocks, snippets and etc., and then push them (and create version, or publish if needed). Pushing is done using: `shopify extension push` command. If you have Development Store Preview enabled you will be able to see your changes immediately after pushing.

Push the extension by running to Shopify by running the Shopify CLI command

```bash
shopify extension push
```

## Publish the extension

Once your Theme App Extension code is ready for public use, push the latest code, head to _Extensions > Online Store > Theme App Extensions_ under your App, click on the extension name, then click _Create Version_ button and once new version appears in your versions list simply click _Publish_ next to it.

## Verify the extension is working

To verify that the extension is working navigate to a product that has reviews. You'll be able to see reviews and ratings from users.

![](images/theme-extension-final.png)

## [Optional] Add theme support detection to the embedded application

A quick way to check if things are set up correctly is to perform the steps below. This will show if your theme and store can use the extension, the results will be shown in the embedded application.

- Add a new variable `THEME_APP_EXTENSION_UUID` to your app's `.env` (in the project root). Set the value to the same as `EXTENSION_UUID` in `theme-app-extension/.env`. This will allow the app to check which blocks have already been added to the merchant's Product Pages using the theme editor.

- Add a Navigation Link to the `/getting-started` route via the Partner Dashboard: _App Setup_ > _Embedded App (Manage)_ > _Navigation (Configure)_ > _Add Navigation Link_

## Summary

Congratulations! If you've reached this step you've deployed the theme extension. Go to the next step, [Adding a Post Checkout Extension](checkout-extension-post-purchase), to add reviews after a customer has purchased a product.

## Common errors

**Incorrect schema of the block**

CLI will infrom you about the issue and what is wrong when trying to push your code changes. Go on and fix those issues and push afterwards.

**401 error code**

This means your authentication session has expired and you need to rerun `shopify login`.

**Cannot see blocks in theme editor**

In order to make blocks visible in your theme editor you need to add `@app` in blocks under needed section schema. Also you'll need to add in order to make it render where you need in the UI:

```liquid
{%- for block in section.blocks -%}
  {% case block.type %}
  {% when '@app' %}
    {% render block %}
  {% endcase %}
{%- endfor -%}
```

For example in `dawn` theme you would head to edit theme code and modify `main-product.liquid` file. Find `blocks` in `schema` and add this:

```liquid
{
  "type": "@app"
}
```

Then in the html template code portion you'll find the `{%- for block in section.blocks -%}`, so simply add within it this snippet:

```liquid
{% when '@app' %}
  {% render block %}
{% endcase %}
```

You should then see your blocks in theme editor under product page product section and if you'll select one of the blocks it will appear in sidepannel where Name, Price and other info about the product is present.

## FAQ

**Q: I can't see my app blocks in my Theme Editor.**

A: After you use the CLI command `shopify extension push` you must go to the extension page in the partner dashboard. Create a new version of the extension. Publish the version, to push it live to merchants.

**Q: I added the product reviews block but the I cannot see the add reviews form.**

A: In the App Block settings in the Theme Editor ensure `Allow unverified review submissions` is selected.

**Q: I cannot see the average review block**

A: The average review block will appear once at least one review has been submitted and approved. You must approve the review in the app admin.
