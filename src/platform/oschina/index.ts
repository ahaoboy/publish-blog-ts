import axios from "../../axios";
import { FM_KEY, SITE_NAME } from "../../config";

const fs = require("fs");
import * as $ from "cheerio";
const yaml = require("js-yaml");
import { CONFIG_PROP } from "../../config";

const re = /---(.*?)---/s;

function getFrontMatter(content: string) {
  const res = re.exec(content);
  if (!res) {
    return {};
  }
  const s = res[1];
  let obj = yaml.safeLoad(s) || {};
  return obj;
}

function setFrontMatter(fm: any, content: string) {
  console.log("setFrontMatter", fm, yaml.dump(fm));
  const s = "---\n" + yaml.dump(fm) + "---\n" + content.replace(re, "");
  // fs.writeFileSync(path, s, "utf8");
  return s;
}
// cookie 信息
const cookie = CONFIG_PROP.oschinaCookie;

// 个人主页
const mainPage = CONFIG_PROP.oschinaMainPage;

const headers = {
  accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
  "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
  "sec-fetch-dest": "document",
  "sec-fetch-mode": "navigate",
  "sec-fetch-site": "same-origin",
  "sec-fetch-user": "?1",
  "upgrade-insecure-requests": "1",
  cookie,
  referrer: mainPage,
};

// 将path路径中的md文件发布到osc
async function publish(path: string) {
  console.log("osc", path);
  let info = await getInfo();
  console.log("info", info);
  const CONTENT = fs.readFileSync(path, "utf8");
  let frontMatter = getFrontMatter(CONTENT);
  let isPublished =
    frontMatter[FM_KEY] &&
    frontMatter[FM_KEY][SITE_NAME.oschina] &&
    frontMatter[FM_KEY][SITE_NAME.oschina].length;
  const url = isPublished ? `${mainPage}/blog/edit` : `${mainPage}/blog/save`;
  // 默认将第一个tag作为分类
  let catalogName = frontMatter.tag[0];
  let catalog =
    catalogName in info.catalog
      ? info.catalog[catalogName]
      : await addCatalog(catalogName, info);
  const blogUrl = frontMatter[FM_KEY][SITE_NAME.oschina].oschina || "";
  const blogId = blogUrl.split("/").pop();
  console.log("publish url id", url, blogId);
  console.log(blogUrl, blogId, isPublished);
  const postData = {
    draft: "",
    id: isPublished ? blogId : "",
    user_code: info.userCode,
    title: frontMatter.title,
    content: CONTENT.replace(re, ""),
    content_type: 3,
    catalog: catalog,

    // 默认全部发送到编程语言, 或者第一个分类, 或者可以在front matter 中自定义
    classification: "428609",
    type: 1,
    origin_url: "",
    privacy: 0,
    deny_comment: 0,
    as_top: 0,
    downloadImg: 0,
    isRecommend: 0,
  };

  let { data } = await axios.post(url, postData, { headers });
  `
code:1
message:"发表成功"
time:"2020-06-30 17:57:14"
result:{
id
catalog:7028036
classification:428609
content:"
as_top:0
abstracts:"Front Matter in VuePress Any markdown fi
id:4330304
}
`;

  console.log("resp", data);

  let id = data.result.id;

  if (!isPublished) {
    // 新建需要更新fm中的字段
    let blogUrl = `${mainPage}/blog/${id}`;
    console.log("blogUrl", blogUrl);
    // 写入 fm
    frontMatter[FM_KEY] = {
      oschina: blogUrl,
    };
    let s = setFrontMatter(frontMatter, CONTENT);
    fs.writeFileSync(path, s, "utf8");
  }

  // {
  //   code: 1,
  //   message: '发表成功'
  // }
  return {
    code: data.code === 1 ? 1 : 0,
    message: isPublished ? "更新成功" : "发布成功",
  };
}

// 获取发布时的信息, 分类, user_code, 类别等
async function getInfo() {
  const url = `${mainPage}/blog/write`;
  console.log("getInfo", url);
  let { data } = (await axios.get<string>(url, { headers })) || "";
  // console.log("html", html);
  // catalog classification
  let dom = $.load(data);
  let classificationDom = dom('select[name="classification"]>option');
  let classification = classificationDom.toArray().reduce((pre, now) => {
    pre[$(now).text()] = now.attribs.value;
    return pre;
  }, {} as Record<string, string>);

  let catalogDom = dom('select[name="catalog"]>option');
  let catalog = catalogDom.toArray().reduce((pre, now) => {
    pre[$(now).text()] = now.attribs.value;
    return pre;
  }, {} as Record<string, string>);
  let userCodeDom = dom("input[name=user_code]");
  let userCode = userCodeDom[0].attribs.value;

  let dataUserIdDom = dom('val[data-name="spaceId"]');
  let dataUserId = dataUserIdDom[0].attribs["data-value"];

  return {
    classification,
    catalog,
    userCode,
    dataUserId,
  };
}

// 添加新的分类, 返回新增加的分类id
async function addCatalog(name: string, info: any) {
  const url = `${mainPage}/blog/quick_add_blog_catalog`;
  const postData = {
    space: info.dataUserId,
    userCode: info.userCode,
    user_code: info.userCode,
    name,
  };
  let { data } = await axios.post(url, postData, { headers });
  // 新增加的分类的id号
  return data.id;
}

// // 更新
// async function update(path: string) {
//   //  如果fm中含有对应的url, 表示该博客已经发布过了, 需要更新
//   const url = "https://my.oschina.net/ahaoboy/blog/edit";
//   return;
// }
export default publish;
