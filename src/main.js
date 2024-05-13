import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";

import "element-plus/dist/index.css";
import "./style.css";
import App from "./App.vue";
const pinia = createPinia();
const app = createApp(App);
app.use(pinia);
app.use(ElementPlus);
let url = location.href;
app.config.globalProperties.$baseUrl = url.substring(0, url.lastIndexOf("/")); //静态资源根路径
app.mount("#app");
