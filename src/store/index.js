import { defineStore } from "pinia";

export const useUsersStore = defineStore("app", {
  state: () => {
    return {
      check: 0,
      worldPosition: {},
      pointArr: [],
      tilesArr: [],
    };
  },
  getters: {},
  actions: {
    changeCheck(val) {
      this.check = val;
    },
    changeposition(val) {
      this.worldPosition = val;
    },
    changePointArr(val) {
      this.pointArr = val;
    },
  },
});
