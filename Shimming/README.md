# Shimming

The webpack compiler can understand modules written as ES2015 modules, CommonJS or AMD. However, some third party libraries may expect global dependencies (e.g. $ for jQuery). The libraries might also create globals which need to be exported. These "broken modules" are one instance where shimming comes into play.

We don't recommend using globals! The whole concept behind webpack is to allow more modular front-end development. This means writing isolated modules that are well contained and do not rely on hidden dependencies (e.g. globals). Please use these features only when necessary.

Another instance where shimming can be useful is when you want to polyfill browser functionality to support more users. In this case, you may only want to deliver those polyfills to the browsers that need patching (i.e. load them on demand).

第一种场景：没有使用模块化来编写的第三方类库（比如 jQuery），需要依赖全局变量。

第二种场景：需要使用 浏览器某个功能的垫片库（polyfill）来支持更多用户时，按需加载 polyfill。

## 1. Shimming Globals 全局变量

Remember that `lodash` package we were using? For demonstration purposes, let's say we wanted to instead provide this as a `global` throughout our application. To do this, we can use the `ProvidePlugin`.

The `ProvidePlugin` makes a package available as a variable in every module compiled through webpack. If webpack sees that variable used, it will include the given package in the final bundle. Let's go ahead by removing the `import` statement for `lodash` and instead providing it via the plugin:

使用 webpack 内置的 `ProvidePlugin` 插件，使某个模块在变成全局变量，在 通过 webpack 编译的所有模块中都可以读取到。

### 1.1 修改 src/index.js, 删除 import lodash 的声明语句：

```js
// - import _ from 'lodash';
// -
function component() {
  var element = document.createElement("div");

  // -   // Lodash, now imported by this script
  element.innerHTML = _.join(["Hello", "webpack"], " ");

  return element;
}

document.body.appendChild(component());
```

### 1.2 修改配置文件：ProvidePlugin

```js
const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist")
  },
  plugins: [
    new webpack.ProvidePlugin({
      _: "lodash"
    })
  ]
};
```

### 1.3 执行构建命令

```shell
npm run build
```

构建结果应该和原来一致：

```
    Asset      Size  Chunks             Chunk Names
bundle.js  70.5 KiB       0  [emitted]  main
Entrypoint main = bundle.js
```

### 1.4 只暴露模块中的某个或某些方法，而不是整个模块：

We can also use the `ProvidePlugin` to expose a single export of a module by configuring it with an "array path" (e.g. [module, child, ...children?]). So let's imagine we only wanted to provide the `join` method from lodash wherever it's invoked:

通过配置，可以只暴露模块的某个方法。假设我们只需要暴露 `lodash` 的 `join` 方法：

src/index.js

```js
function component() {
  var element = document.createElement("div");

  // -   element.innerHTML = _.join(['Hello', 'webpack'], ' ');
  element.innerHTML = join(["Hello", "webpack"], " ");

  return element;
}

document.body.appendChild(component());
```

修改配置文件：

```js
const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist")
  },
  plugins: [
    new webpack.ProvidePlugin({
      //  _: 'lodash'
      join: ["lodash", "join"]
    })
  ]
};
```

This would go nicely with `Tree Shaking` as the rest of the lodash library should get dropped.

## 2. Granular Shimming

Some legacy modules rely on this being the window object. Let's update our index.js so this is the case:

有些遗留下来模块依赖于 `this` 作为 `window 对象`。

src/index.js

```js
function component() {
  var element = document.createElement("div");

  element.innerHTML = join(["Hello", "webpack"], " ");

  // Assume we are in the context of `window`
  this.alert("Hmmm, this probably isn't a great idea...");

  return element;
}

document.body.appendChild(component());
```

This becomes a problem when the module is executed in a `CommonJS` context where `this` is equal to `module.exports`. In this case you can override `this` using the `imports-loader`:

这种写法在 CommonJS 规范中会出问题。 在 CommonJS 中，`this` 相当于 `module.exports` 。 解决方法是 使用 `imports-loader` 来重写 `this`。

```js
const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist")
  },
  module: {
    rules: [
      {
        test: require.resolve("index.js"),
        use: "imports-loader?this=>window"
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      join: ["lodash", "join"]
    })
  ]
};
```

## 3. Global Exports 全局导出

Let's say a library creates a global variable that it expects its consumers to use. We can add a small module to our setup to demonstrate this:

一个库文件要创建一个全局变量供其他模块使用。

src/globals.js

```js
var file = "blah.txt";
var helpers = {
  test: function() {
    console.log("test something");
  },
  parse: function() {
    console.log("parse something");
  }
};
```

Now, while you'd likely never do this in your own source code, you may encounter a dated library you'd like to use that contains similar code to what's shown above. In this case, we can use `exports-loader`, to export that global variable as a normal module export. For instance, in order to export `file` as `file` and `helpers.parse` as `parse`:

使用 `exports-loader` 来导出一个全局变量，作为一个正常的模块导出。

```js
const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist")
  },
  module: {
    rules: [
      {
        test: require.resolve("./src/index.js"),
        use: "imports-loader?this=>window"
      },
      {
        test: require.resolve(".src/globals.js"),
        use: "exports-loader?file,parse=helpers.parse"
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      join: ["lodash", "join"]
    })
  ]
};
```

Now from within our entry script (i.e. src/index.js), we could `import { file, parse } from './globals.js';` and all should work smoothly.

此时，我们可以在入口文件(src/index.js)中 `import { file, parse } from './globals.js';`。

**注意**： 运行构建命令，报错

```
ERROR in ./src/index.js 4:0
Module parse failed: 'import' and 'export' may only appear at the top level (4:0)
You may need an appropriate loader to handle this file type.
| (function() {
|
> import { file, parse } from "./globals.js";
|
| function component() {
```
