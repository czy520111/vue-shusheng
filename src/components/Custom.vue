<template>
  <div class="custom">
    <el-button type="primary" @click="initTiles">空间定制</el-button>
    <div class="show-info" v-show="showNumber">
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
        <p>{{ landNumber }}</p>
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
      </div>
    </div>
    <div class="next-button" v-show="showSureButton">
      <el-button type="primary" :icon="ArrowLeft">上一步</el-button>
      <el-button type="primary" :icon="ArrowRight">下一步</el-button>
    </div>
    <div class="checktBox">
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, toRaw } from "vue";
import * as Native from "../native/main.js";
import { Search, ArrowLeft, ArrowRight } from "@element-plus/icons-vue";
import { ExtrudeGeometry } from "../editor/ExtrudeGeometry.js";
// import Utils from "../editor/utils.js";
// import * as Utils from "../editor/utils.js";
import * as THREE from "three";
import * as turf from "@turf/turf";
import ThreeBSP from "../editor/threebsp.js";
// import { CSG } from "three-csg-ts";
// import ThreeBSP from "../editor/threebsp.js";
// import ThreeBSP from "threebsp.js";
// import { ThreeBSP } from "../editor/threebsp.js";
import { drawPolygonGeometry } from "../editor/draw.js";
import { rotateRectangle, drawLine, rotationEntity } from "../editor/math.js";
import { ElMessage } from "element-plus";
// const ThreeBSP = require("jthreebsp")(THREE);
// const ThreeBSP = _ThreeBSP(THREE);
const projectLayer = ref(null);
const nowNode = ref(null);
const showNumber = ref(false);
const factoryNumber = ref("");
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

//模型的数组
const floorGeomList = reactive([]);
const pointList = ref(null);
const modelCenter = ref(null);
const modelWidth = ref(null);

const initTiles = () => {
  // let SSmap = window.SSmap;
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
            Native.Tileset.add({
              url: filePath,
            });
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
  projectLayer.value = new SSmap.ProjectionLayer();
  toRaw(projectLayer.value).sceneMode =
    SSmap.TextureProjectionSceneMode.WholeScene;
  let pdSource = new SSmap.ProjectionDataSource();
  pdSource.setColor(SSmap.Color.fromRgb(0, 0, 255, 150));
  pdSource.setSelectedColor(SSmap.Color.fromRgb(0, 255, 0, 128));
  pdSource.setStrokeWidth(3);
  pdSource.setStrokeColor(SSmap.Color.fromRgb(0, 0, 255, 150));
  //   pdSource.setSelectedStrokeColor(SSmap.Color.fromRgb(0, 255, 0, 128));
  pdSource.addField("Layer"); //需要拾取的属性
  pdSource.addField("area"); //需要拾取的属性
  pdSource.enabled = true;
  pdSource.loadGeoJson(origin + "/data/geojson/model-design.json");
  toRaw(projectLayer.value).addDataSource(pdSource);

  //地块
  Native.Glbset.add({ url: origin + "/data/glb/BG.glb" });
  Native.Glbset.add({ url: origin + "/data/glb/DEM.glb" });
  Native.Glbset.add({ url: origin + "/data/glb/bridge.glb" });
  Native.Glbset.add({ url: origin + "/data/glb/land.glb" });
  Native.Glbset.add({ url: origin + "/data/glb/white-model.glb" });
  //注册事件
  createEvent();
};

