import _ from "lodash";

import printMe from "./print.js";

function component() {
  let element = document.createElement("div");
  let btn = document.createElement("button");

  element.innerHTML = _.join(["Webpack is ", "Awesome"], " ");

  btn.innerHTML = "Click Me";
  btn.onclick = printMe;
  element.appendChild(btn);

  return element;
}

document.body.appendChild(component());
