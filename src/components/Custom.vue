<template>
  <div class="custom">
    <el-button type="primary" @click="initTiles">空间定制</el-button>
    <div class="bubbleContent"></div>
    <div class="show-info">
      <div class="shuxing">
        <p>厂房编号</p>
        <p>地块编号</p>
        <p>用地性质</p>
        <p>用地面积</p>
        <p>容积率上限</p>
        <p>限高</p>
      </div>
      <div class="shuxing-name">
        <p>{{ factoryNumber }}</p>
        <p>{{ modifiedStr }}</p>
        <p>M1</p>
        <p>{{ landNumber }}平方米</p>
        <p>9.5</p>
        <p>120</p>
      </div>

      <el-button class="checkbutton" @click="showCont" type="primary"
        >选择编辑</el-button
      >
    </div>
    <div class="show-content" v-show="showContent">
      <ul>
        <li @click="showDeitHandle(1)">
          <img src="../images/one.png" alt="" />
          <p>'一'字型</p>
        </li>
        <li @click="showDeitHandle(2)">
          <img src="../images/two.png" alt="" />
          <p>'L'字型</p>
        </li>
        <li @click="showDeitHandle(3)">
          <img src="../images/three.png" alt="" />
          <p>'C'字型</p>
        </li>
        <li @click="showDeitHandle(4)">
          <img src="../images/four.png" alt="" />
          <p>'口'字型</p>
        </li>
      </ul>
    </div>
    <div class="build-edit" v-show="showEditFloor">
      <div class="edit-left">
        <p class="title-edit">标准空间尺寸</p>
        <p>标准层1进深</p>
        <p v-if="checkType == 2 || checkType == 3 || checkType == 4">
          标准层2进深
        </p>
        <p v-if="checkType == 3 || checkType == 4">标准层3进深</p>
        <p v-if="checkType == 4">标准层4进深</p>
        <p>层数</p>
        <p>层高</p>
        <p>旋转</p>
        <!-- <div> -->
        <p class="title-edit">建筑功能样式</p>
        <p>屋顶样式</p>
        <p>立面样式</p>
        <!-- </div> -->
      </div>
      <div class="edit-right">
        <div class="func-top">
          <p v-if="checkType == 4">
            <el-button
              @click="deFourDepth"
              :icon="ArrowLeft"
              type="primary"
              circle
            ></el-button
            >{{ fourDepth }}米<el-button
              @click="addFourDepth"
              :icon="ArrowRight"
              type="primary"
              circle
            ></el-button>
          </p>
          <p v-if="checkType == 3 || checkType == 4">
            <el-button
              @click="deThreeDepth()"
              :icon="ArrowLeft"
              type="primary"
              circle
            ></el-button>
            {{ threeDepth }}米
            <el-button
              :icon="ArrowRight"
              @click="addThreeDepth()"
              type="primary"
              circle
            ></el-button>
          </p>
          <p v-if="checkType == 2 || checkType == 3 || checkType == 4">
            <el-button
              @click="deTwoDepth()"
              :icon="ArrowLeft"
              type="primary"
              circle
            ></el-button>
            {{ twoDepth }}米
            <el-button
              :icon="ArrowRight"
              @click="addTwoDepth()"
              type="primary"
              circle
            ></el-button>
          </p>
          <p>
            <el-button
              @click="deOneDepth"
              :icon="ArrowLeft"
              type="primary"
              circle
            ></el-button
            >{{ oneDepth }}米<el-button
              :icon="ArrowRight"
              @click="addOneDepth"
              type="primary"
              circle
            ></el-button>
          </p>
          <p>
            <el-button
              @click="dePlies"
              :icon="ArrowLeft"
              type="primary"
              circle
            ></el-button
            >{{ floorNumber }}层<el-button
              :icon="ArrowRight"
              @click="addPlies"
              type="primary"
              circle
            ></el-button>
          </p>
          <p>
            <el-button
              :icon="ArrowLeft"
              @click="deFloorHeight"
              type="primary"
              circle
            ></el-button
            >{{ floorHeight }}米<el-button
              :icon="ArrowRight"
              @click="addFloorHeight"
              type="primary"
              circle
            ></el-button>
          </p>
          <p>
            <el-button
              @click="reduceRotate"
              :icon="ArrowLeft"
              type="primary"
              circle
            ></el-button>
            {{ floorRotate }}
            度<el-button
              :icon="ArrowRight"
              @click="addRotate"
              type="primary"
              circle
            ></el-button>
          </p>
        </div>

        <div class="func">
          <p>
            <el-button
              @click="deRoomTop"
              :icon="ArrowLeft"
              type="primary"
              circle
            ></el-button
            >{{ roomTop
            }}<el-button
              @click="addRoomTop"
              :icon="ArrowRight"
              type="primary"
              circle
            ></el-button>
          </p>
          <p>
            <el-button
              @click="deFacedeStyle"
              :icon="ArrowLeft"
              type="primary"
              circle
            ></el-button
            >{{ facadeStyle
            }}<el-button
              @click="addFacedestyle"
              :icon="ArrowRight"
              type="primary"
              circle
            ></el-button>
          </p>
        </div>
        <div class="bottom-build">
          <el-button @click="finishBuild" type="primary"
            >完成建筑生成</el-button
          >
        </div>
      </div>
    </div>
    <div class="picture" v-if="showPic">
      <el-button @click="takePic" type="primary">拍照</el-button>
    </div>
    <div class="next-button" v-show="showSureButton">
      <el-button type="primary" @click="lastStep" :icon="ArrowLeft"
        >上一步</el-button
      >
      <!-- <div> -->
      <el-button
        v-if="steps != 2"
        type="primary"
        :disabled="showNext"
        @click="nextStep"
        :icon="ArrowRight"
        >下一步</el-button
      >
      <el-button @click="saveProject" v-else type="primary">保存</el-button>
      <!-- </div> -->
    </div>
    <div class="checktBox" v-if="steps != 0">
      <div class="checkBox-content">
        <p class="check-title">地块合格检查</p>
        <div>
          <p><img src="../images/duigou.png" alt="" />建筑面积</p>
          <p><img src="../images/duigou.png" alt="" />容积率</p>
          <p><img src="../images/duigou.png" alt="" />建筑高度</p>
          <p><img src="../images/duigou.png" alt="" />建筑覆盖率</p>
        </div>
        <div class="check-two">
          <p>{{ floorArea }}平方米</p>
          <p>3.2/9.5</p>
          <p>{{ floorHeight * floorNumber }}米/24-100米</p>
          <p>30%/70%</p>
        </div>
      </div>
    </div>
    <!-- <div class="checktBox1">
      <div class="checkBox-content">
        <p class="check-title">厂房指标</p>
        <div>
          <p><img src="../images/duigou.png" alt="" />厂房编号</p>
          <p><img src="../images/duigou.png" alt="" />建筑面积</p>
          <p><img src="../images/duigou.png" alt="" />建筑样式</p>
          <p><img src="../images/duigou.png" alt="" />建筑高度</p>
          <p><img src="../images/duigou.png" alt="" />建筑层高</p>
          <p><img src="../images/duigou.png" alt="" />屋顶样式</p>
          <p><img src="../images/duigou.png" alt="" />建筑立面</p>
        </div>
        <div class="check-two">
          <p>{{ floorArea }}平方米</p>
          <p>3.2/9.5</p>
          <p>{{ floorHeight * floorNumber }}米/24-100米</p>
          <p>30%/70%</p>
        </div>
      </div>
    </div> -->
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, toRaw, getCurrentInstance } from "vue";
// import * as Native from "../native/main.js";
import { Search, ArrowLeft, ArrowRight } from "@element-plus/icons-vue";
import { ExtrudeGeometry } from "../editor/ExtrudeGeometry.js";
import { useUsersStore } from "../store/index.js";
// import Utils from "../editor/utils.js";
// import * as Utils from "../editor/utils.js";
import * as THREE from "three";
import * as turf from "@turf/turf";
import ThreeBSP from "../editor/threebsp.js";
// import { CSG } from "three-csg-ts";
// import ThreeBSP from "../editor/threebsp.js";
// import ThreeBSP from "threebsp.js";
// import { ThreeBSP } from "../editor/threebsp.js";
import {
  drawPolygonGeometry,
  drawPolygon3D,
  drawPolyline,
} from "../editor/draw.js";
import {
  rotateRectangle,
  drawLine,
  rotationEntity,
  calculateSquareVertices,
  rotateRectangleVertices,
  getWorldPosition,
  calculatePolygonCenter,
} from "../../public/native/editor/math.js";
import { ElMessage } from "element-plus";
import html2canvas from "html2canvas";
// const ThreeBSP = require("jthreebsp")(THREE);
// const ThreeBSP = _ThreeBSP(THREE);
let { proxy } = getCurrentInstance();
const projectLayer = ref(null);
const tilesArray = reactive([]);
const nowNode = ref(null);
const showNumber = ref(false);
const factoryNumber = ref(null);
const landNumber = ref("");
const modifiedStr = ref("");
const showContent = ref(false);
const oneDepth = ref(40);
const twoDepth = ref(40);
const threeDepth = ref(40);
const fourDepth = ref(40);
const floorArea = ref(0);
const floorNumber = ref(8);
const floorHeight = ref(6);
const floorRotate = ref(0);
const roomTop = ref("屋顶花园");
const facadeStyle = ref("石材");
const showEditFloor = ref(false);
const showSureButton = ref(false);
const tileFeature = ref(null); //点击时的tiles
const checkType = ref(0); //点击类型
const showNext = ref(true);
const directionVal = reactive([]);
const steps = ref(0);
const rotatePoints = reactive([]);
const nextText = ref("下一步");
const showPic = ref(false);
const nowCenter = ref(null);
const HtmldomList = reactive([]);
const videoInterval = ref(null);

