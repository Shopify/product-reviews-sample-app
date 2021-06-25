export const getNodesFromConnections = (connections) => {
  if (!connections) return [];
  return connections.edges.map(({ node }) => node);
};
