import { useUsersStore } from "../store";
import { distanceBetweenPoints } from "../editor/math";
import { toRaw } from "vue";
let Web = {
  //3d场景初始化回调
  initMap() {
    Native.setAuthorize();
    console.log("初始化完成", GlobalViewer);
    window.GlobalViewer = GlobalViewer;
    let position = {
      longitude: 114.054494,
      latitude: 22.540745,
      height: 1300,
    };
    Native.cameraFlyTo(position);
    //加载影像
    // Native.addArcGisImagery();

    // //加载地形
    // Native.Terrain.add({
    //   url: "https://www.dataarche.com/static_resource/MultiScreenData/dem/sz",
    // });
  },

  initArcGis() {
    Native.addArcGisImagery();
  },

  addTileset() {
    Native.Tileset.add({
      url: "https://www.dataarche.com/static_resource/MultiScreenData/tileset/sz-tileset/tileset.json",
    });
  },
  removeTileset() {
    Native.Tileset.remove();
  },

  addTerrain() {
    Native.Terrain.add({
      url: "https://www.dataarche.com/static_resource/MultiScreenData/dem/sz",
    });
  },
  removeTerrain() {
    Native.Terrain.remove();
  },
};

export default Web;
