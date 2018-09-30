# Tree Shaking

Tree shaking is a term commonly used in the JavaScript context for dead-code elimination. It relies on the static structure of ES2015 module syntax, i.e. `import` and `export`. The name and concept have been popularized by the ES2015 module bundler `rollup`.

The webpack 2 release came with built-in support for ES2015 modules (alias harmony modules) as well as unused module export detection. The new webpack 4 release expands on this capability with a way to provide hints to the compiler via the "sideEffects" `package.json` property to denote which files in your project are "pure" and therefore safe to prune if unused.

## 1. Add a Utility

### 1.1 新增一个工具方法。

src/math.js

```js
export function square(x) {
  return x * x;
}

export function cube(x) {
  return x * x * x;
}
```

### 1.2 修改配置文件

Set the mode configuration option to development to make sure that the bundle is not minified:

指定 `mode` 为 `development`, 确保不压缩打包的 js 文件。

webpack.config.js

```js
const path = require("path");

module.exports = {
  entry: "./src/index.js", // 指定构建的入口文件
  output: {
    // 指定打包输入的文件名和存放路径等
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist")
  },
  mode: "development" // 指定为开发模式
};
```

### 1.3 更新 src/index.js

```js
// - import _ from 'lodash';
import { cube } from "./math.js";

function component() {
  // -   var element = document.createElement('div');
  var element = document.createElement("pre");

  // -   // Lodash, now imported by this script
  // -   element.innerHTML = _.join(['Hello', 'webpack'], ' ');
  element.innerHTML = ["Hello webpack!", "5 cubed is equal to " + cube(5)].join(
    "\n\n"
  );

  return element;
}

document.body.appendChild(component());
```

### 1.4 执行命令

Note that we did not `import` the `square` method from the `src/math.js` module. That function is what's known as "dead code", meaning an unused `export` that should be dropped. Now let's run our npm script, `npm run build`, and inspect the output bundle:

我们没有使用到 `src/math.js` 模块中的 `square` 方法。这个方法不应该包含在打包文件中。执行以下命令:

```shell
npm run build
```

查看生成的 dist/bundle.js 文件, 发现 square 方法的代码被打包到了 bundle.js 中。

## 2. Mark the file as side-effect-free

在 `package.json` 文件中，添加 `sideEffects` 字段

```json
"sideEffects": false,
```

A "side effect" is defined as code that performs a special behavior when imported, other than exposing one or more exports. An example of this are polyfills, which affect the global scope and usually do not provide an export.

If your code did have some side effects though, an array can be provided instead:

```json
{
  "name": "your-project",
  "sideEffects": ["./src/some-side-effectful-file.js"]
}
```

The array accepts relative, absolute, and glob patterns to the relevant files. It uses micromatch under the hood.

Note that any imported file is subject to tree shaking. This means if you use something like `css-loader` in your project and import a CSS file, it needs to be added to the side effect list so it will not be unintentionally dropped in production mode:

```json
{
  "name": "your-project",
  "sideEffects": ["./src/some-side-effectful-file.js", "*.css"]
}
```

Finally, "sideEffects" can also be set from the `module.rules` configuration option.

## 3. Minify the Output 压缩生成的文件

### 3.1 修改配置文件：

```js
const path = require("path");

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist")
  },
  mode: "production"
};
```

### 3.2 执行构建命令

```shell
npm run build
```

打包生成的 bundle.js 被压缩和混淆了，并且没有了 square 方法。

### 3.3 ModuleConcatenationPlugin

`ModuleConcatenationPlugin` is needed for the tree shaking to work. It is added by `mode: "production"`. If you are not using it, remember to add the `ModuleConcatenationPlugin` manually.

webapack 的 tree shaking 功能依赖于 `ModuleConcatenationPlugin`插件。设置 `mode: "production"`, 则自动添加了 `ModuleConcatenationPlugin` 插件。如果没有指定 `mode: "production"`，则需要手动添加该插件。

## 4. Conclusion 总结

So, what we've learned is that in order to take advantage of tree shaking, you must...

- Use ES2015 module syntax (i.e. import and export).
- Add a "sideEffects" property to your project's package.json file.
- Use production mode configuration option to enable various optimizations including minification and tree shaking.

You can imagine your application as a tree. The source code and libraries you actually use represent the green, living leaves of the tree. Dead code represents the brown, dead leaves of the tree that are consumed by autumn. In order to get rid of the dead leaves, you have to shake the tree, causing them to fall.

If you are interested in more ways to optimize your output, please jump to the next guide for details on building for production.
