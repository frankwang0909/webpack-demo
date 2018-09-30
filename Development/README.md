# Development 开发模式

## 1. Using source maps 使用 source maps

开发阶段，如果代码出错，通过 source maps 可以找到出错的源代码，而不是打包后的代码。

修改配置文件：

```js
devtool: 'inline-source-map',
```

## 2. Choosing a Development Tool 选择开发工具

It quickly becomes a hassle to manually run `npm run build` every time you want to compile your code.

每次编译代码都需要手动执行 `npm run build` 命令 变得有些麻烦。

There are a couple of different options available in webpack that help you automatically compile your code whenever it changes:

webpack 提供以下三种方式，当代码变化时，可以自动编译：

1. webpack's Watch Mode
2. webpack-dev-server
3. webpack-dev-middleware

In most cases, you probably would want to use `webpack-dev-server`, but let's explore all of the above options.

大多数时候，我们都会选择使用 `webpack-dev-server`。

### 2.1 Using Watch Mode

在 `package.json` 的 `scripts` 字段中增加：

```json
 "watch": "webpack --watch",
```

执行以下命令：

```shell
npm run watch
```

**缺点**：需要手动刷新页面。

### 2.2 Using webpack-dev-server

#### 2.2.1 安装 `webpack-dev-server`

```shell
npm install --save-dev webpack-dev-server
```

#### 2.2.2 修改配置文件

```js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");

module.exports = {
  entry: {
    app: "./src/index.js",
    print: "./src/print.js"
  },
  devtool: "inline-source-map",
  // 设置 devServer 服务器
  devServer: {
    contentBase: "./dist"
  },
  plugins: [
    new CleanWebpackPlugin(["dist"]),
    new HtmlWebpackPlugin({
      title: "Development"
    })
  ],
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist")
  }
};
```

`webpack-dev-server` 会自动启动静态服务器，通过 `localhost:8080`，可访问 `dist` 目录下的文件。

#### 2.2.3 添加 npm scripts

在 `package.json` 的 `scripts` 字段中增加：

```json
"start": "webpack-dev-server --open",
```

#### 2.2.4 执行命令

```shell
npm run start
```

修改 src 目录下的代码（比如 index.js），webpack 将会自动编译，完成之后，会自动刷新浏览器页面。

### 2.3 Using webpack-dev-middleware

#### 2.3.1 安装依赖 express 和 webpack-dev-middleware

```shell
npm install --save-dev express webpack-dev-middleware
```

#### 2.3.2 修改配置文件

```js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");

module.exports = {
  entry: {
    app: "./src/index.js",
    print: "./src/print.js"
  },
  devtool: "inline-source-map",
  devServer: {
    contentBase: "./dist"
  },
  plugins: [
    new CleanWebpackPlugin(["dist"]),
    new HtmlWebpackPlugin({
      title: "Output Management"
    })
  ],
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
    // 设置 publicPath
    publicPath: "/"
  }
};
```

#### 2.3.3 创建自定义的 server.js

在 src 目录同一级，创建 server.js。

```js
const express = require("express");
const webpack = require("webpack");
const webpackDevMiddleware = require("webpack-dev-middleware");

const app = express();
const config = require("./webpack.config.js");
const compiler = webpack(config);

// Tell express to use the webpack-dev-middleware and use the webpack.config.js
// configuration file as a base.
app.use(
  webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath
  })
);

// Serve the files on port 3000.
app.listen(3000, function() {
  console.log("Example app listening on port 3000!\n");
});
```

#### 2.3.4 添加 npm scripts

在 `package.json` 的 `scripts` 字段中增加：

```json
"server": "node server.js",
```

#### 2.3.5 执行命令

```shell
npm run server
```

在浏览器输入 `http://localhost:3000/`，查看页面效果。

#### 2.3.6 与 webpack-dev-server 比较

缺点：

- 1.不能自动打开网页，需要手动在浏览器中输入`http://localhost:3000/`；
- 2.修改代码后，能够自动编译，但是不能自动刷新网页。

## 3. Adjusting Your Text Editor

When using automatic compilation of your code, you could run into issues when saving your files. Some editors have a "safe write" feature that can potentially interfere with recompilation.

To disable this feature in some common editors, see the list below:

- Sublime Text 3: Add `atomic_save: "false"` to your user preferences.
- JetBrains IDEs (e.g. WebStorm): Uncheck `"Use safe write"` in Preferences > Appearance & Behavior > System Settings.
- Vim: Add `:set backupcopy=yes` to your settings.
