import axios from "axios";
import * as qs from "qs";

axios.interceptors.request.use(
  function (config) {
    if (config.method === "post") {
      config.data = qs.stringify(config.data);
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);
export default axios;
