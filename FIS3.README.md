# 前端工程构建工具 FIS3

## 前端工程化需要解决的问题

- 其他语言的编译：ES6/TypeScript/CoffeeScript 等脚本语言，LESS/SASS 等 CSS 预编译语言，Jade/EJS/Mustache 等 HTML 模板语言。
- 静态资源的处理：文件压缩、打包合并，图片转 base64 内嵌，生成雪碧图，生成文件指纹。
- 资源定位：相对路径变成绝对路径；文件名变更 Hash 指纹时，自动更新 HTML 文件中引用的资源 URL。
- 本地调试服务器：监听文件，实现动态构建；浏览器实现自动刷新；提供 mock 服务。

## 安装 FIS3

FIS3 是面向前端的工程构建工具。解决前端工程中性能优化、资源加载（异步、同步、按需、预加载、依赖管理、合并、内嵌）、模块化开发、自动化工具、开发规范、代码部署等问题。

FIS3 是基于 Node.js 的，请先确保本机已安装 `Node.js`。全局环境下安装 FIS3。

```shell
npm install -g FIS3
```

## 配置文件

FIS3 默认配置文件为 `fis-conf.js`，FIS3 编译的整个流程都是通过配置来控制的。

FIS3 定义了一种类似 CSS 的配置方式。固化了构建流程，让工程构建变得简单。

`fis-conf.js`  上面存放所有构建指令，如压缩资源、文件指纹等等操作，通过在终端运行  `fis3 release -d` 就会根据 `fis-conf.js` 中的指令进行构建，把结果发布到 web server 的 www 目录下面。

配置接口：

```js
fis.match(selector, props);
```

参数说明：

- selector：FIS3 把匹配文件的路径作为 selector，匹配到的文件会分配给它设置的 props。
- props：编译规则属性，包括文件属性和插件属性。

## 构建

### 1.资源定位

我们在项目根目录执行命令  fis3 release -d ../output  发布到目录  ../output  下。

构建过程中对资源 URI 进行了替换，替换成了绝对 URL。通俗点讲就是相对路径换成了绝对路径。这是一个 FIS 的很重要的特性，资源定位。

资源定位能力，可以有效地分离开发路径与部署路径之间的关系，工程师不再关心资源部署到线上之后去了哪里，变成了什么名字，这些都可以通过配置来指定，而工程师只需要使用相对路径来定位自己的开发资源即可。

FIS3 的构建是不会对源码做修改的，而是构建产出到了另外一个目录，并且构建的结果才是用来上线使用的。

```js
//配置文件，注意，清空所有的配置，只留下以下代码即可。
fis.match("_.{png,js,css}", {
  release: "/static/$0"
});
```

### 2.文件指纹

文件指纹，唯一标识一个文件。在开启强缓存的情况下，如果文件的 URL 不发生变化，无法刷新浏览器缓存。一般都需要通过一些手段来强刷缓存，一种方式是添加时间戳，每次上线更新文件，给这个资源文件的 URL 添加上时间戳。

FIS3 选择的是添加 `MD5 戳`，直接修改文件的 URL，而不是在其后添加 query。

对 js、css、png 图片引用 URL 添加 md5 戳，配置如下；

```js
//清除其他配置，只剩下如下配置
fis.match("_.{js,css,png}", {
  useHash: true
});
```

### 3.压缩资源

为了减少资源网络传输的大小，通过压缩器对 js、css、图片进行压缩是一直以来前端工程优化的选择。在 FIS3 中这个过程非常简单，通过给文件配置压缩器即可。

```js
// 清除其他配置，只保留如下配置
fis.match("*.js", {
  // fis-optimizer-uglify-js 插件进行压缩，已内置
  optimizer: fis.plugin("uglify-js")
});

fis.match("*.css", {
  // fis-optimizer-clean-css 插件进行压缩，已内置
  optimizer: fis.plugin("clean-css")
});

fis.match("*.png", {
  // fis-optimizer-png-compressor 插件进行压缩，已内置
  optimizer: fis.plugin("png-compressor")
});
```

### 4. CssSprite 图片合并

压缩了静态资源，我们还可以对图片进行合并，来减少请求数量。

FIS3 提供了比较简易、使用方便的图片合并工具。通过配置即可调用此工具并对资源进行合并。

FIS3 构建会对 CSS 中，路径带  `?__sprite`  的图片进行合并。为了节省编译的时间，分配到  `useSprite: true`  的 CSS 文件才会被处理。

