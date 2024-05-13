<template>
  <div class="area">
    <el-button type="primary" @click="setArea()">面积</el-button>
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
import {
  getWorldPosition,
  calSpaceArea,
  calculatePolygonCenter,
} from "../editor/math.js";
import {
  drawPolyline,
  drawLabel,
  drawPolygonGeometry,
  drawPolygon3D,
  addBillboard,
} from "../editor/draw.js";
import { ElMessage } from "element-plus";
const store = useUsersStore();
const pointList = reactive([]);
const threeList = reactive([]);
const moveList = reactive([]);
const polyList = reactive([]);
const bbList = reactive([]);
let { proxy } = getCurrentInstance();
const setArea = () => {
  clearMeasure();
  document
    .getElementById("qtcanvas")
    .addEventListener("click", mouseClickEvent);
  document.getElementById("qtcanvas").style.cursor = "crosshair";
  document
    .getElementById("qtcanvas")
    .addEventListener("contextmenu", ContextMenuEvent);
  ElMessage.info("左键获取,右键结束");
};
const endarea = () => {
  document
    .getElementById("qtcanvas")
    .removeEventListener("click", mouseClickEvent);
  document.getElementById("qtcanvas").style.cursor = "default";
  document
    .getElementById("qtcanvas")
    .removeEventListener("contextmenu", ContextMenuEvent);
  document
    .getElementById("qtcanvas")
    .removeEventListener("mousemove", mousemoveEvent);
  ElMessage.info("左键获取,右键结束");
};

