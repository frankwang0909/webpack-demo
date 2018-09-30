# Production 生产模式

## 1. Setup

The goals of development and production builds differ greatly. In development, we want strong source mapping and a localhost server with live reloading or hot module replacement. In production, our goals shift to a focus on minified bundles, lighter weight source maps, and optimized assets to improve load time. With this logical separation at hand, we typically recommend writing separate webpack configurations for each environment.

由于 开发模式 与 生产模式 的构建目的差异很大，我们可以将配置文件`webpack.config.js`拆分。

```
|- webpack.common.js
|- webpack.dev.js
|- webpack.prod.js
```

`webpack.dev.js` 或者 `webpack.prod.js` 需要使用 `webpack-merge` 来合并公共的配置( `webpack.common.js` )与 开发环境或者生产环境单独的配置项。
`

```shell
npm install --save-dev webpack-merge
```

webpack.dev.js

```js
const merge = require("webpack-merge");
const common = require("./webpack.common.js");

module.exports = merge(common, {
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    contentBase: "./dist"
  }
});
```

webpack.prod.js

```js
const merge = require("webpack-merge");
const common = require("./webpack.common.js");

module.exports = merge(common, {
  mode: "production"
});
```

## 2. NPM Scripts

修改 npm scripts 脚本：

package.json

```json
"scripts": {
  "start": "webpack-dev-server --open --config webpack.dev.js",
  "build": "webpack --config webpack.prod.js"
},
```

## 3. Specify the Mode

src/index.js

```js
import { cube } from "./math.js";

if (process.env.NODE_ENV !== "production") {
  console.log("Looks like we are in development mode!");
}

function component() {
  var element = document.createElement("pre");

  element.innerHTML = ["Hello webpack!", "5 cubed is equal to " + cube(5)].join(
    "\n\n"
  );

  return element;
}

document.body.appendChild(component());
```

## 4. Minification

webpack v4+ will minify your code by default in `production mode`.

生产模式下，webpack 4 默认会压缩代码(使用了 UglifyJSPlugin)。

Note that while the `UglifyJSPlugin` is a great place to start for minification and being used by default, there are other options out there. Here are a few more popular ones:

- BabelMinifyWebpackPlugin
- ClosureCompilerPlugin

If you decide to try another minification plugin, just make sure your new choice also drops dead code as described in the tree shaking guide and provide it as the optimization.minimizer.

## 5. Source Mapping

建议在生产模式下也使用 source map 方便排查错误。

与 开发模式的 `inline-source-map` 不同，生产模式下使用 `source-map`。

```js
const merge = require("webpack-merge");
const common = require("./webpack.common.js");

module.exports = merge(common, {
  mode: "production",
  devtool: "source-map"
});
```

## 6. Minimize CSS

It is crucial to minimize your CSS on production, please see [Minimizing for Production](https://webpack.js.org/plugins/mini-css-extract-plugin/#minimizing-for-production) section.
