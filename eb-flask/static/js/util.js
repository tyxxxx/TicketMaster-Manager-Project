
let util = {
  q: function (cssSelector, ele) {
    if (ele == null) {
      ele = document;
    }
    return ele.querySelector(cssSelector);
  },
  qa: function (cssSelector, ele) {
    if (ele == null) {
      ele = document;
    }
    return ele.querySelectorAll(cssSelector);
  },
  l: function (...args) {
    console.log(...args);
  },
  attr: function(ele, name, value){
    if(ele == null || name == null){
      return;
    }
    ele.setAttribute(name, value);
  },
  create: function (param, html, parent) {
    let ele = document.createElement(param);
    if (html != null && html != "") {
      ele.innerHTML = html;
    }
    if (parent != null) {
      parent.appendChild(ele);
    }
    return ele;
  },
  parse: function (html, parent) {
    let div = document.createElement("div");
    div.innerHTML = html;
    let ele = div.children[0];
    if (parent != null) {
      parent.appendChild(ele);
    }
    return ele;
  },
  addEle: function (newEle, posEle, pos) {
    if (pos == 'before') {
      posEle.parentNode.insertBefore(newEle, posEle);
    } else if (pos == 'append') {
      posEle.appendChild(newEle);
    } else {
      posEle.parentNode.insertBefore(newEle, posEle.nextSibling);
    }
  },
  get: function (url) {
    return new Promise((resolve, reject) => {
      fetch(url)
        .then((res) => res.json())
        .then((data) => resolve(data))
        .catch((err) => reject(err));
    });
  }

}
