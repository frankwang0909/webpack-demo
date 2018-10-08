const path = require("path");
const UglifyPlugin = require("uglifyjs-webpack-plugin");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  entry: {
    index: "./src/index.js",
    bar: "./src/foo.js"
  },
  output: {
    filename: "[name].[hash].js",
    path: __dirname + "/dist"
  },

  module: {
    rules: [
      {
        test: /\.less$/,
        // 因为这个插件需要干涉模块转换的内容，所以需要使用它对应的 loader
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: ["css-loader", "less-loader"]
        })
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: "file-loader",
            options: {}
          }
        ]
      }
    ]
  },

  // 代码模块路径解析的配置
  resolve: {
    modules: ["node_modules", path.resolve(__dirname, "src")],

    extensions: [".wasm", ".mjs", ".js", ".json", ".jsx"]
  },

  plugins: [
    // 使用 uglifyjs-webpack-plugin 来压缩 JS 代码
    new UglifyPlugin(),
    // Generates default index.html
    new HtmlWebpackPlugin(),
    // Also generate a test.html
    new HtmlWebpackPlugin({
      filename: "test.html",
      template: "src/assets/test.html"
    }),
    new ExtractTextPlugin({
      filename: "style.[hash].css"
    })
  ]
};
