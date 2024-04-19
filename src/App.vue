<template>
  <div>
    <!-- 3d视图容器 -->
    <div
      class="viewer-container"
      ref="container"
      @contextmenu.prevent="Web.removeContextmenu()"
    ></div>

    <!-- ui面板 -->
    <div class="ui-wrapper">
      <ul class="list">
        <li class="item">
          <button class="btn" @click="addArcGisImagery">加载Arcgis影像</button>
        </li>
        <li class="item">
          <button class="btn" @click="addTerrain">加载地形</button>
          <button class="btn" @click="removeTerrain">删除地形</button>
        </li>
        <li class="item">
          <button class="btn" @click="addTileset">加载白模</button>
          <button class="btn" @click="removeTileset">删除白模</button>
        </li>
      </ul>
      <Measurement></Measurement>
      <Coordinate />
      <Area />
      <Volume />
      <Create />
      <!-- <Point></Point> -->
    </div>
  </div>
</template>

<script setup>
import Measurement from "./components/Measurement.vue";
import Coordinate from "./components/Coordinate.vue";
import Area from "./components/Area.vue";
import Volume from "./components/Volume.vue";
import Create from "./components/Create.vue";
import { ref, onMounted } from "vue";
import Web from "./web/index.js";
import * as Native from "./native/main.js";
import qtLoader from "../assets/loader.js";

// export default {
//   name: "app",
//   setup() {
const container = ref(null);

const addArcGisImagery = () => {
  Native.addArcGisImagery();
};

const addTerrain = () => {
  Web.addTerrain();
};

const removeTerrain = () => {
  Web.removeTerrain();
};

const addTileset = () => {
  Web.addTileset();
};

const removeTileset = () => {
  Web.removeTileset();
};

onMounted(() => {
  qtLoader({
    el: container.value,
  }).then(([SSmap, GlobalViewer]) => {
    // 设置Native全局变量
    window.Native = Native;
    window.nowLayer = null;
    // 设置视图全局变量
    window.GlobalViewer = GlobalViewer;
    window.SSmap = SSmap;

    // 浏览器环境全局变量
    window.isWeb = true;

    window.HtmldomList = [];
    window.pointLineList = [];
    window.linedistance = 0;
    window.entityAllList = [];
    window.nodeMoveList = [];
    window.laberMoveList = [];
    window.billboardCollection = null;
    // 初始化完成
    Web.initMap();
  });
});
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
}
html,
body {
  height: 100%;
  overflow: hidden;
  user-select: none;
}
canvas {
  outline: none;
}
.viewer-container {
  position: relative;
  width: 100vw;
  height: 100vh;
}
.ui-wrapper {
  position: absolute;
  left: 10px;
  top: 10px;
  padding: 5px;
  background-color: rgba(0, 0, 0, 0.7);
}
.ui-wrapper .item {
  display: flex;
}
.ui-wrapper .item + .item {
  margin-top: 5px;
}
.ui-wrapper .item .btn {
  padding: 3px 6px;
  flex: 1;
}
.ui-wrapper .item .btn + .btn {
  margin-left: 5px;
}
</style>
