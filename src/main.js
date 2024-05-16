import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";

import "element-plus/dist/index.css";
import "./style.css";
import App from "./App.vue";

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(ElementPlus);
let url = location.href;
app.config.globalProperties.$baseUrl = url.substring(0, url.lastIndexOf("/")); //静态资源根路径
window.$baseUrl = url.substring(0, url.lastIndexOf("/"));
app.mount("#app");
