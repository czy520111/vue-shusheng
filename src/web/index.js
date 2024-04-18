import { useUsersStore } from "../store";
import { distanceBetweenPoints } from "../editor/math";

import { toRaw } from "vue";
let Web = {
  //3d场景初始化回调
  initMap() {
    Native.setAuthorize();

    let position = {
      longitude: 114.054494,
      latitude: 22.540745,
      height: 1300,
    };
    Native.cameraFlyTo(position);
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
  getPosition(e) {
    const store = useUsersStore();
    let scene = GlobalViewer.scene;
    var ray = scene.mainCamera.screenPointToRay(e.x, e.y);
    var hit = new SSmap.RaycastHit();
    let result = null;
    if (scene.raycast(ray, hit)) {
      console.log("hit");
      result = hit.point.toCartesian3().toCartographic(); //获取射和实体的交点
      // let a = GlobalViewer.scene.getWorldPositionByMouse(result);
      store.result = result.toVector3();
    }
    hit.delete();
    store.changeposition(result);
    const check = store.check;
    const pointArr = store.pointArr;
    debugger;

    var xyposition = scene.mainCamera.worldToScreenPoint(result);
    console.log(result, "666", store.result, store.$state);

    if (check == 1) {
      pointArr.push(result.toVector3());

      // let sphere = new SSmap.Sphere3D();
      // sphere.radii = SSmap.Vector3.create(100.0, 100.0, 100.0);
      // sphere.color = SSmap.Color.fromRgb(0, 255, 0, 255);
      // sphere.radius = 1000.0;
      // sphere.position = SSmap.Cartographic.fromDegrees(
      //   result.longitude,
      //   result.latitude,
      //   result.height
      // ).toVector3();
      // sphere.create();

      // let sphereEntity = sphere.createEntity();
      // sphereEntity.parent = SSmap.Entity.root();

      let pyramid = new SSmap.Pyramid3D();
      pyramid.position = SSmap.Cartographic.fromDegrees(
        result.longitude,
        result.latitude,
        result.height
      ).toVector3();
      pyramid.color = SSmap.Color.fromRgb(0, 240, 0, 255);
      pyramid.width = 1000.0;
      pyramid.length = 2000.0;
      pyramid.height = 2000.0;
      pyramid.create();

      let pyramidEntity = pyramid.createEntity();
      // pyramidEntity.add(pyramid);
      pyramidEntity.parent = SSmap.Entity.root();
      // if (pointArr.length > 1) {
      //   let end = pointArr[pointArr.length - 2];
      //   // let distance = end.distanceToPoint(store.result);
      //   let distance = distanceBetweenPoints(toRaw(end), toRaw(store.result));
      //   console.log("distance", distance);
      // }
    }
  },
  removeContextmenu() {
    console.log("清除");
    const store = useUsersStore();
    store.changeCheck(0);
  },
};

export default Web;
