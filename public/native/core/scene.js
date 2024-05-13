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

/**
 * 加载3d-tiles
 */
export const Tileset = {
  add(options) {
    // debugger;
    // if (cache.tileset) {
    //   return;
    // }
    let scene = GlobalViewer.scene;
    let tileset = new SSmap.Tileset(options.url);

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
};
