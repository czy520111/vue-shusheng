<template>
  <div class="test">
    <!-- <p>测量</p> -->
    <div class="mb-4">
      <el-button @click="setLine()" type="primary">线长</el-button>
      <!-- <el-button type="danger">Danger</el-button> -->
    </div>
  </div>
</template>

<script setup>
import { ElMessage } from "element-plus";
import { useUsersStore } from "../store";
import {
  getWorldPosition,
  distanceBetweenPoints,
  isPointOnLine,
} from "../editor/math";
import { addBillboard } from "../editor/draw";
import {
  ref,
  reactive,
  toRaw,
  onUnmounted,
  defineExpose,
  getCurrentInstance,
} from "vue";
import { fa, tr } from "element-plus/es/locales.mjs";
const emit = defineEmits(["clearMeasure"]);
const store = useUsersStore();
const text = ref("");
const check = ref(false);
const idnum = ref(0);
const pointArr = ref([]);
const bbList = reactive([]);
const checkPoint = ref(false);
const lineList = reactive([]);
const polyList = reactive([]);
const labelList = reactive([]);
const dbPoint = ref(false);
let { proxy } = getCurrentInstance();
const setLine = () => {
  clearMeasure();

  pointArr.value = [];
  store.changePointArr([]);
  check.value = true;
  store.check = 1;
  document
    .getElementById("qtcanvas")
    .addEventListener("click", mouseClickEvent);
  document.getElementById("qtcanvas").style.cursor = "crosshair";
  document
    .getElementById("qtcanvas")
    .addEventListener("mousemove", MouseMoveEvent);
  document
    .getElementById("qtcanvas")
    .addEventListener("contextmenu", ContextMenuEvent);

  ElMessage.info("左键获取，右键结束");
  // // console.log("setLine", store.worldPosition, store.check);
  // pointArr.value.push(store.worldPosition);
  // if (pointArr.value.length > 1 && check.value) {
  //   debugger;
  //   let end = pointArr[pointArr.length - 1];
  //   let distance = end.distance(store.WorldPosition);
  //   // console.log("distance", distance);
  // } else {
  //   check.value = false;
  // }
};

const clearMeasure = () => {
  if (bbList.length > 0) {
    let length = window.entityAllList.length;
    for (var i = length - 1; i > -1; i--) {
      window.entityAllList[i].delete();
      window.entityAllList.splice(i, 1);
      delete window.entityAllList[i];
    }
    let length2 = labelList.length;
    for (var i = length2 - 1; i > -1; i--) {
      toRaw(labelList[i]).delete();
      labelList.splice(i, 1);
      delete toRaw(labelList[i]);
    }
    let length3 = bbList.length;
    for (var i = length3 - 1; i > -1; i--) {
      toRaw(bbList[i]).delete();
      bbList.splice(i, 1);
      delete toRaw(bbList[i]);
    }
    let length1 = polyList.length;
    for (var i = length1 - 1; i > -1; i--) {
      toRaw(polyList[i]).delete();
      polyList.splice(i, 1);
      delete toRaw(polyList[i]);
    }
  }
};

const mouseClickEvent = (event) => {
  // // console.log(e);
  // let point = getWorldPosition(event);
  let url = proxy.$baseUrl;
  Native.Point.getWorldPosition({ x: event.x, y: event.y }, function (point) {
    Native.Measurement.mouseClickEvent(point, url);
  });

  return;
  //鼠标左键点击
  if (window.pointLineList.length == 0) {
    window.linedistance = 0; //清空上次测量结果
  }

  window.pointLineList.push(point); //记录点击的节点坐标

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
  Billboard.objectName = "bill";
  bbList.push(Billboard);

  //两个节点确定一条线
  if (window.pointLineList.length > 1) {
    var pointArr = new Array();
    pointArr.push(window.pointLineList[window.pointLineList.length - 2]);
    pointArr.push(window.pointLineList[window.pointLineList.length - 1]);
    var polylineObj = {
      width: 3,
      alpha: 1,
      pointArr: pointArr,
      color: SSmap.Color.fromRgb(83, 255, 26, 255),
      altitude: SSmap.AltitudeMethod.Absolute,
      depthTest: false,
      name: "polyline",
      // id: "measure",
    };
    var polyline = drawPolyline(polylineObj);
    window.entityAllList.push(polyline);
    lineList.push(polyline);
    //水平距离
    var distance = SSmap.Cartesian3.distance(
      window.pointLineList[window.pointLineList.length - 2].toCartesian3(),
      window.pointLineList[window.pointLineList.length - 1].toCartesian3()
    ).toFixed(2);
    //累积多个节点的距离，总长度
    var opt = {
      num1: window.linedistance,
      num2: distance,
    };
    window.linedistance = numAdd(opt);
    //标签
    var labelObj = {
      position: point,
      text: window.linedistance.toFixed(2).toString() + "m",
      fontSize: 20,
      fontColor: SSmap.Color.fromRgb(255, 255, 26, 255),
      translucencyByDistance: SSmap.Vector4.create(30000, 1.0, 1.0e5, 0.7),
      name: "label",
      // id: "measure",
    };
    var label3d = addLabel3D(labelObj);
    window.entityAllList.push(label3d);
    // let lableEntity = new SSmap.VisualEntity();
    // lableEntity.addComponent(label3d);
    // GlobalViewer.scene.addEntity(lableEntity);
  }
};

