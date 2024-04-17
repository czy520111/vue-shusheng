<template>
  <div class="test">
    <p>测量</p>
    <div class="mb-4">
      <el-button @click="setLine" type="primary">线长</el-button>
      <el-button @click="setCoordinate" type="primary">坐标</el-button>
      <el-button type="primary">面积</el-button>
      <el-button type="primary">体积</el-button>
      <!-- <el-button type="danger">Danger</el-button> -->
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ElMessage } from "element-plus";
import { useUsersStore } from "../store";
import { ref } from "vue";
const store = useUsersStore();
const text = ref("");
const check = ref(false);
let pointArr = ref([]);
const setLine = () => {
  pointArr.value = [];
  store.changePointArr([]);
  check.value = true;
  store.check = 1;
  ElMessage.info("左键获取，右键结束");
  console.log("setLine", store.worldPosition, store.check);
  pointArr.value.push(store.worldPosition);
  if (pointArr.value.length > 1 && check.value) {
    debugger;
    let end = pointArr[pointArr.length - 1];
    let distance = end.distance(store.WorldPosition);
    console.log("distance", distance);
  } else {
    check.value = false;
  }
};
const getDistance = (start: any, end: any) => {
  return start.distance(end);
};
const setCoordinate = () => {
  ElMessage.info("左键获取，右键结束");
  console.log("setCoordinate");
};
</script>

<style lang="scss" scoped>
.test {
  position: absolute;
  top: 0px;
  left: 200px;
  width: 500px;
  height: 200px;
  p {
    color: white;
  }
}
</style>
