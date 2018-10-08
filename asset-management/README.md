# asset management 资源管理

## 1. Loading CSS 加载 CSS

### 1.1 CSS 文件的处理需要用到 `style-loader` 和 `css-loader` 这两个 loader。

```shell
npm install --save-dev style-loader css-loader
```

### 1.2 在配置文件中指定 loader 的规则

```js
const path = require("path");

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist")
  },
  module: {
    // 指定 loader 的规则
    rules: [
      {
        test: /\.css$/, // 指定匹配的文件
        use: ["style-loader", "css-loader"] // 指定需要使用的 loader
      }
    ]
  }
};
```

### 1.3 新增一个样式文件 `src/style.css`。

```
.hello {
  color: red;
}
```

### 1.4 在入口文件 `src/index.js` 中引入样式文件，并给新增的 DOM 节点添加样式。

```js
import _ from "lodash";

// 引入样式文件
import "./style.css";

function component() {
  var element = document.createElement("div");

  // Lodash, now imported by this script
  element.innerHTML = _.join(["Hello", "webpack"], " ");

  // 添加样式
  element.classList.add("hello");

  return element;
}

document.body.appendChild(component());
```

### 1.5 执行构建命令:

```shell
npm run build
```

### 1.6 分离出 CSS 文件

#### 1.6.1 需要用到 MiniCssExtractPlugin 插件：

```shell
npm install --save-dev mini-css-extract-plugin
```

这个插件应该只用于 `production` 模式,并且构建流程中不能与 `style-loader` 同时使用。

配置文件如下所示：

```js
const path = require("path");

// 添加 压缩 CSS 的插件
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist")
  },
  module: {
    // 指定 loader 的规则
    rules: [
      {
        test: /\.css$/, // 指定匹配的文件
        // use: ["style-loader", "css-loader"] // 指定需要使用的 loader
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              // you can specify a publicPath here
              // by default it use publicPath in webpackOptions.output
              publicPath: "../"
            }
          },
          "css-loader"
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: "[name].css",
      chunkFilename: "[id].css"
    })
  ]
};
```

#### 1.6.2 如果需要在 `development` 模式使用 HRM ，在 `production` 模式抽取 CSS 代码 打包成单独的 CSS 文件，可使用如下配置：

```js
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const devMode = process.env.NODE_ENV !== "production";

module.exports = {
  plugins: [
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: devMode ? "[name].css" : "[name].[hash].css",
      chunkFilename: devMode ? "[id].css" : "[id].[hash].css"
    })
  ],
  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          devMode ? "style-loader" : MiniCssExtractPlugin.loader,
          "css-loader",
          "postcss-loader",
          "sass-loader"
        ]
      }
    ]
  }
};
```

### 1.7 Minimizing For Production 生产环境下压缩 CSS

webpack 5 已经内置了压缩 css 功能，但 webpack 4 需要依赖于插件 `optimize-css-assets-webpack-plugin` 来实现。

设置 `optimization.minimizer` 来重写 webpack 的默认配置，需要同时指定了 JS minimizer，即使用了 `uglifyjs-webpack-plugin` 插件。

```shell
npm install --save-dev optimize-css-assets-webpack-plugin uglifyjs-webpack-plugin
```

配置文件如下：

```js
// 先引入 js 的压缩处理插件 uglifyjs-webpack-plugin
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
module.exports = {
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: true // set to true if you want JS source maps
      }),
      new OptimizeCSSAssetsPlugin({})
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css"
    })
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"]
      }
    ]
  }
};
```

## 2. Loading Images 加载图片

### 2.1 安装依赖的 `file-loader`:

```shell
npm install --save-dev file-loader
```

### 2.2 修改配置文件 webpack.config.js

```js
const path = require("path");

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist")
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      // 指定 图片的加载规则
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: ["file-loader"]
      }
    ]
  }
};
```

### 2.3 添加一个图片 `src/icon.png`

### 2.4 `src/index.js` 引入图片

```js
import Icon from "./icon.png";
```

### 2.5 执行构建命令

```shell
npm run build
```

### 2.6 minifying and optimizing your images 压缩和优化图片

`image-webpack-loader` 和 `url-loader`

## 3. Loading Fonts 加载字体

### 3.1 字体文件与图片文件类似，依赖于 `file-loader`。

### 3.2 修改配置文件 webpack.config.js:

```js
const path = require("path");

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist")
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: ["file-loader"]
      },
      // 指定字体文件加载规则
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: ["file-loader"]
      }
    ]
  }
};
```

### 3.3 增加 字体文件 到 `src/` 目录

```
 |- /src
+   |- my-font.woff
+   |- my-font.woff2
    |- icon.png
    |- style.css
    |- index.js
```

### 3.4 在 样式文件中引入 字体文件

通过 @font-face 声明，引入字体文件

```css
@font-face {
  font-family: "MyFont";
  src: url("./my-font.woff2") format("woff2"), url("./my-font.woff") format("woff");
  font-weight: 600;
  font-style: normal;
}

.hello {
  color: red;
  font-family: "MyFont";
  background: url("./icon.png");
}
```

## 4. Loading Data 加载数据

### 4.1 加载包括 JSON, CSVs, TSVs, XML 等格式的数据文件。

webpack 内置支持 JSON，类似于 NodeJS, 可以直接 `import Data from './data.json'`>

要加载 其他格式，比如 CSVs, TSVs, XML， 则需要依赖额外的 `csv-loader` 和 `xml-loader`。

```shell
npm install --save-dev csv-loader xml-loader
```

### 4.2 修改配置文件：

```js
const path = require("path");

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist")
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: ["file-loader"]
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: ["file-loader"]
      },
      {
        test: /\.(csv|tsv)$/,
        use: ["csv-loader"]
      },
      {
        test: /\.xml$/,
        use: ["xml-loader"]
      }
    ]
  }
};
```

### 4.3 添加 xml 文件

```
|- /src
+   |- data.xml
    |- my-font.woff
    |- my-font.woff2
    |- icon.png
    |- style.css
    |- index.js
```

### 4.4 在 src/index.js 中 引入 data.xml

```js
// 引入 xml 文件
import Data from "./data.xml";
```

## 5. Global asset VS components

可以使用更简便的方式来组织代码， 静态资源可以不放在全局的 assets 目录下，而是放在各自的组件中：

```
- |- /assets
+ |– /components
+ |  |– /my-component
+ |  |  |– index.jsx
+ |  |  |– index.css
+ |  |  |– icon.svg
+ |  |  |– img.png
```