const createEvent = () => {
  document
    .getElementById("qtcanvas")
    .addEventListener("click", mouseClickEvent);
};
const mouseClickEvent = (e) => {
  let feature = toRaw(projectLayer.value).getFeatureByMouse();

  //   toRaw(projectLayer.value).setColor(SSmap.Color.fromRgb(0, 0, 255, 128));

  let feature5 = window.GlobalViewer.scene.getFeatureByMouse();
  tileFeature.value = feature5;
  console.log(feature, "789789", projectLayer, feature5);
  if (nowNode.value && feature) {
    toRaw(nowNode.value).setColor(SSmap.Color.fromRgb(0, 0, 255, 150));
    toRaw(nowNode.value).setSelectedColor(SSmap.Color.fromRgb(0, 0, 255, 128));
    // toRaw(nowNode.value).setStrokeWidth(3);
    toRaw(nowNode.value).setStrokeColor(SSmap.Color.fromRgb(0, 0, 255, 150));
  }
  if (feature) {
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
  showContent.value = true;
  showSureButton.value = true;
  showNumber.value = false;
};
const showDeitHandle = (value) => {
  checkType.value = value;
  showEditFloor.value = true;
  let feature = toRaw(nowNode.value).feature();
  feature.enabled = false;
  feature.parent.enabled = false;
  feature.parent.parent.enabled = false;
  toRaw(nowNode.value).enabled = false;
  toRaw(tileFeature.value).tileset.enabled = false; //设置tiles隐藏
  // debugger;
  document
    .getElementById("qtcanvas")
    .removeEventListener("click", mouseClickEvent);
  // drawExtru(arr);
  console.log(nowNode.value, "789789", tileFeature.value);
  changeBuild();
};

const changeBuild = () => {
  let center = toRaw(tileFeature.value).boundingVolume.center;
  let height = floorHeight.value * floorNumber.value;
  // let height = 50;
  let length = 90;
  let width = -oneDepth.value;
  floorArea.value = length * oneDepth.value * height;
  let length1 = floorGeomList.length;
  for (var i = length1 - 1; i > -1; i--) {
    toRaw(floorGeomList[i]).delete();
    floorGeomList.splice(i, 1);
    delete toRaw(floorGeomList[i]);
  }

  switch (checkType.value) {
    case 1:
      oneBuild(center, length, width, height);
      break;
    case 2:
      twoBuild(center, length, width, height);
      break;
    case 3:
      threeBuild(center, length, width, height);
      break;
    case 4:
      fourBuild(center, length, width, height);
      break;
    default:
      break;
  }
};

const oneBuild = (center, length, width, height) => {
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
  var selfPosition = GlobalViewer.scene.globe.ellipsoid.eastNorthUpToFixedFrame(
    center.toCartesian3()
  );
  let attributr = geometry.attributes;
  let att2 = box1.attributes;
  let att3 = box2.attributes;
  let boxColor2 = {
    r: 255,
    g: 0,
    b: 0,
    a: 255,
  };
  let boxColor = {
    r: 140,
    g: 145,
    b: 227,
    a: 220,
  };
  let boxColor3 = {
    r: 0,
    g: 255,
    b: 0,
    a: 255,
  };
  let e1 = drawLine(
    GlobalViewer.scene,
    attributr.position.array,
    "1",
    boxColor,
    1
  );
  let e2 = drawLine(GlobalViewer.scene, att2.position.array, "2", boxColor2, 1);
  let e3 = drawLine(GlobalViewer.scene, att3.position.array, "3", boxColor3, 1);
  let arr = [];
  arr.push(e1, e2, e3);
  // arr.push(e2);
  floorGeomList.push(e1, e2, e3);
  const mat = rotationEntity(selfPosition, 0, 0, floorRotate.value, 0);
  const transtion = SSmap.Matrix4.fromTranslation(
    SSmap.Vector3.create(40, -50, -34)
  );
  const matrix4 = SSmap.Matrix4.multiply(mat, transtion);
  arr.forEach((i) => {
    i.transform.matrix = matrix4;
  });
};
const twoBuild = (center, length, width, height) => {
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

  var selfPosition = GlobalViewer.scene.globe.ellipsoid.eastNorthUpToFixedFrame(
    center.toCartesian3()
  );

  let attributr = geometry.attributes;
  let att2 = box1.attributes;
  let att3 = box2.attributes;
  let att4 = box3.attributes;
  let boxColor2 = {
    r: 255,
    g: 0,
    b: 0,
    a: 255,
  };
  let boxColor = {
    r: 142,
    g: 147,
    b: 227,
    a: 255,
  };
  let boxColor3 = {
    r: 0,
    g: 255,
    b: 0,
    a: 255,
  };
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
  let arr = [];
  arr.push(e1, e2, e3, e4);
  // arr.push(e2);
  floorGeomList.push(e1, e2, e3, e4);
  const mat = rotationEntity(selfPosition, 0, 0, floorRotate.value, 0);
  const transtion = SSmap.Matrix4.fromTranslation(
    SSmap.Vector3.create(40, -50, -34)
  );
  const matrix4 = SSmap.Matrix4.multiply(mat, transtion);
  arr.forEach((i) => {
    i.transform.matrix = matrix4;
  });
};
const threeBuild = (center, length, width, height) => {
  let width2 = -twoDepth.value;
  let width3 = -threeDepth.value;
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
      [-width2 + 10 - length, 0],
      [-width2 + 10 - length, 10],
      [-width2 + 10 - length - 20, 10],
      [-width2 + 10 - length - 20, 0],
      [-width2 + 10 - length, 0],
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
    [
      [width3 + 10, 0],
      [width3 + 10, 10],
      [width3 + 10 - 20, 10],
      [width3 + 10 - 20, 0],
      [width3 + 10, 0],
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
  shape2.moveTo(-width2 + 10 - length, 0);
  shape2.lineTo(-width2 + 10 - length, 10);
  shape2.lineTo(-width2 + 10 - length - 20, 10);
  shape2.lineTo(-width2 + 10 - length - 20, 0);
  shape2.lineTo(-width2 + 10 - length, 0);
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
  let diffArr3 = [];
  polygon5.geometry.coordinates[0].forEach((item, index) => {
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
  let diffArr6 = [];
  polygon6.geometry.coordinates[0].forEach((item, index) => {
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

  var selfPosition = GlobalViewer.scene.globe.ellipsoid.eastNorthUpToFixedFrame(
    center.toCartesian3()
  );

  let attributr = geometry.attributes;
  let att2 = box1.attributes;
  let att3 = box2.attributes;
  let att4 = box3.attributes;
  let att6 = box6.attributes;
  let att7 = box7.attributes;
  let boxColor2 = {
    r: 255,
    g: 0,
    b: 0,
    a: 255,
  };
  let boxColor = {
    r: 142,
    g: 147,
    b: 227,
    a: 255,
  };
  let boxColor3 = {
    r: 0,
    g: 255,
    b: 0,
    a: 255,
  };
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
  let arr = [];
  arr.push(e1, e2, e3, e4, e6, e7);
  // arr.push(e2);
  floorGeomList.push(e1, e2, e3, e4, e6, e7);
  const mat = rotationEntity(selfPosition, 0, 0, floorRotate.value, 0);
  const transtion = SSmap.Matrix4.fromTranslation(
    SSmap.Vector3.create(40, -50, -34)
  );
  const matrix4 = SSmap.Matrix4.multiply(mat, transtion);
  arr.forEach((i) => {
    i.transform.matrix = matrix4;
  });
};
const fourBuild = (center, length, width, height) => {
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
    [
      [-length / 2 + 15, 0],
      [-length / 2 + 15, 15],
      [-length / 2 - 15, 15],
      [-length / 2 - 15, 0],
      [-length / 2 + 15, 0],
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
    [
      [0, length + width4],
      [0, length],
      [-length, length],
      [-length, length + width4],
      [0, length + width4],
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
  let diffArr3 = [];
  polygon5.geometry.coordinates[0].forEach((item, index) => {
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
  let diffArr6 = [];
  polygon6.geometry.coordinates[0].forEach((item, index) => {
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
    depth: height,
    bevelEnabled: false,
  };
  let box7 = new THREE.ExtrudeGeometry(shape7, extrudeSettings7);

  var selfPosition = GlobalViewer.scene.globe.ellipsoid.eastNorthUpToFixedFrame(
    center.toCartesian3()
  );
  let attributr = geometry.attributes;
  let att2 = box1.attributes;
  let att3 = box2.attributes;
  let att4 = box3.attributes;
  let att6 = box6.attributes;
  let att7 = box7.attributes;
  let boxColor2 = {
    r: 255,
    g: 0,
    b: 0,
    a: 255,
  };
  let boxColor = {
    r: 142,
    g: 147,
    b: 227,
    a: 255,
  };
  let boxColor3 = {
    r: 0,
    g: 255,
    b: 0,
    a: 255,
  };
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
  let arr = [];
  arr.push(e1, e2, e3, e4, e6, e7);
  // arr.push(e2);
  floorGeomList.push(e1, e2, e3, e4, e6, e7);
  const mat = rotationEntity(selfPosition, 0, 0, floorRotate.value, 0);
  const transtion = SSmap.Matrix4.fromTranslation(
    SSmap.Vector3.create(40, -50, -34)
  );
  const matrix4 = SSmap.Matrix4.multiply(mat, transtion);
  arr.forEach((i) => {
    i.transform.matrix = matrix4;
  });
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
  if (twoDepth.value <= 20) {
    twoDepth.value = 20;
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
  if (threeDepth.value <= 20) {
    threeDepth.value = 20;
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
  if (fourDepth.value <= 20) {
    fourDepth.value = 20;
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
};
const addRoomTop = () => {
  if (roomTop.value == "屋顶花园") {
    roomTop.value = "楼顶停车";
  } else {
    roomTop.value = "屋顶花园";
  }
};
//立面样式
const deFacedeStyle = () => {
  if (facadeStyle.value == "石材") {
    facadeStyle.value = "玻璃";
  } else {
    facadeStyle.value = "石材";
  }
};
const addFacedestyle = () => {
  if (facadeStyle.value == "石材") {
    facadeStyle.value = "玻璃";
  } else {
    facadeStyle.value = "石材";
  }
};

onMounted(() => {
  //   initTiles();
});
</script>

<style lang="scss" scoped>
.custom {
  //   position: absolute;
  .show-info {
    position: absolute;
    background-color: #fff9;
    display: flex;
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
      margin-top: 240px;
    }
  }
  .show-content {
    position: absolute;
    top: 1150px;
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
    top: 1200px;
    left: 1800px;
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
    left: 80vw;
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
}
</style>
