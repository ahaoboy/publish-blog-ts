import axios from "../axios";
import oschina from "./oschina";
import csdn from "./csdn";

export async function publishAll(path: string) {
  // const url = "http://www.baidu.com";
  // const { data } = await axios.get(url);
  // console.log("data", data, oschina.toString());
  // console.log("csdn", csdn);
  console.log("publishAll", path);
  const res = await oschina(path);
  console.log("osc res", res);
  return res;
}
