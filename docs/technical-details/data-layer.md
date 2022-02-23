# Data layer

We want to showcase how to use our [Metafields API](https://shopify.dev/api/admin-rest/latest/resources/metafield), therefore, the only data persisted in the app storage (Memory storage for this sample app) will be the [shop auth token](https://shopify.dev/apps/auth). For the rest (i.e.: products with reviews, reviews, average rating) we use the [Metafields API](https://shopify.dev/api/admin-rest/latest/resources/metafield).

- Reviews are stored in JSON typed metafields on the Product level. We encode/decode the data here since a review has various properties (name, rating, title, etc). See the table below for more context over the metafields structure. Note that each review has its own metafield instance.
- We leverage different public metafields namespaces to implement the publish and unpublish functionality. Since this is a sample app, we don’t worry about exposing unpublished reviews to the storefront because they are essentially owned by the shop.
- In order to (re)calculate product average rating, we have a dedicated product private metafield (key = “**ratings**”) that helps us to keep track of the total number of reviews under each rating score. More details can be found below.

## Structure

### Unpublished reviews

- Visibility: **public**
- Namespace: **prapp-pvt-reviews**
- Metafield node structure:

  ```json
  {
    "key": "{random_id}",
    "value": "{\"id\":\"{random_uid}\",\"rating\":\"5\",\"title\":\"title\",\"body\":\"body\",\"name\":\"Peter Parker\",\"email\":\"peter.parker@shopify.com\",\"created_at\":\"2021-05-19T09:03:32.401Z\",\"state\":\"unpublished\"}",
    "valueType": "JSON_STRING"
  }
  ```

  ```ts
  type Review = {
    id: String;
    rating: Number;
    title: String;
    body: String;
    name: String;
    email: String;
    created_at: String;
    state: "unpublished" | "published";
  };
  ```

### Published reviews

- Visibility: **public**
- Namespace: **prapp-pub-reviews**
- Metafield node structure:

  ```json
  {
    "key": "{random_id}",
    "value": "{\"id\":\"{random_uid}\",\"rating\":\"5\",\"title\":\"title\",\"body\":\"body\",\"name\":\"Peter Parker\",\"email\":\"peter.parker@shopify.com\",\"created_at\":\"2021-05-19T09:03:32.401Z\",\"state\":\"published\"}",
    "valueType": "JSON_STRING"
  }
  ```

### Product ratings

- Visibility: **private**
- Namespace: **prapp**
- Metafield node structure:

  ```json
  {
    "key": "ratings",
    "value": "{\"1\":{\"weight\":1,\"total\":10},\"2\":{\"weight\":2,\"total\":20},\"3\":{\"weight\":3,\"total\":30},\"4\":{\"weight\":4,\"total\":40},\"5\":{\"weight\":5,\"total\":50}}",
    "valueType": "JSON_STRING"
  }
  ```

### Product average rating

- Visibility: **public**
- Namespace: **prapp**
- Metafield node structure:

  ```json
  {
    "key": "avg_rating",
    "value": "4.87",
    "valueType": "STRING"
  }
  ```

### Product queue messages

- Visibility: **public**
- Namespace: **prapp-messages**
- Metafield node structure:

  ```json
  {
    "key": "{random_id}",
    "value": "{\"type\":\"review_published\",\"data\":{\"review_snapshot\":\"{\"id\":\"{random_uid}\",\"rating\":\"5\",\"title\":\"title\",\"body\":\"body\",\"name\":\"Peter Parker\",\"email\":\"peter.parker@shopify.com\",\"created_at\":\"2021-05-19T09:03:32.401Z\",\"state\":\"published\"}\"}}",
    "valueType": "JSON_STRING"
  }
  ```

  ```ts
  type ProductQueueMessageValue = {
    type: "review_published" | "review_unpublished" | "review_deleted";
    data: {
      review_snapshot: {
        id: String;
        rating: Number;
        title: String;
        body: String;
        name: String;
        email: String;
        created_at: String;
        state: "unpublished" | "published";
      };
    };
  };
  ```