```css
li.list-1::before {
  background-image: url("./img/list-1.png?__sprite");
}
li.list-2::before {
  background-image: url("./img/list-2.png?__sprite");
}
```

```js
// 启用 fis-spriter-csssprites 插件
fis.match("::package", {
  spriter: fis.plugin("csssprites")
});
// 对 CSS 进行图片合并
fis.match("*.css", {
  // 给匹配到的文件分配属性 `useSprite`
  useSprite: true
});
```

### 5. 组合使用

```js
// 加 md5
fis.match("_.{js,css,png}", {
  useHash: true
});
// 启用 fis-spriter-csssprites 插件
fis.match("::package", {
  spriter: fis.plugin("csssprites")
});
// 对 CSS 进行图片合并
fis.match("_.css", {
  // 给匹配到的文件分配属性 `useSprite`
  useSprite: true
});
// 对 js 文件进行压缩
fis.match("_.js", {
  // fis-optimizer-uglify-js 插件进行压缩，已内置
  optimizer: fis.plugin("uglify-js")
});
// 对 css 文件进行压缩
fis.match("_.css", {
  // fis-optimizer-clean-css 插件进行压缩，已内置
  optimizer: fis.plugin("clean-css")
});
// 对 png 图片进行压缩
fis.match("_.png", {
  // fis-optimizer-png-compressor 插件进行压缩，已内置
  optimizer: fis.plugin("png-compressor")
});
// 开发的时候不需要压缩、合并图片、也不需要 hash
fis.media("debug").match("_.{js,css,png}", {
  useHash: false,
  useSprite: false,
  optimizer: null
}); // fis3 release debug 启用 media debug 的配置
```

## FIS3 内置语法

前端开发所需要的编译能力

- 1.资源定位：获取任何开发中所使用资源的线上路径；
- 2.内容嵌入：把一个文件的内容(文本)或者 base64 编码(图片)嵌入到另一个文件中；
- 3.依赖声明：在一个文本文件内标记对其他资源的依赖关系；

### 1. 匹配其他语言

内置语法主要针对 html、css、js 等三种语言提供不同的编译语法。假设遇到后端模板、异构语言、前端模板等如何让内置语法起效呢？

```js
// FIS 中前端模板推荐预编译为 js，所以应该使用 js 的内置语法
fis.match("_.tmpl", {
  isJsLike: true
});
fis.match("_.sass", {
  isCssLike: true
});
fis.match("*.xxhtml", {
  isHtmlLike: true
});
```

### 2.预处理

#### 2.1 安装插件

FIS3 是一个扩展性很强的构建工具，社区也包含很多 FIS3 的插件。为了展示 FIS3 的预处理、静态合并 js、css 能力，需要安装两个插件:

- fis-parser-less：例子引入一个 less 文件，需要 less 预处理插件
- fis3-postpackager-loader：可对页面散列文件进行合并

FIS3 的插件都是以 NPM 包形式存在的，所以安装 FIS3 的插件需要使用 npm 来安装。

```shell
npm install -g 插件名
```

譬如：

```shell
npm install -g fis-parser-less
npm install -g fis3-postpackager-loader
```

#### 2.2 预处理 less

FIS3 提供强大的预处理能力，可以对 less、sass 等异构语言进行预处理，还可以对模板语言进行预编译。FIS3 社区已经提供了绝大多数需要预处理的异构语言。
我们给定的例子中有个 less 文件，那么需要对 less 进行预处理，我们已经安装了对应的预处理插件。现在只需要配置启用这个插件就能搞定这个事情。

```js
fis.match("*.less", {
  // fis-parser-less 插件进行解析
  parser: fis.plugin("less"),
  // .less 文件后缀构建后被改成 .css 文件
  rExt: ".css"
});
```

如同之前强调的，虽然构建后后缀为 `.css`。但在使用 FIS3 时，开发者只需要关心源码路径。所以引入一个 less 文件时，依然是 `.less` 后缀。

```html
   <link rel="stylesheet" type="text/css" href="./test.less">
```

## FIS3 内置 本地调试服务器

### 1. 服务器文件目录

构建时不指定输出目录，即不指定 -d 参数时，构建结果被发送到内置 Web Server 的根目录下。此目录可以通过执行以下命令打开。

