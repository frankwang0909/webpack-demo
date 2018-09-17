const path = require("path");

module.exports = {
  entry: "./src/index.js", // 入口文件
  output: {
    // 打包生成的文件
    filename: "main.js", // 文件名
    path: path.resolve(__dirname, "dist") // 生成文件存放的目录
  },
  module: {
    // 指定规则
    rules: [
      {
        test: /\.css$/, // 监听 .css 结尾的样式文件
        use: ["style-loader", "css-loader"] // 指定使用的 loader
      },
      {
        test: /\.(png|svg|jpg|gif)$/, // 监听 图片
        use: ["file-loader"]
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/, // 监听 字体文件
        use: ["file-loader"]
      },
      {
        test: /\.(csv|tsv)$/,  // 监听 csv/tsv 格式的数据文件
        use: ["csv-loader"]
      },
      {
        test: /\.xml$/,  // 监听 xml 格式的数据文件
        use: ["xml-loader"]
      }
    ]
  }
};
