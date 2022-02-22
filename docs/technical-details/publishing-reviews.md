# Publishing reviews

All reviews, either submitted in storefront form or created via the embedded app are initially created in "unpublished" status. This means they do not show up on the storefront until they are published through the embedded app. This allows merchants to verify reviews before they become public. Likewise in the same place, any review that is no longer wished to be shown in storefront can be unpublished.

From a technical standpoint - reviews are product-level metafields under a certain namespace, and when publishing/unpublishing we simply remove product review data from one namespace and recreate them under another namespace. In case of publishing remove is moved between namespaces like this: `prapp-pvt-reviews` -> `prapp-pub-reviews`, and in opposite direction on unpublish. For in-depth technical details, you can check [`usePublishReviews.js`](/hooks/usePublishReviews.js) and [`useUnpublishReviews.js`](/hooks/useUnpublishReviews.js) files that define dedicated React hooks for these two actions.

Any publish/unpublish will trigger `PRODUCTS_UPDATE` webhook that is defined in [server.js](/server/server.js) file, and is responsible for recalculating product average rating. To inform which of the actions (publish or unpublish) happened, we bind action type using methods from [useProduceProductMessage.js](/hooks/useProduceProductMessage.js). Therefore `PRODUCTS_UPDATE` webhook can look up the type of action that happened and recalculate the average rating for the product accordingly.

## Flow

- Visit your embedded app `/products` route (root route of the app) where you'll see all products that have reviews (either published or unpublished doesn't matter)
- We click on the product that we want reviews handled for
- We get the tabbed list where we can switch between published and unpublished reviews lists.
- In case we want to publish some reviews, we click on the "Unpublished" tab, mark checkboxes next to each review that we want to publish, and finally, click "Publish Selected". Done! Those reviews now are public and visible in the storefront (with a condition you're already using `Product Reviews` app block in theme).
- In case we want to unpublish some reviews, we click on the "Published" tab, mark checkboxes next to each review that we want to unpublish, and finally click "Unpublish Selected". Done! Those reviews are no longer publicly visible in the storefront (with a condition you're already using `Product Reviews` app block in theme, otherwise none are visible).
