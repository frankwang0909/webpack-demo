# 前端构建工具 webpack

## 安装

把 webpack 作为项目的`开发依赖`来安装使用，这样可以指定项目中使用的 webpack 版本，更加方便多人协同开发。确保你的项目中有 `package.json` 文件，如果没有可以使用 `npm init` 来创建。

安装 webpack, webpack-cli 为项目开发依赖：

```shell
npm install webpack webpack-cli -D
```

这样 webpack 会出现在`package.json` 中，我们再添加一个 `npm scripts`：

```json
  "scripts": {
    "build": "webpack --mode production"
  },
  "devDependencies": {
    "webpack": "^4.20.2",
    "webpack-cli": "^3.1.2"
  }
```

然后，创建一个 `./src/index.js` 文件，可以写任意的 JS 代码。创建好了之后执行 `npm run build` 命令，你就会发现新增了一个 `dist` 目录，里边存放的是 webpack 构建好的 `main.js` 文件。

## 基本概念

webpack 是一个 JS 代码模块化的打包工具，藉由它强大的扩展能力，随着社区的发展，逐渐成为一个功能完善的构建工具。

webpack 本质上是一个`打包工具`，它会根据代码的内容解析模块依赖，帮助我们把多个模块的代码打包。

webpack 会把我们项目中使用到的多个代码模块（可以是不同文件类型），打包构建成项目运行仅需要的几个静态文件。

### 1. entry 入口

在多个代码模块中会有一个起始的 `.js` 文件作为 webpack 构建的入口。webpack 会读取这个文件，并从它开始`解析依赖`，然后进行`打包`。默认的入口文件就是 `./src/index.js`。

我们常见的项目中，如果是单页面应用，那么可能入口只有一个；如果是多个页面的项目，那么经常是`一个页面会对应一个构建入口`。

入口可以使用 `entry` 字段来进行配置，webpack 支持配置`多个入口`来进行构建：

```shell
module.exports = {
  entry: './src/index.js'
}

// 上述配置等同于
module.exports = {
  entry: {
    main: './src/index.js'
  }
}

// 或者配置多个入口
module.exports = {
  entry: {
    foo: './src/page-foo.js',
    bar: './src/page-bar.js',
    // ...
  }
}

// 使用数组来对多个文件进行打包
module.exports = {
  entry: {
    main: [
      './src/foo.js',
      './src/bar.js'
    ]
  }
}
```

### 2. loader 转换器

`loader` 可以理解为是一个`转换器`，负责把某种文件格式的内容转换成 webpack 可以支持打包的模块。

举个例子，在没有添加额外插件的情况下，webpack 会默认把所有依赖打包成 `js 文件`，如果入口文件依赖一个 `.hbs` 的模板文件以及一个 `.css` 的样式文件，那么我们需要 `handlebars-loader` 来处理 `.hbs` 文件，需要 `css-loader` 来处理 `.css` 文件（这里其实还需要 style-loader，后续详解），最终把不同格式的文件都解析成 `js 代码`，以便打包后在浏览器中运行。

当我们需要使用不同的 `loader` 来解析处理不同类型的文件时，我们可以在 `module.rules` 字段下来配置相关的规则，例如使用 Babel 来处理 `.js` 文件：

```js
module: {
  // ...
  rules: [
    {
      test: /\.jsx?/, // 匹配文件路径的正则表达式，通常我们都是匹配文件类型后缀
      include: [
        path.resolve(__dirname, 'src') // 指定哪些路径下的文件需要经过 loader 处理
      ],
      use: 'babel-loader', // 指定使用的 loader
    },
  ],
}
```

### 3. plugin 插件

在 webpack 的构建流程中，`plugin` 用于处理更多其他的一些`构建任务`。

`模块代码转换`的工作由 `loader` 来处理，除此之外的其他任何工作都可以交由 `plugin` 来完成。

通过添加我们需要的 plugin，可以满足更多构建中特殊的需求。例如，要使用压缩 JS 代码的 `uglifyjs-webpack-plugin` 插件，只需在配置中通过 `plugins`字段添加新的 plugin 即可：

```js
const UglifyPlugin = require("uglifyjs-webpack-plugin");

module.exports = {
  plugins: [new UglifyPlugin()]
};
```

常用的插件还有定义环境变量的 `DefinePlugin`，生成 CSS 文件的 `ExtractTextWebpackPlugin` 等。

### 4. outout 输出