const ContextMenuEvent = () => {
  Native.Measurement.ContextMenuEvent();
  document.getElementById("qtcanvas").style.cursor = "default";
  endMeasure();
  updataLine();
  document.getElementById("qtcanvas").addEventListener("mousedown", mouseDown);
  document.getElementById("qtcanvas").addEventListener("mouseup", mouseUp);
  return;
  if (window.nodeMoveList.length > 0) {
    window.nodeMoveList[window.nodeMoveList.length - 1].delete(); //删除鼠标移动中前一帧创建的线实体
  }
  window.nodeMoveList = [];
  if (window.laberMoveList.length > 0) {
    window.laberMoveList[window.laberMoveList.length - 1].delete(); //删除鼠标移动中前一帧创建的线实体
  }
  window.laberMoveList = [];
  window.pointLineList = [];
};

const dblClickEvent = (event) => {
  console.log(event, "666666666666666");
  return;
  let url = proxy.$baseUrl;
  Native.Measurement.dblClickEvent({ x: event.x, y: event.y }, url);
  return;
  let feature = window.GlobalViewer.scene.getFeatureByMouse();
  let point = getWorldPosition(event);
  if (feature) {
    if (feature.parent.objectName == "polyline") {
      // console.log("获取线图层属性", feature);
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
      // console.log(polyList, 555);

      let originalLength = bbList.length; // 保存原始长度

      for (let i = 1; i < originalLength; i++) {
        let p1 = toRaw(bbList[i - 1]).position;
        let p2 = toRaw(bbList[i]).position;
        let p3 = point;
        let result = isPointOnLine(p3, p1, p2, 30);
        if (result) {
          // console.log(i, "789789");
          var Billboard = addBillboard(Geoobj);
          Billboard.objectName = "bill";
          bbList.splice(i, 0, Billboard);
          originalLength++; // 每次插入一个元素，原始长度加一
          updataLine();
          return;
        }
      }
    } else if (feature.parent.objectName == "bill") {
      // console.log("获取点图层属性", feature);
    }
  }
};
let mouseMoveListener = null;
const mouseDown = (e) => {
  // console.log("mouseDown");
  // let point = getWorldPosition(e);
  // Native.Point.getWorldPosition({ x: e.x, y: e.y }, function (point) {
  Native.Measurement.mouseDown(function (feature) {
    if (mouseMoveListener) {
      document
        .getElementById("qtcanvas")
        .removeEventListener("mousemove", mouseMoveListener);
    }
    mouseMoveListener = (e) => movePoint(e, feature);
    document
      .getElementById("qtcanvas")
      .addEventListener("mousemove", mouseMoveListener);
  });

  // });
  return;
  let feature = window.GlobalViewer.scene.getFeatureByMouse();
  if (feature?.parent.objectName == "bill") {
    checkPoint.value = true;
    let position = feature.parent.position;

    // console.log("获取点图层属性", feature);
  }
};

