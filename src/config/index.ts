// 用于记录已发表的博客信息字段名
export const FM_KEY = "_publish_blog_";
export enum SITE_NAME {
  oschina = "oschina",
}
import * as vscode from "vscode";

const propNameList = [
  "oschinaCookie",
  "oschinaMainPage",
  "csdnCookie",
  "csdnMainPage",
];

export const CONFIG_PROP = propNameList.reduce((pre, name) => {
  pre[name] =
    vscode.workspace.getConfiguration().get(`publish-blog-ts.${name}`) || "";
  return pre;
}, {} as Record<string, string>);
console.log("CONFIG_PROP", CONFIG_PROP);
// 配置文件的信息, 如果是默认信息, 则表示不支持该平台
// cookie 信息
// const oschinaCookie = vscode.workspace
//   .getConfiguration()
//   .get("publish-blog.oschinaCookie");

// // 个人主页
// const mainPage = vscode.workspace
//   .getConfiguration()
//   .get("publish-blog.oschinaMainPage");
