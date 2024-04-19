<template>
  <div>{{ msg }}}</div>
</template>

<script lang="ts" setup>
import { ref, defineProps } from "vue";
import { useUsersStore } from "../store";
import { getWorldPosition } from "../editor/math";
import { ElMessage } from "element-plus";
const store = useUsersStore();
const msg = ref("");
</script>

<style lang="scss" scoped></style>
