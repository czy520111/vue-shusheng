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
import { addBillboard } from "../editor/draw";
const store = useUsersStore();
const pointList = reactive([]);
const bbList = reactive([]);
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
  document.getElementById("qtcanvas").addEventListener("mousemove", mouseMove);
  //   let point = getWorldPosition(event);
  //   console.log("point", point);
};
const getTextEvent = (event) => {
  var e = event;
  if (e) {
    let feature = window.GlobalViewer.scene.getFeatureByMouse();
    if (feature) {
      //   debugger;
      //   console.log("获取线图层属性");
      //   console.log(feature.parent.text);
      let text = feature.parent.text;
      navigator.clipboard.writeText(text);
      ElMessage.success("复制成功");
      //   this.lineLayerPick(feature);
    }
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
