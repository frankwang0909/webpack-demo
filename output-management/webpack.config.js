const path = require("path");

// 用于生成index.html文件的 HtmlWebpackPlugin 插件
const HtmlWebpackPlugin = require("html-webpack-plugin");

// 用于清空 dist 目录的 CleanWebpackPlugin 插件
const CleanWebpackPlugin = require("clean-webpack-plugin");

module.exports = {
  // 指定多个构建入口文件
  entry: {
    app: "./src/index.js",
    print: "./src/print.js"
  },
  plugins: [
    new CleanWebpackPlugin(["dist"]),
    new HtmlWebpackPlugin({
      title: "Output Management"
    })
  ],
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist")
  }
};
