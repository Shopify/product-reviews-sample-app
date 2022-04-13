import "core-js/stable";
import "regenerator-runtime/runtime";
import dotenv from "dotenv";
import "isomorphic-fetch";
import createShopifyAuth, { verifyRequest } from "@shopify/koa-shopify-auth";
import Shopify, { ApiVersion } from "@shopify/shopify-api";
import Koa from "koa";
import next from "next";
import Router from "koa-router";
import koaBody from "koa-bodyparser";
import cors from "@koa/cors";
import { addReview, createClient, getFirstPublishedProduct } from "./handlers";
import {
  containsAppBlock,
  verifyAppProxyExtensionSignature,
  verifyPostPurchaseToken,
} from "./utilities";
import { enqueueProductUpdateJob } from "./jobs/product-update";

dotenv.config();
const port = parseInt(process.env.PORT, 10) || 8081;
const dev = process.env.NODE_ENV !== "production";
const app = next({
  dev,
});
const handle = app.getRequestHandler();

Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY,
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
  SCOPES: process.env.SCOPES
    ? process.env.SCOPES.split(",")
    : "write_products,write_customers,write_draft_orders,read_themes",
  HOST_NAME: process.env.HOST.replace(/https:\/\//, ""),
  API_VERSION: ApiVersion.Unstable,
  IS_EMBEDDED_APP: true,
  // This should be replaced with your preferred storage strategy
  SESSION_STORAGE: new Shopify.Session.MemorySessionStorage(),
});

// Storing the currently active shops in memory will force them to re-login when your server restarts. You should
// persist this object in your app.
const ACTIVE_SHOPIFY_SHOPS = {};

