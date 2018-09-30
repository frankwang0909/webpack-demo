# Code Splitting 代码拆分

There are three general approaches to code splitting available:

- Entry Points: Manually split code using entry configuration.
- Prevent Duplication: Use the SplitChunksPlugin to dedupe and split chunks.
- Dynamic Imports: Split code via inline function calls within modules.

## 1.Entry Points 指定多个入口文件

This is by far the easiest, and most intuitive, way to split code. However, it is more manual and has some pitfalls we will go over. Let's take a look at how we might split another module from the main bundle:

### 1.1 新增一个 js 模块：

src/another-module.js

```js
import _ from "lodash";

console.log(_.join(["Another", "module", "loaded!"], " "));
```

### 1.2 修改配置文件：指定多个入口文件

webpack.config.js

```js
const path = require("path");

module.exports = {
  mode: "development",
  entry: {
    index: "./src/index.js",
    another: "./src/another-module.js"
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist")
  }
};
```

### 1.3 执行构建命令

```shell
npm run build
```

生成两个 bundle 文件：

```
            Asset     Size   Chunks             Chunk Names
another.bundle.js  551 KiB  another  [emitted]  another
  index.bundle.js  551 KiB    index  [emitted]  index
```

### 1.4 问题

As mentioned there are some pitfalls to this approach:

- If there are any duplicated modules between entry chunks they will be included in both bundles.
- It isn't as flexible and can't be used to dynamically split code with the core application logic.

The first of these two points is definitely an issue for our example, as lodash is also imported within ./src/index.js and will thus be duplicated in both bundles. Let's remove this duplication by using the [SplitChunksPlugin](https://webpack.js.org/plugins/split-chunks-plugin/).

1. 如果有入口文件有引用相同的模块，则会重复打包该模块。

2. 不够灵活，不能动态拆分代码。

解决方法： 使用 SplitChunksPlugin 插件来拆分代码

## 2.Prevent Duplication 防止重复

The `SplitChunksPlugin` allows us to extract common dependencies into an existing entry chunk or an entirely new chunk. Let's use this to de-duplicate the `lodash` dependency from the previous example:

### 2.1 修改配置文件： 增加代码拆分配置项

webpack.config.js

```js
const path = require("path");

module.exports = {
  mode: "development",
  entry: {
    index: "./src/index.js",
    another: "./src/another-module.js"
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist")
  },
  optimization: {
    splitChunks: {
      chunks: "all"
    }
  }
};
```

### 2.2 执行构建命令：

With the `optimization.splitChunks` configuration option in place, we should now see the duplicate dependency removed from our `index.bundle.js` and `another.bundle.js`. The plugin should notice that we've separated `lodash` out to a separate chunk and remove the dead weight from our main bundle. Let's do an `npm run build` to see if it worked:

```shell
npm run build
```

生成了三个 bundle 文件，其中共同依赖的 lodash 库单独打包成一个 bundle。

```
                          Asset      Size                 Chunks             Chunk Names
              another.bundle.js  6.94 KiB                another  [emitted]  another
                index.bundle.js  7.04 KiB                  index  [emitted]  index
vendors~another~index.bundle.js   547 KiB  vendors~another~index  [emitted]  vendors~another~index
```

### 2.3 其他拆分代码的插件

Here are some other useful plugins and loaders provided by the community for splitting code:

- mini-css-extract-plugin: Useful for splitting CSS out from the main application.
- bundle-loader: Used to split code and lazy load the resulting bundles.
- promise-loader: Similar to the bundle-loader but uses promises.

## 3. Dynamic Imports 动态引入

Two similar techniques are supported by webpack when it comes to dynamic code splitting. The first and recommended approach is to use the `import()` syntax that conforms to the ECMAScript proposal for dynamic imports. The legacy, webpack-specific approach is to use `require.ensure`. Let's try using the first of these two approaches...

`import()` calls use `promises` internally. If you use `import()` with older browsers, remember to shim `Promise` using a polyfill such as `es6-promise` or `promise-polyfill`.

### 3.1 import()

Before we start, let's remove the extra `entry` and `optimization.splitChunks` from our config as they won't be needed for this next demonstration:

#### 3.1.1 修改配置文件:

移除额外的入口文件和 `optimization.splitChunks` 配置项。

webpack.config.js

```js
const path = require("path");

module.exports = {
  mode: "development",
  entry: {
    index: "./src/index.js"
    // -   another: './src/another-module.js'
  },
  output: {
    filename: "[name].bundle.js",
    chunkFilename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist")
  }
  // -   optimization: {
  // -     splitChunks: {
  // -       chunks: 'all'
  // -     }
  // -   }
};
```

#### 3.1.2 移除未使用的 js 文件

