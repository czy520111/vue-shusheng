<template>
  <div>
    <!-- 3d视图容器 -->
    <div class="viewer-container" ref="container"></div>

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
        <li class="item">
          <Custom />
        </li>
      </ul>
      <!-- <div class="meausre"><p>测量</p></div>
      <el-radio-group @change="changeComponent" v-model="selectedComponent">
        <el-radio-button label="Measurement">
          <Measurement />
        </el-radio-button>
        <el-radio-button label="Coordinate">
          <Coordinate />
        </el-radio-button>
        <el-radio-button label="Area">
          <Area />
        </el-radio-button>
        <el-radio-button label="Volume">
          <Volume />
        </el-radio-button>
      </el-radio-group> -->
      <!-- <div>
        <button @click="toggleComponent">Toggle Component</button>
      </div> -->
      <div class="tool-box">
        <p>测量</p>
        <!-- <div> -->
        <Measurement @click="changeComponent(1)" ref="MeasurementVal" />

        <!-- </div> -->
        <!-- <div> -->
        <Coordinate @click="changeComponent(2)" ref="CoordinateVal" />

        <!-- </div> -->

        <Area @click="changeComponent(3)" ref="AreaVal" />
        <Volume @click="changeComponent(4)" ref="VolumeVal" />
        <Create @click="changeComponent(5)" />
      </div>

      <!-- <Point></Point> -->
    </div>
  </div>
</template>

<script setup>
import SSWebChannel from "../public/SSWebChannel.js";
import emitter from "./libs/emitter.js";
import Measurement from "./components/Measurement.vue";
import Coordinate from "./components/coordinate.vue";
import Area from "./components/Area.vue";
import Volume from "./components/Volume.vue";
import Create from "./components/Create.vue";
import Custom from "./components/Custom.vue";
import { ref, onMounted } from "vue";
import Web from "./web/index.js";
import { ElRadioGroup, ElRadio, ElRadioButton } from "element-plus";
import * as Native from "../public/native/main.js";
import qtLoader from "../assets/loader.js";
// import CanvasLoader from "./views/hybrid-loader.vue";

const CoordinateVal = ref();
const MeasurementVal = ref();
const AreaVal = ref();
const VolumeVal = ref();

const meausreVal = ref(false);
const coorVal = ref(false);
// export default {
//   name: "app",
//   setup() {
const container = ref(null);
const selectedComponent = ref("");
const componentKey = ref(0);

const changeComponent = (val) => {
  console.log("CoordinateVal", CoordinateVal.value);
  console.log("CoordinateVal", CoordinateVal.value.clearMeasure);
  CoordinateVal.value.clearMeasure();
  MeasurementVal.value.clearMeasure();
  AreaVal.value.clearMeasure();
  VolumeVal.value.clearMeasure();
  // console.log("changeComponent", val);
  // meausreVal.value = false;
  // coorVal.value = false;
  // if (val === "meausreVal") {
  //   meausreVal.value = true;
  // } else if (val === "coorVal") {
  //   coorVal.value = true;
  // }
};

const toggleComponent = () => {
  componentKey.value++; // 改变 key 值，触发组件重新渲染
};
const clearMeasure = (e) => {
  console.log("handleCustomEvent", e);
};
const addArcGisImagery = () => {
  Web.initArcGis();
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
  //客户端
  if (!window.Native) {
    let canvasEl = document.createElement("div");
    canvasEl.id = "qtcanvas";
    canvasEl.style.cssText = `
            width: 100vw;
            height: 100vh;
            touch-action: none;
        `;
    canvasEl.oncontextmenu = function (e) {
      e.preventDefault();
    };

    let app = document.querySelector(".viewer-container");
    app.appendChild(canvasEl);

    //初始化SSWebChannel.js脚本
    window.ssWebChannel = new SSWebChannel(canvasEl, (channel) => {
      //初始化native模块
      channel.importModule("public/native/main.js", "Native", () => {
        //初始化完成
        window.GlobalViewer.canvasEl = canvasEl;

        window.HtmldomList = [];
        window.pointLineList = [];
        window.linedistance = 0;
        window.entityAllList = [];
        window.nodeMoveList = [];
        window.laberMoveList = [];
        window.billboardCollection = null;
        emitter.emit("initMap");
      });
    });
  }

  //网页端
  // qtLoader({
  //   el: container.value,
  // }).then(([SSmap, GlobalViewer]) => {
  //   // 设置Native全局变量
  //   window.Native = Native;
  //   window.nowLayer = null;
  //   // 设置视图全局变量
  //   window.GlobalViewer = GlobalViewer;
  //   window.SSmap = SSmap;
  //   window.scene = GlobalViewer.scene;
  //   // 浏览器环境全局变量
  //   window.isWeb = true;
  //   window.HtmldomList = [];
  //   window.pointLineList = [];
  //   window.linedistance = 0;
  //   window.entityAllList = [];
  //   window.nodeMoveList = [];
  //   window.laberMoveList = [];
  //   window.billboardCollection = null;
  //   // 初始化完成
  //   Web.initMap();
  // });
});

emitter.on("initMap", () => {
  // state.appShow = true;
  //sdk授权
  Web.initMap();

  // draw();
});

const draw = () => {
  let position = {
    longitude: 114.054494,
    latitude: 22.540745,
    height: 1300,
  };
  Native.cameraFlyTo(position);

  // //加载影像
  // Native.ArcGisMapLayer.add({
  //   url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
  //   id: uuid(),
  // });

  // //加载地形
  // Native.Terrain.add({
  //   url: "https://www.dataarche.com/static_resource/MultiScreenData/dem/sz",
  // });
};
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
  margin: -4px;
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
.meausre {
  color: white;
}
.tool-box {
  position: absolute;
  left: 200px;
  top: 10px;
  padding: 5px;
  /* background-color: rgba(0, 0, 0, 0.7); */
  width: 500px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  color: white;
}
</style>