webpack 的输出即指 webpack 最终构建出来的静态文件，可以看看上面 webpack 官方图片右侧的那些文件。当然，构建结果的文件名、路径等都是可以配置的，使用 output 字段：

```js
module.exports = {
  // ...
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js"
  }
};

// 或者多个入口生成不同文件
module.exports = {
  entry: {
    foo: "./src/foo.js",
    bar: "./src/bar.js"
  },
  output: {
    filename: "[name].js",
    path: __dirname + "/dist"
  }
};

// 路径中使用 hash，每次构建时会有一个不同 hash 值，避免发布新版本时线上使用浏览器缓存
module.exports = {
  // ...
  output: {
    filename: "[name].js",
    path: __dirname + "/dist/[hash]"
  }
};
```

默认创建的输出内容就是 `./dist/main.js`。

### 5. 配置文件

我们把上述涉及的几部分配置内容合到一起，就可以创建一个简单的 webpack 配置了。webpack 运行时默认读取项目下的 `webpack.config.js` 文件作为配置。

```js
const path = require("path");
const UglifyPlugin = require("uglifyjs-webpack-plugin");

module.exports = {
  entry: "./src/index.js",

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js"
  },

  module: {
    rules: [
      {
        test: /\.jsx?/,
        include: [path.resolve(__dirname, "src")],
        use: "babel-loader"
      }
    ]
  },

  // 代码模块路径解析的配置
  resolve: {
    modules: ["node_modules", path.resolve(__dirname, "src")],

    extensions: [".wasm", ".mjs", ".js", ".json", ".jsx"]
  },

  plugins: [
    new UglifyPlugin()
    // 使用 uglifyjs-webpack-plugin 来压缩 JS 代码
  ]
};
```

webpack 的配置其实是一个 `Node.js` 的脚本，这个脚本对外暴露一个`配置对象`，webpack 通过这个对象来读取相关的一些配置。

## webpack 的基本用法：

前端开发环境需要解决的问题：

- 构建发布需要的 HTML、CSS、JS 文件
- 使用 CSS 预处理器来编写样式
- 处理和压缩图片
- 使用 Babel 来支持 ES 新特性
- 本地提供静态服务以方便开发调试

### 1. 关联 HTML

webpack 默认从作为入口的 `.js` 文件进行构建（更多是基于 SPA 去考虑），但通常一个前端项目都是从一个页面（即 HTML）出发的。最简单的方法是，创建一个 HTML 文件，使用 script 标签直接引用构建好的 JS 文件，如：

```html
<script src="./dist/bundle.js"></script>
```

但是，如果我们的`文件名`或者`路径`会变化，例如使用 `[hash]` 来进行命名，那么最好是将 HTML `引用路径`和`构建结果`关联起来，这个时候我们可以使用 `html-webpack-plugin`。

`html-webpack-plugin` 是一个独立的 node package，所以在使用之前我们需要先安装它，把它安装到项目的开发依赖中：

```shell
npm install html-webpack-plugin -D
```

然后将 `html-webpack-plugin` 添加到 webpack 配置文件的 `plugins`字段中：

```js
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  // ...
  plugins: [new HtmlWebpackPlugin()]
};
```

这样配置好之后，构建时 `html-webpack-plugin` 会为我们创建一个 HTML 文件，其中会引用构建出来的 JS 文件。

实际项目中，默认创建的 HTML 文件并没有什么用，我们需要自己来写 HTML 文件，可以通过 `html-webpack-plugin` 的配置，传递一个写好的 `HTML 模板`：

```js
module.exports = {
  // ...
  plugins: [
    new HtmlWebpackPlugin({
      filename: "index.html", // 配置输出文件名和路径
      template: "src/assets/index.html" // 配置文件模板
    })
  ]
};
```

这样，通过 html-webpack-plugin 就可以将我们的页面和构建 JS 关联起来，回归日常，从页面开始开发。如果需要添加多个页面关联，那么实例化多个 `html-webpack-plugin`， 并将它们都放到 plugins 字段数组中就可以了。

### 2. 构建 CSS

