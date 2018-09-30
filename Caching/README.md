# Caching 缓存

## 1. Output Filenames

A simple way to ensure the browser picks up changed files is by using `output.filename` substitutions. The `[hash]` substitution can be used to include a build-specific hash in the filename, however it's even better to use the `[contenthash]` substitution which is the hash of the content of a file, which is different for each asset.

Let's get our project set up using the example from getting started with the plugins from output management, so we don't have to deal with maintaining our index.html file manually:

### 1.1 修改配置文件：

```js
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
      title: "Caching"
    })
  ],
  output: {
    // filename: "[name].bundle.js",
    filename: "[name].[contenthash].js",
    path: path.resolve(__dirname, "dist")
  }
};
```

### 1.2 执行构建命令

```shell
npm run build
```

打包结果如下：

```
                        Asset       Size  Chunks             Chunk Names
  app.0b812f518e950f99e6dd.js   70.8 KiB    0, 1  [emitted]  app
print.1ae604f34a057a4d6522.js   1.02 KiB       1  [emitted]  print
                   index.html  272 bytes          [emitted]
Entrypoint app = app.0b812f518e950f99e6dd.js
Entrypoint print = print.1ae604f34a057a4d6522.js
```

## 2.Extracting Boilerplate

As we learned in code splitting, the `SplitChunksPlugin` can be used to split modules out into separate bundles. webpack provides an optimization feature which does split out runtime code into a separate chunk(s) according to the options provided, simply use `optimization.runtimeChunk` set to `single` for creating one runtime bundle:

### 2.1 修改配置文件：optimization.runtimeChunk

webpack.config.js

```js
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({
      title: 'Caching'
  ],
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist')
  },
  optimization: {
    runtimeChunk: 'single'
  }
};
```

### 2.2 执行构建命令：

结果如下：

```
                          Asset       Size  Chunks             Chunk Names
runtime.53f9fab62897f60029bf.js   1.42 KiB       0  [emitted]  runtime
    app.5bc3c883d97c3aedde69.js   69.9 KiB    1, 2  [emitted]  app
  print.8dfde67054e3be82bffd.js  199 bytes       2  [emitted]  print
                     index.html  350 bytes          [emitted]
Entrypoint app = runtime.53f9fab62897f60029bf.js app.5bc3c883d97c3aedde69.js
Entrypoint print = runtime.53f9fab62897f60029bf.js print.8dfde67054e3be82bffd.js
```

### 2.3 第三方类库：cacheGroups

It's also good practice to extract third-party libraries, such as `lodash` or `react`, to a separate vendor chunk as they are less likely to change than our local source code. This step will allow clients to request even less from the server to stay up to date. This can be done by using the `cacheGroups` option of the `SplitChunksPlugin` demonstrated in Example 2 of SplitChunksPlugin. Lets add `optimization.splitChunks` with `cacheGroups` with next params and build:

通过设置配置项`optimization.splitChunks`，让依赖的第三方类库单独打包。

#### 2.3.1 修改配置文件：optimization.splitChunks

```js
var path = require("path");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/index.js",
  plugins: [
    new CleanWebpackPlugin(["dist"]),
    new HtmlWebpackPlugin({
      title: "Caching"
    })
  ],
  output: {
    filename: "[name].[contenthash].js",
    path: path.resolve(__dirname, "dist")
  },
  optimization: {
    runtimeChunk: "single",
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all"
        }
      }
    }
  }
};
```

#### 2.3.2 执行构建命令

构建结果如下：

```
                          Asset       Size  Chunks             Chunk Names
runtime.53f9fab62897f60029bf.js   1.42 KiB       0  [emitted]  runtime
    app.c0410ae1f86888d599e7.js  518 bytes    1, 2  [emitted]  app
  print.8dfde67054e3be82bffd.js  199 bytes       2  [emitted]  print
vendors.3fd93d2d688485bf2919.js   69.5 KiB       3  [emitted]  vendors
                     index.html  428 bytes          [emitted]
Entrypoint app = runtime.53f9fab62897f60029bf.js vendors.3fd93d2d688485bf2919.js app.c0410ae1f86888d599e7.js
Entrypoint print = runtime.53f9fab62897f60029bf.js print.8dfde67054e3be82bffd.js
```

app.c0410ae1f86888d599e7.js 不包含 第三方类库，因此体积变小了。

## 3. Module Identifiers

src/print.js

```js
export default function print(text) {
  console.log(text);
}
```

src/index.js

```js
import _ from "lodash";
import Print from "./print";

function component() {
  var element = document.createElement("div");

  // Lodash, now imported by this script
  element.innerHTML = _.join(["Hello", "webpack"], " ");
  element.onclick = Print.bind(null, "Hello webpack!");

  return element;
}

document.body.appendChild(component());
```

执行构建命令，打包结果如下：

```
                          Asset       Size  Chunks             Chunk Names
runtime.53f9fab62897f60029bf.js   1.42 KiB       0  [emitted]  runtime
    app.617fbd3944275f85be61.js  421 bytes    1, 2  [emitted]  app
  print.75162da84ca28f4051d4.js  172 bytes       2  [emitted]  print
vendors.3fd93d2d688485bf2919.js   69.5 KiB       3  [emitted]  vendors
                     index.html  428 bytes          [emitted]
Entrypoint app = runtime.53f9fab62897f60029bf.js vendors.3fd93d2d688485bf2919.js app.617fbd3944275f85be61.js
Entrypoint print = runtime.53f9fab62897f60029bf.js print.75162da84ca28f4051d4.js
```

**注意：** 以上构建结果与官网不同。官网文档应该是旧版的 webpack 构建的结果，每次构建 vendors 的 hash 也会更改。而我使用的版本(4.19.0)，构建的 vendors 的 hash 并不会出现这个问题。

官网文档中使用的 webpack 版本，每次构建 vendors 的 hash 也会更改，导致缓存失效。解决方法是使用 webpack 内置的`HashedModuleIdsPlugin` 插件。

webpack.config.js

```js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");

const webpack = require("webpack");

module.exports = {
  // 指定多个构建入口文件
  entry: {
    app: "./src/index.js",
    print: "./src/print.js"
  },
  plugins: [
    new CleanWebpackPlugin(["dist"]),
    new HtmlWebpackPlugin({
      title: "Caching"
    }),
    new webpack.HashedModuleIdsPlugin()
  ],
  output: {
    filename: "[name].[contenthash].js",
    path: path.resolve(__dirname, "dist")
  },
  optimization: {
    runtimeChunk: "single",
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all"
        }
      }
    }
  }
};
```
