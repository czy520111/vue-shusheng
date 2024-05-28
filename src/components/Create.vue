<template>
  <div class="create">
    <el-button type="primary" @click="showContent = true">创建</el-button>
    <div class="content" v-if="showContent">
      <div class="build">
        <p>建筑名称</p>
        <!-- <el-icon><Close /></el-icon> -->
        <el-button :icon="Close" @click="closeContent" circle />
        <div class="build-img">
          <el-tooltip content="保存" placement="top">
            <el-button @click="addList" :icon="Document" circle />

            <!-- <el-icon><Document /></el-icon> -->
            <!-- <el-icon><CirclePlusFilled /></el-icon> -->
            <!-- <el-icon><DeleteFilled /></el-icon> -->
          </el-tooltip>
          <el-tooltip content="添加" placement="top">
            <el-button @click="openDraw" :icon="CirclePlusFilled" circle />
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-button @click="deleteBuild" :icon="DeleteFilled" circle />
          </el-tooltip>
          <el-dialog
            v-model="dialogVisible"
            title="提示"
            width="500"
            :before-close="handleClose"
          >
            <span>此操作将永久删除建筑,是否继续?</span>
            <template #footer>
              <div class="dialog-footer">
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="sureDelete"> 确定 </el-button>
              </div>
            </template>
          </el-dialog>
        </div>
      </div>
      <div class="content-info">
        <div class="info-arr" v-for="(item, index) in geoList">
          <div class="self-info">
            <p>{{ item.name }}</p>
            <div>
              <el-tooltip content="定位" placement="top">
                <el-button
                  @click="goPosition(item, index)"
                  :icon="LocationInformation"
                  circle
                />
                <!-- <el-icon><LocationInformation /></el-icon> -->
              </el-tooltip>
              <el-tooltip content="编辑" placement="top">
                <el-button
                  @click="editCurrentGeo(item, index)"
                  :icon="EditPen"
                  circle
                />
              </el-tooltip>
              <el-tooltip content="移动" placement="top">
                <el-button
                  @click.stop="moveGeo(item, index)"
                  :icon="Rank"
                  circle
                />
              </el-tooltip>
              <el-checkbox
                style="margin-left: 12px"
                v-model="item.checked"
                size="large"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="open-build" v-if="showInfo">
      <p>建筑名称</p>
      <el-button @click="closeBuilid" :icon="Close"></el-button>
      <el-input
        v-model="inputValue"
        style="width: 240px"
        placeholder="Please input"
      />
      <div class="floor">
        <span>楼层</span>
        <div>
          <el-button
            type="info"
            @click="floorMin"
            :icon="Minus"
            size="small"
            circle
          ></el-button>
          <b style="margin: 0 12px">{{ floorList.length }}</b>
          <el-button
            type="info"
            @click="floorMax"
            :icon="Plus"
            size="small"
            circle
          ></el-button>
        </div>

        <!-- <el-icon><Minus /></el-icon> -->
      </div>
      <div class="add-floor" v-for="(item, index) in floorList">
        <!-- <div> -->
        <span> {{ item.name }}</span>

        <!-- </div> -->
        <div class="add-floor-right">
          <el-button
            @click="cutHeight(item, index)"
            :icon="CaretLeft"
          ></el-button>
          <el-input
            v-model="item.input"
            @change="currentInput(item, index)"
            style="width: 40px"
            placeholder="Please input"
          />
          <el-button
            @click="addHeight(item, index)"
            :icon="CaretRight"
          ></el-button>
          <el-button
            @click="currentDelete(item.index)"
            :icon="Delete"
          ></el-button>
        </div>
        <!-- <el-icon><CaretLeft /></el-icon> -->
      </div>
      <div>
        建筑每层高度(m)<el-input
          v-model="peiInput"
          style="width: 240px"
          placeholder="Please input"
        />
      </div>
      <div>
        建筑总高度(m)
        <p style="color: #000">{{ totalHeight }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, toRaw } from "vue";
