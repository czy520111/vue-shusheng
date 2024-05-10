<template>
  <div class="coordinate">
    <el-button type="primary" @click="setPoint()">坐标</el-button>
    <div @click="getTextEvent" class="text-info">
      <p>经度:{{ longitude }}</p>
      <p>维度:{{ latitude }}</p>
      <p>高度:{{ height }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, toRaw, onUnmounted, defineExpose } from "vue";
import { useUsersStore } from "../store";
import { getWorldPosition } from "../editor/math";
import { ElMessage } from "element-plus";
import { addBillboard } from "../editor/draw";
const store = useUsersStore();
const pointList = reactive([]);
const bbList = reactive([]);
const longitude = ref(0);
const latitude = ref(0);
const height = ref(0);
const setPoint = () => {
  clearMeasure();
  document
    .getElementById("qtcanvas")
    .addEventListener("click", mouseClickEvent);
  document.getElementById("qtcanvas").style.cursor = "crosshair";
  document
    .getElementById("qtcanvas")
    .addEventListener("contextmenu", ContextMenuEvent);
  document
    .getElementById("qtcanvas")
    .removeEventListener("mousemove", mouseMove);
  ElMessage.info("左键获取坐标");
};

const clearMeasure = () => {
  let elem = document.querySelector(".text-info");
  elem.style.display = "none";
  // if (pointList.length > 0) {
  let length = pointList.length;
  for (var i = length - 1; i > -1; i--) {
    toRaw(pointList[i]).delete();
    pointList.splice(i, 1);
    delete toRaw(pointList[i]);
  }
  let length2 = bbList.length;
  for (var i = length2 - 1; i > -1; i--) {
    toRaw(bbList[i]).delete();
    bbList.splice(i, 1);
    delete toRaw(bbList[i]);
  }
  // }
};

const mouseClickEvent = (event) => {
  let point = getWorldPosition(event);
  let la = point.toCartographic().toDegrees();
  let Geoobj = {
    position: point, //坐标
    name: "zuobiao",
    url: "src/images/circle.png", //路径
    scale: 0.5, //比例
    altitude: 10, //海拔，非必填
    // imageWidth:0,
    // imageHeight:0,
    altitudeMethod: SSmap.AltitudeMethod.Absolute, //Absolute 绝对海拔  OnTerrain 贴地 RelativeToTerrain 贴地并相对海拔
  };
  var Billboard = addBillboard(Geoobj);
  bbList.push(Billboard);
  console.log("la", la);
  latitude.value = la.latitude.toFixed(6);
  longitude.value = la.longitude.toFixed(6);
  height.value = la.height.toFixed(2);
  let obj = {
    point,
    text: `
    经度:${la.longitude.toFixed(6)} 
    纬度:${la.latitude.toFixed(6)} 
    高度:${la.height.toFixed(2)}`,
  };
  // drawLabel(obj);

  let elem = document.querySelector(".text-info");
  elem.style.display = "block";
  let world = getWorldPosition(event);
  let tohic = world.toCartesian3().toVector3();
  let frameAction = new SSmap.FrameAction();
  frameAction.onTriggered(() => {
    //每一帧改变div的位置
    // debugger;
    var xyposition =
      window.GlobalViewer.scene.mainCamera.worldToScreenPoint(tohic);
    elem.style.bottom = 0.1 - xyposition.y + elem.clientHeight / 2 + "px";
    elem.style.left = 0.1 + xyposition.x - elem.clientWidth * 1.8 + "px";
    // console.log("456456");
  });
  scene.rootEntity.addComponent(frameAction);
  //   drawShpere(la);
  ContextMenuEvent();
  getText(event);
};
const getText = (event) => {
  // document.getElementById("qtcanvas").addEventListener("click", getTextEvent);
  document.getElementById("qtcanvas").addEventListener("mousemove", mouseMove);
  //   let point = getWorldPosition(event);
  //   console.log("point", point);
};
const getTextEvent = (event) => {
  // var e = event;
  // if (e) {
  //   let feature = window.GlobalViewer.scene.getFeatureByMouse();
  //   if (feature) {
  //   debugger;
  //   console.log("获取线图层属性");
  //   console.log(feature.parent.text);
  let el = document.querySelector(".text-info");
  let text = el.innerText;
  navigator.clipboard.writeText(text);
  ElMessage.success("复制成功");
  //   }
  // }
};
const mouseMove = (e) => {
  let feature = window.GlobalViewer.scene.getFeatureByMouse();
  if (feature) {
    document.getElementById("qtcanvas").style.cursor = "pointer";
  } else {
    document.getElementById("qtcanvas").style.cursor = "default";
  }
};
const ContextMenuEvent = (event) => {
  document.getElementById("qtcanvas").style.cursor = "default";
  document
    .getElementById("qtcanvas")
    .removeEventListener("click", mouseClickEvent);
  document
    .getElementById("qtcanvas")
    .removeEventListener("contextmenu", ContextMenuEvent);
  // document
  //   .getElementById("qtcanvas")
  //   .removeEventListener("click", getTextEvent);
};

onUnmounted(() => {
  clearMeasure();
});

defineExpose({
  clearMeasure,
});
</script>

<style lang="scss" scoped>
.text-info {
  cursor: pointer;
  position: absolute;
  display: none;
  background: #000;
  border-radius: 8px;
  padding: 8px;
  min-width: 140px;
}
</style>
