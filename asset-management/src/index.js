import _ from "lodash";

// 引入样式文件
import "./style.css";

// 引入图片
import Icon from "./icon.png";

// 引入 xml 文件
import Data from "./data.xml";

function component() {
  var element = document.createElement("div");

  // Lodash, now imported by this script
  element.innerHTML = _.join(["Hello", "webpack"], " ");

  // 添加样式
  element.classList.add("hello");

  // 添加图片
  var myIcon = new Image();
  myIcon.src = Icon;
  element.appendChild(myIcon);

  console.log(Data);

  return element;
}

document.body.appendChild(component());
