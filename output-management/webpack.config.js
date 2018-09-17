const path = require("path");

module.exports = {
  entry: "./src/index.js", // 入口文件
  output: {
    // 打包生成的文件
    filename: "bundle.js", // 文件名
    path: path.resolve(__dirname, "dist") // 生成文件存放的目录
  }
};
