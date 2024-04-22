<template>
  <div class="create">
    <el-button type="primary" @click="showContent = true">创建</el-button>
    <div class="content" v-if="showContent">
      <div class="build">
        <p>建筑名称</p>
        <!-- <el-icon><Close /></el-icon> -->
        <el-button :icon="Close" @click="showContent = false" circle />
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
            <el-button :icon="DeleteFilled" circle />
          </el-tooltip>
        </div>
      </div>
      <div class="content-info">
        <div class="info-arr" v-for="(item, index) in geoList">
          <div class="self-info">
            <p>{{ item.name }}</p>
            <div>
              <el-tooltip content="定位" placement="top">
                <el-button :icon="LocationInformation" circle />
                <!-- <el-icon><LocationInformation /></el-icon> -->
              </el-tooltip>
              <el-tooltip content="编辑" placement="top">
                <el-button :icon="EditPen" circle />
              </el-tooltip>
              <el-tooltip content="移动" placement="top">
                <el-button :icon="Rank" circle />
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
      <el-button @click="showInfo = false" :icon="Close"></el-button>
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
} from "../editor/math.js";

import {
  drawPolyline,
  drawLabel,
  drawPolygonGeometry,
  drawPolygon3D,
} from "../editor/draw.js";

const showContent = ref(false);
const showInfo = ref(false);
const geoList = reactive([]);
const inputValue = ref("建筑1");
const floorvalue = ref(1);
const floorList = reactive([]); //内部结构数组
const bulidHeight = ref(3);
const peiInput = ref(3);
const totalHeight = ref(3);
//几何体
const pointList = reactive([]);
const threeList = reactive([]);
const moveList = reactive([]);
const polyList = reactive([]);
const floorGeomList = reactive([]);

const addList = () => {
  inputValue.value = "建筑" + (geoList.length + 1);
  geoList.unshift({ name: "建筑" + (geoList.length + 1), checked: false });
};
const openDraw = () => {
  showInfo.value = true;
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
  floorList.push({
    name: floorList.length + 1 + "层",
    input: peiInput.value * 1,
  });
  let obj = {
    height: peiInput.value, //高度
    altitude: floorList.length - 1,
  };
  addFloor(obj);
};
const currentDelete = (item, index) => {
  console.log("currentDelete", item, index);
  debugger;
  floorList.splice(index, 1);
  removeFloor();
  floorList.forEach((i, index) => {
    i.name = index + 1 + "层";
  });
};

const currentInput = (item, index) => {
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
const redrawExtru = () => {
  let exArr = [];
  pointList.forEach((item) => {
    exArr.push(toRaw(item).toCartesian3());
  });
  let length = floorGeomList.length;
  for (var i = length - 1; i > -1; i--) {
    toRaw(floorGeomList[i]).delete();
    floorGeomList.splice(i, 1);
    delete toRaw(floorGeomList[i]);
  }
  let liftHeight = 0;
  for (let i = 0; i < floorList.length; i++) {
    let item = floorList[i];

    let obj = {
      height: item.input * 10, ////高度
      alpha: 1, //透明度
      pointArr: exArr,
      color: SSmap.Color.fromRgb(255, 255, 255, 255), //填充颜色
      name: "pickpolygon",
      altitude: liftHeight * 10, //建筑的海拔高度 z轴
    };
    liftHeight += item.input;
    totalHeight.value = liftHeight;
    let extru = drawPolygonGeometry(obj);
    floorGeomList.push(extru);
  }
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
  pointList.push(pointList[0]);
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
  geoList.unshift({ name: "建筑1", checked: false });
});
</script>

<style lang="scss" scoped>
.create {
  position: absolute;
  top: 62px;
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
