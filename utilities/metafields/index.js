export function extractIdFromGid(gid) {
  return gid.split("/").pop();
}

const generateShopifyGid = (entityType, value) => {
  return `gid://shopify/${entityType}/${value}`;
};

export const generateShopifyProductGid = (value) => {
  return generateShopifyGid("Product", value);
};