```shell
fis3 server open


[INFO] Currently running fis3 (C:\Users\frank\AppData\Roaming\npm\node_modules\fis3\)

[INFO] Browse C:/Users/frank/AppData/Local/.fis3-tmp/www
```

### 2. 发布代码到本地服务器

```shell
   fis3 release
```

不加 -d 参数默认被发布到内置 Web Server 的根目录下，当启动服务时访问此目录下的资源。

### 3. 启动本地服务器

通过`fis3 server start`来启动本地 Web Server。当此 Server 启动后，会自动浏览器打开  http://127.0.0.1:8080，默认监听端口 8080

通过执行以下命令得到更多启动参数，可以设置不同的端口号（当 8080 占用时）

```shell
fis3 server -h
```

### 4. 文件监听，自动构建

为了方便开发，FIS3 支持文件监听，当启动文件监听时，修改文件会构建发布。而且其编译是增量的，编译花费时间少。
FIS3 通过对 release 命令添加 -w 或者 --watch 参数启动文件监听功能。

```shell
fis3 release -w
```

添加 -w 参数时，程序不会执行终止；停止程序用快捷键 CTRL+c

### 5. 浏览器自动刷新

文件修改自动构建发布后，浏览器能自动刷新。
FIS3 支持浏览器自动刷新功能，只需要给 release 命令添加 -L 参数，通常 -w 和 -L 一起使用。

```shell
fis3 release -wL
```

### 6. 替代内置 Server

FIS3 内置了一个 Web Server 提供给构建后的代码进行调试。如果你自己启动了你自己的 Web Server 依然可以使用它们。
假设你的 Web Server 的根目录是  `/Users/my-name/work/htdocs`，那么发布时只需要设置产出目录到这个目录即可。

```shell
fis3 release -d /Users/my-name/work/htdocs
```

如果想执行  `fis3 release`  直接发布到此目录下，可在配置文件配置；

```js
fis.match("*", {
  deploy: fis.plugin("local-deliver", {
    to: "/Users/my-name/work/htdocs"
  })
});
```

### 7. Mock 数据模拟

当后端开发人员还没有准备好后端接口时，为了能让前端项目开发继续进行下去，往往需要提供假数据来协助前端开发。
fis 中默认的 node 服务就支持此功能。

#### 7.1 静态假数据

1.准备好假数据文件，如 `sample.json` 文件，放在服务器的  `/mock/sample.json`  目录，确保通过  http://127.0.0.1:8080/mock/sample.json  可访问到。

```json
{
  "error": 0,
  "message": "ok",
  "data": {
    "uname": "foo",
    "uid": 1
  }
}
```

2.准备一个  `server.conf` 配置文件，放在服务器目录的 `/mock/server.conf`，内容如下。

```conf
rewrite ^\/api\/user$ /mock/sample.json
```

3.然后当你请求  http://127.0.0.1:8080/api/user  的时候，返回的就是 sample.json 中的内容。

#####  server.conf  配置语法

关于  server.conf  配置语法，格式如下：

```conf
指令名称 正则规则 目标文件
```

- 指令名称: 支持 rewrite 、 redirect 和 proxy。
- 正则规则: 用来命中需要作假的请求路径。
- 目标文件: 设置转发的目标地址，需要配置一个可请求的 url 地址。

刚说的是把文件放在服务器目录，操作起来其实并不是很方便，这类假数据文件建议放在`项目源码`中，然后通过  `fis3 release`  伴随源码一起发布到调试服务器。
推荐以下存放规范。

```code
└── mock
    ├── sample.json
    └── server.conf
```

#### 7.2 代理到其他服务器

这个功能要求 fis3 >= 3.3.29 使用格式如:

```conf
proxy ^\/api\/test http://127.0.0.1:9119/api/test
```

#### 7.3 动态假数据

静态的假数据可以通过 json 文件提供，那么动态数据怎么提供？node 服务器可以通过 js 的方式提供动态假数据。
/mock/dynamic.js

```js
module.exports = function(req, res, next) {
  res.write("Hello world ");

  // set custom header.
  // res.setHeader('xxxx', 'xxx');

  res.end("The time is " + Date.now());
};
```

然后结合  `server.conf`  就可以模拟各种动态请求了。

```conf
rewrite ^\/api\/dynamic\/time$ /mock/dynamic.js
```

如上面的例子，当请求  http://127.0.0.1:8080/api/dynamic/time  时，返回：`Hello world The time is 1442556037130`
