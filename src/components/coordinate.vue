<template>
  <div class="coordinate">
    <el-button type="primary" @click="setPoint()">坐标</el-button>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useUsersStore } from "../store";
import { getWorldPosition } from "../editor/math";
import { ElMessage } from "element-plus";
const store = useUsersStore();
const setPoint = () => {
  document
    .getElementById("qtcanvas")
    .addEventListener("click", mouseClickEvent);
  document.getElementById("qtcanvas").style.cursor = "crosshair";
  document
    .getElementById("qtcanvas")
    .addEventListener("contextmenu", ContextMenuEvent);
  ElMessage.info("左键获取坐标");
};

const mouseClickEvent = (event) => {
  let point = getWorldPosition(event);
  let obj = {
    point,
  };
  drawLabel(obj);
};
const drawLabel = (obj) => {
  let label3d = new SSmap.Label3D();
  label3d.position = obj.point;

  //   label3d.frameUrl = frameUrl;
  //   label3d.url = imageUrl;
  label3d.text = "Test";
  label3d.background = SSmap.Color.fromRgb(0, 0, 200, 200);
  label3d.imageWidth = 20;
  label3d.imageHeight = 20;
  label3d.fontSize = 14;
  label3d.mix = true;
  label3d.setAltitude(20);
  label3d.setAltitudeMethod(SSmap.AltitudeMethod.Absolute);
  label3d.lineColor = SSmap.Color.fromRgb(0, 0, 200, 200);
  label3d.lineToGround = true;
  label3d.setCollection(SSmap.BillboardCollection.Instance());
};
const ContextMenuEvent = (event) => {
  document.getElementById("qtcanvas").style.cursor = "default";
  document
    .getElementById("qtcanvas")
    .removeEventListener("click", mouseClickEvent);
  document
    .getElementById("qtcanvas")
    .removeEventListener("contextmenu", ContextMenuEvent);
};
</script>

<style lang="scss" scoped>
.coordinate {
  position: absolute;
  top: 62px;
  left: 280px;
  width: 50px;
  height: 20px;
  p {
    color: white;
  }
}
</style>
