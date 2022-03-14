// metafields namespaces used for graphql queries to store/retrieve data by those namespaces
export const METAFIELD_NAMESPACE = {
  general: "prapp",
  publicReviews: "prapp-pub-reviews",
  privateReviews: "prapp-pvt-reviews",
  messages: "prapp-messages",
  standardRating: "reviews",
};

// graphql queries will add/delete/update data under these keys in the
// METAFIELD_NAMESPACE.general namespace
export const METAFIELD_KEY = {
  ratings: "rating",
  avgRating: "avg_rating",
  standardRatingCount: "rating_count",
};

// Event types used by the PRODUCTS_UPDATE webhook (server.js)
// to determine if and how the average rating should be recalculated
export const MESSAGE_TYPE = {
  reviewPublished: "review_published",
  reviewUnpublished: "review_unpublished",
  reviewDeleted: "review_deleted",
};

export const ROUTES = {
  products: "/products",
  gettingStarted: "/getting-started",
};

export const MAX_RATING = 5;
export const MIN_RATING = 1;