const mouseUp = (e) => {
  // console.log("mouseUp");

  Native.Measurement.mouseUp(function (mouseMoveListener) {
    if (mouseMoveListener) {
      document
        .getElementById("qtcanvas")
        .removeEventListener("mousemove", mouseMoveListener);
      // mouseMoveListener = null; // 置空变量
    }
    document
      .getElementById("qtcanvas")
      .removeEventListener("mousedown", mouseDown);
    document.getElementById("qtcanvas").addEventListener("mousedown", setPoint);
  });
  return;
  // checkPoint.value = false;
  document.getElementById("qtcanvas").style.cursor = "default";
  // let cameraCtrl = GlobalViewer.scene.mainCamera.cameraController();
  // cameraCtrl.enableInputs = true;
  // console.log(lineList, "+++", bbList);
  // updataLine();
  if (mouseMoveListener) {
    document
      .getElementById("qtcanvas")
      .removeEventListener("mousemove", mouseMoveListener);
    mouseMoveListener = null; // 置空变量
  }
  document
    .getElementById("qtcanvas")
    .removeEventListener("mousedown", mouseDown);
  document.getElementById("qtcanvas").addEventListener("mousedown", setPoint);
};

const movePoint = (e, feature) => {
  Native.Measurement.movePoint({ x: e.x, y: e.y }, function (feature) {
    document.getElementById("qtcanvas").style.cursor = "pointer";
  });
  return;
  if (checkPoint.value == false) return;
  document.getElementById("qtcanvas").style.cursor = "pointer";
  let cameraCtrl = GlobalViewer.scene.mainCamera.cameraController();
  cameraCtrl.enableInputs = false;
  let newPosition = getWorldPosition(e);
  feature.parent.position = newPosition;
  updataLine();
};

const setPoint = (e) => {
  Native.Measurement.setPoint();
  return;
  let feature = window.GlobalViewer.scene.getFeatureByMouse();
  if (feature?.parent.objectName == "bill") {
    mouseDown(e);
  }
};

const updataLine = () => {
  Native.Measurement.updataLine();
  return;
  let pointList = [];
  let length3 = labelList.length;
  for (var i = length3 - 1; i > -1; i--) {
    toRaw(labelList[i]).delete();
    labelList.splice(i, 1);
    delete toRaw(labelList[i]);
  }
  let total = 0;
  for (let i = 1; i < bbList.length; i++) {
    total += distanceBetweenPoints(
      toRaw(bbList[i - 1]).position,
      toRaw(bbList[i]).position
    );
    var labelObj = {
      position: toRaw(bbList[i]).position,
      text: total.toFixed(2).toString() + "m",
      fontSize: 20,
      fontColor: SSmap.Color.fromRgb(255, 255, 26, 255),
      translucencyByDistance: SSmap.Vector4.create(30000, 1.0, 1.0e5, 0.7),
      name: "label",
      // id: "measure",
    };
    var label3d = addLabel3D(labelObj);
    labelList.push(label3d);
  }
  bbList.forEach((item) => {
    pointList.push(toRaw(item).position);
    var labelObj = {
      position: toRaw(item).position,
      text: total.toFixed(2).toString() + "m",
      fontSize: 20,
      fontColor: SSmap.Color.fromRgb(255, 255, 26, 255),
      translucencyByDistance: SSmap.Vector4.create(30000, 1.0, 1.0e5, 0.7),
      name: "label",
      // id: "measure",
    };
  });

  // console.log(labelList, "777", total);
  let polylineObj = {
    width: 3,
    alpha: 1,
    pointArr: pointList,
    color: SSmap.Color.fromRgb(83, 255, 26, 255),
    altitude: SSmap.AltitudeMethod.Absolute,
    depthTest: false,
    name: "polyline",
    // id: "measure",
  };
  let length = window.entityAllList.length;
  for (var i = length - 1; i > -1; i--) {
    window.entityAllList[i].delete();
    window.entityAllList.splice(i, 1);
    delete window.entityAllList[i];
  }
  let length1 = polyList.length;
  for (var i = length1 - 1; i > -1; i--) {
    toRaw(polyList[i]).delete();
    polyList.splice(i, 1);
    delete toRaw(polyList[i]);
  }

  let polyline = drawPolyline(polylineObj);
  polyList.push(polyline);
};

const endMeasure = () => {
  document
    .getElementById("qtcanvas")
    .removeEventListener("click", mouseClickEvent);
  document.getElementById("qtcanvas").style.cursor = "default";
  document
    .getElementById("qtcanvas")
    .removeEventListener("mousemove", MouseMoveEvent);
  document
    .getElementById("qtcanvas")
    .removeEventListener("contextmenu", ContextMenuEvent);
  document
    .getElementById("qtcanvas")
    .addEventListener("dblclick", dblClickEvent);
};

