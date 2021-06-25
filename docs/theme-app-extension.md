# Theme App Extension

Theme App Extensions allow you to extend a theme by adding App Blocks to it. Theme App extensions are tied together with an app, so in order to build a theme app extension you need to have an app to register the extension under. **An app can have only one theme app extension. Once registered it cannot be unregistered**

We recommend to keep all of your app extensions in the same repository as the embedded app. When using the CLI to generate an extension, it will create a dedicated directory it. For this reason it is advised to simply run the `shopify extension create` commands from the root directory of your project.

To create Theme App Extension follow these steps below.

## Table of contents

- [Theme App Extension](#theme-app-extension)
	- [Authenticate](#authenticate)
	- [Create an extension](#create-an-extension)
	- [Register an extension](#register-an-extension)
	- [Push the extension](#push-the-extension)
	- [Publish](#publish)
	- [Common errors](#common-errors)

## Authenticate

Run `shopify login` command. If you have multiple accounts add `--shop` flag like this, to specify development store on which you'll test, like this: `shopify login --shop=your-shop-name.myshopify.com`.

Command will give you authentication URL that you need to open in the browser. Once it authenticates you can return to Terminal where you ran initial CLI command.

## Create an extension

Run `shopify extension create` command and from promted selection choose `Theme App Extension (limit 1 per app)` option, or you can use this command `shopify extension create --type=THEME_APP_EXTENSION` and get the option preselected.

You'll be asked to choose to which app this extension has to be attributed. Theme App Extension can be only one per app.

Once creation is done you will have new directory with some sample App blocks and directories for assets, snippets and locales.

## Register an extension

Run `shopify extension register` to register your Theme App Extension under your app. It will then appear in your Shopify Partners dashboard under your App _Extensions > Online Store > Theme App Extensions_. From there you can create versions of your extension or publish/unpublish them (until published merchants won't be able to use those versions of the extension).

## Push the extension

From this point you can either push existing sample code of Theme App Extension to make it available for new version creation and also usage in development stores, or you can first modify/create your blocks, snippets and etc., and then push them (and create version, or publish if needed). Pushing is done using: `shopify extension push` command.

## Publish

Once your Theme App Extension code is ready for public use, push the latest code, head to _Extensions > Online Store > Theme App Extensions_ under your App, click on the extension name, then click _Create Version_ button and once new version appears in your versions list simply click _Publish_ next to it.

## Common errors

- Incorrect schema of the block - CLI will infrom you about the issue and what is wrong when trying to push your code changes. Go on and fix those issues and push afterwards.
- 401 error code - this means your authentication session has expired and you need to rerun `shopify login`.

❗️ **NOTE:** in order to make blocks visible in your theme editor you need to add `@app` in blocks under needed section schema. Also you'll need to add in order to make it render where you need in the UI:

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