import {
  Minus,
  Check,
  Edit,
  Message,
  Search,
  Star,
  Document,
  CirclePlusFilled,
  DeleteFilled,
  Close,
  LocationInformation,
  EditPen,
  Rank,
  Plus,
  CaretLeft,
  CaretRight,
  Delete,
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import {
  getWorldPosition,
  calSpaceArea,
  calculatePolygonCenter,
  compareArrays,
  recomputeVertices,
  addcomputeVertices,
  rotationEntity,
  isInPolygon,
} from "../editor/math.js";

import {
  drawPolyline,
  drawLabel,
  drawPolygonGeometry,
  drawPolygon3D,
  addBillboard,
} from "../editor/draw.js";
import * as turf from "@turf/turf";

const showContent = ref(false);
const dialogVisible = ref(false);
const showInfo = ref(false);
const geoList = reactive([]); //外部结构数组
const inputValue = ref("建筑1");
const floorvalue = ref(1);
const floorList = reactive([]); //内部结构数组
const bulidHeight = ref(3);
const peiInput = ref(3);
const totalHeight = ref(3);
const centerPoint = ref(null);
const editBUtton = ref(false);
const checkEdit = ref(0);
const cloneFloorList = reactive([]);
const cloneGeoList = reactive([]);
const moveBuild = ref(false);
const nowBuild = ref(0);
const nowItem = ref(null);
const checkPointVal = ref(null);
const editBuild = ref(false);
const nowWorldPoint = ref(null);
const parentPosition = ref({ x: 0, y: 0, z: 0 });
const lastBuildPosition = ref(null);
//几何体
const pointList = reactive([]);
const threeList = reactive([]);
const moveList = reactive([]);
const polyList = reactive([]);
const floorGeomList = reactive([]);
const allGeoList = reactive([]); //所有创建几何体的集合
const allPointList = reactive([]); //所有创建几何体形状点位的集合
const topPointList = reactive([]); //顶层建筑点位
const moveBuildList = reactive([]); //移动建筑的集合

const closeBuilid = () => {
  console.log(
    "closeBuilid",
    floorGeomList,
    pointList,
    floorList,
    cloneFloorList
  );
  // let result = compareArrays(cloneFloorList, floorList);
  // if (!result) {
  //   floorList.length = 0;
  //   floorGeomList.length = 0;

  //   cloneFloorList.forEach((i) => {
  //     floorList.push(i);
  //   });
  //   cloneGeoList.forEach((i) => {
  //     floorGeomList.push(i);
  //   });
  // }
  // editBUtton.value
  // if (!editBUtton.value) {
  //   let length = floorGeomList.length;
  //   for (var i = length - 1; i > -1; i--) {
  //     toRaw(floorGeomList[i]).delete();
  //     floorGeomList.splice(i, 1);
  //     delete toRaw(floorGeomList[i]);
  //   }
  // }
  // if (geoList.length > 0) {
  //   savePoint();
  //   editBUtton.value = false;
  //   showInfo.value = false;
  //   allGeoList.shift();
  //   allGeoList.unshift([...floorGeomList]);
  //   allPointList.shift();
  //   allPointList.unshift([...pointList]);
  //   inputValue.value = "建筑" + geoList.length;
  //   geoList.shift();
  //   geoList.unshift({
  //     name: "建筑" + (geoList.length + 1),
  //     checked: false,
  //     edit: [...floorList],
  //     geo: [...floorGeomList],
  //     position: { ...centerPoint },
  //     allPointList: allPointList,
  //     pointList: [...pointList],
  //   });
  // }
  addList();
  // showInfo.value = false;
};

const deleteBuild = () => {
  console.log("allGeoList", allGeoList, geoList);
  dialogVisible.value = true;
};

const sureDelete = () => {
  for (let i = 0; i < geoList.length; i++) {
    let geometry = geoList[i];
    if (geometry.checked) {
      geoList.splice(i, 1);
      i--;
      let length = geometry.geo.length;
      for (var j = length - 1; j > -1; j--) {
        toRaw(geometry.geo[j]).delete();
        geometry.geo.splice(j, 1);
        delete toRaw(geometry.geo[j]);
      }
    }
  }
  dialogVisible.value = false;
};

const addList = () => {
  if (!showInfo.value) {
    ElMessage.info("当前没有可保存的建筑");
    return;
  }
  savePoint();
  let parentEntity = new SSmap.Entity();
  if (editBUtton.value) {
    // reSave();
    editBUtton.value = false;
    showInfo.value = false;
    allGeoList.shift();
    allGeoList.unshift([...floorGeomList]);
    allPointList.shift();
    allPointList.unshift([...pointList]);
    inputValue.value = "建筑" + geoList.length;
    geoList.shift();
    geoList.unshift({
      name: "建筑" + (geoList.length + 1),
      checked: false,
      edit: [...floorList],
      geo: [...floorGeomList],
      position: { ...centerPoint },
      allPointList: allPointList,
      pointList: [...pointList],
    });
  } else {
    showInfo.value = false;
    allGeoList.unshift([...floorGeomList]);
    allPointList.unshift([...pointList]);
    inputValue.value = "建筑" + (geoList.length + 1);
    geoList.unshift({
      name: "建筑" + (geoList.length + 1),
      checked: false,
      edit: [...floorList],
      geo: [...floorGeomList],
      position: { ...centerPoint },
      allPointList: allPointList,
      pointList: [...pointList],
    });
  }
};
const closeContent = () => {
  showContent.value = false;
  savePoint();
};
const reSave = () => {
  allGeoList[checkEdit.value] = [...floorGeomList];
  allPointList[checkEdit.value] = [...pointList];
  geoList[checkEdit.value].edit = [...floorList];
  geoList[checkEdit.value].geo = [...floorGeomList];
  // geoList[checkEdit.value].position = { ...centerPoint };
  geoList[checkEdit.value].allPointList = [...allPointList];
  showInfo.value = false;
  redrawExtru();
  // allGeoList.unshift([...floorGeomList]);
  // allPointList.unshift([...pointList]);
  // inputValue.value = "建筑" + (geoList.length + 1);
  // geoList.unshift({
  //   name: "建筑" + (geoList.length + 1),
  //   checked: false,
  //   edit: [...floorList],
  //   geo: [...floorGeomList],
  //   position: { ...centerPoint },
  //   allPointList: allPointList,
  // });
};
const goPosition = (item, index) => {
  if (showInfo.value) {
    ElMessage.info("建筑正在编辑中");
    return;
  }
  let point = toRaw(item).geo[0];
  let position;
  if (toRaw(point).parentEntity.objectName == "parentBulid") {
    let parent = toRaw(point).parentEntity.transform.position;
    let px = toRaw(item).position._rawValue.x + parent.x;
    let py = toRaw(item).position._rawValue.y + parent.y;
    let pz = toRaw(item).position._rawValue.z + parent.z;
    let chP = SSmap.Vector3.create(px, py, pz);
    // toRaw(item).position._rawValue.x -= point.x;
    // toRaw(item).position._rawValue.y -= point.y;
    // toRaw(item).position._rawValue.z -= point.z;
    position = chP.toCartesian3().toCartographic().toDegrees();
  } else {
    position = toRaw(item)
      .position._rawValue.toCartesian3()
      .toCartographic()
      .toDegrees();
  }

  let opt = {
    lat: position.lat || 22.540745, //纬度
    lng: position.lon || 114.054494, //经度
    alt: position.height || 5, //高度
    pitch: -80, //俯仰角
    distance: 1000, //观察点到目标点的直线距离
  };
  console.log("goPosition", item, index, opt);
  flyTopoint(opt);
};
const flyTopoint = (opt) => {
  let point = SSmap.Cartesian3.fromDegrees(
    opt.lng,
    opt.lat,
    opt.alt
  ).toVector3();
  let distance = opt.distance || 500;
  //利用三角函数，根据500米距离和俯仰角（opt.pitch）计算正北方向 观察点（相机）的偏移值
  let Yoffset = Math.sin(((90 + opt.pitch) * Math.PI) / 180) * distance;
  let Zoffset = Math.cos(((90 + opt.pitch) * Math.PI) / 180) * distance;

  //根据上述偏移值，重新获取偏移后的坐标（相机位置）
  let destination = vector3Offset(point, {
    offsetY: -Yoffset,
    offsetZ: Zoffset,
  });
  //定位
  window.GlobalViewer.scene.mainCamera.cameraController().flyTo(
    destination,
    3, //飞行时间
    Number(0), //不能改 0为正北方向
    Number(opt.pitch), //
    Number(0) //不能改
  );
};

const vector3Offset = (point, { offsetX = 0, offsetY = 0, offsetZ = 0 }) => {
  if (GlobalViewer) {
    let vec3 = SSmap.Vector3.create(offsetX, offsetY, offsetZ);
    let localToWorld =
      GlobalViewer.scene.globe.ellipsoid.eastNorthUpToFixedFrame(
        point.toCartesian3()
      );
    let newPoint = SSmap.Matrix4.multiplyByVector3(localToWorld, vec3);
    return newPoint;
  }
};

const moveGeo = (item, index) => {
  console.log("moveGeo", item, index);
  nowBuild.value = index;
  nowItem.value = item;
  document.getElementById("qtcanvas").style.cursor = "crosshair";
  document.getElementById("qtcanvas").addEventListener("click", moveExtru);
  moveBuild.value = true;
  ElMessage.info("屏幕选取点移动建筑");
};

const moveExtru = (e) => {
  if (!moveBuild.value) return;
  let point = getWorldPosition(e); //点击的世界坐标
  let scene = GlobalViewer.scene;
  let ellipsoid = scene.globe.ellipsoid;
  let centerX = toRaw(nowItem.value).position._rawValue.x;
  let centerY = toRaw(nowItem.value).position._rawValue.y;
  let centerZ = toRaw(nowItem.value).position._rawValue.z;
  let vec3 = SSmap.Vector3.create(centerX, centerY, centerZ);
  let p3 = SSmap.Vector3.create(0, 0, 0);
  let worldPosition = ellipsoid.eastNorthUpToFixedFrame(p3.toCartesian3()); //世界坐标转局部矩阵，指定位置建立局部坐标
  let worldToLocal = worldPosition.inverted();
  // let parentEntity = new SSmap.Entity();
  checkEdit.value = nowBuild.value;
  // floorList.length = 0;
  // pointList.length = 0;
  // floorGeomList.length = 0;
  let geometry = nowItem.value.geo;
  let pointArray = nowItem.value.edit;
  let parentEntity = new SSmap.Entity();
  parentEntity.objectName = "parentBulid";
  // window.GlobalViewer.scene.addEntity(parentEntity);
  geometry.forEach((i) => {
    toRaw(i).parentEntity = parentEntity;
  });
  globalViewer.scene.addEntity(parentEntity);
  let length = geometry.length;
  let pos = SSmap.Vector3.create(
    point.x - centerX,
    point.y - centerY,
    point.z - centerZ
  );
  const mmm = SSmap.Matrix4.fromTranslation(pos);
  parentEntity.transform.matrix = mmm;
  // parPoint.x = toRaw(floorGeomList[0]).parentEntity.transform.position.x;
  // parPoint.y = toRaw(floorGeomList[0]).parentEntity.transform.position.y;
  // parPoint.z = toRaw(floorGeomList[0]).parentEntity.transform.position.z;
  // console.log("parPoint11", parPoint.x);
  parentPosition.value.x = parentEntity.transform.position.x;
  parentPosition.value.y = parentEntity.transform.position.y;
  parentPosition.value.z = parentEntity.transform.position.z;
  // geometry.forEach((i) => {
  //   debugger;
  //   let geo = toRaw(i);
  //   let position = geo.transform.matrix;
  //   let newPoint = SSmap.Matrix4.multiply(position, mmm);
  //   geo.transform.matrix = newPoint;
  //   // if (geo.name.includes("poly")) {
  //   //   let pointArr = geo.pointArr;
  //   //   pointArr.forEach((i) => {
  //   //     let point = toRaw(i);
  //   //     // let newPoint = SSmap.Matrix4.multiplyByVector3(position, mmm);
  //   //     point.transform.position = newPoint;
  //   //   });
  //   // }
  // });

  // pointArray.forEach((i) => {
  //   let exArr = [];
  // });

  if (moveBuild.value) {
    // redrawExtru();
    ElMessage.info("移动建筑成功");
    document.getElementById("qtcanvas").removeEventListener("click", moveExtru);
    document.getElementById("qtcanvas").style.cursor = "default";
  }
};

const openDraw = () => {
  showInfo.value = true;
  editBuild.value = true;
  floorList.length = 0;
  pointList.length = 0;
  floorGeomList.length = 0;
  floorList.push({ name: floorList.length + 1 + "层", input: 3 });
  drawBuild();
};
const floorMin = () => {
  floorvalue.value = floorvalue.value - 1;

  if (floorvalue.value < 1) {
    floorvalue.value = 1;
  } else {
    floorList.pop();
    removeFloor();
  }
};
const floorMax = (index) => {
  floorvalue.value = floorvalue.value + 1;
  console.log(floorList, "floorList");
  let poins = floorList[floorList.length - 1].pointArr;
  floorList.push({
    name: floorList.length + 1 + "层",
    input: peiInput.value * 1,
    pointArr: poins,
  });
  let obj = {
    height: peiInput.value, //高度
    altitude: floorList.length - 1,
  };
  addFloor(obj);
};
const currentDelete = (item, index) => {
  console.log("currentDelete", item, index);
  floorList.splice(index, 1);
  removeFloor();
  floorList.forEach((i, index) => {
    i.name = index + 1 + "层";
  });
};

const currentInput = (item, index) => {
  if (!/^\d*\.?\d*$/.test(item.input) || item.input <= 0) {
    ElMessage.error("请输入大于0数字");
    item.input = 3;
    // return;
  }
  item.input *= 1;
  changeHeight(item, index);
};

const drawBuild = () => {
  document
    .getElementById("qtcanvas")
    .addEventListener("click", mouseClickEvent);
  document.getElementById("qtcanvas").style.cursor = "crosshair";
  document
    .getElementById("qtcanvas")
    .addEventListener("contextmenu", ContextMenuEvent);
  ElMessage.info("左键获取,右键结束");
};
const mouseClickEvent = (event) => {
  let point = getWorldPosition(event);
  pointList.push(point);
  let la = point.toCartographic().toDegrees();
  if (pointList.length > 0) {
    let obj = {
      width: 3,
      alpha: 1,
      pointArr: toRaw(pointList),
      color: SSmap.Color.fromRgb(83, 255, 26, 255),
      altitude: SSmap.AltitudeMethod.Absolute,
      depthTest: false,
      name: "polyline",
    };
    let tLine = drawPolyline(obj);
    threeList.push(tLine);
    let area = calSpaceArea(toRaw(pointList));

    document
      .getElementById("qtcanvas")
      .addEventListener("mousemove", mousemoveEvent);
    // console.log("area", area);
  }
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
const addFloor = (val) => {
  redrawExtru();
};
const removeFloor = (val) => {
  let lastElement = toRaw(floorGeomList)[toRaw(floorGeomList).length - 1];
  floorGeomList.pop();
  lastElement.delete();
  console.log(floorList, "floor");
  redrawExtru();
};
const cutHeight = (item, index) => {
  //   if (floorList.length < 2) return;
  item.input--;
  console.log("cutHeight", item, index);
  changeHeight(item, index);
};
const addHeight = (item, index) => {
  item.input++;
  console.log("addHeight", item, index);
  changeHeight(item, index);
};
const changeHeight = (item, index) => {
  console.log("changeHeight", item, index, floorList, floorGeomList);
  redrawExtru();
};
const redrawExtru = (number) => {
  // let exArr = [];
  console.log("redrawExtru", pointList, allPointList, floorList);
  console.log(floorList[0].pointArr, "floorList222");
  // if (number) {
  //   floorGeomList.length = 0;
  //   // pointList.length = 0;
  //   // geoList[number].pointList.forEach((i) => {
  //   //   pointList.push(i);
  //   // });
  //   geoList[number].geo.forEach((i) => {
  //     floorGeomList.push(i);
  //   });
  // }
  // pointList.forEach((item) => {
  //   exArr.push(toRaw(item).toCartesian3());
  // });
  topPointList.length = 0;
  let parPoint = SSmap.Vector3.create(0, 0, 0);
  if (toRaw(floorGeomList[0]).parentEntity.objectName == "parentBulid") {
    // parPoint = toRaw(floorGeomList[0]).parentEntity.transform.position;
  }
  let length = floorGeomList.length;
  for (var i = length - 1; i > -1; i--) {
    toRaw(floorGeomList[i]).delete();
    floorGeomList.splice(i, 1);
    delete toRaw(floorGeomList[i]);
  }
  let liftHeight = 0;

  for (let i = 0; i < floorList.length; i++) {
    if (floorList[i].pointArr == undefined) return;
    let exArr = [];
    let points = [];
    floorList[i].pointArr.forEach((item) => {
      console.log("item666", parentPosition.value);
      let px = toRaw(item).x + toRaw(parentPosition.value).x;
      let py = toRaw(item).y + toRaw(parentPosition.value).y;
      let pz = toRaw(item).z + toRaw(parentPosition.value).z;
      let chP = SSmap.Vector3.create(px, py, pz);
      exArr.push(toRaw(chP).toCartesian3());
      points.push(toRaw(chP));
    });
    let center = calculatePolygonCenter(toRaw(points));
    centerPoint.value = center;
    let item = floorList[i];
    let obj;
    if (i == floorList.length - 1) {
      obj = {
        height: item.input * 10, ////高度
        alpha: 1, //透明度
        pointArr: exArr,
        color: SSmap.Color.fromRgb(255, 255, 255, 255), //填充颜色
        name: "tPoly",
        altitude: liftHeight * 10, //建筑的海拔高度 z轴
      };

      if (showInfo.value) {
        let pps = [];
        points.forEach((item) => {
          pps.push(toRaw(item));
        });
        pps.push(points[0]);
        let lineObj = {
          width: 3,
          alpha: 1,
          pointArr: pps,
          color: SSmap.Color.fromRgb(83, 255, 26, 255),
          altitude: SSmap.AltitudeMethod.Absolute,
          depthTest: false,
          height: liftHeight * 10 + item.input * 10,
          name: "tLine",
        };
        let tLine = drawPolyline(lineObj);
        // let lineObj1 = {
        //   width: 3,
        //   alpha: 1,
        //   pointArr: pps,
        //   color: SSmap.Color.fromRgb(83, 255, 26, 255),
        //   altitude: SSmap.AltitudeMethod.Absolute,
        //   depthTest: false,
        //   height: liftHeight * 10,
        //   name: "tLine",
        // };
        // let tLine1 = drawPolyline(lineObj1);

        floorGeomList.push(tLine);
        points.forEach((pp, index) => {
          let pointObj = {
            position: toRaw(pp), //坐标
            name: "tPoint",
            url: "src/images/circle.png", //路径
            scale: 0.5, //比例
            objectName: "tPoint",
            altitude: liftHeight * 10 + item.input * 10, //海拔，非必填
            // imageWidth:0,
            // imageHeight:0,
            altitudeMethod: SSmap.AltitudeMethod.Absolute, //Absolute 绝对海拔  OnTerrain 贴地 RelativeToTerrain 贴地并相对海拔
          };
          // if (pointList.length == index) return;
          let tPoint = addBillboard(pointObj);

          floorGeomList.push(tPoint);
          topPointList.push(tPoint);
        });

        document
          .getElementById("qtcanvas")
          .addEventListener("mousedown", checkPoint);
      }
    } else {
      obj = {
        height: item.input * 10, ////高度
        alpha: 1, //透明度
        pointArr: exArr,
        color: SSmap.Color.fromRgb(255, 255, 255, 255), //填充颜色
        name: "pickpolygon",
        altitude: liftHeight * 10, //建筑的海拔高度 z轴
      };
      lastBuildPosition.value = points;
    }

    liftHeight += item.input;
    totalHeight.value = liftHeight;
    let extru = drawPolygonGeometry(obj);
    floorGeomList.push(extru);
  }
};
//移动最上层建筑
const checkPoint = () => {
  let feature = window.GlobalViewer.scene.getFeatureByMouse();
  if (!feature) return;
  let name = feature.getProperty("name");
  console.log("checkPoint", feature, name);
  if (name == "tPoint") {
    let cameraCtrl = GlobalViewer.scene.mainCamera.cameraController();
    cameraCtrl.enableInputs = false;
    ElMessage.info("选中点位");
    // document
    //   .getElementById("qtcanvas")
    //   .addEventListener("mousemove", movePoint);
    checkPointVal.value = feature;
    document
      .getElementById("qtcanvas")
      .addEventListener("mousemove", movePoint);
    document.getElementById("qtcanvas").style.cursor = "pointer";

    document.getElementById("qtcanvas").addEventListener("mouseup", mouseUp);
  }
};
const movePoint = (e) => {
  document
    .getElementById("qtcanvas")
    .removeEventListener("mousedown", checkPoint);
  let point = getWorldPosition(e);
  let feature = window.GlobalViewer.scene.getFeatureByMouse();
  // if (!feature) return;
  // let name = feature.getProperty("name");
  if (
    !checkPointVal.value &&
    !checkPointVal.value.parent.url.includes("circle")
  )
    return;
  // if (name == "tPoint") {

  // console.log("movePoint", point);
  let ppp = point.toCartographic().toDegrees();
  var pt = turf.point([ppp.longitude, ppp.latitude]);
  // let pt = { x: point.x, y: -point.z };
  let ppList = [];
  lastBuildPosition.value.forEach((i) => {
    let point = toRaw(i).toCartographic().toDegrees();
    let obj = [point.longitude, point.latitude];
    // let obj = { x: toRaw(i).x, y: -toRaw(i).z };
    ppList.push(obj);
  });
  ppList.push(ppList[0]);
  // let bb = JSON.stringify(ppList);
  // console.log("999999", bb);
  var poly = turf.polygon([ppList]);

  // let result = isInPolygon(pt, poly);
  let result = turf.booleanPointInPolygon(pt, poly);
  // console.log("4444", result, lastBuildPosition.value, feature);
  if (!result) return;
  toRaw(checkPointVal.value).parent.position = point;
  updatePoly();
  // }
};
const updatePoly = () => {
  //删除之前的顶层几何体及线条
  toRaw(floorGeomList[floorGeomList.length - 1]).delete();
  floorGeomList.pop();
  floorGeomList.forEach((item, index) => {
    if (toRaw(item).name == "tLine") {
      toRaw(item).delete();
      floorGeomList.splice(index, 1);
    }
  });
  pointList.length = 0;

  topPointList.forEach((item) => {
    pointList.push(toRaw(item).position);
  });

  floorList[floorList.length - 1].pointArr = [...pointList];
  reTopBuild();
};
const reTopBuild = () => {
  let height = 0;
  let alti = floorList[floorList.length - 1].input;
  floorList.forEach((item, index) => {
    if (index == floorList.length - 1) return;
    height += item.input;
  });

  let topArr = [];
  let pps = [];
  pointList.forEach((item) => {
    pps.push(toRaw(item));
    topArr.push(toRaw(item).toCartesian3());
  });
  pps.push(pps[0]);
  let lineObj = {
    width: 3,
    alpha: 1,
    pointArr: pps,
    color: SSmap.Color.fromRgb(83, 255, 26, 255),
    altitude: SSmap.AltitudeMethod.Absolute,
    depthTest: false,
    height: height * 10 + alti * 10,
    name: "tLine",
  };
  let tLine = drawPolyline(lineObj);
  floorGeomList.push(tLine);
  let obj = {
    height: alti * 10, ////高度
    alpha: 1, //透明度
    pointArr: topArr,
    name: "tPoly",
    color: SSmap.Color.fromRgb(255, 255, 255, 255), //填充颜色
    name: "pickpolygon",
    altitude: height * 10, //建筑的海拔高度 z轴
  };

  let extru = drawPolygonGeometry(obj);
  floorGeomList.push(extru);
  // redrawExtru();
  console.log("reTopBuild", pointList);
};
const mouseUp = () => {
  redrawExtru();
  // document
  //   .getElementById("qtcanvas")
  //   .removeEventListener("mousedown", checkPoint);
  document
    .getElementById("qtcanvas")
    .removeEventListener("mousemove", movePoint);
  document.getElementById("qtcanvas").style.cursor = "default";
  let cameraCtrl = GlobalViewer.scene.mainCamera.cameraController();
  cameraCtrl.enableInputs = true;
};

const savePoint = () => {
  editBuild.value = false;
  // document.getElementById("qtcanvas").removeEventListener("mousedown", checkPoint);
  document
    .getElementById("qtcanvas")
    .removeEventListener("mousedown", checkPoint);
  document.getElementById("qtcanvas").removeEventListener("mouseup", mouseUp);
  floorGeomList.forEach((item) => {
    if (item.name == "tPoint" || item.name == "tLine") {
      // debugger;
      toRaw(item).enabled = false;
    }
  });
};

const editCurrentGeo = (item, index) => {
  editBUtton.value = true;
  editBuild.value = true;
  if (showInfo.value) {
    ElMessage.info("建筑正在编辑中");
    return;
  }
  // if (nowItem.value) {
  //   item = { ...nowItem.value };
  //   index = nowBuild.value;
  // }
  // cloneFloorList = [...floorList];
  // cloneGeoList = [...floorGeomList];
  checkEdit.value = index;
  floorList.length = 0;
  pointList.length = 0;
  floorGeomList.length = 0;
  let length = floorGeomList.length;
  for (var i = length - 1; i > -1; i--) {
    toRaw(floorGeomList[i]).delete();
    floorGeomList.splice(i, 1);
    delete toRaw(floorGeomList[i]);
  }
  cloneFloorList.length = 0;
  cloneGeoList.length = 0;
  console.log("editCurrentGeo", item, index);
  let pointArr = item.allPointList[index];
  let geoList = item.geo;

  toRaw(item.edit).forEach((i, index) => {
    let pointList = [];
    if (toRaw(geoList[0]).parentEntity.objectName == "parentBulid") {
      // let point = toRaw(item).geo[0];

      // return;
      console.log(toRaw(i.pointArr[0]).x, "999999");
      let parent = toRaw(item.geo[0]).parentEntity.transform.position;
      i.pointArr.forEach((item1) => {
        // if (toRaw(item1).name.includes("poly")) {

        //   let self = toRaw(item1).transform.matrix;
        //   let world = SSmap.Matrix4.multiply(parent, self);
        //   toRaw(item1).transform.matrix = world;
        //   console.log(toRaw(item1).transform.matrix, "8888888");
        //   let point = toRaw(item1).transform.position;
        //   pointList.push(point);
        // }

        // debugger;
        // return;
        // let parx = toRaw(geoList[0]).parentEntity.transform.position.x;
        // let pary = toRaw(geoList[0]).parentEntity.transform.position.y;
        // let parz = toRaw(geoList[0]).parentEntity.transform.position.z;
        // toRaw(item1).x -= parx;
        // toRaw(item1).y -= pary;
        // toRaw(item1).z -= parz;

        // toRaw(item1).x += parent.x;
        // toRaw(item1).y += parent.y;
        // toRaw(item1).z += parent.z;
        // let chP = SSmap.Vector3.create(px, py, pz);
        // toRaw(item1).x = chP.x;
        // toRaw(item1).y = chP.y;
        // toRaw(item1).z = chP.z;
        console.log(toRaw(item1).x, "4444444", parent.x);
      });
    }
    console.log(toRaw(i.pointArr[0]).x, "7777");

    // i.pointArr.forEach((i, ind) => {
    //   toRaw(i).x = toRaw(pointArr[ind]).x;
    //   toRaw(i).y = toRaw(pointArr[ind]).y;
    //   toRaw(i).z = toRaw(pointArr[ind]).z;
    // });

    floorList.push(i);
    cloneFloorList.push(i);
  });
  console.log(floorList[0].pointArr, "floorList111");
  pointArr.forEach((i) => {
    pointList.push(i);
  });
  geoList.forEach((i) => {
    floorGeomList.push(i);
    cloneGeoList.push(i);
  });

  showInfo.value = true;
  redrawExtru();
};

const mousemoveEvent = (event) => {
  let point = getWorldPosition(event);
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
    name: "polyline",
  };
  let movePoly = drawPolyline(obj);
  moveList.push(movePoly);
  if (pointList.length > 1) {
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
  if (pointList.length < 3) return;
  console.log("ContextMenuEvent");
  // pointList.push(pointList[0]);
  floorList[0].pointArr = [...pointList];
  let obj = {
    width: 3,
    alpha: 1,
    pointArr: toRaw(pointList),
    color: SSmap.Color.fromRgb(83, 255, 26, 255),
    altitude: SSmap.AltitudeMethod.Absolute,
    depthTest: false,
    name: "polyline",
  };
  let center = calculatePolygonCenter(toRaw(pointList));
  centerPoint.value = center;
  let tLine = drawPolyline(obj);
  threeList.push(tLine);
  let length = threeList.length;
  for (var i = length - 1; i > -1; i--) {
    toRaw(threeList[i]).delete();
    threeList.splice(i, 1);
    delete toRaw(threeList[i]);
  }
  let pointArr = [];
  pointList.forEach((item) => {
    // point.toCartesian3().toCartographic()
    pointArr.push(toRaw(item));
  });
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

  //   let polyGeometry = drawPolygon3D(polygongeometryObj);
  //   //   let polyGeometry = drawPolygonGeometry(polygongeometryObj);
  //   threeList.push(polyGeometry);
  let exArr = [];
  pointList.forEach((item) => {
    exArr.push(toRaw(item).toCartesian3());
  });

  let polyObj = {
    height: 30, ////高度
    alpha: 1, //透明度
    pointArr: exArr,
    color: SSmap.Color.fromRgb(255, 255, 255, 255), //填充颜色
    name: "pickpolygon",
    altitude: 0 * 30, //建筑的海拔高度
  };
  let extru = drawPolygonGeometry(polyObj);
  floorGeomList.push(extru);

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
  //   console.log("area", area, center);
};

onMounted(() => {
  // geoList.unshift({ name: "建筑1", checked: false });
});
</script>

<style lang="scss" scoped>
.create {
  position: absolute;
  top: 6px;
  left: 520px;
  width: 300px;
  height: 20px;
  p {
    color: white;
  }
  .content {
    .build {
      padding: 0 12px;
      background-color: #ccc;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .self-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #ccc;
      padding: 0 16px;
    }
  }

  .open-build {
    background-color: #ccc;
    position: absolute;
    top: 30px;
    left: 340px;
    padding: 12px 12px;
    .floor {
      height: 50px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
  .add-floor {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    .add-floor-right {
      display: flex;
    }
  }
}
</style>
