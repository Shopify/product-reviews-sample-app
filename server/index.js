require("@babel/register")({
  presets: ["@babel/preset-env"],
});

// Import the rest of our application.
module.exports = require("./server.js");
