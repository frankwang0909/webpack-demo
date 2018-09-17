import _ from "lodash";

// 引入样式
import "./style.css";   

// 引入 图片
import Icon from "./icon.png";

// 引入 xml 格式的数据文件
import Data from "./data.xml";

function component() {
  let element = document.createElement("div");

  element.innerHTML = _.join(["Hello", "webpack"], " ");

  // 给元素添加样式
  element.classList.add('hello');

  // 给元素添加图片子元素
  var myIcon = new Image();
  myIcon.src = Icon;
  element.appendChild(myIcon);

  // 在控制台打印出来 Data
  console.log(Data);

  return element;
}

document.body.appendChild(component());
