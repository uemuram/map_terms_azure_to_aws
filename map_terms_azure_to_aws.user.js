// ==UserScript==
// @name         Map terms Azure to AWS
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Map terms AWS to Azure
// @author       uemuram
// @match        https://docs.microsoft.com/*
// @grant        none
// ==/UserScript==

(function main(w) {
  'use strict';

  // マッピング
  const termMappings = [{
    "azure": "Virtual Machine Scale Sets",
    "aws": "AWS Auto Scaling"
  }, {
    "azure": "Azure Virtual Machines",
    "aws": "EC2"
  }, {
    "azure": "Azure Batch",
    "aws": "AWS Batch"
  }, {
    "azure": "Azure VMware by CloudSimple",
    "aws": "VMware Cloud on AWS"
  }];

  // ヒットした部分を加工する
  let replaceTermString = function (str) {
    for (let i = 0; i < termMappings.length; i++) {
      let index = str.indexOf(termMappings[i].azure);
      if (index >= 0) {
        let beforeStr = str.substring(0, index);
        let afterStr = str.substring(index + termMappings[i].azure.length);
        return replaceTermString(beforeStr) + '<div class="tooltip">' + termMappings[i].azure + "<span>" + termMappings[i].aws + '</span></div>' + replaceTermString(afterStr);
      }
    }
    return str;
  }

  // 子要素を走査し、テキストノード(nodeType=3)であれば、書き換えを行う
  let replaceTerm = function (r) {
    let children = r.childNodes;
    let l = children.length;
    for (let i = 0; i < l; i++) {
      let child = (children[i]);
      if (child.nodeType == 3 && !/^[ \n\t]+$/.test(child.nodeValue) && child.nodeValue.length > 0) {
        let newSpan = document.createElement("span");
        newSpan.innerHTML = replaceTermString(child.nodeValue);
        r.insertBefore(newSpan, child);
        child.remove();
      } else {
        replaceTerm(child);
      }
    }
  }

  // スタイル追加
  let style = document.createElement("style");
  document.head.appendChild(style);
  let sheet = style.sheet;
  sheet.insertRule("div.tooltip {display:inline; border-bottom:solid 1px #87CEFA}", 0);
  sheet.insertRule("div.tooltip span { display:none; padding:5px; margin:10px 0 0 0px;}", 1);
  sheet.insertRule("div.tooltip:hover span{ display:inline;  position:absolute; border:1px solid #CCC; border-radius:5px; background:#F7F7F7; color:#666; font-size:12px; line-height:1.6em;}", 2);

  var o, b, i;
  //フレームが複数ある場合を考慮してmainを再帰的に実行
  while (o = w.frames[i++]) try { main(o) } catch (o) { }
  replaceTerm(b = w.document.body);
})(window);