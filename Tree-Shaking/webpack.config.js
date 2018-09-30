const path = require("path");

module.exports = {
  entry: "./src/index.js", // 指定构建的入口文件
  output: {
    // 指定打包输入的文件名和存放路径等
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist")
  },
  // mode: "development" // 指定为开发模式
  mode: "production"
};
