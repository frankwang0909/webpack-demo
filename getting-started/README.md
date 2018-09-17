

## 通过 `<script>` 引入 依赖的脚本(lodash.js)存在以下问题：

1.It is not immediately apparent that the script depends on an external library.

脚本间的依赖关系不明显。

2.If a dependency is missing, or included in the wrong order, the application will not function properly.

如果缺少依赖的脚本，或者引入的顺序不对，应用将无法正常工作。

3.If a dependency is included but not used, the browser will be forced to download unnecessary code.

如果引入的依赖脚本并没有真正被使用到，浏览器还是会加载这些不必要的代码。


## 用 `webpack` 可以解决以上问题。

### 1. 目录结构做微调：

分为 `src` 和 `dist` 两个目录分别存放 源代码 和 压缩混淆处理后的代码。

### 2. 通过 `npm install` 下载依赖的脚本到本地

```shell
npm install --save lodash
```

### 3. 通过 import 关键字引入依赖的脚本

```js
import _ from "lodash";
```

### 4. 修改 html 页面中引入的脚本

1.去掉通过 `<script>` 引入的依赖脚本(lodash.js)；

2.引入压缩打包后的脚本.
```html
<script src="main.js"></script>
```

## 运行 `npx webpack` 命令， 以 `src/index.js` 为入口文件，生成 `dist/main.js`。

With that said, let's run `npx webpack`, which will take our script at `src/index.js` as the entry point, and will generate `dist/main.js` as the output.


## Modules 模块

1.webpack 支持 ES6 的模块方法： `import` 引入模块 和 `export` 导入模块。

2.webpack 会自动处理 `import` 和 `export` ，生成能兼容老旧的不支持 `import` 和 `export` 的浏览器的代码。

3.如果需要使用更多的 ES6 支持的新的特性，需要通过 webpack 的 `loader` 机制，添加 `babel` 插件，把 ES6 的代码转成兼容老旧的浏览器的 ES5 的代码。


## 配置文件 `webpack.config.js`
```js
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  }
};
```

运行 webpack 打包文件：

```shell
npx webpack --config webpack.config.js

```

有配置文件时，运行 `npx webpack` 默认会读取配置文件的配置。因此，以上命令等同于:

```shell
npx webpack 
```

## NPM Scripts

在 package.json 中添加一行代码，

```json
"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build": "webpack"
},
```

用以下命令代替原来的 `npx webpack`:
```shell
npm run build
```