app.prepare().then(async () => {
  const server = new Koa();
  const router = new Router();
  server.keys = [Shopify.Context.API_SECRET_KEY];

  // This sample App leverages both "online" and "offline" Shopify API access modes
  // as an example of how to have them configured.

  // Read more about Shopify API access modes in
  // https://shopify.dev/concepts/about-apis/authentication#api-access-modes
  server.use(
    createShopifyAuth({
      accessMode: "online",
      prefix: "/online",
      async afterAuth(ctx) {
        // Online access mode access token and shop available in ctx.state.shopify
        const { shop } = ctx.state.shopify;

        // Redirect to app with shop parameter upon auth
        // ctx.redirect(`/?shop=${shop}&host=${host}`);
        ctx.redirect(
          `https://${shop}/admin/apps/${process.env.SHOPIFY_API_KEY}`
        );
      },
    })
  );

  // Shopify API "offline" access mode tokens are meant for long term access to a store,
  // where no user interaction is involved is ideal for background work in response to webhooks,
  // or for maintenance work in backgrounded jobs.
  server.use(
    createShopifyAuth({
      accessMode: "offline",
      prefix: "/offline",
      async afterAuth(ctx) {
        // Offline access mode access token and shop available in ctx.state.shopify
        const { shop, accessToken, scope } = ctx.state.shopify;

        ACTIVE_SHOPIFY_SHOPS[shop] = scope;

        let response = await Shopify.Webhooks.Registry.register({
          shop,
          accessToken,
          path: "/webhooks",
          topic: "APP_UNINSTALLED",
          webhookHandler: async (topic, shop, body) =>
            delete ACTIVE_SHOPIFY_SHOPS[shop],
        });

        if (!response.success) {
          console.log(
            `Failed to register APP_UNINSTALLED webhook: ${response.result}`
          );
        }

        response = await Shopify.Webhooks.Registry.register({
          shop,
          accessToken,
          path: "/webhooks",
          topic: "PRODUCTS_UPDATE",
          webhookHandler: async (topic, shop, body) => {
            enqueueProductUpdateJob(shop, JSON.parse(body));
          },
        });

        if (!response.success) {
          console.log(
            `Failed to register PRODUCTS_UPDATE webhook: ${response.result}`
          );
        }

        // Redirect to online auth entry point to create
        // an online access mode token that will be used by the embedded app
        ctx.redirect(`/online/auth/?shop=${shop}`);
      },
    })
  );

  const handleRequest = async (ctx) => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;
  };

  const verifyIfActiveShopifyShop = (ctx, next) => {
    const { shop } = ctx.query;

    // This shop hasn't been seen yet, go through OAuth to create a session
    if (ACTIVE_SHOPIFY_SHOPS[shop] === undefined) {
      ctx.redirect(`/offline/auth?shop=${shop}`);
      return;
    }

    return next();
  };

  const verifyAppProxyExtensionSignatureMiddleware = (ctx, next) => {
    if (
      verifyAppProxyExtensionSignature(
        ctx.query,
        process.env.SHOPIFY_API_SECRET
      )
    ) {
      return next();
    }
    ctx.res.statusCode = 401;
  };

  const verifyPostPurchaseTokenMiddleware = (ctx, next) => {
    const { token, reference_id: referenceId } = ctx.request.body;
    if (
      verifyPostPurchaseToken(
        token,
        referenceId,
        process.env.SHOPIFY_API_SECRET
      )
    ) {
      return next();
    }
    ctx.res.statusCode = 401;
  };

  router.post("/webhooks", async (ctx) => {
    try {
      await Shopify.Webhooks.Registry.process(ctx.req, ctx.res);
      console.log(`Webhook processed, returned status code 200`);
    } catch (error) {
      console.log(`Failed to process webhook: ${error}`);
    }
  });

  router.post(
    "/graphql",
    // Requests to `/graphql` must have an online session
    // Shopify.Utils.graphqlProxy only works for accessMode: "online" sessions
    verifyRequest({ returnHeader: true, authRoute: "/online/auth" }),
    async (ctx) => {
      await Shopify.Utils.graphqlProxy(ctx.req, ctx.res);
    }
  );

  const createReview = async (ctx) => {
    // We shouldn't trust user's input.
    // We need to verify whether this request is coming from Shopify,
    // see the `verifyAppProxyExtensionSignatureMiddleware` middleware function
    const { shop } = ctx.query;

    // Note that loadOfflineSession should not take the shop name
    // from user input as it assumes the request is coming from your app's backend.
    //
    // Hence why the signature query param or the checkout post-purchase token are
    // verified before loading the offline session.
    //
    // We need offline access mode token here in order to call the Shopify Admin API
    const session = await Shopify.Utils.loadOfflineSession(shop);

    if (!session) {
      ctx.res.statusCode = 403;
      return;
    }

    const client = createClient(session.shop, session.accessToken);

    try {
      await addReview(client, ctx.request.body);
      ctx.res.statusCode = 200;
    } catch (err) {
      console.error(err);
      ctx.res.statusCode = 500;
    }
  };

  // Configuring an App Proxy Extension REST endpoint to handle review
  // creation requests coming from the online store
  router.post(
    "/api/reviews",
    verifyAppProxyExtensionSignatureMiddleware,
    koaBody(),
    createReview
  );

  /**
   * This REST endpoint is resposible for returning whether the store's current main theme supports app blocks.
   */
  router.get(
    "/api/store/themes/main",
    verifyRequest({ authRoute: "/online/auth" }),
    async (ctx) => {
      const session = await Shopify.Utils.loadCurrentSession(ctx.req, ctx.res);
      const clients = {
        rest: new Shopify.Clients.Rest(session.shop, session.accessToken),
        graphQL: createClient(session.shop, session.accessToken),
      };

      // Check if App Blocks are supported
      // -----------------------------------

      // Specify the name of the template we want our app to integrate with
      const APP_BLOCK_TEMPLATES = ["product"];

      // Use `client.get` to request list of themes on store
      const {
        body: { themes },
      } = await clients.rest.get({
        path: "themes",
      });

      // Find the published theme
      const publishedTheme = themes.find((theme) => theme.role === "main");

      // Get list of assets contained within the published theme
      const {
        body: { assets },
      } = await clients.rest.get({
        path: `themes/${publishedTheme.id}/assets`,
      });

      // Check if template JSON files exist for the template specified in APP_BLOCK_TEMPLATES
      const templateJSONFiles = assets.filter((file) => {
        return APP_BLOCK_TEMPLATES.some(
          (template) => file.key === `templates/${template}.json`
        );
      });

      // Get bodies of template JSONs
      const templateJSONAssetContents = await Promise.all(
        templateJSONFiles.map(async (file) => {
          const {
            body: { asset },
          } = await clients.rest.get({
            path: `themes/${publishedTheme.id}/assets`,
            query: { "asset[key]": file.key },
          });

          return asset;
        })
      );

      // Find what section is set as 'main' for each template JSON's body
      const templateMainSections = templateJSONAssetContents
        .map((asset, index) => {
          const json = JSON.parse(asset.value);
          const main = json.sections.main && json.sections.main.type;

          return assets.find((file) => file.key === `sections/${main}.liquid`);
        })
        .filter((value) => value);

      // Request the content of each section and check if it has a schema that contains a
      // block of type '@app'
      const sectionsWithAppBlock = (
        await Promise.all(
          templateMainSections.map(async (file, index) => {
            let acceptsAppBlock = false;
            const {
              body: { asset },
            } = await clients.rest.get({
              path: `themes/${publishedTheme.id}/assets`,
              query: { "asset[key]": file.key },
            });

            const match = asset.value.match(
              /\{\%\s+schema\s+\%\}([\s\S]*?)\{\%\s+endschema\s+\%\}/m
            );
            const schema = JSON.parse(match[1]);

            if (schema && schema.blocks) {
              acceptsAppBlock = schema.blocks.some((b) => b.type === "@app");
            }

            return acceptsAppBlock ? file : null;
          })
        )
      ).filter((value) => value);

      /**
       * Fetch one published product that's later used to build the editor preview url
       */
      const product = await getFirstPublishedProduct(clients.graphQL);
      const editorUrl = `https://${session.shop}/admin/themes/${
        publishedTheme.id
      }/editor?previewPath=${encodeURIComponent(
        `/products/${product?.handle}`
      )}`;

      /**
       * This is where we check if the theme supports apps blocks.
       * To do so, we check if the main-product section supports blocks of type @app
       */
      const supportsSe = templateJSONFiles.length > 0;
      const supportsAppBlocks = supportsSe && sectionsWithAppBlock.length > 0;

      ctx.body = {
        theme: publishedTheme,
        supportsSe,
        supportsAppBlocks,
        /**
         * Check if each of the sample app's app blocks have been added to the product.json template
         */
        containsAverageRatingAppBlock: containsAppBlock(
          templateJSONAssetContents[0]?.value,
          "average-rating",
          process.env.THEME_APP_EXTENSION_UUID
        ),
        containsProductReviewsAppBlock: containsAppBlock(
          templateJSONAssetContents[0]?.value,
          "product-reviews",
          process.env.THEME_APP_EXTENSION_UUID
        ),
        editorUrl,
      };
      ctx.res.statusCode = 200;
    }
  );

  // Configuring an Post Checkout Extension REST endpoint to handle
  // requests coming from the post-checkout extension
  router.all(
    "(/api/post-purchase/.*)",
    cors({
      origin: "https://shopify-argo-internal.com",
      allowMethods: ["POST"],
    })
  );

  router.post(
    "/api/post-purchase/reviews",
    koaBody(),
    verifyPostPurchaseTokenMiddleware,
    createReview
  );

  router.post(
    "/api/post-purchase/get-product",
    koaBody(),
    verifyPostPurchaseTokenMiddleware,
    async (ctx) => {
      const { shop } = ctx.query;
      const { product_id: productId } = ctx.request.body;
      const session = await Shopify.Utils.loadOfflineSession(shop);

      try {
        const apiResponse = await fetch(
          `https://${shop}/admin/api/2021-04/products/${productId}.json`,
          {
            headers: {
              "X-Shopify-Access-Token": session.accessToken,
            },
          }
        );
        const { product } = await apiResponse.json();
        const productImageURL =
          product.images === undefined || product.images.length === 0
            ? ""
            : product.images[0].src;
        ctx.body = JSON.stringify({
          productId: product.id,
          productTitle: product.title,
          productImageURL: productImageURL,
          productDescription: product.body_html.split(/<br.*?>/),
        });
        ctx.res.statusCode = 200;
      } catch (err) {
        console.error(err);
        ctx.res.statusCode = 500;
      }
    }
  );

  router.get("(/_next/static/.*)", handleRequest); // Static content is clear
  router.get("/_next/webpack-hmr", handleRequest); // Webpack content is clear

  // Embedded app Next.js entry point
  router.get("(.*)", verifyIfActiveShopifyShop, handleRequest);

  server.use(router.allowedMethods());
  server.use(router.routes());
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
