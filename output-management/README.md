
# 静态资源的管理

## 1. 加载 CSS 样式文件

要 `import` CSS， 需要使用 `style-loader` 和 `css-loader`：

```shell
npm install --save-dev style-loader css-loader
```

在 `src/index.js` 中 `import` 样式文件。
```js
import "./style.css";
```

webpack 通过 `style-loader` 和 `css-loader` 会自动在 index.html 文件 的 `<head>`中插入 `<style>`标签。


## 2. 加载 图片

加载图片需要使用 `file-loader`：

```shell
npm install --save-dev file-loader
```


## 3. 加载 Fonts 字体文件

加载字体文件，同样需要使用 `file-loader`。


## 4. 加载 Data 数据文件

加载数据文件，比如：JSON 文件， CSVs, TSVs, and XML。

1.webpack 内置了对 JSON 文件的支持, 可以直接引入 JSON 文件。
```js
import Data from './data.json'
```

2.要引入 CSVs, TSVs 或 XML， 需要使用 `csv-loader` 或 `xml-loader`。
```shell
npm install --save-dev csv-loader xml-loader
```

