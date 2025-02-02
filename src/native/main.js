//绘图对象缓存
const cache = {};

/**
 * 数生sdk鉴权
 */
export function setAuthorize() {
  GlobalViewer.setAuthorizedUrl(
    "https://www.dataarche.com:8062/authentic/license?t=2023-03-21T11:09:37.152"
  );
}

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

/**
 * 相机定位
 * @param {Object} position -位置（卡托坐标）
 * @param {Number} position.longitude -经度(欧拉角)
 * @param {Number} position.latitude -纬度(欧拉角)
 * @param {Number} position.height -高度(米)
 * @param {Object} [orientation] -朝向
 * @param {Number} [orientation.heading=0] -转向角(欧拉角)
 * @param {Number} [orientation.pitch=-90] -俯仰角(欧拉角)
 * @param {Number} [orientation.roll=0] -翻滚角(欧拉角)
 * @param {Number} [duration=2] -飞行时间(s)
 */
export function cameraFlyTo(position, orientation, duration = 2) {
  let scene = GlobalViewer.scene;
  let camera = scene.mainCamera;
  let cameraController = camera.cameraController();
  position = SSmap.Cartographic.fromDegrees(
    position.longitude,
    position.latitude,
    position.height
  );
  position = position.toVector3();
  orientation = orientation
    ? orientation
    : {
        heading: 0,
        pitch: -90,
        roll: 0,
      };
  cameraController.flyTo(
    position,
    duration,
    orientation.heading,
    orientation.pitch,
    orientation.roll
  );
}

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
 * 加载3d-tiles
 */
export const Tileset = {
  add(options) {
    if (cache.tileset) {
      return;
    }

    let scene = GlobalViewer.scene;
    let tileset = new SSmap.Tileset(options.url);

    let entity = new SSmap.Entity();
    entity.addComponent(tileset);
    scene.addEntity(entity);

    cache.tileset = tileset;
  },
  remove() {
    if (cache.tileset) {
      cache.tileset.delete();
      cache.tileset = null;
    }
  },
};
