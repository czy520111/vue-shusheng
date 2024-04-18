<template>
  <div class="ui-wrapper">
    <el-tooltip content="我的位置" placement="top">
      <el-button
        class="IMhome"
        type="primary"
        icon="el-icon-s-home"
        circle
        @click="flyToHome"
      ></el-button>
    </el-tooltip>

    <el-button
      type="primary"
      icon="el-icon-picture-outline"
      size="small"
      @click="opencrop()"
    >
      html对象
    </el-button>

    <el-button
      type="primary"
      icon="el-icon-picture-outline"
      size="small"
      @click="deletedomHtml()"
    >
      移除对象
    </el-button>
  </div>
</template>

<script setup>
import { ref } from "vue";

let longitude = ref(0);
let latitude = ref(0);
let bubbleshow = ref(false);
let idnum = ref(0);

window.initScene = () => {
  window.viewer = window.GlobalViewer;
  draw();
  window.HtmldomList = [];
  window.viewer.setAuthorizedUrl(
    `https://www.dataarche.com:8062/authentic/license?t=2023-03-21T11:09:37.152`
  );
};

function draw() {
  flyToHome();
  addTiandituImagery();
}

function addTiandituImagery() {
  if (!window.nowLayer) {
    let wmtsurl =
      "crs=EPSG:3857&format=image/jpeg&layers=World_Imagery&styles=default&tileMatrixSet=default028mm&url=https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/WMTS";
    window.nowLayer = GlobalViewer.scene.globe.addWmsImageryLayer(wmtsurl);
    GlobalViewer.scene.globe.lightingEnabled = false;
  }
}

function addTiandituImagery1() {
  let scene = GlobalViewer.scene;
  let globe = scene.globe;
  globe.lightingEnabled = true;
  let imageLayer = new SSmap.TiandituImageryLayer();
  // 设置图层属性...
  return imageLayer;
}

function opencrop() {
  document
    .getElementById("qtcanvas")
    .addEventListener("click", mouseClickEvent);
  document.getElementById("qtcanvas").style.cursor = "crosshair";
  
}

function deletedomHtml() {
  let fbubble = document.getElementById("bubbleContent");
  for (var i = 0; i < fbubble.childNodes.length; i++) {
    fbubble.removeChild(fbubble.childNodes[i]);
    window.HtmldomList.shift();
    i--;
  }

  window.videoInterval.delete();
  window.videoInterval = null;
}

function mouseClickEvent(event) {
  // 鼠标点击事件的逻辑...
  debugger;
  var nowidnum = idnum.value;
  if (GlobalViewer.scene == undefined) return;
  // //获取相机
  var camera = GlobalViewer.scene.mainCamera;
  var hit = new SSmap.RaycastHit(); //射线投影
  //鼠标点击的位置，通过相机视角射线获取
  var ray = camera.screenPointToRay(event.x, event.y);
  var rayok = GlobalViewer.scene.raycast(ray, hit); //判断是否存在
  var point = 0;
  var tohic = null;
  if (rayok) {
    if (hit) {
      //获取坐标
      point = hit.point; //Vector3
      //Vector3转笛卡尔
      tohic = point.toCartesian3().toVector3();
    }
  }
  hit.delete();
}
function flyToHome() {
  let scene = window.GlobalViewer.scene;
  let camera = scene.mainCamera;
  let position = SSmap.Cartographic.fromDegrees(114.054494, 22.540745, 1300);
  camera.flyTo(position);
}

// 监听canvas鼠标移动事件的逻辑...
</script>

<style scoped>
.ui-wrapper {
  position: absolute;
  width: 100%;
  top: 6px;
}

.IMhome {
  position: absolute;
  right: 6px;
}
</style>
