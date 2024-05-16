// import { toRaw } from "vue";

//地形
export const Terrain = {
  add(options, cb) {
    GlobalViewer.scene.globe
      .setTerrainProviderUrl(options.url)
      .then(function () {
        cb && cb();
      });
  },
  remove() {
    GlobalViewer.scene.globe.setDefaultTerrain();
  },
};

/**
 * 加载Arcgis影像(DOM)
 */
export function addArcGisImagery() {
  let url =
    "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer";
  let scene = GlobalViewer.scene;
  let globe = scene.globe;
  globe.addArcGisMapServerImageryLayer(url || arcGisImageryUrl);
}

//globe
export const Glbset = {
  add(optins) {
    let model = new SSmap.Model(optins.url);

    var entity = new SSmap.Entity();
    entity.addComponent(model);
    let pos = SSmap.Cartographic.fromDegrees(113.930397051, 22.6339379087, 30);
    model.transform.cartographic = pos;
    GlobalViewer.scene.addEntity(entity);
  },
};
