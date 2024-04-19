<template>
  <div class="coordinate">
    <el-button type="primary" @click="setPoint()">坐标</el-button>
  </div>
</template>

<script setup>
import { ref, reactive, toRaw } from "vue";
import { useUsersStore } from "../store";
import { getWorldPosition } from "../editor/math";
import { ElMessage } from "element-plus";
const store = useUsersStore();
const pointList = reactive([]);
const setPoint = () => {
  clearMeasure();
  document
    .getElementById("qtcanvas")
    .addEventListener("click", mouseClickEvent);
  document.getElementById("qtcanvas").style.cursor = "crosshair";
  document
    .getElementById("qtcanvas")
    .addEventListener("contextmenu", ContextMenuEvent);
  ElMessage.info("左键获取坐标");
};

const clearMeasure = () => {
  if (pointList.length > 0) {
    let length = pointList.length;
    for (var i = length - 1; i > -1; i--) {
      toRaw(pointList[i]).delete();
      pointList.splice(i, 1);
      delete toRaw(pointList[i]);
    }
  }
};

const mouseClickEvent = (event) => {
  let point = getWorldPosition(event);
  let la = point.toCartographic().toDegrees();

  console.log("la", la);
  let obj = {
    point,
    text: `
    经度:${la.longitude.toFixed(6)} 
    纬度:${la.latitude.toFixed(6)} 
    高度:${la.height.toFixed(2)}`,
  };
  drawLabel(obj);
  //   drawShpere(la);
  ContextMenuEvent();
  getText(event);
};
const getText = (event) => {
  document.getElementById("qtcanvas").addEventListener("click", getTextEvent);
  //   let point = getWorldPosition(event);
  //   console.log("point", point);
};
const getTextEvent = (event) => {
  //   let point = getWorldPosition(event);
  var camera = window.GlobalViewer.scene.mainCamera; //获取相机

  var hit = new SSmap.RaycastHit(); //射线投影
  //鼠标点击的位置，通过相机视角射线获取
  var ray = camera.screenPointToRay(event.x, event.y);
  var rayok = window.GlobalViewer.scene.raycast(ray, hit); //判断是否存在
  var point = 0;
  if (rayok) {
    if (hit) {
      point = hit.point; //Vector3
    }
  }
  hit.delete();

  console.log("point", point);
};
const drawShpere = (obj) => {
  let sphere = new SSmap.Sphere3D();
  sphere.radii = SSmap.Vector3.create(5.0, 5.0, 5.0);
  sphere.color = SSmap.Color.fromRgb(0, 255, 0, 255);
  sphere.position = SSmap.Cartographic.fromDegrees(
    obj.longitude,
    obj.latitude,
    obj.height
  ).toVector3();
  sphere.create();

  let sphereEntity = sphere.createEntity();
  sphereEntity.parent = SSmap.Entity.root();
  //   Utils.sphere3d = sphereEntity;
};
const drawLabel = (obj) => {
  let label3d = new SSmap.Label3D();
  label3d.position = obj.point;

  //   label3d.frameUrl = frameUrl;
  //   label3d.url = imageUrl;
  label3d.objectName = "label";
  label3d.text = obj.text;
  label3d.background = SSmap.Color.fromRgb(46, 183, 192, 200);
  label3d.imageWidth = 24;
  label3d.imageHeight = 20;
  label3d.fontSize = 12;
  label3d.mix = true;
  label3d.setAltitude(20);
  label3d.setAltitudeMethod(SSmap.AltitudeMethod.Absolute);
  label3d.lineColor = SSmap.Color.fromRgb(0, 0, 200, 200);
  label3d.lineToGround = true;
  label3d.setCollection(SSmap.BillboardCollection.Instance());

  //   let sphereEntity = label3d.createEntity();
  //   sphereEntity.parent = SSmap.Entity.root();
  pointList.push(label3d);
};
const ContextMenuEvent = (event) => {
  document.getElementById("qtcanvas").style.cursor = "default";
  document
    .getElementById("qtcanvas")
    .removeEventListener("click", mouseClickEvent);
  document
    .getElementById("qtcanvas")
    .removeEventListener("contextmenu", ContextMenuEvent);
  document
    .getElementById("qtcanvas")
    .removeEventListener("click", getTextEvent);
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
