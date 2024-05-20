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
import {
  ref,
  reactive,
  toRaw,
  onUnmounted,
  defineExpose,
  getCurrentInstance,
} from "vue";
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
let { proxy } = getCurrentInstance();
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
  console.log("cccccc");
  let elem = document.querySelector(".text-info");
  elem.style.display = "none";
  // let elem = document.querySelector(".text-info");
  // elem.style.display = "none";
  Native.Point.clearMeasure();
  return;
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
const downPoint = (poi, url) => {
  let elem = document.querySelector(".text-info");
  elem.style.display = "block";
  Native.Point.checkPoint(poi, url, function (la) {
    // console.log(la, "la6666");
    latitude.value = la.latitude.toFixed(6);
    longitude.value = la.longitude.toFixed(6);
    height.value = la.height.toFixed(2);

    elem.style.bottom = 0.1 - la.xyposition.y + elem.clientHeight / 2 + "px";
    elem.style.left = 0.1 + la.xyposition.x - elem.clientWidth * 1.8 + "px";
  });
};

const mouseClickEvent = (event) => {
  console.log(Native, "Native");
  Native.Point.getWorldPosition({ x: event.x, y: event.y }, function (poi) {
    console.log("World position:", poi);
    // let point = { x: poi.x, y: poi.y, z: poi.z };
    let url = proxy.$baseUrl;
    // Native.Point.checkPoint(poi, url);
    downPoint(poi, url);
    ContextMenuEvent();
    getText(event);
    // SSmap = window.SSmap;
  });
};
const getText = (event) => {
  // document.getElementById("qtcanvas").addEventListener("click", getTextEvent);
  // document.getElementById("qtcanvas").addEventListener("mousemove", mouseMove);
  //   let point = getWorldPosition(event);
  //   console.log("point", point);
};
const getTextEvent = async () => {
  //区分是否是客户端，做不同的复制方法
  try {
    let el = document.querySelector(".text-info");
    let text = el.innerText;
    const permissionStatus = await navigator.permissions.query({
      name: "clipboard-write",
    });
    if (
      permissionStatus.state === "granted" ||
      permissionStatus.state === "prompt"
    ) {
      await navigator.clipboard.writeText(text);
      ElMessage.success("复制成功");
    } else {
      const textArea = document.createElement("textArea");
      textArea.value = text;
      textArea.style.width = 0;
      textArea.style.position = "fixed";
      textArea.style.left = "-999px";
      textArea.style.top = "10px";
      textArea.setAttribute("readonly", "readonly");
      document.body.appendChild(textArea);

      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      ElMessage.success("复制成功");
    }
    // console.log("Page URL copied to clipboard");
  } catch (err) {
    console.error("Failed to copy: ", err);
  }
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
