# Hot Module Replacement 模块热更新

Hot Module Replacement (or HMR) is one of the most useful features offered by webpack. It allows all kinds of modules to be updated at runtime without the need for a full refresh. This page focuses on implementation while the concepts page gives more details on how it works and why it's useful.

HMR is not intended for use in production, meaning it should only be used in development. See the building for production guide for more information.

HMR 只适用于 `开发环境`，不适用于 `生产环境`。

## 1.Enabling HMR 开启 HMR

### 1.1 修改配置文件 `webpack.config.js`，开启 HMR。

```js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
// 引入 webpack 模块
const webpack = require("webpack");

module.exports = {
  entry: {
    app: "./src/index.js"
  },
  devtool: "inline-source-map",
  devServer: {
    contentBase: "./dist",
    // 开启 HMR
    hot: true
  },
  plugins: [
    new CleanWebpackPlugin(["dist"]),
    new HtmlWebpackPlugin({
      title: "Hot Module Replacement"
    }),
    // 使用 webpack 内置的 HMR 插件
    new webpack.HotModuleReplacementPlugin()
  ],
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist")
  }
};
```

### 1.2 修改 index.js 和 print.js

src/index.js

```js
import _ from "lodash";

import printMe from "./print.js";

function component() {
  let element = document.createElement("div");
  let btn = document.createElement("button");

  element.innerHTML = _.join(["Webpack is ", "Awesome"], " ");

  btn.innerHTML = "Click Me";
  btn.onclick = printMe;
  element.appendChild(btn);

  return element;
}

document.body.appendChild(component());

// 如果支持 HMR
if (module.hot) {
  module.hot.accept("./print.js", function() {
    console.log("Accepting the updated printMe module!");
    printMe();
  });
}
```

src/print.js

```js
export default function printMe() {
  // console.log("I get called from print.js!");
  console.log("Updating print.js...");
}
```

### 1.3 查看控制台 console 的日志

```
[WDS] App hot update...       log.js:24
[HMR] Checking for updates on the server...   index.js:23
Accepting the updated printMe module!     print.js:3
Updating print.js...        log.js:24
[HMR] Updated modules:        log.js:24
[HMR]  - 0        log.js:24
[HMR] Consider using the NamedModulesPlugin for module names.        log.js:24
[HMR] App is up to date.
```

## 2. Via the Node.js API

dev-sever.js

```js
const webpackDevServer = require("webpack-dev-server");
const webpack = require("webpack");

const config = require("./webpack.config.js");
const options = {
  contentBase: "./dist",
  hot: true,
  host: "localhost"
};

webpackDevServer.addDevServerEntrypoints(config, options);
const compiler = webpack(config);
const server = new webpackDevServer(compiler, options);

server.listen(5000, "localhost", () => {
  console.log("dev server listening on port 5000");
});
```

## 3. Gotchas

开启 HMR 后，代码实现了热更新，但是之前绑定的事件需要做相应的处理，否则还是触发原来绑定的事件回调。

src/index.js

```js
import _ from "lodash";
import printMe from "./print.js";

function component() {
  var element = document.createElement("div");
  var btn = document.createElement("button");

  element.innerHTML = _.join(["Hello", "webpack"], " ");

  btn.innerHTML = "Click me and check the console!";
  btn.onclick = printMe; // onclick event is bind to the original printMe function

  element.appendChild(btn);

  return element;
}

// - document.body.appendChild(component());
let element = component(); // Store the element to re-render on print.js changes
document.body.appendChild(element);

if (module.hot) {
  module.hot.accept("./print.js", function() {
    console.log("Accepting the updated printMe module!");
    // -     printMe();
    // 移除原来的节点，并重新渲染节点
    document.body.removeChild(element);
    element = component(); // Re-render the "component" to update the click handler
    document.body.appendChild(element);
  });
}
```

## 4. HMR with Stylesheets

### 4.1 安装依赖的 loader （前面已经安装过）

```
npm install --save-dev style-loader css-loader
```

### 4.2 修改配置文件

```js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const webpack = require("webpack");

module.exports = {
  entry: {
    app: "./src/index.js"
  },
  devtool: "inline-source-map",
  devServer: {
    contentBase: "./dist",
    hot: true
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(["dist"]),
    new HtmlWebpackPlugin({
      title: "Hot Module Replacement"
    }),
    new webpack.HotModuleReplacementPlugin()
  ],
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist")
  }
};
```

### 4.3 新增 src/style.css 文件

### 4.4 src/index.js 引入 style.css

```js
import "./styles.css";
```

### 4.5 执行命令

```shell
npm run start
```

### 4.6 修改 style.css

修改样式背景颜色， 样式自动热更新

## 5. Other Code and Frameworks

There are many other loaders and examples out in the community to make HMR interact smoothly with a variety of frameworks and libraries...

- React Hot Loader: Tweak react components in real time.
- Vue Loader: This loader supports HMR for vue components out of the box.
- Elm Hot Loader: Supports HMR for the Elm programming language.
- Angular HMR: No loader necessary! A simple change to your main NgModule file is all that's required to have full control over the HMR APIs.
