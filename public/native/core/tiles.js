import { pickWorldPositionByMouse, vec3ToJson } from "../editor/math.js";
/**
 * 加载3d-tiles
 */
export let tilesArr = [];
export const Tileset = {
  add(options, cb) {
    // const store = useUsersStore();
    // debugger;
    // if (cache.tileset) {
    //   return;
    // }
    let scene = GlobalViewer.scene;
    let tilesetLayer = new SSmap.TilesetLayer();
    tilesetLayer.url = options.url;
    tilesetLayer.clipLevelOfDetail = true;
    tilesetLayer.skipLevelOfDetail = false;
    tilesetLayer.streamingMode = true;
    tilesetLayer.maximumMemoryUsage = 1024;
    tilesetLayer.componentComplete();
    // window.tilesArr = arr;
    // console.log("tilesetLayer", options.store);
    // if (store.tilesArr.length > 20) {
    //   debugger;
    //   toRaw(store.tilesArr[16]).enabled = false;
    // }
    tilesArr.push(tilesetLayer);
    cb(tilesetLayer);
    return;

    let entity = new SSmap.Entity();
    entity.addComponent(tileset);
    scene.addEntity(entity);
    let bbb = tileset.contentLoaded(function (entity) {
      // console.log("contentLoaded", entity);
      entity.travalRenderers(function (renderer) {
        let material = renderer.material;
        let roug = renderer.material.roughness;
        let opacity = renderer.material.opacity;
        let color = {
          r: material.color.red,
          g: material.color.green,
          b: material.color.blue,
        };
        let text = material.texture;
        console.log("renderer", renderer.material, roug, opacity, color, text);
      });
    });
    window.boxColor1 = { r: 237, g: 235, b: 227, a: 1 }; //外围色
    window.boxColor2 = { r: 203, g: 213, b: 211, a: 1 };
    window.boxColor3 = {
      //花园色
      r: 199,
      g: 225,
      b: 171,
      a: 1,
    };
    window.boxColor4 = {
      //停车色
      r: 245,
      g: 195,
      b: 151,
      a: 1,
    };
    window.boxColor5 = {
      //玻璃
      r: 219,
      g: 255,
      b: 255,
      a: 0.75,
    };
    // console.log(bbb, "889988");
  },
  remove() {
    if (cache.tileset) {
      cache.tileset.delete();
      cache.tileset = null;
    }
  },
  pickFeature(options, cb) {
    let scene = GlobalViewer.scene;
    let data = {
      position: { x: 0, y: 0, z: 0 },
      properties: null,
    };
    scene.pickFeature(options.x, options.y).then((feature) => {
      if (feature) {
        let properties = {};
        console.log("gggggfeature", feature.boundingVolume.center);
        // debugger;
        let nameList = feature.propertyNames();
        let size = nameList.size();

        for (let i = 0; i < size; i++) {
          let key = nameList.get(i);
          let value = feature.getProperty(key);
          //   let boundingVolume = feature.getProperty("boundingVolume");
          properties[key] = value;
        }

        data.properties = properties;
        let point = pickWorldPositionByMouse(options.x, options.y);
        data.position = vec3ToJson(point);
      }
      cb(data);
    });
  },
};
