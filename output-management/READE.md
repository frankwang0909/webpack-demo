# Output Management 输出管理

So far we've manually included all our assets in our `index.html` file, but as your application grows and once you start using `hashes` in filenames and outputting multiple bundles, it will be difficult to keep managing your `index.html` file manually. However, a few plugins exist that will make this process much easier to manage.

## 1.Preparation 准备

### 1.1 新增一个 src/print.js

```js
export default function printMe() {
  console.log("I get called from print.js!");
}
```

### 1.2 在 src/index.js 中引用 print.js

```js
import _ from "lodash";

import printMe from "./print.js";

function component() {
  let element = document.createElement("div");
  let btn = document.createElement("button");

  element.innerHTML = _.join(["Hello", "webpack"], " ");

  btn.innerHTML = "Click me and check the console!";
  btn.onclick = printMe;
  element.appendChild(btn);

  return element;
}

document.body.appendChild(component());
```

### 1.3 dist/index.html

```html
<!doctype html>
  <html>
    <head>
    <title>Output Management</title>
    <script src="./print.bundle.js"></script>
  </head>
  <body>
      <script src="./app.bundle.js"></script>
  </body>
</html>
```

### 1.4 修改配置文件

```js
const path = require("path");

module.exports = {
  // entry: "./src/index.js",
  // 指定多个构建入口文件
  entry: {
    app: "./src/index.js",
    print: "./src/print.js"
  },
  output: {
    // filename: "bundle.js",
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist")
  }
};
```

### 1.5 执行构建命令

```shell
npm run build
```

生成了 `app.bundle.js` 和 `print.bundle.js`。

## 2. 使用 HtmlWebpackPlugin 插件

使用 `HtmlWebpackPlugin` 插件 自动生成 `index.html` 文件

### 2.1 安装插件

```shell
npm install --save-dev html-webpack-plugin
```

### 2.2 修改配置文件

```js
const path = require("path");

// 引入 HtmlWebpackPlugin 插件
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: {
    app: "./src/index.js",
    print: "./src/print.js"
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist")
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Output Management"
    })
  ]
};
```

### 2.3 执行构建命令

```shell
npm run build
```

将会自动生成 `dist/index.html` 文件，如果 dist 目录下原本有 `index.html`，则会替换掉原来的 `index.html`.

## 3. Cleaning up the /dist folder 清空 dist 目录

使用 `clean-webpack-plugin` 插件，可以在每次构建前，清空 dist 目录，删除 dist 下的所有文件。

### 3.1 安装插件

```shell
npm install --save-dev clean-webpack-plugin
```

### 3.2 修改配置文件

```js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

// 用于清空 dist 目录的 CleanWebpackPlugin 插件
const CleanWebpackPlugin = require("clean-webpack-plugin");

module.exports = {
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
```

### 3.3 执行构建命令

```shell
npm run build
```

将会自动清空 dist 目录下的文件，重新生成 index.html, app.bundle.js, print.bundle.js

## 4. The Manifest

You might be wondering how webpack and its plugins seem to "know" what files are being generated. The answer is in the manifest that webpack keeps to track how all the modules map to the output bundles. If you're interested in managing webpack's output in other ways, the manifest would be a good place to start.

The manifest data can be extracted into a json file for easy consumption using the WebpackManifestPlugin.

We won't go through a full example of how to use this plugin within your projects, but you can read up on the concept page and the caching guide to find out how this ties into long term caching.

webpack 通过 manifest 来追踪模块，从而得知那些文件需要打包输出。
