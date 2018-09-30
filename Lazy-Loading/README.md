# Lazy Loading 按需加载

Lazy, or "on demand", loading is a great way to optimize your site or application. This practice essentially involves splitting your code at logical breakpoints, and then loading it once the user has done something that requires, or will require, a new block of code. This speeds up the initial load of the application and lightens its overall weight as some blocks may never even be loaded.

src/print.js

```js
console.log(
  "The print.js module has loaded! See the network tab in dev tools..."
);

export default () => {
  console.log('Button Clicked: Here\'s "some text"!');
};
```

src/index.js

```js
import _ from "lodash";

function component() {
  var element = document.createElement("div");
  var button = document.createElement("button");
  var br = document.createElement("br");

  button.innerHTML = "Click me and look at the console!";
  element.innerHTML = _.join(["Hello", "webpack"], " ");
  element.appendChild(br);
  element.appendChild(button);

  // Note that because a network request is involved, some indication
  // of loading would need to be shown in a production-level site/app.
  button.onclick = e =>
    import(/* webpackChunkName: "print" */ "./print").then(module => {
      var print = module.default;

      print();
    });

  return element;
}
document.body.appendChild(component());
```

执行构建命令：

```shell
npm run build
```

打包结果如下：

```
          Asset       Size  Chunks             Chunk Names
index.bundle.js    556 KiB   index  [emitted]  index
print.bundle.js  659 bytes   print  [emitted]  print
```

## Frameworks

Many frameworks and libraries have their own recommendations on how this should be accomplished within their methodologies. Here are a few examples:

- React: [Code Splitting and Lazy Loading](https://reacttraining.com/react-router/web/guides/code-splitting)
- Vue: [Lazy Load in Vue using Webpack's code splitting](https://alexjoverm.github.io/2017/07/16/Lazy-load-in-Vue-using-Webpack-s-code-splitting/)
- AngularJS: [AngularJS + Webpack = lazyLoad by @var_bincom](https://medium.com/@var_bin/angularjs-webpack-lazyload-bb7977f390dd)