我们编写 CSS，并且希望使用 webpack 来进行构建，为此，需要在配置中引入 loader 来解析和处理 CSS 文件：

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css/,
        include: [path.resolve(__dirname, "src")],
        use: ["style-loader", "css-loader"]
      }
    ]
  }
};
```

`style-loader` 和 `css-loader` 都是单独的 node package，需要安装:

```shell
npm install style-loader css-loader -D
```

我们创建一个 `index.css` 文件，并在 `index.js` 中通过 `import` 引用它，然后进行构建。

```js
import "./index.css";
```

可以发现，构建出来的文件并没有 CSS，先来看一下新增两个 loader 的作用：

- css-loader 负责解析 CSS 代码，主要是为了处理 CSS 中的依赖，例如 @import 和 url() 等引用外部文件的声明；
- style-loader 会将 `css-loader` 解析的结果转变成 `JS 代码`，运行时动态插入 `style 标签`来让 CSS 代码生效。

经由上述两个 loader 的处理后，CSS 代码会转变为 JS，和 index.js 一起打包了。

如果需要单独把 CSS 文件分离出来，我们需要使用 `extract-text-webpack-plugin` 插件。

这个插件并未发布支持 webpack 4.x 的正式版本，所以安装的时候需要指定使用它的 alpha 版本：`npm install extract-text-webpack-plugin@next -D` 。如果你用的是 webpack 3.x 版本，直接用 extract-text-webpack-plugin 现有的版本即可。

看一个简单的例子：

```js
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.css$/,
        // 因为这个插件需要干涉模块转换的内容，所以需要使用它对应的 loader
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: "css-loader"
        })
      }
    ]
  },
  plugins: [
    // 引入插件，配置文件名，这里同样可以使用 [hash]
    new ExtractTextPlugin("index.css")
  ]
};
```

### 3.CSS 预处理器

在上述使用 CSS 的基础上，通常我们会使用 `Less/Sass` 等 CSS 预处理器，webpack 可以通过添加对应的 `loader` 来支持，以使用 Less 为例，我们可以在官方文档中找到对应的 loader。

```shell
npm install less-loader less -D
```

我们需要在上面的 webpack 配置中，添加一个配置来支持解析后缀为 `.less` 的文件：

```js
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.less$/,
        // 因为这个插件需要干涉模块转换的内容，所以需要使用它对应的 loader
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: ["css-loader", "less-loader"]
        })
      }
    ]
  }
  // ...
};
```

### 4.处理图片文件

在前端项目的样式中总会使用到图片，虽然我们已经提到 `css-loader` 会解析样式中用 `url()` 引用的文件路径，但是图片对应的 `jpg/png/gif` 等文件格式，webpack 处理不了。

我们需要添加一个处理图片的 loader 配置，现有的 `file-loader` 就是个不错的选择。

```shell
npm install file-loader -D
```

`file-loader` 可以用于处理很多类型的文件，它的主要作用是`直接输出文件`，把构建后的文件路径返回。配置很简单，在 `rules` 中添加一个字段，增加图片类型文件的解析配置：

```js
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: "file-loader",
            options: {}
          }
        ]
      }
    ]
  }
};
```

### 5.使用 Babel

Babel 是一个让我们能够使用 ES 新特性的 JS 编译工具，我们可以在 webpack 中配置 Babel，以便使用 ES6、ES7 标准来编写 JS 代码。

```shell
npm install -D babel-loader @babel/core @babel/preset-env
```

```js
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.jsx?/, // 支持 js 和 jsx
        include: [
          path.resolve(__dirname, "src") // src 目录下的才需要经过 babel-loader 处理
        ],
        loader: "babel-loader"
      }
    ]
  }
};
```

Babel 的相关配置可以在目录下使用 `.babelrc` 文件来处理，详细参考 Babel 官方文档。

### 6.启动静态服务

至此，我们完成了处理多种文件类型的 webpack 配置。我们可以使用 `webpack-dev-server` 在本地开启一个简单的静态服务来进行开发。

在项目下安装 `webpack-dev-server`。

```shell
npm install -D webpack-dev-server
```

然后添加启动命令到 `package.json` 中。

```json
"scripts": {
"build": "webpack --mode production",
"start": "webpack-dev-server --mode development"
}
```

运行 `npm run start`命令，然后就可以访问 http://localhost:8080/ 来查看你的页面了。默认是访问 `index.html`，如果是其他页面要注意访问的 URL 是否正确。

## 1. Getting Started 开始

## 2. Asset Management 静态资源管理

## 3. Output Management 输入管理

## 4. Development 开发模式

## 5. Hot Module Replacement 模块热更新

## 6. Tree Shaking 不打包未被依赖的代码

## 7. Production 生产模式

## 8. Code Splitting 代码拆分

## 9. Lazy Loading 按需加载

## 10. Caching 缓存

## 11. Shimming 垫片库