const drawPolyline = (opt) => {
  var polyline = new SSmap.Polyline3D();
  for (var i = 0; i < opt.pointArr.length; i++) {
    polyline.addPoint(opt.pointArr[i]);
  }
  polyline.alpha = opt.alpha >= 1 ? 0.99 : opt.alpha;
  polyline.color = opt.color;
  polyline.depthTest = opt.depthTest;
  polyline.setWidth(opt.width);
  polyline.setAltitudeMethod(opt.altitude);
  polyline.setAltitude(0.1);
  polyline.setMinDistance(5.0);
  polyline.name = opt.name;
  polyline.addProperty("name", opt.name);
  polyline.objectName = "polyline";
  polyline.draw();
  polyline.end();
  return polyline;
};

const numAdd = (opt) => {
  var baseNum, baseNum1, baseNum2;
  try {
    baseNum1 = opt.num1.toString().split(".")[1].length;
  } catch (e) {
    baseNum1 = 0;
  }
  try {
    baseNum2 = opt.num2.toString().split(".")[1].length;
  } catch (e) {
    baseNum2 = 0;
  }
  baseNum = Math.pow(10, Math.max(baseNum1, baseNum2));
  return (opt.num1 * baseNum + opt.num2 * baseNum) / baseNum;
};

const addLabel3D = (opt) => {
  var label3d = new SSmap.Label3D();
  label3d.position = opt.position;
  if (opt.text != "" && opt.text != undefined) {
    label3d.text = opt.text;
  }
  label3d.fontSize = opt.fontSize; //字体大小
  label3d.fontColor = opt.fontColor; //字体颜色，白色
  if (opt.strokeColor) {
    label3d.strokeColor = opt.strokeColor; //描边颜色，黑边
  }
  if (opt.background) {
    label3d.background = opt.background; //背景颜色
  }
  if (opt.url) {
    label3d.url = window.document.location.origin + "/" + opt.url; //图片路径
  }
  if (opt.vertical) {
    label3d.vertical = opt.vertical;
  }
  if (opt.horizontal) {
    label3d.horizontal = opt.horizontal;
  }
  if (opt.imageWidth) {
    label3d.imageWidth = opt.imageWidth;
  }
  if (opt.imageHeight) {
    label3d.imageHeight = opt.imageHeight;
  }
  if (opt.offset) {
    label3d.offset = opt.offset; //偏移量
  }
  if (opt.scaleByDistance) {
    label3d.setScaleByDistance(opt.scaleByDistance); //缩放比
  }
  if (opt.translucencyByDistance) {
    label3d.setTranslucencyByDistance(opt.translucencyByDistance); //缩放控制透明度
  }
  if (window.billboardCollection == null) {
    var bbcollection = new SSmap.BillboardCollection();
    window.billboardCollection = bbcollection;
  }

  label3d.name = opt.name;
  label3d.addProperty("name", opt.name);
  if (opt.id) {
    label3d.id = opt.id;
    label3d.addProperty("id", opt.id);
  }
  label3d.setCollection(window.billboardCollection);
  return label3d;
};

const MouseMoveEvent = (event) => {
  // // console.log(e);
  // let point = getWorldPosition(event);
  Native.Point.getWorldPosition({ x: event.x, y: event.y }, function (point) {
    Native.Measurement.MouseMoveEvent(point);
  });
  return;
  if (window.nodeMoveList.length > 0) {
    window.nodeMoveList[window.nodeMoveList.length - 1].delete(); //删除鼠标移动中前一帧创建的线实体
  }
  window.nodeMoveList = [];
  if (window.laberMoveList.length > 0) {
    window.laberMoveList[window.laberMoveList.length - 1].delete(); //删除鼠标移动中前一帧创建的线实体
  }
  window.laberMoveList = [];
  if (window.pointLineList.length > 0) {
    var pointArr = new Array();
    pointArr.push(window.pointLineList[window.pointLineList.length - 1]);
    pointArr.push(point);

    var polylineObj = {
      width: 1.5,
      alpha: 1,
      pointArr: pointArr,
      color: SSmap.Color.fromRgb(83, 255, 26, 255),
      altitude: SSmap.AltitudeMethod.Absolute,
      depthTest: false,
      name: "move",
    };
    var polyline = drawPolyline(polylineObj);
    window.nodeMoveList.push(polyline);
  }
};

onUnmounted(() => {
  clearMeasure();
});

defineExpose({
  clearMeasure,
});
</script>

<style lang="scss" scoped></style>