//模型的数组
const floorGeomList = reactive([]);
const pointList = ref(null);
const modelCenter = ref(null);
const modelWidth = ref(null);

const initTiles = () => {
  // let SSmap = window.SSmap;
  clearMeasure();
  let position = {
    longitude: 113.92803903224512,
    latitude: 22.624062856429408,
    height: 1213.7344480457762,
  };
  let oo = {
    heading: 18.26336481801765,
    pitch: -44.10005977299126,
    roll: 359.99231495233613,
  };
  Native.cameraFlyTo(position, oo);

  //加载tiles文件
  let folderPath = origin + "/data/tileset/tileset.json";
  fetch(folderPath)
    .then((response) => response.json())
    .then((files) => {
      files.root.children.forEach((file) => {
        let riFile = origin + "/data/tileset";
        let path = "/" + file.content.uri.replace(/^\.\//, "");
        let filePath = riFile + path;
        fetch(filePath)
          .then((response) => response.json())
          .then((data) => {
            Native.Tileset.add(
              {
                url: filePath,
              },
              function (tiles) {
                // tiles.enabled = false;
                // console.log(tiles, "tiles666666");
                tilesArray.push(tiles);
              }
            );
            // console.log("Loaded file:", filePath, data);
          })
          .catch((error) => {
            console.error("Error loading file:", filePath, error);
          });
      });
    })
    .catch((error) => {
      console.error("Error loading folder:", folderPath, error);
    });
  //投影
  let projectPath = origin + "/data/geojson/model-design.json";
  fetch(projectPath)
    .then((response) => response.json())
    .then((json) => {
      Native.Custom.addProjection(json, function (data) {
        console.log(data, "dddddddddd");
      });
    });
  let url = proxy.$baseUrl;
  // Native.Custom.addProjectionLayer(url);
  // projectLayer.value = new SSmap.ProjectionLayer();
  // toRaw(projectLayer.value).sceneMode =
  //   SSmap.TextureProjectionSceneMode.WholeScene;
  // let pdSource = new SSmap.ProjectionDataSource();
  // pdSource.setColor(SSmap.Color.fromRgb(0, 0, 255, 150));
  // pdSource.setSelectedColor(SSmap.Color.fromRgb(0, 255, 0, 128));
  // pdSource.setStrokeWidth(3);
  // pdSource.setStrokeColor(SSmap.Color.fromRgb(0, 0, 255, 150));
  // //   pdSource.setSelectedStrokeColor(SSmap.Color.fromRgb(0, 255, 0, 128));
  // pdSource.addField("Layer"); //需要拾取的属性
  // pdSource.addField("area"); //需要拾取的属性
  // pdSource.enabled = true;
  // pdSource.loadGeoJson(origin + "/data/geojson/model-design.json");
  // toRaw(projectLayer.value).addDataSource(pdSource);

  //地块
  Native.Glbset.add({ url: origin + "/data/glb/BG.glb" });
  Native.Glbset.add({ url: origin + "/data/glb/DEM.glb" });
  Native.Glbset.add({ url: origin + "/data/glb/bridge.glb" });
  Native.Glbset.add({ url: origin + "/data/glb/land.glb" });
  Native.Glbset.add({ url: origin + "/data/glb/white-model.glb" });
  //注册事件
  createEvent();
};

const clearMeasure = () => {
  console.log("clearMeasure");
  // Native.Custom.clearMeasure();
  // let projectLayer = toRaw(projectLayer.value);
};
const createEvent = () => {
  document
    .getElementById("qtcanvas")
    .addEventListener("click", mouseClickEvent);
};
const mouseClickEvent = (e) => {
  console.log(tilesArray, "66666666666");
  Native.Custom.mouseClickEvent(
    { x: e.x, y: e.y, arr: toRaw(tilesArray) },
    function (all) {
      // console.log(feature, factory, "fffffffffffff");
      let feature = all.feature;
      // tileFeature.value = all.tileFeature;
      // nowNode.value = all.nowNode;
      if (feature) {
        // console.log(feature, "ccccccccccc");
        factoryNumber.value = all.factoryNumber;
        landNumber.value = all.landNumber;
        modifiedStr.value = all.modifiedStr;
        // console.log(factoryNumber, factory, "ccccccccccc");
        showInfo(e);
        let elem = document.querySelector(".show-info");
        elem.style.display = "flex";
        Native.Point.getWorldPosition({ x: e.x, y: e.y }, function (point) {
          let elem = document.querySelector(".show-info");
          elem.style.display = "flex";
          Native.Custom.createDomLabel(point, function (xyposition) {
            elem.style.bottom = 0.1 - xyposition.y - elem.clientHeight + "px";
            elem.style.left =
              0.1 + xyposition.x - elem.clientWidth * 3.5 + "px";
          });
        });
      }
    }
  );

  return;
  let feature = toRaw(projectLayer.value).getFeatureByMouse();

  //   toRaw(projectLayer.value).setColor(SSmap.Color.fromRgb(0, 0, 255, 128));

  let feature5 = window.GlobalViewer.scene.getFeatureByMouse();
  tileFeature.value = feature5;
  console.log(feature, projectLayer, "789789", projectLayer, feature5);
  // let ce = direction.center().toVector3();
  if (nowNode.value && feature) {
    toRaw(nowNode.value).setColor(SSmap.Color.fromRgb(0, 0, 255, 150));
    toRaw(nowNode.value).setSelectedColor(SSmap.Color.fromRgb(0, 0, 255, 128));
    // toRaw(nowNode.value).setStrokeWidth(3);
    toRaw(nowNode.value).setStrokeColor(SSmap.Color.fromRgb(0, 0, 255, 150));
  }
  if (feature) {
    createDomLabel(e);
    let dire = feature5.tileset.rectangle;
    let southwest = dire.southwest().toVector3();
    let southeast = dire.southeast().toVector3();
    let northeast = dire.northeast().toVector3();
    let northwest = dire.northwest().toVector3();
    directionVal.push(southwest, southeast, northeast, northwest);
    let Layer = feature.getProperty("Layer");
    let Area = feature.getProperty("area");
    let modified = Layer.substring(0, Layer.lastIndexOf("_"));
    factoryNumber.value = Layer;
    landNumber.value = Math.round(Area * 10) / 10;
    modifiedStr.value = modified;
    // let polygon = feature.polygon();
    // debugger;

    nowNode.value = toRaw(projectLayer.value).getNode(feature);
    //   this.oldcolor = window.nownode.color();
    toRaw(nowNode.value).setColor(SSmap.Color.fromRgb(200, 0, 0, 122));
    toRaw(nowNode.value).setSelectedColor(SSmap.Color.fromRgb(0, 255, 0, 122));
    toRaw(nowNode.value).setStrokeColor(SSmap.Color.fromRgb(200, 0, 0, 122));
    showInfo(e);
  }
};

const showInfo = (e) => {
  showNumber.value = true;

  document.querySelector(".show-info").style.marginLeft = e.x + "px";
  document.querySelector(".show-info").style.marginTop = e.y + "px";
};
const showCont = () => {
  let elem = document.querySelector(".show-info");
  elem.style.display = "none";
  showContent.value = true;
  showSureButton.value = true;
  showNumber.value = false;
};
const showDeitHandle = (value) => {
  checkType.value = value;
  showEditFloor.value = true;
  Native.Custom.showDeitHandle(function (data) {
    // debugger;
    // directionVal.push(data.northeastJson);
    // directionVal.push(data.northwestJson);
    // directionVal.push(data.southeastJson);
    // directionVal.push(data.southwestJson);

    nowCenter.value = data.centerJson;

    document
      .getElementById("qtcanvas")
      .removeEventListener("click", mouseClickEvent);
    // drawExtru(arr);
    // console.log(nowNode.value, "789789", tileFeature.value);

    changeBuild();
  });

  // debugger;
};

// const takePic = () => {
//   console.log("555");
//   // let canvas = document.getElementById("qtcanvas");
//   html2canvas(document.body).then(function (canvas) {
//     // document.body.appendChild(canvas);
//     console.log(canvas, "canvas");
//     let canvas1 = document.getElementById("qtcanvas");
//     var link = document.createElement("a");
//     link.href = canvas.toDataURL();
//     link.download = "厂区规划图.png";
//     // 触发点击事件，执行下载操作
//     link.click();
//   });
// };

const takePic = () => {
  let el = document.getElementById("qtcanvas");
  let opts = {
    width: el.offsetWidth,
    height: el.offsetHeight,
    useCORS: true, // 是否尝试使用 CORS 从服务器加载图像
    allowTaint: false, // 是否允许跨源图像污染画布
  };
  html2canvas(el, opts).then((canvas) => {
    let imgData = canvas.toDataURL("image/png"); // 转base64
    fileDownload(imgData);
  });
};

// 下载图片方法
const fileDownload = (downloadUrl) => {
  let aLink = document.createElement("a");
  aLink.style.display = "none";
  aLink.href = URL.createObjectURL(dataURIToBlob(downloadUrl));
  debugger;
  aLink.download = "img.png";
  document.body.appendChild(aLink);
  aLink.click();
  document.body.removeChild(aLink);
};

// base64转blob方法
const dataURIToBlob = (dataURI) => {
  let binStr = atob(dataURI.split(",")[1]),
    len = binStr.length,
    arr = new Uint8Array(len);

  for (var i = 0; i < len; i++) {
    arr[i] = binStr.charCodeAt(i);
  }
  return new Blob([arr]);
};

const lastStep = () => {
  steps.value--;
  showPic.value = false;
  if (steps.value == 1) {
    // showEditFloor.value = true;
    showContent.value = true;
    showNext.value = true;
    createEvent();
  } else {
    showEditFloor.value = false;
    showSureButton.value = false;
    showContent.value = false;
    showNumber.value = false;
    Native.Custom.lastStepBack();
    createEvent();
    return;
    directionVal.length = 0;
    let feature = toRaw(nowNode.value).feature();
    feature.enabled = true;
    feature.parent.enabled = true;
    feature.parent.parent.enabled = true;
    toRaw(nowNode.value).enabled = true;
    toRaw(tileFeature.value).tileset.enabled = true; //设置tiles隐藏
    let length1 = floorGeomList.length;
    for (var i = length1 - 1; i > -1; i--) {
      toRaw(floorGeomList[i]).delete();
      floorGeomList.splice(i, 1);
      delete toRaw(floorGeomList[i]);
    }
    toRaw(nowNode.value).setColor(SSmap.Color.fromRgb(0, 0, 255, 150));
    toRaw(nowNode.value).setSelectedColor(SSmap.Color.fromRgb(0, 0, 255, 128));
    // toRaw(nowNode.value).setStrokeWidth(3);
    toRaw(nowNode.value).setStrokeColor(SSmap.Color.fromRgb(0, 0, 255, 150));
  }
};

const nextStep = () => {
  showNext.value = false;
  if (steps.value == 1) {
    steps.value = 2;
    showEditFloor.value = false;
    showContent.value = false;
    changeBuild();
  }
  if (steps.value == 2) {
    showPic.value = true;
    nextText.value = "保存";
  }
};
const saveProject = () => {
  ElMessage.success("保存成功");
  showSureButton.value = false;
  showPic.value = false;
};

const finishBuild = () => {
  showNext.value = false;
  steps.value = 1;
};

const changeBuild = () => {
  Native.Custom.vec3ToJson(toRaw(nowCenter.value), function (data) {
    // let center = nowCenter.value;
    let center = data.center;
    let height = floorHeight.value * floorNumber.value;
    // let height = 50;
    let length = 100;
    let width = -oneDepth.value;
    floorArea.value = length * oneDepth.value * height;
    let length1 = floorGeomList.length;
    for (var i = length1 - 1; i > -1; i--) {
      toRaw(floorGeomList[i]).delete();
      floorGeomList.splice(i, 1);
      delete toRaw(floorGeomList[i]);
    }
    let boxColor = {
      r: 166,
      g: 172,
      b: 227,
      a: 1,
    };
    let boxColor2;
    let boxColor3;
    if (facadeStyle.value == "石材") {
      boxColor2 = {
        r: 122,
        g: 151,
        b: 227,
        a: 1,
      };
    } else {
      boxColor2 = {
        r: 122,
        g: 151,
        b: 227,
        a: 0.5,
      };
    }
    if (roomTop.value == "楼顶停车") {
      boxColor3 = {
        r: 167,
        g: 81,
        b: 223,
        a: 1,
      };
    } else {
      boxColor3 = {
        r: 87,
        g: 127,
        b: 223,
        a: 1,
      };
    }

    if (steps.value == 2) {
      boxColor = window.boxColor1;
      if (facadeStyle.value == "石材") {
        boxColor2 = window.boxColor2;
      } else {
        boxColor2 = window.boxColor5;
      }
      if (roomTop.value == "楼顶停车") {
        boxColor3 = window.boxColor4;
      } else {
        boxColor3 = window.boxColor3;
      }
    }

    switch (checkType.value) {
      case 1:
        oneBuild(center, length, width, height, boxColor, boxColor2, boxColor3);
        break;
      case 2:
        twoBuild(center, length, width, height, boxColor, boxColor2, boxColor3);
        break;
      case 3:
        threeBuild(
          center,
          length,
          width,
          height,
          boxColor,
          boxColor2,
          boxColor3
        );
        break;
      case 4:
        fourBuild(
          center,
          length,
          width,
          height,
          boxColor,
          boxColor2,
          boxColor3
        );
        break;
      default:
        break;
    }
  });

  return;
  const worldPosition =
    GlobalViewer.scene.globe.ellipsoid.eastNorthUpToFixedFrame(
      center.toCartesian3()
    );
  let worldToLocal = worldPosition.inverted();
  let pointArr = [];
  directionVal.forEach((item) => {
    let point;
    point = SSmap.Matrix4.multiplyByVector3(worldToLocal, toRaw(item));
    let rotation = SSmap.Quaternion.fromEulerAngles(
      0,
      0,
      40
    ).toRotationMatrix();
    let modelMatrix = SSmap.Matrix4.fromRotationTranslation(
      rotation,
      SSmap.Vector3.create(0, 0, 0)
    );
    let scaleMatrix = SSmap.Matrix4.fromScale(
      SSmap.Vector3.create(0.8, 0.8, 0.8)
    );
    let matrix = SSmap.Matrix4.multiply(worldPosition, modelMatrix);
    matrix = SSmap.Matrix4.multiply(matrix, scaleMatrix);
    point = SSmap.Matrix4.multiplyByVector3(matrix, toRaw(point));
    pointArr.push(toRaw(point));
    rotatePoints.push(toRaw(point));
  });
  // rotatePoints = pointArr;
  var altitude = SSmap.AltitudeMethod.OnTerrain;
  if (steps.value == 2) {
    pointArr.push(pointArr[0]);
    var polylineObj = {
      width: 3,
      alpha: 1,
      pointArr: pointArr,
      color: SSmap.Color.fromRgb(0, 0, 255, 200),
      altitude: SSmap.AltitudeMethod.Absolute,
      dash: true,
      height: 30,
      depthTest: false,
      name: "move",
    };
    var polyline = drawPolyline(polylineObj);
    floorGeomList.push(polyline);
  } else {
    var obj1 = {
      alpha: 100, //边界透明度
      pointArr: pointArr, //点坐标
      color: SSmap.Color.fromRgb(0, 102, 255, 200), //填充颜色
      borColor: SSmap.Color.fromRgb(0, 102, 255, 200), //边界颜色
      altitude: altitude, //海拔高度模式
      name: "mianhuancong", //名称
      width: 0, //边界宽度
    };
    var Aentity = drawPolygon3D(obj1);
    floorGeomList.push(Aentity);
  }
};

const oneBuild = (
  center,
  length,
  width,
  height,
  boxColor,
  boxColor2,
  boxColor3
) => {
  const shape = new THREE.Shape();
  var polygon1 = turf.polygon([
    [
      [0, 0],
      [0, -width],
      [-length, -width],
      [-length, 0],
      [0, 0],
    ],
  ]);
  var polygon2 = turf.polygon([
    [
      [-length / 2 + 10, 0],
      [-length / 2 + 10, 10],
      [-length / 2 - 10, 10],
      [-length / 2 - 10, 0],
      [-length / 2 + 10, 0],
    ],
  ]);
  var polygon3 = turf.polygon([
    [
      [-5, 5],
      [-5, -width - 5],
      [-length + 5, -width - 5],
      [-length + 5, 5],
      [-length / 2, 5],
      [-5, 5],
    ],
  ]);
  var polygon4 = turf.polygon([
    [
      [-length / 2 + 15, 0],
      [-length / 2 + 15, 15],
      [-length / 2 - 15, 15],
      [-length / 2 - 15, 0],
      [-length / 2 + 15, 0],
    ],
  ]);

  var difference = turf.difference(polygon1, polygon2);
  let diffArr = [];
  difference.geometry.coordinates[0].forEach((item) => {
    diffArr.push({ x: item[0], y: item[1] });
  });

  const shape2 = new THREE.Shape();
  // var hole = new THREE.Path();
  diffArr.forEach((item, index) => {
    if (index == 0) {
      shape.moveTo(item.x, item.y);
    } else {
      shape.lineTo(item.x, item.y);
    }
  });
  shape2.moveTo(-length / 2 + 10, 0);
  shape2.lineTo(-length / 2 + 10, 10);
  shape2.lineTo(-length / 2 - 10, 10);
  shape2.lineTo(-length / 2 - 10, 0);
  shape2.lineTo(-length / 2 + 10, 0);
  const extrudeSettings2 = {
    // bevelEnabled: true,
    // bevelThickness: 5,
    depth: height + 1,
    bevelEnabled: false,
  };

  const extrudeSettings = {
    depth: height,
    bevelEnabled: false,
    // bevelEnabled: true,
    // bevelThickness: 1,
  };
  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  // let box1 = new THREE.BoxGeometry(20, 10, height + 1);
  const box1 = new THREE.ExtrudeGeometry(shape2, extrudeSettings2);
  const shape3 = new THREE.Shape();

  var difference2 = turf.difference(polygon3, polygon4);
  let diffArr2 = [];
  difference2.geometry.coordinates[0].forEach((item) => {
    diffArr2.push({ x: item[0], y: item[1] });
  });

  // const shape2 = new THREE.Shape();
  // var hole = new THREE.Path();
  diffArr2.forEach((item, index) => {
    if (index == 0) {
      shape3.moveTo(item.x, item.y);
    } else {
      shape3.lineTo(item.x, item.y);
    }
    // shape.holes.push(hole);
  });

  const extrudeSettings3 = {
    depth: height + 0.2,
    bevelEnabled: false,
  };
  const box2 = new THREE.ExtrudeGeometry(shape3, extrudeSettings3);
  let attributr = geometry.attributes;
  let att2 = box1.attributes;
  let att3 = box2.attributes;

  // let e1 = drawLine(
  //   GlobalViewer.scene,
  //   attributr.position.array,
  //   "1",
  //   boxColor,
  //   1
  // );
  // let e2 = drawLine(GlobalViewer.scene, att2.position.array, "2", boxColor2, 1);
  // let e3 = drawLine(GlobalViewer.scene, att3.position.array, "3", boxColor3, 1);
  // let arr = [];
  // arr.push(e1, e2, e3);
  // // arr.push(e2);
  // floorGeomList.push(e1, e2, e3);
  // console.log(arr, "9999999999999");
  // console.log(attributr.position.array, "7777777777777777");
  let arr1 = [];
  attributr.position.array.forEach((i) => {
    arr1.push(i);
  });
  let arr2 = [];
  att2.position.array.forEach((i) => {
    arr2.push(i);
  });
  let arr3 = [];
  att3.position.array.forEach((i) => {
    arr3.push(i);
  });
  // Native.Custom.vec3ToJson(center, function (cb) {
  //   console.log(cb, "cb");
  // });
  Native.Custom.drawBuild(
    center,
    arr1,
    arr2,
    arr3,
    boxColor,
    boxColor2,
    boxColor3,
    toRaw(floorRotate.value),
    steps.value
  );
  return;
  var selfPosition = GlobalViewer.scene.globe.ellipsoid.eastNorthUpToFixedFrame(
    center.toCartesian3()
  );
  const mat = rotationEntity(selfPosition, 0, 0, floorRotate.value, 0);
  const transtion = SSmap.Matrix4.fromTranslation(
    SSmap.Vector3.create(40, -50, -34)
  );
  const matrix4 = SSmap.Matrix4.multiply(mat, transtion);
  arr.forEach((i) => {
    i.transform.matrix = matrix4;
  });
};
const twoBuild = (
  center,
  length,
  width,
  height,
  boxColor,
  boxColor2,
  boxColor3
) => {
  let width2 = -twoDepth.value;
  const shape = new THREE.Shape();
  var polygon1 = turf.polygon([
    [
      [0, 0],
      [0, -width],
      [-length, -width],
      [-length, 0],
      [0, 0],
    ],
  ]);
  var polygon2 = turf.polygon([
    [
      [-width2 + 15 - length, 0],
      [-width2 + 15 - length, 10],
      [-width2 + 15 - length - 20, 10],
      [-width2 + 15 - length - 20, 0],
      [-width2 + 15 - length, 0],
    ],
  ]);
  var polygon3 = turf.polygon([
    [
      [-5, 5],
      [-5, -width - 5],
      [-length + 5, -width - 5],
      [-length + 5, 5],
      [-5, 5],
    ],
  ]);
  var polygon4 = turf.polygon([
    [
      [-width2 + 20 - length, 0 + 5],
      [-width2 + 20 - length, 10 + 5],
      [-width2 + 10 - length - 20, 10 + 5],
      [-width2 + 10 - length - 20, 0 + 5],
      [-width2 + 20 - length, 0 + 5],
    ],
  ]);
  var polygon5 = turf.polygon([
    //矩形块
    [
      [-length - width2, 0],
      [-length - width2, length],
      [-length, length],
      [-length, 0],
      [-length - width2, 0],
    ],
  ]);

  var polygon6 = turf.polygon([
    [
      [-length - width2 - 5, 5],
      [-length - width2 - 5, length - 5],
      [-length + 5, length - 5],
      [-length + 5, 5],
      [-length - width2 - 5, 5],
    ],
  ]);

  var difference = turf.difference(polygon1, polygon2);
  let diffArr = [];
  difference.geometry.coordinates[0].forEach((item) => {
    diffArr.push({ x: item[0], y: item[1] });
  });

  const shape2 = new THREE.Shape();
  // var hole = new THREE.Path();
  diffArr.forEach((item, index) => {
    if (index == 0) {
      shape.moveTo(item.x, item.y);
    } else {
      shape.lineTo(item.x, item.y);
    }
  });

  let box2Arr = [];
  polygon2.geometry.coordinates[0].forEach((item) => {
    box2Arr.push({ x: item[0], y: item[1] });
  });
  box2Arr.forEach((item, index) => {
    if (index == 0) {
      shape2.moveTo(item.x, item.y);
    } else {
      shape2.lineTo(item.x, item.y);
    }
  });

  const extrudeSettings2 = {
    // bevelEnabled: true,
    // bevelThickness: 5,
    depth: height + 1,
    bevelEnabled: false,
  };

  const extrudeSettings = {
    depth: height,
    bevelEnabled: false,
    // bevelEnabled: true,
    // bevelThickness: 1,
  };
  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  // let box1 = new THREE.BoxGeometry(20, 10, height + 1);
  const box1 = new THREE.ExtrudeGeometry(shape2, extrudeSettings2);
  const shape3 = new THREE.Shape();
  var difference2 = turf.difference(polygon3, polygon4);
  let diffArr2 = [];
  difference2.geometry.coordinates[0].forEach((item) => {
    diffArr2.push({ x: item[0], y: item[1] });
  });

  diffArr2.forEach((item, index) => {
    if (index == 0) {
      shape3.moveTo(item.x, item.y);
    } else {
      shape3.lineTo(item.x, item.y);
    }
  });

  const extrudeSettings3 = {
    depth: height + 0.2,
    bevelEnabled: false,
  };
  const box2 = new THREE.ExtrudeGeometry(shape3, extrudeSettings3);

  let shape5 = new THREE.Shape();
  let diffArr3 = [];
  let diff5 = turf.difference(polygon5, polygon2);
  diff5.geometry.coordinates[0].forEach((item, index) => {
    diffArr3.push({ x: item[0], y: item[1] });
  });
  diffArr3.forEach((item, index) => {
    if (index == 0) {
      shape5.moveTo(item.x, item.y);
    } else {
      shape5.lineTo(item.x, item.y);
    }
  });
  const extrudeSettings5 = {
    depth: height,
    bevelEnabled: false,
  };
  let box3 = new THREE.ExtrudeGeometry(shape5, extrudeSettings5);

  let shape6 = new THREE.Shape();
  let diffArr4 = [];
  let diff6 = turf.difference(polygon6, polygon4);
  diff6.geometry.coordinates[0].forEach((item, index) => {
    diffArr4.push({ x: item[0], y: item[1] });
  });
  diffArr4.forEach((item, index) => {
    if (index == 0) {
      shape6.moveTo(item.x, item.y);
    } else {
      shape6.lineTo(item.x, item.y);
    }
  });
  const extrudeSettings6 = {
    depth: height + 0.2,
    bevelEnabled: false,
  };
  let box4 = new THREE.ExtrudeGeometry(shape6, extrudeSettings6);

  // var selfPosition = GlobalViewer.scene.globe.ellipsoid.eastNorthUpToFixedFrame(
  //   center.toCartesian3()
  // );

  let attributr = geometry.attributes;
  let att2 = box1.attributes;
  let att3 = box2.attributes;
  let att4 = box3.attributes;
  let att5 = box4.attributes;
  let arr1 = [];
  attributr.position.array.forEach((i) => {
    arr1.push(i);
  });
  let arr2 = [];
  att2.position.array.forEach((i) => {
    arr2.push(i);
  });
  let arr3 = [];
  att3.position.array.forEach((i) => {
    arr3.push(i);
  });
  let arr4 = [];
  att4.position.array.forEach((i) => {
    arr4.push(i);
  });
  let arr5 = [];
  att5.position.array.forEach((i) => {
    arr5.push(i);
  });
  let allArr = [];
  allArr.push(arr1, arr2, arr3, arr4, arr5);
  Native.Custom.drawTwoBuild(
    center,
    arr1,
    arr2,
    arr3,
    arr4,
    arr5,
    boxColor,
    boxColor2,
    boxColor3,
    toRaw(floorRotate.value),
    steps.value
  );
  // let e1 = drawLine(
  //   GlobalViewer.scene,
  //   attributr.position.array,
  //   "1",
  //   boxColor,
  //   1
  // );
  // let e2 = drawLine(GlobalViewer.scene, att2.position.array, "2", boxColor2, 1);
  // let e3 = drawLine(GlobalViewer.scene, att3.position.array, "3", boxColor3, 1);
  // let e4 = drawLine(GlobalViewer.scene, att4.position.array, "1", boxColor, 1);
  // let e5 = drawLine(GlobalViewer.scene, att5.position.array, "2", boxColor3, 1);
  // let arr = [];
  // arr.push(e1, e2, e3, e4, e5);
  // // arr.push(e2);
  // floorGeomList.push(e1, e2, e3, e4, e5);
  // const mat = rotationEntity(selfPosition, 0, 0, floorRotate.value, 0);
  // const transtion = SSmap.Matrix4.fromTranslation(
  //   SSmap.Vector3.create(40, -50, -34)
  // );
  // const matrix4 = SSmap.Matrix4.multiply(mat, transtion);
  // arr.forEach((i) => {
  //   i.transform.matrix = matrix4;
  // });
};
const threeBuild = (
  center,
  length,
  width,
  height,
  boxColor,
  boxColor2,
  boxColor3
) => {
  let width2 = -twoDepth.value;
  let width3 = -threeDepth.value;
  const shape = new THREE.Shape();
  var polygon1 = turf.polygon([
    //第一进深
    [
      [0, 0],
      [0, -width],
      [-length, -width],
      [-length, 0],
      [0, 0],
    ],
  ]);
  var polygon2 = turf.polygon([
    //下红色方块
    [
      [-width2 + 10 - length, 0],
      [-width2 + 10 - length, 10],
      [-width2 + 10 - length - 20, 10],
      [-width2 + 10 - length - 20, 0],
      [-width2 + 10 - length, 0],
    ],
  ]);
  var polygon3 = turf.polygon([
    //第一绿色区域
    [
      [-5, 5],
      [-5, -width - 5],
      [-length + 5, -width - 5],
      [-length + 5, 5],
      [-5, 5],
    ],
  ]);
  var polygon4 = turf.polygon([
    //第一进深减去的绿色区域
    [
      [-width2 + 15 - length, 0 + 5],
      [-width2 + 15 - length, 10 + 5],
      [-width2 + 5 - length - 20, 10 + 5],
      [-width2 + 5 - length - 20, 0 + 5],
      [-width2 + 15 - length, 0 + 5],
    ],
  ]);
  var polygon5 = turf.polygon([
    [
      [-length - width2, 0],
      [-length - width2, length],
      [-length, length],
      [-length, 0],
      [-length - width2, 0],
    ],
  ]);
  var polygon6 = turf.polygon([
    [
      [0, 0],
      [0, length],
      [width3, length],
      [width3, 0],
      [0, 0],
    ],
  ]);
  var polygon7 = turf.polygon([
    //上红色快
    [
      [width3 + 10, 0],
      [width3 + 10, 10],
      [width3 - 10, 10],
      [width3 - 10, 0],
      [width3 + 10, 0],
    ],
  ]);
  var polygon8 = turf.polygon([
    //上绿色减去区域
    [
      [width3 + 15, 0 + 5],
      [width3 + 15, 10 + 5],
      [width3 + 5 - 20, 10 + 5],
      [width3 + 5 - 20, 0 + 5],
      [width3 + 15, 0 + 5],
    ],
  ]);
  var polygon9 = turf.polygon([
    [
      [-length - width2 - 5, 5],
      [-length - width2 - 5, length - 5],
      [-length + 5, length - 5],
      [-length + 5, 5],
      [-length - width2 - 5, 5],
    ],
  ]);
  var polygon10 = turf.polygon([
    [
      [-5, 5],
      [-5, length - 5],
      [width3 + 5, length - 5],
      [width3 + 5, 5],
      [-5, 5],
    ],
  ]);

  var difference = turf.difference(polygon1, polygon2);
  var diff222 = turf.difference(difference, polygon7);
  let diffArr = [];
  diff222.geometry.coordinates[0].forEach((item) => {
    diffArr.push({ x: item[0], y: item[1] });
  });

  // var hole = new THREE.Path();
  diffArr.forEach((item, index) => {
    if (index == 0) {
      shape.moveTo(item.x, item.y);
    }
    // else if (index == 2 || index == 3) {
    //   shape.lineTo(item.x, item.y + 20);
    // }
    else {
      shape.lineTo(item.x, item.y);
    }
    // shape.holes.push(hole);
  });
  const shape2 = new THREE.Shape();
  let box2Arr = [];
  polygon2.geometry.coordinates[0].forEach((item) => {
    box2Arr.push({ x: item[0], y: item[1] });
  });
  box2Arr.forEach((item, index) => {
    if (index == 0) {
      shape2.moveTo(item.x, item.y);
    } else {
      shape2.lineTo(item.x, item.y);
    }
  });
  // shape2.moveTo(-width2 + 10 - length, 0);
  // shape2.lineTo(-width2 + 10 - length, 10);
  // shape2.lineTo(-width2 + 10 - length - 20, 10);
  // shape2.lineTo(-width2 + 10 - length - 20, 0);
  // shape2.lineTo(-width2 + 10 - length, 0);
  const extrudeSettings2 = {
    // bevelEnabled: true,
    // bevelThickness: 5,
    depth: height + 1,
    bevelEnabled: false,
  };

  const extrudeSettings = {
    depth: height,
    bevelEnabled: false,
    // bevelEnabled: true,
    // bevelThickness: 1,
  };
  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  // let box1 = new THREE.BoxGeometry(20, 10, height + 1);
  const box1 = new THREE.ExtrudeGeometry(shape2, extrudeSettings2);
  const shape3 = new THREE.Shape();

  var difference2 = turf.difference(polygon3, polygon4);
  let dif44 = turf.difference(difference2, polygon9);
  let diffArr2 = [];
  difference2.geometry.coordinates[0].forEach((item) => {
    diffArr2.push({ x: item[0], y: item[1] });
  });

  // const shape2 = new THREE.Shape();
  // var hole = new THREE.Path();
  diffArr2.forEach((item, index) => {
    if (index == 0) {
      shape3.moveTo(item.x, item.y);
    } else {
      shape3.lineTo(item.x, item.y);
    }
    // shape.holes.push(hole);
  });

  const extrudeSettings3 = {
    depth: height + 0.2,
    bevelEnabled: false,
  };
  const box2 = new THREE.ExtrudeGeometry(shape3, extrudeSettings3);

  let shape5 = new THREE.Shape();
  let diff3 = turf.difference(polygon5, polygon2);
  let diffArr3 = [];
  diff3.geometry.coordinates[0].forEach((item, index) => {
    diffArr3.push({ x: item[0], y: item[1] });
  });
  diffArr3.forEach((item, index) => {
    if (index == 0) {
      shape5.moveTo(item.x, item.y);
    } else {
      shape5.lineTo(item.x, item.y);
    }
  });
  const extrudeSettings5 = {
    depth: height,
    bevelEnabled: false,
  };
  let box3 = new THREE.ExtrudeGeometry(shape5, extrudeSettings5);

  let shape6 = new THREE.Shape();
  let dif333 = turf.difference(polygon6, polygon7);
  let diffArr6 = [];
  dif333.geometry.coordinates[0].forEach((item, index) => {
    diffArr6.push({ x: item[0], y: item[1] });
  });
  diffArr6.forEach((item, index) => {
    if (index == 0) {
      shape6.moveTo(item.x, item.y);
    } else {
      shape6.lineTo(item.x, item.y);
    }
  });
  const extrudeSettings6 = {
    depth: height,
    bevelEnabled: false,
  };
  let box6 = new THREE.ExtrudeGeometry(shape6, extrudeSettings6);

  let shape7 = new THREE.Shape();
  let diff7 = turf.difference(difference, polygon7);
  let diffArr7 = [];
  polygon7.geometry.coordinates[0].forEach((item, index) => {
    diffArr7.push({ x: item[0], y: item[1] });
  });
  diffArr7.forEach((item, index) => {
    if (index == 0) {
      shape7.moveTo(item.x, item.y);
    } else {
      shape7.lineTo(item.x, item.y);
    }
  });
  const extrudeSettings7 = {
    depth: height + 1,
    bevelEnabled: false,
  };
  let box7 = new THREE.ExtrudeGeometry(shape7, extrudeSettings7);

  let shape8 = new THREE.Shape();
  let diff8 = turf.difference(polygon3, polygon8);
  let diff666 = turf.difference(diff8, polygon4);
  let diff1 = turf.difference(polygon9, diff666);
  let diffArr8 = [];
  diff666.geometry.coordinates[0].forEach((item, index) => {
    diffArr8.push({ x: item[0], y: item[1] });
  });
  diffArr8.forEach((item, index) => {
    if (index == 0) {
      shape8.moveTo(item.x, item.y);
    } else {
      shape8.lineTo(item.x, item.y);
    }
  });
  const extrudeSettings8 = {
    depth: height + 0.2,
    bevelEnabled: false,
  };
  let box8 = new THREE.ExtrudeGeometry(shape8, extrudeSettings8);

  let shape9 = new THREE.Shape();
  let diff9 = turf.difference(polygon9, polygon4);
  let diffArr9 = [];
  diff9.geometry.coordinates[0].forEach((item, index) => {
    diffArr9.push({ x: item[0], y: item[1] });
  });
  diffArr9.forEach((item, index) => {
    if (index == 0) {
      shape9.moveTo(item.x, item.y);
    } else {
      shape9.lineTo(item.x, item.y);
    }
  });
  const extrudeSettings9 = {
    depth: height + 0.2,
    bevelEnabled: false,
  };
  let box9 = new THREE.ExtrudeGeometry(shape9, extrudeSettings9);

  let shape10 = new THREE.Shape();
  let diff10 = turf.difference(polygon10, polygon8);
  let diffArr10 = [];
  diff10.geometry.coordinates[0].forEach((item, index) => {
    diffArr10.push({ x: item[0], y: item[1] });
  });
  diffArr10.forEach((item, index) => {
    if (index == 0) {
      shape10.moveTo(item.x, item.y);
    } else {
      shape10.lineTo(item.x, item.y);
    }
  });
  const extrudeSettings10 = {
    depth: height + 0.2,
    bevelEnabled: false,
  };
  let box10 = new THREE.ExtrudeGeometry(shape10, extrudeSettings10);

  // var selfPosition = GlobalViewer.scene.globe.ellipsoid.eastNorthUpToFixedFrame(
  //   center.toCartesian3()
  // );

  let attributr = geometry.attributes;
  let att2 = box1.attributes;
  let att3 = box2.attributes;
  let att4 = box3.attributes;
  let att6 = box6.attributes;
  let att7 = box7.attributes;
  let att8 = box8.attributes;
  let att9 = box9.attributes;
  let att10 = box10.attributes;
  let arr1 = [];
  attributr.position.array.forEach((i) => {
    arr1.push(i);
  });
  let arr2 = [];
  att2.position.array.forEach((i) => {
    arr2.push(i);
  });
  let arr3 = [];
  att3.position.array.forEach((i) => {
    arr3.push(i);
  });
  let arr4 = [];
  att4.position.array.forEach((i) => {
    arr4.push(i);
  });
  let arr6 = [];
  att6.position.array.forEach((i) => {
    arr6.push(i);
  });
  let arr7 = [];
  att7.position.array.forEach((i) => {
    arr7.push(i);
  });
  let arr8 = [];
  att8.position.array.forEach((i) => {
    arr8.push(i);
  });
  let arr9 = [];
  att9.position.array.forEach((i) => {
    arr9.push(i);
  });
  let arr10 = [];
  att10.position.array.forEach((i) => {
    arr10.push(i);
  });

  Native.Custom.drawThreeBuild(
    center,
    arr1,
    arr2,
    arr4,
    arr6,
    arr7,
    arr8,
    arr9,
    arr10,
    boxColor,
    boxColor2,
    boxColor3,
    toRaw(floorRotate.value),
    steps.value
  );

  return;
  let e1 = drawLine(
    GlobalViewer.scene,
    attributr.position.array,
    "1",
    boxColor,
    1
  );
  let e2 = drawLine(GlobalViewer.scene, att2.position.array, "2", boxColor2, 1);
  let e3 = drawLine(GlobalViewer.scene, att3.position.array, "3", boxColor3, 1);
  let e4 = drawLine(GlobalViewer.scene, att4.position.array, "1", boxColor, 1);
  let e6 = drawLine(GlobalViewer.scene, att6.position.array, "1", boxColor, 1);
  let e7 = drawLine(GlobalViewer.scene, att7.position.array, "1", boxColor2, 1);
  let e8 = drawLine(GlobalViewer.scene, att8.position.array, "1", boxColor3, 1);
  let e9 = drawLine(GlobalViewer.scene, att9.position.array, "1", boxColor3, 1);
  let e10 = drawLine(
    GlobalViewer.scene,
    att10.position.array,
    "1",
    boxColor3,
    1
  );
  let arr = [];
  arr.push(e1, e2, e4, e6, e7, e8, e9, e10);
  // arr.push(e2);
  floorGeomList.push(e1, e2, e4, e6, e7, e8, e9, e10);
  const mat = rotationEntity(selfPosition, 0, 0, floorRotate.value, 0);
  const transtion = SSmap.Matrix4.fromTranslation(
    SSmap.Vector3.create(40, -50, -34)
  );
  const matrix4 = SSmap.Matrix4.multiply(mat, transtion);
  arr.forEach((i) => {
    i.transform.matrix = matrix4;
  });
};
const fourBuild = (
  center,
  length,
  width,
  height,
  boxColor,
  boxColor2,
  boxColor3
) => {
  let width2 = -twoDepth.value;
  let width3 = -threeDepth.value;
  let width4 = -fourDepth.value;
  const shape = new THREE.Shape();
  var polygon1 = turf.polygon([
    [
      [0, 0],
      [0, -width],
      [-length, -width],
      [-length, 0],
      [0, 0],
    ],
  ]);
  var polygon2 = turf.polygon([
    [
      [-length / 2 + 10, 0],
      [-length / 2 + 10, 10],
      [-length / 2 - 10, 10],
      [-length / 2 - 10, 0],
      [-length / 2 + 10, 0],
    ],
  ]);
  var polygon3 = turf.polygon([
    [
      [-5, 5],
      [-5, -width - 5],
      [-length + 5, -width - 5],
      [-length + 5, 5],
      [-length / 2, 5],
      [-5, 5],
    ],
  ]);
  var polygon4 = turf.polygon([
    //绿色被减面
    [
      [-length / 2 + 15, 0],
      [-length / 2 + 15, 15],
      [-length / 2 - 15, 15],
      [-length / 2 - 15, 0],
      [-length / 2 + 15, 0],
    ],
  ]);
  //下面是其他蓝色面矩形
  var polygon5 = turf.polygon([
    [
      [-length - width2, 0],
      [-length - width2, length],
      [-length, length],
      [-length, 0],
      [-length - width2, 0],
    ],
  ]);
  var polygon8 = turf.polygon([
    //绿色
    [
      [-length - width2 - 5, 5],
      [-length - width2 - 5, length - 5],
      [-length + 5, length - 5],
      [-length + 5, 5],
      [-length - width2 - 5, 5],
    ],
  ]);
  var polygon9 = turf.polygon([
    //红色
    [
      [-length + 10, length / 2 - 10],
      [-length + 10, length / 2 + 10],
      [-length, length / 2 + 10],
      [-length, length / 2 - 10],
      [-length + 10, length / 2 - 10],
    ],
  ]);
  var polygon10 = turf.polygon([
    //绿色被减面
    [
      [-length + 15, length / 2 - 15],
      [-length + 15, length / 2 + 15],
      [-length, length / 2 + 15],
      [-length, length / 2 - 15],
      [-length + 15, length / 2 - 15],
    ],
  ]);
  //另一个方向
  var polygon6 = turf.polygon([
    [
      [0, 0],
      [0, length],
      [width3, length],
      [width3, 0],
      [0, 0],
    ],
  ]);
  var polygon11 = turf.polygon([
    //绿色
    [
      [-5, 5],
      [-5, length - 5],
      [width3 + 5, length - 5],
      [width3 + 5, 5],
      [-5, 5],
    ],
  ]);
  var polygon12 = turf.polygon([
    //红色
    [
      [0, length / 2 - 10],
      [0, length / 2 + 10],
      [-10, length / 2 + 10],
      [-10, length / 2 - 10],
      [0, length / 2 - 10],
    ],
  ]);
  var polygon13 = turf.polygon([
    //绿色被减面
    [
      [-5, length / 2 - 15],
      [-5, length / 2 + 15],
      [-15, length / 2 + 15],
      [-15, length / 2 - 15],
      [-5, length / 2 - 15],
    ],
  ]);
  //另一个方向
  var polygon7 = turf.polygon([
    [
      [0, length + width4],
      [0, length],
      [-length, length],
      [-length, length + width4],
      [0, length + width4],
    ],
  ]);
  var polygon14 = turf.polygon([
    //红色
    [
      [-length / 2 + 10, length - 10],
      [-length / 2 + 10, length],
      [-length / 2 - 10, length],
      [-length / 2 - 10, length - 10],
      [-length / 2 + 10, length - 10],
    ],
  ]);
  var polygon15 = turf.polygon([
    //绿色
    [
      [-5, length - 5],
      [-5, length + width4 + 5],
      [-length + 5, length + width4 + 5],
      [-length + 5, length - 5],
      [-5, length - 5],
    ],
  ]);
  var polygon16 = turf.polygon([
    //绿色被减面
    [
      [-length / 2 + 15, length - 15],
      [-length / 2 + 15, length],
      [-length / 2 - 15, length],
      [-length / 2 - 15, length - 15],
      [-length / 2 + 15, length - 15],
    ],
  ]);

  var difference = turf.difference(polygon1, polygon2);
  let diffArr = [];
  difference.geometry.coordinates[0].forEach((item) => {
    diffArr.push({ x: item[0], y: item[1] });
  });

  const shape2 = new THREE.Shape();
  // var hole = new THREE.Path();
  diffArr.forEach((item, index) => {
    if (index == 0) {
      shape.moveTo(item.x, item.y);
    }
    // else if (index == 2 || index == 3) {
    //   shape.lineTo(item.x, item.y + 20);
    // }
    else {
      shape.lineTo(item.x, item.y);
    }
    // shape.holes.push(hole);
  });
  shape2.moveTo(-length / 2 + 10, 0);
  shape2.lineTo(-length / 2 + 10, 10);
  shape2.lineTo(-length / 2 - 10, 10);
  shape2.lineTo(-length / 2 - 10, 0);
  shape2.lineTo(-length / 2 + 10, 0);
  const extrudeSettings2 = {
    // bevelEnabled: true,
    // bevelThickness: 5,
    depth: height + 1,
    bevelEnabled: false,
  };

  const extrudeSettings = {
    depth: height,
    bevelEnabled: false,
    // bevelEnabled: true,
    // bevelThickness: 1,
  };
  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  // let box1 = new THREE.BoxGeometry(20, 10, height + 1);
  const box1 = new THREE.ExtrudeGeometry(shape2, extrudeSettings2);
  const shape3 = new THREE.Shape();

  var difference2 = turf.difference(polygon3, polygon4);
  let diffArr2 = [];
  difference2.geometry.coordinates[0].forEach((item) => {
    diffArr2.push({ x: item[0], y: item[1] });
  });

  // const shape2 = new THREE.Shape();
  // var hole = new THREE.Path();
  diffArr2.forEach((item, index) => {
    if (index == 0) {
      shape3.moveTo(item.x, item.y);
    } else {
      shape3.lineTo(item.x, item.y);
    }
    // shape.holes.push(hole);
  });

  const extrudeSettings3 = {
    depth: height + 0.2,
    bevelEnabled: false,
  };
  const box2 = new THREE.ExtrudeGeometry(shape3, extrudeSettings3);

  let shape5 = new THREE.Shape();
  let diff22 = turf.difference(polygon5, polygon9);
  let diffArr3 = [];
  diff22.geometry.coordinates[0].forEach((item, index) => {
    diffArr3.push({ x: item[0], y: item[1] });
  });
  diffArr3.forEach((item, index) => {
    if (index == 0) {
      shape5.moveTo(item.x, item.y);
    } else {
      shape5.lineTo(item.x, item.y);
    }
  });
  const extrudeSettings5 = {
    depth: height,
    bevelEnabled: false,
  };
  let box3 = new THREE.ExtrudeGeometry(shape5, extrudeSettings5);

  let shape8 = new THREE.Shape();
  let diff2 = turf.difference(polygon8, polygon10);
  let diffArr4 = [];
  diff2.geometry.coordinates[0].forEach((item, index) => {
    diffArr4.push({ x: item[0], y: item[1] });
  });
  diffArr4.forEach((item, index) => {
    if (index == 0) {
      shape8.moveTo(item.x, item.y);
    } else {
      shape8.lineTo(item.x, item.y);
    }
  });
  const extrudeSettings8 = {
    depth: height + 0.2,
    bevelEnabled: false,
  };
  let box8 = new THREE.ExtrudeGeometry(shape8, extrudeSettings8);

  let shape9 = new THREE.Shape();
  let diffArr5 = [];
  polygon9.geometry.coordinates[0].forEach((item, index) => {
    diffArr5.push({ x: item[0], y: item[1] });
  });
  diffArr5.forEach((item, index) => {
    if (index == 0) {
      shape9.moveTo(item.x, item.y);
    } else {
      shape9.lineTo(item.x, item.y);
    }
  });
  const extrudeSettings9 = {
    depth: height + 1,
    bevelEnabled: false,
  };
  let box9 = new THREE.ExtrudeGeometry(shape9, extrudeSettings9);

  //另一个矩形块

  let shape6 = new THREE.Shape();
  let diffArr6 = [];
  let diff333 = turf.difference(polygon6, polygon12);
  diff333.geometry.coordinates[0].forEach((item, index) => {
    diffArr6.push({ x: item[0], y: item[1] });
  });
  diffArr6.forEach((item, index) => {
    if (index == 0) {
      shape6.moveTo(item.x, item.y);
    } else {
      shape6.lineTo(item.x, item.y);
    }
  });
  const extrudeSettings6 = {
    depth: height,
    bevelEnabled: false,
  };
  let box6 = new THREE.ExtrudeGeometry(shape6, extrudeSettings6);

  let shape11 = new THREE.Shape();
  let diffArr11 = [];
  let diff3 = turf.difference(polygon11, polygon13);
  diff3.geometry.coordinates[0].forEach((item, index) => {
    diffArr11.push({ x: item[0], y: item[1] });
  });
  diffArr11.forEach((item, index) => {
    if (index == 0) {
      shape11.moveTo(item.x, item.y);
    } else {
      shape11.lineTo(item.x, item.y);
    }
  });
  const extrudeSettings11 = {
    depth: height + 0.2,
    bevelEnabled: false,
  };
  let box11 = new THREE.ExtrudeGeometry(shape11, extrudeSettings11);

  let shape12 = new THREE.Shape();
  let diffArr12 = [];
  polygon12.geometry.coordinates[0].forEach((item, index) => {
    diffArr12.push({ x: item[0], y: item[1] });
  });
  diffArr12.forEach((item, index) => {
    if (index == 0) {
      shape12.moveTo(item.x, item.y);
    } else {
      shape12.lineTo(item.x, item.y);
    }
  });
  const extrudeSettings12 = {
    depth: height + 1,
    bevelEnabled: false,
  };
  let box12 = new THREE.ExtrudeGeometry(shape12, extrudeSettings12);

  //另一个矩形块

  let shape7 = new THREE.Shape();
  let diff4 = turf.difference(polygon7, polygon14);
  let diffArr7 = [];
  diff4.geometry.coordinates[0].forEach((item, index) => {
    diffArr7.push({ x: item[0], y: item[1] });
  });
  diffArr7.forEach((item, index) => {
    if (index == 0) {
      shape7.moveTo(item.x, item.y);
    } else {
      shape7.lineTo(item.x, item.y);
    }
  });
  const extrudeSettings7 = {
    depth: height,
    bevelEnabled: false,
  };
  let box7 = new THREE.ExtrudeGeometry(shape7, extrudeSettings7);

  let shape14 = new THREE.Shape();
  let diffArr14 = [];
  polygon14.geometry.coordinates[0].forEach((item, index) => {
    diffArr14.push({ x: item[0], y: item[1] });
  });
  diffArr14.forEach((item, index) => {
    if (index == 0) {
      shape14.moveTo(item.x, item.y);
    } else {
      shape14.lineTo(item.x, item.y);
    }
  });
  const extrudeSettings14 = {
    depth: height + 1,
    bevelEnabled: false,
  };
  let box14 = new THREE.ExtrudeGeometry(shape14, extrudeSettings14);

  let shape15 = new THREE.Shape();
  let diff44 = turf.difference(polygon15, polygon16);
  let diffArr15 = [];
  diff44.geometry.coordinates[0].forEach((item, index) => {
    diffArr15.push({ x: item[0], y: item[1] });
  });
  diffArr15.forEach((item, index) => {
    if (index == 0) {
      shape15.moveTo(item.x, item.y);
    } else {
      shape15.lineTo(item.x, item.y);
    }
  });
  const extrudeSettings15 = {
    depth: height + 0.2,
    bevelEnabled: false,
  };
  let box15 = new THREE.ExtrudeGeometry(shape15, extrudeSettings15);

  // var selfPosition = GlobalViewer.scene.globe.ellipsoid.eastNorthUpToFixedFrame(
  //   center.toCartesian3()
  // );
  let attributr = geometry.attributes;
  let att2 = box1.attributes;
  let att3 = box2.attributes;
  let att4 = box3.attributes;
  let att6 = box6.attributes;
  let att7 = box7.attributes;
  let att8 = box8.attributes;
  let att9 = box9.attributes;
  let att11 = box11.attributes;
  let att12 = box12.attributes;
  let att14 = box14.attributes;
  let att15 = box15.attributes;
  let arr1 = [];
  attributr.position.array.forEach((i) => {
    arr1.push(i);
  });
  let arr2 = [];
  att2.position.array.forEach((i) => {
    arr2.push(i);
  });
  let arr3 = [];
  att3.position.array.forEach((i) => {
    arr3.push(i);
  });
  let arr4 = [];
  att4.position.array.forEach((i) => {
    arr4.push(i);
  });
  let arr6 = [];
  att6.position.array.forEach((i) => {
    arr6.push(i);
  });
  let arr7 = [];
  att7.position.array.forEach((i) => {
    arr7.push(i);
  });
  let arr8 = [];
  att8.position.array.forEach((i) => {
    arr8.push(i);
  });
  let arr9 = [];
  att9.position.array.forEach((i) => {
    arr9.push(i);
  });
  let arr11 = [];
  att11.position.array.forEach((i) => {
    arr11.push(i);
  });
  let arr12 = [];
  att12.position.array.forEach((i) => {
    arr12.push(i);
  });
  let arr14 = [];
  att14.position.array.forEach((i) => {
    arr14.push(i);
  });
  let arr15 = [];
  att15.position.array.forEach((i) => {
    arr15.push(i);
  });
  Native.Custom.drawFourBuild(
    center,
    arr1,
    arr2,
    arr3,
    arr4,
    arr6,
    arr7,
    arr8,
    arr9,
    arr11,
    arr12,
    arr14,
    arr15,
    boxColor,
    boxColor2,
    boxColor3,
    toRaw(floorRotate.value),
    steps.value
  );

  return;
  let e1 = drawLine(
    GlobalViewer.scene,
    attributr.position.array,
    "1",
    boxColor,
    1
  );
  let e2 = drawLine(GlobalViewer.scene, att2.position.array, "2", boxColor2, 1);
  let e3 = drawLine(GlobalViewer.scene, att3.position.array, "3", boxColor3, 1);
  let e4 = drawLine(GlobalViewer.scene, att4.position.array, "1", boxColor, 1);
  let e6 = drawLine(GlobalViewer.scene, att6.position.array, "1", boxColor, 1);
  let e7 = drawLine(GlobalViewer.scene, att7.position.array, "1", boxColor, 1);
  let e8 = drawLine(GlobalViewer.scene, att8.position.array, "1", boxColor3, 1);
  let e9 = drawLine(GlobalViewer.scene, att9.position.array, "1", boxColor2, 1);
  let e11 = drawLine(
    GlobalViewer.scene,
    att11.position.array,
    "1",
    boxColor3,
    1
  );
  let e12 = drawLine(
    GlobalViewer.scene,
    att12.position.array,
    "1",
    boxColor2,
    1
  );
  let e14 = drawLine(
    GlobalViewer.scene,
    att14.position.array,
    "1",
    boxColor2,
    1
  );
  let e15 = drawLine(
    GlobalViewer.scene,
    att15.position.array,
    "1",
    boxColor3,
    1
  );
  let arr = [];
  arr.push(e1, e2, e3, e4, e6, e7, e8, e9, e11, e12, e14, e15);
  // arr.push(e2);
  floorGeomList.push(e1, e2, e3, e4, e6, e7, e8, e9, e11, e12, e14, e15);
  const mat = rotationEntity(selfPosition, 0, 0, floorRotate.value, 0);
  const transtion = SSmap.Matrix4.fromTranslation(
    SSmap.Vector3.create(40, -50, -34)
  );
  const matrix4 = SSmap.Matrix4.multiply(mat, transtion);
  arr.forEach((i) => {
    i.transform.matrix = matrix4;
  });
};

const createDomLabel = (e) => {
  //画div盒子
  let elem = document.querySelector(".show-info");
  elem.style.display = "flex";
  let world = getWorldPosition(e);
  let tohic = world.toCartesian3().toVector3();
  let frameAction = new SSmap.FrameAction();
  frameAction.onTriggered(() => {
    //每一帧改变div的位置
    // debugger;
    var xyposition =
      window.GlobalViewer.scene.mainCamera.worldToScreenPoint(tohic);
    elem.style.bottom = 0.1 - xyposition.y - elem.clientHeight + "px";
    elem.style.left = 0.1 + xyposition.x - elem.clientWidth * 3.5 + "px";
    // console.log("456456");
  });
  scene.rootEntity.addComponent(frameAction);
  // HtmldomList.push(opt);
  // addHtmldom();
};

//功能点
//进深增加
const deOneDepth = () => {
  oneDepth.value -= 8;
  if (oneDepth.value <= 24) {
    oneDepth.value = 24;
    changeBuild();
    ElMessage.warning("已经到极限了");
    return;
  }

  changeBuild();
};
const addOneDepth = () => {
  oneDepth.value += 8;
  changeBuild();
};
const deTwoDepth = () => {
  twoDepth.value -= 8;
  if (twoDepth.value <= 24) {
    twoDepth.value = 24;
    changeBuild();
    ElMessage.warning("已经到极限了");
    return;
  }
  changeBuild();
};
const addTwoDepth = () => {
  twoDepth.value += 8;
  changeBuild();
};
const deThreeDepth = () => {
  threeDepth.value -= 8;
  if (threeDepth.value <= 24) {
    threeDepth.value = 24;
    changeBuild();
    ElMessage.warning("已经到极限了");
    return;
  }
  changeBuild();
};
const addThreeDepth = () => {
  threeDepth.value += 8;
  changeBuild();
};
const deFourDepth = () => {
  fourDepth.value -= 8;
  if (fourDepth.value <= 24) {
    fourDepth.value = 24;
    changeBuild();
    ElMessage.warning("已经到极限了");
    return;
  }
  changeBuild();
};
const addFourDepth = () => {
  fourDepth.value += 8;
  changeBuild();
};
//层数改变
const dePlies = () => {
  floorNumber.value -= 1;
  if (floorNumber.value <= 1) {
    floorNumber.value = 1;
    changeBuild();
    ElMessage.warning("已经到极限了");
    return;
  }
  changeBuild();
};
const addPlies = () => {
  floorNumber.value += 1;
  changeBuild();
};
//层高改变
const deFloorHeight = () => {
  floorHeight.value -= 1;
  if (floorHeight.value <= 1) {
    floorHeight.value = 1;
    changeBuild();
    ElMessage.warning("已经到极限了");
    return;
  }

  changeBuild();
};
const addFloorHeight = () => {
  floorHeight.value += 1;
  changeBuild();
};
//旋转
const reduceRotate = () => {
  if (floorRotate.value <= 0) {
    ElMessage.warning("已经到极限了");
    return;
  }
  floorRotate.value -= 90;
  changeBuild();
};
const addRotate = () => {
  if (floorRotate.value >= 360) {
    ElMessage.warning("已经到极限了");
    return;
  }
  floorRotate.value += 90;
  changeBuild();
};
//屋顶样式
const deRoomTop = () => {
  if (roomTop.value == "屋顶花园") {
    roomTop.value = "楼顶停车";
  } else {
    roomTop.value = "屋顶花园";
  }
  changeBuild();
};
const addRoomTop = () => {
  if (roomTop.value == "屋顶花园") {
    roomTop.value = "楼顶停车";
  } else {
    roomTop.value = "屋顶花园";
  }
  changeBuild();
};
//立面样式
const deFacedeStyle = () => {
  if (facadeStyle.value == "石材") {
    facadeStyle.value = "玻璃";
  } else {
    facadeStyle.value = "石材";
  }
  changeBuild();
};
const addFacedestyle = () => {
  if (facadeStyle.value == "石材") {
    facadeStyle.value = "玻璃";
  } else {
    facadeStyle.value = "石材";
  }
  changeBuild();
};

onMounted(() => {
  //   initTiles();
});
</script>

<style lang="scss" scoped>
.custom {
  //   position: absolute;
  .show-info {
    display: none;
    position: absolute;
    background-color: #fff9;
    // display: flex;
    align-items: center;
    justify-content: space-around;
    // flex-direction: column;
    // justify-content: center;
    // align-items: center;
    width: 300px;
    height: 300px;
    padding: 8px;
    // padding-top: 12px;
    border-radius: 10px;
    .shuxing {
      margin-top: -32px;
    }
    .shuxing-name {
      color: #000;
      font-weight: 900;
      margin-top: -32px;
    }
    .checkbutton {
      position: absolute;
      margin-top: 40%;
      // margin-bottom: 200px;
    }
  }
  .show-content {
    position: absolute;
    bottom: -86vh;
    ul {
      list-style: none;
      display: flex;
      width: 500px;
      justify-content: space-around;
      align-content: center;
      li {
        width: 100px;
        height: 100px;
        background-color: #fff;
        box-shadow: 0 0.625rem 1.5625rem #9c9db29c;
        border-radius: 0.26042rem;
        display: flex;
        flex-direction: column;
        // justify-content: center;
        align-items: center;
        img {
          width: 50px;
          height: 50px;
          margin-top: 10px;
        }
      }
    }
  }
  .build-edit {
    position: absolute;
    font-size: 14px;
    bottom: -1000px;
    left: 58px;
    // width: 14.73958rem;
    // max-height: 30.20833rem;
    overflow-y: auto;
    padding: 0.9375rem;
    box-sizing: border-box;
    box-shadow: 0 0.625rem 1.5625rem #9c9db29c;
    background-color: #ffffff80;
    border-radius: 0.26042rem;
    // min-height: 500px;
    display: flex;

    .edit-left {
      width: 200px;
      display: flex;
      // justify-content: space-around;
      flex-direction: column;
      // align-items: center;
      // justify-content: space-around;

      p {
        margin: 15px 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }
    .edit-right {
      width: 140px;
      p {
        background-color: #674ae5;
        border-radius: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: #fff;
      }
      .func-top {
        margin-top: 65px;
      }
      .func {
        margin-top: 65px;
      }
      // display: flex;
      // justify-content: space-around;
      // flex-direction: column;
      // align-items: center;
      // justify-content: space-around;
    }
  }
  .next-button {
    width: 300px;
    position: absolute;
    bottom: -82vh;
    right: -70vw;
    .el-button {
      height: 50px;
    }
  }
  .title-edit {
    color: #674ae5;
    font-weight: bolder;
    // position: absolute;
    // margin-top: -10px;
  }
  .checktBox {
    position: absolute;
    right: -76vw;
    width: 400px;
    box-sizing: border-box;
    background-color: #ffffffb3;
    border-radius: 0.26042rem;
    box-shadow: 0 0.625rem 1.5625rem #9c9db29c;
    padding: 0.98958rem 1.09375rem 0.98958rem 0.9375rem;
    .check-title {
      color: #674ae5;
      font-weight: bolder;
      position: absolute;
      margin-top: -20px;
      font-size: 20px;
    }
    .checkBox-content {
      margin-top: 20px;
      display: flex;
      // flex-direction: column;
      // justify-content: space-between;
      div {
        width: 200px;
      }
      .check-two {
        color: #000;
        font-weight: 900;
      }
    }
  }
  .checktBox1 {
    position: absolute;
    left: 80vw;
    width: 400px;
    top: 30vh;
    box-sizing: border-box;
    background-color: #ffffffb3;
    border-radius: 0.26042rem;
    box-shadow: 0 0.625rem 1.5625rem #9c9db29c;
    padding: 0.98958rem 1.09375rem 0.98958rem 0.9375rem;
    .check-title {
      color: #674ae5;
      font-weight: bolder;
      position: absolute;
      margin-top: -20px;
      font-size: 20px;
    }
    .checkBox-content {
      margin-top: 20px;
      display: flex;
      // flex-direction: column;
      // justify-content: space-between;
      div {
        width: 200px;
      }
      .check-two {
        color: #000;
        font-weight: 900;
      }
    }
  }
  .bottom-build {
    // position: absolute;
    // bottom: 10px;
    margin-left: -80px;
  }
  .picture {
    position: absolute;
    top: 80vh;
    left: 50vw;
    .el-button {
      width: 100px;
      height: 100px;
      border-radius: 50%;
    }
  }
}
</style>
