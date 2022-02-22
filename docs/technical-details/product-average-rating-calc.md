# Product average rating calculation

In this sample application, product average rating calculation is done in the Node.js application as a background job that will be enqueued once it is known that a product was updated.

We've taken this opportunity to showcase [Shopify Webhooks](https://shopify.dev/docs/admin-api/rest/reference/events/webhook) handling and how to make calls to the [Shopify Admin API](https://shopify.dev/docs/admin-api) (queries and mutations) from the backend side.

---

There is a dedicated product private metafield (key = "**ratings**") that help us to keep track of the total number of reviews that were published for a specific product for each rating class (1 star, 2 stars, 3 stars, etc.). The average rating is then calculated by using a weighted average formula.

We emulate how a message broker works so this application can remain free of any extra service. Each message has its own metafield instance and carries a message type ("**review_published**", "**review_unpublished**" or "**review_deleted**") and a snapshot of the review.

A product update message has the following structure:

```json
{
  "type": "review_published" | "review_unpublished" | "review_deleted",
  "data": {
    "review_snapshot": {
      "id": "{review_id}",
      "rating": "{review_rating}",
      "title": "...",
      "body": "..."
      // ...
    }
  }
}
```

The list of messages are scoped per product and and are processed in sequence when the products/update webhook is handled. The messages are deleted after they are processed.

## Client-side

Since we also want to showcase how to manage metafields and make calls from the client-side (embedded app frontend) to the [Shopify Admin API](https://shopify.dev/api/admin), messages are created from the client-side once users publish, unpublish or delete reviews.

## Backend (Node.js)

We leverage the power of [Shopify Webhooks](https://shopify.dev/api/admin-rest/latest/resources/webhook). Once the app is installed we register to the **products/update** webhook and this allows us to be notified when a product is updated, and perform the necessary actions involved with calculating the new average rating, see [server/jobs/product-update](/server/jobs/product-update.js).
