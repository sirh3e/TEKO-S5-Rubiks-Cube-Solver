/* eslint-disable no-undef */
const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require('path');

module.exports = {
  entry: "./bootstrap.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bootstrap.js",
  },
  mode: "development",
  plugins: [
    new CopyWebpackPlugin(['index.html'])
  ],
  devtool: 'source-map',
  resolve: {
    alias: {
      'three': path.resolve('./node_modules/three')
    }
  }
};