Note the use of `chunkFilename`, which determines the name of non-entry chunk files. For more information on `chunkFilename`, see [output documentation](https://webpack.js.org/configuration/output/#output-chunkfilename). We'll also update our project to remove the now unused files:

删掉 src/another-module.js

#### 3.1.3 动态引入模块

Now, instead of statically importing lodash, we'll use dynamic importing to separate a chunk:

src/index.js

```js
function getComponent() {
  return import(/* webpackChunkName: "lodash" */ "lodash")
    .then(({ default: _ }) => {
      var element = document.createElement("div");

      element.innerHTML = _.join(["Hello", "webpack"], " ");

      return element;
    })
    .catch(error => "An error occurred while loading the component");
}

getComponent().then(component => {
  document.body.appendChild(component);
});
```

**注意**：注释中的 `webpackChunkName： "lodash"` , webpack 读取这条注释， 给 单独打包的 bundle 命名为`lodash.bundle.js`。

Note the use of `webpackChunkName` in the comment. This will cause our separate bundle to be named `lodash.bundle.js`instead of just `[id].bundle.js`. For more information on `webpackChunkName` and the other available options, see the [import() documentation](https://webpack.js.org/api/module-methods/#import-). Let's run webpack to see `lodash` separated out to a separate bundle:

#### 3.1.4 执行构建命令

```shell
npm run build
```

```
                   Asset      Size          Chunks             Chunk Names
         index.bundle.js  9.02 KiB           index  [emitted]  index
vendors~lodash.bundle.js   547 KiB  vendors~lodash  [emitted]  vendors~lodash
```

#### 3.1.5 async

As `import()` returns a promise, it can be used with `async functions`. However, this requires using a pre-processor like `Babel` and the `Syntax Dynamic Import Babel Plugin`. Here's how it would simplify the code:

src/index.js

```js
// - function getComponent() {
async function getComponent() {
  // -   return import(/* webpackChunkName: "lodash" */ 'lodash').then({ default: _ } => {
  // -     var element = document.createElement('div');
  // -
  // -     element.innerHTML = _.join(['Hello', 'webpack'], ' ');
  // -
  // -     return element;
  // -
  // -   }).catch(error => 'An error occurred while loading the component');
  var element = document.createElement("div");
  const {
    default: _
  } = await import(/* webpackChunkName: "lodash" */ "lodash");

  element.innerHTML = _.join(["Hello", "webpack"], " ");

  return element;
}

getComponent().then(component => {
  document.body.appendChild(component);
});
```

## 4. Prefetching/Preloading modules 预加载模块

webpack 4.6.0+ adds support for prefetching and preloading.

Using these inline directives while declaring your imports allows webpack to output “Resource Hint” which tells the browser that for:

- prefetch: resource is probably needed for some navigation in the future
- preload: resource might be needed during the current navigation

### 4.1 prefetch

Simple prefetch example can be having a `HomePage` component, which renders a `LoginButton` component which then on demand loads a `LoginModal` component after being clicked.

LoginButton.js

```js
//...
import(/* webpackPrefetch: true */ "LoginModal");
```

This will result in `<link rel="prefetch" href="login-modal-chunk.js">` being appended in the head of the page, which will instruct the browser to prefetch in idle time the `login-modal-chunk.js` file.

### 4.2 preload

Preload directive has a bunch of differences compared to prefetch:

- A preloaded chunk starts loading in parallel to the parent chunk. A prefetched chunk starts after the parent chunk finishes loading.
- A preloaded chunk has medium priority and is instantly downloaded. A prefetched chunk is downloaded while browser is idle.
- A preloaded chunk should be instantly requested by the parent chunk. A prefetched chunk can be used anytime in the future.
- Browser support is different.

Simple preload example can be having a `Component` which always depends on a big library that should be in a separate chunk.

Let's imagine a component `ChartComponent` which needs huge `ChartingLibrary`. It displays a `LoadingIndicator` when rendered and instantly does an on demand import of `ChartingLibrary`:

ChartComponent.js

```js
//...
import(/* webpackPreload: true */ "ChartingLibrary");
```

When a page which uses the `ChartComponent` is requested, the `charting-library-chunk` is also requested via `<link rel="preload">`. Assuming the `page-chunk` is smaller and finishes faster, the page will be displayed with a `LoadingIndicator`, until the already requested `charting-library-chunk` finishes. This will give a little load time boost since it only needs one round-trip instead of two. Especially in high-latency environments.

Using `webpackPreload` incorrectly can actually hurt performance, so be careful when using it.

## 5. Bundle Analysis

Once you start splitting your code, it can be useful to analyze the output to check where modules have ended up. The [official analyze tool](https://github.com/webpack/analyse) is a good place to start. There are some other community-supported options out there as well:

- webpack-chart: Interactive pie chart for webpack stats.
- webpack-visualizer: Visualize and analyze your bundles to see which modules are taking up space and which might be duplicates.
- webpack-bundle-analyzer: A plugin and CLI utility that represents bundle content as convenient interactive zoomable treemap.

## 6. Next Steps

See `Lazy Loading` for a more concrete example of how `import()` can be used in a real application and `Caching` to learn how to split code more effectively.
