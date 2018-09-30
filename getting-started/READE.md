## 1. 通过在 html 文件中添加 `<script>` 标签 来引入脚本，存在以下几个问题：

1） 无法直接看出脚本之间的依赖关系(index.js 依赖了 lodash.js)；

2） 如果被依赖的脚本被移除，或者顺序不对，应用将无法正常工作；

3） 如果添加的依赖脚本没有被使用到，浏览器却下载了不需要的脚本。

## 2. 使用 webpack 来管理 js 脚本

1） 代码目录分为 `src` 和 `dist` 两个目录，分别存放 `源代码` 和 `压缩优化后代码`。

2）`npm install` 下载依赖的 lodash 到本地。

3）在 js (index.js) 脚本中 使用 `import`来引入依赖的其他脚本(lodash.js)。
import 语句显式地声明了脚本之间的依赖关系，webpack 据此可以创建依赖关系表。

4）执行 `npx webpack` 命令，会以 `src/index.js` 作为入口（entry point），自动生成 `dist/main.js`。

## 3. 本地安装 webpack webpack-cli

```shell
npm install webpack webpack-cli --save-dev
```

## 4. 本地安装依赖的脚本（第三方类库）

```shell
npm install --save lodash
```

## 5. 执行构建命令

```shell
npx webpack
```

默认配置下，webpack 将会以 `src/index.js` 作为构建的入口, 生成文件 `dist/main.js`.

## 6. 模块

大部分浏览器已经支持 ES2015 标准中的模块的 `import` 和 `export` 声明语句, 老旧的浏览器不支持 js 模块。

webapck 会自动将 `import` 和 `export` 声明语句转换成老旧浏览器支持的写法 ES5/ES3。

除此之外，webpack 还支持其他 ES2015 的新功能，但不会自动转换成 ES5, 如需兼容，需要添加 Babel 转换器相关的插件。

## 7. 使用配置文件 `webpack.config.js`

```js
const path = require("path");

module.exports = {
  entry: "./src/index.js", // 指定构建的入口文件
  output: {
    // 指定打包输入的文件名和存放路径等
    filename: "main.js",
    path: path.resolve(__dirname, "dist")
  }
};
```

执行构建命令时，可添加参数。

```shell
npx webpack --config webpack.config.js
```

实际上，如果目录下存在配置文件 `webpack.config.js` ， 执行 `npx webpack` 时，会自动读取*配置文件*，无需显式地指定。

## 8. NPM Scripts

在 `package.json` 中添加一个 npm 脚本配置。

```json
"scripts": {
  "build": "webpack"
}
```

执行以下脚本即可执行 webpack 的构建命令：

```shell
npm run build
```
