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
        <li @click="showDeitHandle">
          <img src="../images/one.png" alt="" />
          <p>'一'字型</p>
        </li>
        <li>
          <img src="../images/two.png" alt="" />
          <p>'L'字型</p>
        </li>
        <li>
          <img src="../images/three.png" alt="" />
          <p>'C'字型</p>
        </li>
        <li>
          <img src="../images/four.png" alt="" />
          <p>'口'字型</p>
        </li>
      </ul>
    </div>
    <div class="build-edit" v-show="showEditFloor">
      <div class="edit-left">
        <p class="title-edit">标准空间尺寸</p>
        <p>标准层1进深</p>
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
            <el-button :icon="ArrowLeft" type="primary" circle></el-button
            >{{ roomTop
            }}<el-button :icon="ArrowRight" type="primary" circle></el-button>
          </p>
          <p>
            <el-button :icon="ArrowLeft" type="primary" circle></el-button
            >{{ facadeStyle
            }}<el-button :icon="ArrowRight" type="primary" circle></el-button>
          </p>
        </div>
      </div>
    </div>
    <div class="next-button" v-show="showSureButton">
      <el-button type="primary" :icon="ArrowLeft">上一步</el-button>
      <el-button type="primary" :icon="ArrowRight">下一步</el-button>
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
import _ThreeBSP from "../editor/threebsp.js";
import { CSG } from "three-csg-ts";
// import ThreeBSP from "../editor/threebsp.js";
// import ThreeBSP from "threebsp.js";
// import { ThreeBSP } from "../editor/threebsp.js";
import { drawPolygonGeometry } from "../editor/draw.js";
import { rotateRectangle, drawLine, rotationEntity } from "../editor/math.js";
import { ElMessage } from "element-plus";
// const ThreeBSP = require("jthreebsp")(THREE);
const ThreeBSP = _ThreeBSP(THREE);
const projectLayer = ref(null);
const nowNode = ref(null);
const showNumber = ref(false);
const factoryNumber = ref("");
const landNumber = ref("");
const modifiedStr = ref("");
const showContent = ref(false);
const oneDepth = ref(40);
const floorNumber = ref(8);
const floorHeight = ref(6);
const floorRotate = ref(0);
const roomTop = ref("屋顶花园");
const facadeStyle = ref("石材");
const showEditFloor = ref(false);
const showSureButton = ref(false);
const tileFeature = ref(null); //点击时的tiles

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
const showDeitHandle = () => {
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

const drawExtru = (arr) => {
  let transtion;
  arr.forEach((i) => {
    transtion = SSmap.Matrix4.fromTranslation(SSmap.Vector3.create(10, -10, 0));
    let matrix4 = SSmap.Matrix4.multiply(selfPosition, transtion);
    let mat = (transtion = rotationEntity(matrix4, 0, 0, 0, 0));
    i.transform.matrix = mat;
  });
};

const oneBuild = (opt) => {
  // debugger;
  let exArr = [];
  opt.arr.forEach((item) => {
    exArr.push(toRaw(item).toCartesian3());
  });
  let length = floorGeomList.length;
  for (var i = length - 1; i > -1; i--) {
    toRaw(floorGeomList[i]).delete();
    floorGeomList.splice(i, 1);
    delete toRaw(floorGeomList[i]);
  }
  console.log(exArr, "oneList");
  let liftHeight = 3;
  let obj = {
    height: 5 * 10, ////高度
    alpha: 1, //透明度
    pointArr: exArr,
    color: SSmap.Color.fromRgb(255, 255, 255, 255), //填充颜色
    name: "pickpolygon",
    altitude: liftHeight * 10, //建筑的海拔高度 z轴
  };
  // liftHeight += item.input;
  // totalHeight.value = liftHeight;
  let extru = drawPolygonGeometry(obj);
  floorGeomList.push(extru);
};

const changeBuild = () => {
  let center = toRaw(tileFeature.value).boundingVolume.center;
  // let height = toRaw(tileFeature.value).boundingVolume.boundingRegion
  //   .minimumHeight;
  let height = floorHeight.value * floorNumber.value;
  // let height = 50;
  let length = 90;
  let width = -oneDepth.value;
  let length1 = floorGeomList.length;
  for (var i = length1 - 1; i > -1; i--) {
    toRaw(floorGeomList[i]).delete();
    floorGeomList.splice(i, 1);
    delete toRaw(floorGeomList[i]);
  }
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(0, -width);
  shape.lineTo(-length, -width);
  shape.lineTo(-length, 0);
  shape.lineTo(0, 0);
  const extrudeSettings = {
    steps: 2,
    depth: height,
    bevelEnabled: true,
    bevelThickness: 1,
    bevelSize: 0,
    bevelOffset: 0,
    bevelSegments: 1,
  };
  // let hole;
  // let holes1 = [
  //   new THREE.Vector3(0, -20, 0),
  //   new THREE.Vector3(0, -width - 10, 0),
  //   new THREE.Vector3(-length / 2, -width - 10, 0),
  //   new THREE.Vector3(-length, -20, 0),
  // ];
  // holes1.forEach((items, index) => {
  //   hole = new THREE.Path();
  //   if (index == 0) {
  //     hole.moveTo(items.x, items.y);
  //   } else {
  //     hole.lineTo(items.x, items.y);
  //   }
  //   shape.holes.push(hole);
  // });
  // let holes1 = new THREE.Path();
  // holes1.lineTo(0, -20);
  // shape.holes.push(holes1);
  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

  let boxGeometry = new THREE.BoxGeometry(length, 30, 50);
  // const shape2 = new THREE.Shape();
  // shape.moveTo(0, 0);
  // shape.lineTo(0, -100);
  // shape.lineTo(-200, -100);
  // shape.lineTo(-200, 0);
  // shape.lineTo(0, 0);
  // const extrudeSettings2 = {
  //   steps: 2,
  //   depth: 100 + 4,
  //   bevelEnabled: true,
  //   bevelThickness: 1,
  //   bevelSize: 0,
  //   bevelOffset: 0,
  //   bevelSegments: 1,
  // };
  let box1 = new THREE.BoxGeometry(20, 10, height + 4);
  // let box1 = new THREE.ExtrudeGeometry(shape2, extrudeSettings2);
  var selfPosition = GlobalViewer.scene.globe.ellipsoid.eastNorthUpToFixedFrame(
    center.toCartesian3()
  );
  let attributr = geometry.attributes;
  // floorGeomList.forEach((item) => {
  //   item.delete();
  // });
  let att2 = box1.attributes;
  let boxColor2 = {
    r: 255,
    g: 255,
    b: 255,
    a: 255,
  };
  let boxColor = {
    r: 142,
    g: 147,
    b: 227,
    a: 255,
  };
  let e1 = drawLine(
    GlobalViewer.scene,
    attributr.position.array,
    "1",
    boxColor
  );
  let e2 = drawLine(GlobalViewer.scene, att2.position.array, "2", boxColor2);
  let arr = [];
  arr.push(e1);
  arr.push(e2);
  let transtion;
  floorGeomList.push(e1);
  arr.forEach((i) => {
    let mat = (transtion = rotationEntity(selfPosition, 0, 0, 0, 0));
    if (i.name == 2) {
      transtion = SSmap.Matrix4.fromTranslation(
        // SSmap.Vector3.create(21.9, -21.9, -5)
        SSmap.Vector3.create(0, -35.1, 23)
      );
    } else {
      transtion = SSmap.Matrix4.fromTranslation(
        SSmap.Vector3.create(40, -40, -32) //一加一减
        // SSmap.Vector3.create(40, 40, -32)
      );
    }

    let matrix4 = SSmap.Matrix4.multiply(mat, transtion);
    // let mat = (transtion = rotationEntity(matrix4, 0, 0, 0, 0));
    i.transform.matrix = matrix4;
  });
};

//功能点
//进深增加
const deOneDepth = () => {
  if (oneDepth.value <= 0) {
    ElMessage.warning("已经到极限了");
    return;
  }
  oneDepth.value -= 8;
  changeBuild();
};
const addOneDepth = () => {
  oneDepth.value += 8;
  changeBuild();
};
//层数改变
const dePlies = () => {
  if (floorNumber.value <= 1) {
    ElMessage.warning("已经到极限了");
    return;
  }
  floorNumber.value -= 1;
  changeBuild();
};
const addPlies = () => {
  floorNumber.value += 1;
  changeBuild();
};
//层高改变
const deFloorHeight = () => {
  if (floorHeight.value <= 0) {
    ElMessage.warning("已经到极限了");
    return;
  }
  floorHeight.value -= 1;
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
  // let arr = [];
  // pointList.value.forEach((item) => {
  //   arr.push(item);
  // });
  let arr = rotateRectangle(
    toRaw(modelCenter.value),
    toRaw(pointList.value),
    225
  );
  pointList.value = arr;
  oneBuild({
    arr: arr,
  });
};
const addRotate = () => {
  if (floorRotate.value >= 360) {
    ElMessage.warning("已经到极限了");
    return;
  }
  floorRotate.value += 90;
  let arr = rotateRectangle(
    toRaw(modelCenter.value),
    toRaw(pointList.value),
    45
  );
  pointList.value = arr;
  oneBuild({
    arr: arr,
  });
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
    left: 1200px;
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
}
</style>