const clearMeasure = () => {
  Native.Area.clearMeasure();
  return;
  if (threeList.length > 0) {
    pointList.splice(0, pointList.length);
    let length = threeList.length;
    for (var i = length - 1; i > -1; i--) {
      toRaw(threeList[i]).delete();
      threeList.splice(i, 1);
      delete toRaw(threeList[i]);
    }
    let length1 = moveList.length;
    for (var i = length1 - 1; i > -1; i--) {
      toRaw(moveList[i]).delete();
      moveList.splice(i, 1);
      delete toRaw(moveList[i]);
    }
    let length2 = polyList.length;
    for (var i = length2 - 1; i > -1; i--) {
      toRaw(polyList[i]).delete();
      polyList.splice(i, 1);
      delete toRaw(polyList[i]);
    }
    let length3 = bbList.length;
    for (var i = length3 - 1; i > -1; i--) {
      toRaw(bbList[i]).delete();
      bbList.splice(i, 1);
      delete toRaw(bbList[i]);
    }
  }
};
const NattiClick = () => {};
const mouseClickEvent = (event) => {
  // let point = getWorldPosition(event);
  let url = proxy.$baseUrl;
  Native.Point.getWorldPosition({ x: event.x, y: event.y }, function (point) {
    Native.Area.mouseClickEvent(point, url);
    document
      .getElementById("qtcanvas")
      .addEventListener("mousemove", mousemoveEvent);
  });
  return;
  pointList.push(point);
  let la = point.toCartographic().toDegrees();
  let Geoobj = {
    position: point, //坐标
    name: "zuobiao",
    url: "src/images/point.png", //路径
    scale: 0.5, //比例
    altitude: 10, //海拔，非必填
    // imageWidth:0,
    // imageHeight:0,
    altitudeMethod: SSmap.AltitudeMethod.Absolute, //Absolute 绝对海拔  OnTerrain 贴地 RelativeToTerrain 贴地并相对海拔
  };
  var Billboard = addBillboard(Geoobj);
  bbList.push(Billboard);
  if (pointList.length > 0) {
    let obj = {
      width: 3,
      alpha: 1,
      pointArr: toRaw(pointList),
      color: SSmap.Color.fromRgb(83, 255, 26, 255),
      altitude: SSmap.AltitudeMethod.Absolute,
      depthTest: false,
      height: 1,
      name: "polyline",
    };
    let tLine = drawPolyline(obj);
    threeList.push(tLine);
    let area = calSpaceArea(toRaw(pointList));
    // let position = point.toCartesian3().toCartographic();
    document
      .getElementById("qtcanvas")
      .addEventListener("mousemove", mousemoveEvent);
    // console.log("area", area);
  }
  //   ContextMenuEvent();
};
const mousemoveEvent = (event) => {
  // let point = getWorldPosition(event);
  Native.Point.getWorldPosition({ x: event.x, y: event.y }, function (point) {
    Native.Area.mousemoveEvent(point);
  });
  return;
  if (moveList.length > 0) {
    toRaw(moveList)[moveList.length - 1].delete(); //删除鼠标移动中前一帧创建的线实体
    moveList.splice(0, moveList.length);
  }
  if (polyList.length > 0) {
    toRaw(polyList)[polyList.length - 1].delete(); //删除鼠标移动中前一帧创建的面实体
    polyList.splice(0, polyList.length);
  }
  let pointArr = new Array();
  let polyArr = new Array();
  pointArr.push(toRaw(pointList)[pointList.length - 1]);
  pointArr.push(point);
  //   polyArr.push(toRaw(pointList), point);
  pointList.forEach((item) => {
    polyArr.push(toRaw(item));
  });
  polyArr.push(point);
  //   polyArr.push(point);
  //
  let obj = {
    width: 3,
    alpha: 1,
    pointArr: toRaw(pointArr),
    color: SSmap.Color.fromRgb(83, 255, 26, 255),
    altitude: SSmap.AltitudeMethod.Absolute,
    depthTest: false,
    height: 1,
    name: "polyline",
  };
  let movePoly = drawPolyline(obj);
  moveList.push(movePoly);
  if (pointList.length > 1) {
    debugger;
    let altitude = SSmap.AltitudeMethod.OnTerrain;
    let polygongeometryObj = {
      fillAlpha: 0.5,
      pointArr: toRaw(polyArr),
      color: SSmap.Color.fromRgb(0, 240, 120, 255),
      borColor: SSmap.Color.fromRgb(83, 255, 26, 255),
      altitude: altitude,
      name: "topology",
      width: 1,
    };
    let polyGeometry = drawPolygon3D(polygongeometryObj);
    polyList.push(polyGeometry);
  }

  //   console.log("mousemoveEvent", event.x);
};
const ContextMenuEvent = () => {
  console.log("ContextMenuEvent");
  Native.Area.ContextMenuEvent();
  endarea();
  return;
  if (pointList.length < 3) return;

  pointList.push(pointList[0]);
  let obj = {
    width: 3,
    alpha: 1,
    pointArr: toRaw(pointList),
    color: SSmap.Color.fromRgb(83, 255, 26, 255),
    altitude: SSmap.AltitudeMethod.Absolute,
    height: 1,
    depthTest: false,
    name: "polyline",
  };
  let tLine = drawPolyline(obj);
  threeList.push(tLine);
  let area = calSpaceArea(toRaw(pointList));
  let center = calculatePolygonCenter(toRaw(pointList));
  let labelObj = {
    position: center,
    text: area.toFixed(2).toString() + "㎡",
    fontSize: 20,
    fontColor: SSmap.Color.fromRgb(255, 255, 26, 255),
    translucencyByDistance: SSmap.Vector4.create(30000, 1.0, 1.0e5, 0.7),
    name: "label",
    // id: "measure",
  };
  let label3d = drawLabel(labelObj);
  threeList.push(label3d);
  let pointArr = [];
  pointList.forEach((item) => {
    // point.toCartesian3().toCartographic()
    pointArr.push(toRaw(item));
  });
  //   let polygongeometryObj = {
  //     height: 10,
  //     alpha: 0.8,
  //     pointArr,
  //     color: SSmap.Color.fromRgb(83, 255, 26, 255),
  //     name: "polygongeometry",
  //   };
  let altitude = SSmap.AltitudeMethod.OnTerrain;
  let polygongeometryObj = {
    fillAlpha: 0.5,
    pointArr: pointArr,
    color: SSmap.Color.fromRgb(0, 240, 120, 255),
    borColor: SSmap.Color.fromRgb(83, 255, 26, 255),
    altitude: altitude,
    name: "topology",
    width: 1,
  };

  let polyGeometry = drawPolygon3D(polygongeometryObj);
  //   let polyGeometry = drawPolygonGeometry(polygongeometryObj);
  threeList.push(polyGeometry);
  let length1 = moveList.length;
  for (var i = length1 - 1; i > -1; i--) {
    toRaw(moveList[i]).delete();
    moveList.splice(i, 1);
    delete toRaw(moveList[i]);
  }
  let length2 = polyList.length;
  for (var i = length2 - 1; i > -1; i--) {
    toRaw(polyList[i]).delete();
    polyList.splice(i, 1);
    delete toRaw(polyList[i]);
  }
  endarea();
  console.log("area", area, center);
};

onUnmounted(() => {
  clearMeasure();
});

defineExpose({
  clearMeasure,
});
</script>

<style lang="scss" scoped></style>
