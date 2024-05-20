import { Tileset, tilesArr } from "../core/tiles.js";
// import * as turf from "@turf/turf";
// import { useUsersStore } from "../../../src/store/index.js";
import {
  calculatePolygonCenter,
  vec3ToJson,
  distanceBetweenPoints,
} from "../editor/math.js";
import { drawPolygon3D, drawPolyline } from "../editor/draw.js";
import { scalePolygon, rotatePolygon } from "../math/math.js";
let projectLayer = null;
let tileFeature = null;
let nowNode = null;
let factoryNumber = null;
let modifiedStr = null;
let frame = null;
let landNumber = null;
let nodes = [];
let ProjectFeature = null;
let directionVal = [];
let checkTiles = null;
let nowTile = null;
let floorGeomList = [];
let layers = {};
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

export const Custom = {
  addNode(options, cb) {
    if (!options.data || typeof options.data != "object") {
      throw new TypeError("投影节点data参数需传入geojson数据");
    }

    let defaults = {
      data: null,
      mode: "WholeScene",
      textureSize: 2048,
      colorKey: "",
      style: {
        colorRgba: [255, 255, 255, 1],
        strokeColorRgba: [255, 255, 255, 1],
        selectedColorRgab: [],
        strokeAlpha: "",
        selectedColorAlpha: 1,
        strokeWidth: 0.01,
        alpha: null,
      },
    };
    options = this.mergeOptions(defaults, options);
    projectLayer = new SSmap.ProjectionLayer();
    projectLayer.sceneMode = SSmap.TextureProjectionSceneMode.WholeScene;
    projectLayer.textureSize = options.textureSize;
    projectLayer.beforeTranslucent = true;

    let features = options.data.features; //加载后的jeojson数据
    features.forEach((feature, index) => {
      feature.properties.index = index;
      let coordinates =
        feature.geometry.type == "MultiPolygon"
          ? feature.geometry.coordinates[0]
          : feature.geometry.coordinates;

      //属性关键字重置颜色
      if (options.colorKey) {
        let value = feature.properties[options.colorKey];
        options.style.colorRgba = value;
      } else if (feature.properties.RGBA) {
        let colorArr = feature.properties.RGBA.split(",");

        let colorArrNumber = [
          +colorArr[0],
          +colorArr[1],
          +colorArr[2],
          +colorArr[3],
        ];

        options.style.colorRgba = colorArrNumber;
      }
      let data = {
        style: options.style,
        coordinates: coordinates,
        properties: feature.properties,
      };
      createNode(data);
    });

    //创建投影节点
    function createNode(data) {
      let coordinates = data.coordinates;
      let properties = data.properties;
      let style = data.style;

      let node = new SSmap.ProjectionNode();
      // let uuid = store.add(node);
      const scaleFactor = 1.15;
      let cartoArr = new SSmap.CartographicVector();
      let points = coordinates[0];
      // let newPoints = caclRoid(points);
      let objArr = [];
      points.forEach((point, index) => {
        point = SSmap.Cartographic.fromDegrees(
          point[0],
          point[1],
          0
        ).toVector3();
        if (index == points.length - 1) return;
        objArr.push({ x: point.x, y: point.y, z: point.z });
      });
      // let newPoints = rotatePolygon(objArr, 90);
      let newPoints = scalePolygon(objArr, 8);
      newPoints.push(newPoints[0]);
      // var line = turf.lineString(points);
      // var bbox = turf.bbox(line);

      // var bboxPolygon = turf.bboxPolygon(bbox);
      // let bboxPoint = bboxPolygon.geometry.coordinates[0];
      // let boxPoly = turf.polygon([bboxPoint]);
      // var poly = turf.polygon([points]);
      // var scaledPoly = turf.transformScale(poly, scaleFactor);
      // var intersection = turf.difference(boxPoly, poly);
      // var triangles = turf.tesselate(poly);
      // newPoints.forEach((point, index) => {
      //   let carto = SSmap.Cartographic.fromDegrees(point[0], point[1], 0);
      //   // console.log("88888888", carto, point);

      //   cartoArr.push_back(carto);
      // });

      newPoints.forEach((point, index) => {
        point = SSmap.Vector3.create(point.x, point.y, point.z);
        let carto = point.toCartographic();
        // carto = SSmap.Cartographic.fromDegrees(
        //   carto.longitude,
        //   carto.latitude,
        //   0
        // );
        // console.log("88888888", carto, point);

        cartoArr.push_back(carto);
      });
      node.setPoints(cartoArr);
      cartoArr.delete();

      if (coordinates.length > 1) {
        // 挖洞
        for (let i = 1; i < coordinates.length; i++) {
          let holeList = new SSmap.CartographicVector();
          let holePoints = coordinates[i];
          holePoints.forEach((point) => {
            let carto = SSmap.Cartographic.fromDegrees(point[0], point[1], 0);
            holeList.push_back(carto);
          });
          node.setHole(holeList);
          holeList.delete();
        }
      }

      // 添加属性
      let feature = new SSmap.Feature();
      for (let key in properties) {
        feature.setProperty(key, String(properties[key]));
      }
      feature.setProperty("uuid", "777777");
      node.setFeature(feature);
      node.setColor(SSmap.Color.fromRgb(0, 0, 255, 0.8 * 255));
      if (style.selectedColorRgab.length) {
        node.setSelectedColor(SSmap.Color.fromRgb(0, 0, 255, 0.8 * 255));
      }

      if (style.strokeColorRgba.length) {
        node.setStrokeColor(SSmap.Color.fromRgb(0, 0, 255, 0.8 * 255));
      }
      node.setStrokeWidth(style.strokeWidth);

      projectLayer.addNode(node);
      projectLayer.moveToTop(node);

      nodes.push(node);
    }
    function caclRoid(points) {
      const result = { x: 0, y: 0 };
      points.forEach((point) => {
        result.x += point[0];
        result.y += point[1];
      });
      result.x /= points.length;
      result.y /= points.length;
      // return result;

      // const centroid = points
      //   .reduce(
      //     (acc, point) => {
      //       acc[0] += point[0];
      //       acc[1] += point[1];
      //       return acc;
      //     },
      //     [0, 0]
      //   )
      //   .map((coord) => coord / points.length);

      // const [Cx, Cy] = result;
      let Cx = result.x;
      let Cy = result.y;

      console.log(`质心: (${Cx}, ${Cy})`);

      // 计算新的坐标点
      const scaledPoints = points.map(([x, y]) => {
        const x_new = Cx + 1.5 * (x - Cx);
        const y_new = Cy + 1.5 * (y - Cy);
        return [x_new, y_new];
      });

      return scaledPoints;
    }

    // map.set(projectLayer, nodes);

    //返回投影层id
    // let layerId = store.add(projectLayer, options.id);
    // cb && cb(layerId);
  },
  addProjection(json) {
    this.addNode({
      data: json,
      colorKey: "",
      style: {
        colorRgba: [0, 0, 255, 0.8],
        strokeColorRgba: [0, 0, 255, 0.8],
        selectedColorRgab: [0, 255, 0, 0.8],
        strokeWidth: 0.1,
        selectedColorAlpha: 0.7,
        alpha: 0.7,
      },
    });
    return;
    let sceneMode = "TerrainOnly";
    console.log(json, "jsonnnnnnnnn");
    json.features.forEach((item) => {
      let projectionNode = new window.SSmap.ProjectionNode();
      let points = new window.SSmap.CartographicVector();
      item.geometry.coordinates[0].forEach((j) => {
        j.forEach((k) => {
          points.push_back(k.toCartesian3().toCartographic());
        });
      });
      projectionNode.setPoints(points);
      projectionNode.setColor(window.SSmap.Color.fromRgb(0, 0, 255, 150));
      let projectLayer = layers[sceneMode];
      projectLayer.addNode(projectionNode);
    });
  },
  clearMeasure() {
    tilesArr.forEach((item) => {
      item.enabled = true;
    });
    nodes.forEach((item) => {
      item.setColor(SSmap.Color.fromRgb(255, 255, 255, 0.8 * 255));
      item.setSelectedColor(SSmap.Color.fromRgb(0, 0, 255, 0.8 * 255));
      item.setStrokeColor(SSmap.Color.fromRgb(0, 0, 255, 0.8 * 255));
    });
  },
  //添加投影面
  addProjectionLayer(url) {
    // Native.addProjection(json);
    projectLayer = new SSmap.ProjectionLayer();
    projectLayer.sceneMode = SSmap.TextureProjectionSceneMode.WholeScene;
    let proJson = null;
    fetch(url + "/data/geojson/model-design.json")
      .then((response) => response.json())
      .then((json) => {
        console.log(json, "json");
        json.features.forEach((item) => {
          item.geometry.coordinates[0].forEach((j) => {
            j.forEach((k) => {
              k += 5;
              console.log(k, "kkkkk");
            });
          });
        });
        proJson = json;

        console.log(proJson, "projson");
      });

    // projectLayer = new SSmap.ProjectionLayer();
    // projectLayer.sceneMode = SSmap.TextureProjectionSceneMode.WholeScene;
    // let pdSource = new SSmap.ProjectionDataSource();
    pdSource.setColor(SSmap.Color.fromRgb(0, 0, 255, 150));
    pdSource.setSelectedColor(SSmap.Color.fromRgb(0, 255, 0, 128));
    pdSource.setStrokeWidth(3);
    pdSource.setStrokeColor(SSmap.Color.fromRgb(0, 0, 255, 150));
    //   pdSource.setSelectedStrokeColor(SSmap.Color.fromRgb(0, 255, 0, 128));
    pdSource.addField("Layer"); //需要拾取的属性
    pdSource.addField("area"); //需要拾取的属性
    pdSource.enabled = true;
    // pdSource.loadGeoJson(url + "/data/geojson/model-design.json");
    // projectLayer.addDataSource(pdSource);
  },
  mouseClickEvent(e, cb) {
    // const store = useUsersStore();
    // console.log(store, "123123123");
    // console.log(tilesArr, "8888888888888");
    let feature = projectLayer.getFeatureByMouse();
    // tilesArr[16].enabled = false;
    // console.log(e.arr[0], "feature8888");

    //   (projectLayer).setColor(SSmap.Color.fromRgb(0, 0, 255, 128));
    ProjectFeature = feature;
    console.log(projectLayer, "ppppppppppppp");
    tileFeature = window.GlobalViewer.scene.getFeatureByMouse();
    // console.log(tileFeature.tileset, "tileFeature666666666");
    // tileFeature = feature5;
    // console.log(feature, projectLayer, "789789", projectLayer, feature5);
    // let ce = direction.center().toVector3();
    // if (nowNode && feature) {
    //   nowNode.setColor(SSmap.Color.fromRgb(0, 0, 255, 0.8 * 255)); //一开始颜色
    //   nowNode.setSelectedColor(SSmap.Color.fromRgb(0, 255, 0, 0.8 * 255)); //点击时颜色
    //   // (nowNode).setStrokeWidth(3);
    //   nowNode.setStrokeColor(SSmap.Color.fromRgb(0, 0, 255, 0.8 * 255));
    // }

    if (feature) {
      Tileset.pickFeature({ x: e.x, y: e.y }, (data) => {
        let name = data.properties.name;
        name = name.slice(0, -3);
        tilesArr.forEach((item) => {
          if (item.url.includes(name)) {
            nowTile = item;
          }
        });
      });
      console.log(tileFeature, "tileFeature");
      let Layer = feature.getProperty("Layer");
      let Area = feature.getProperty("area");
      let modified = Layer.substring(0, Layer.lastIndexOf("_"));
      factoryNumber = Layer;
      landNumber = Math.round(Area * 10) / 10;
      modifiedStr = modified;
      // projectLayer.enabled = false;
      console.log(projectLayer, nodes, "66666666");
      nodes.forEach((item) => {
        item.setColor(SSmap.Color.fromRgb(255, 255, 255, 0.8 * 255));
        item.setSelectedColor(SSmap.Color.fromRgb(0, 0, 255, 0.8 * 255));
        item.setStrokeColor(SSmap.Color.fromRgb(0, 0, 255, 0.8 * 255));
      });
      nowNode = projectLayer.getNode(feature);
      nowNode.setColor(SSmap.Color.fromRgb(0, 0, 255, 0.8 * 255));
      nowNode.setSelectedColor(SSmap.Color.fromRgb(0, 0, 225, 0.8 * 255));
      nowNode.setStrokeColor(SSmap.Color.fromRgb(0, 0, 225, 0.8 * 255));
      cb({
        feature: true,
        factoryNumber,
        landNumber,
        modifiedStr,
      });
    }
  },
  createDomLabel(point, cb) {
    let world = SSmap.Vector3.create(point.x, point.y, point.z);
    let tohic = world.toCartesian3().toVector3();
    if (frame) {
      frame.delete();
    }
    frame = new SSmap.FrameAction();
    frame.onTriggered(() => {
      //每一帧改变div的位置
      // debugger;
      var xyposition =
        window.GlobalViewer.scene.mainCamera.worldToScreenPoint(tohic);

      cb({ x: xyposition.x, y: xyposition.y });
      // console.log("456456");
    });
    window.GlobalViewer.scene.rootEntity.addComponent(frame);
  },
  showDeitHandle(cb) {
    directionVal.length = 0;
    nowTile.enabled = false;
    let feature = nowNode.feature();
    feature.enabled = false;
    feature.parent.enabled = false;
    feature.parent.parent.enabled = false;
    let dire = nowTile.tileset().rectangle;
    let southwest = dire.southwest().toVector3();
    let southeast = dire.southeast().toVector3();
    let northeast = dire.northeast().toVector3();
    let northwest = dire.northwest().toVector3();
    directionVal.push(southwest, southeast, northeast, northwest);
    let centerJson = vec3ToJson(calculatePolygonCenter(directionVal));
    cb({
      // center: { x: center.x, y: center.y, z: center.z },
      centerJson,
    });
  },
  //json转Vector3
  vec3ToJson(point, cb) {
    console.log(directionVal, "4444444");
    let l1 = distanceBetweenPoints(directionVal[0], directionVal[1]);
    let l2 = distanceBetweenPoints(directionVal[1], directionVal[2]);
    let length = Math.max(l1, l2);
    console.log(length, "8888888888");
    point = SSmap.Vector3.create(point.x, point.y, point.z);
    cb({
      center: {
        x: point.x,
        y: point.y,
        z: point.z,
      },
      length,
    });
  },
  lastStepBack() {
    directionVal.length = 0;
    let feature = nowNode.feature();
    feature.enabled = true;
    feature.parent.enabled = true;
    feature.parent.parent.enabled = true;
    nowNode.enabled = true;
    nowTile.enabled = true; //设置tiles隐藏
    let length1 = floorGeomList.length;
    for (var i = length1 - 1; i > -1; i--) {
      floorGeomList[i].delete();
      floorGeomList.splice(i, 1);
      delete floorGeomList[i];
    }

    nodes.forEach((item) => {
      item.setColor(SSmap.Color.fromRgb(0, 0, 255, 0.8 * 255));
      item.setSelectedColor(SSmap.Color.fromRgb(0, 0, 255, 0.8 * 255));
      item.setStrokeColor(SSmap.Color.fromRgb(0, 0, 255, 0.8 * 255));
    });
  },
  drawBuild(
    center,
    arr1,
    arr2,
    arr3,
    boxColor,
    boxColor2,
    boxColor3,
    floorRotate,
    steps,
    cb
  ) {
    console.log(floorGeomList, "8888888888", directionVal);
    nowNode.enabled = false;
    let length1 = floorGeomList.length;
    for (var i = length1 - 1; i > -1; i--) {
      floorGeomList[i].delete();
      floorGeomList.splice(i, 1);
      delete floorGeomList[i];
    }
    // console.log(arr1, boxColor.r, this, "7777777777777777");
    // console.log(arr, 44444);
    let e1 = this.drawLine(GlobalViewer.scene, arr1, "1", boxColor, 1);
    let e2 = this.drawLine(GlobalViewer.scene, arr2, "2", boxColor2, 1);
    let e3 = this.drawLine(GlobalViewer.scene, arr3, "3", boxColor3, 1);
    let arr = [];
    arr.push(e1, e2, e3);
    floorGeomList.push(e1, e2, e3);
    center = SSmap.Vector3.create(center.x, center.y, center.z);
    // let carto = center.toCartesian3();
    var selfPosition =
      GlobalViewer.scene.globe.ellipsoid.eastNorthUpToFixedFrame(
        center.toCartesian3()
      );
    const mat = this.rotationEntity(selfPosition, 0, 0, floorRotate, 0);
    const transtion = SSmap.Matrix4.fromTranslation(
      SSmap.Vector3.create(50, -40, 59.5)
    );
    const matrix4 = SSmap.Matrix4.multiply(mat, transtion);
    // console.log(center, matrix4, "4444444444");
    arr.forEach((i) => {
      // console.log(i.transform.matrix, "88888888");
      i.transform.matrix = matrix4;
    });
    this.drawExtru(center, steps);
    // cb("456456");
    // cb(matrix4);
  },
  drawTwoBuild(
    center,
    arr1,
    arr2,
    arr3,
    arr4,
    arr5,
    boxColor,
    boxColor2,
    boxColor3,
    floorRotate,
    steps,
    cb
  ) {
    nowNode.enabled = false;
    let length1 = floorGeomList.length;
    for (var i = length1 - 1; i > -1; i--) {
      floorGeomList[i].delete();
      floorGeomList.splice(i, 1);
      delete floorGeomList[i];
    }
    // console.log(arr1, boxColor.r, this, "7777777777777777");
    // console.log(arr, 44444);
    // allArr.forEach((i) => {
    //   let el = this.drawLine(GlobalViewer.scene, i.arr, i.tag, i.color, 1);
    // });
    let e1 = this.drawLine(GlobalViewer.scene, arr1, "1", boxColor, 1);
    let e2 = this.drawLine(GlobalViewer.scene, arr2, "2", boxColor2, 1);
    let e3 = this.drawLine(GlobalViewer.scene, arr3, "3", boxColor3, 1);
    let e4 = this.drawLine(GlobalViewer.scene, arr4, "1", boxColor, 1);
    let e5 = this.drawLine(GlobalViewer.scene, arr5, "3", boxColor3, 1);
    let arr = [];
    arr.push(e1, e2, e3, e4, e5);
    floorGeomList.push(e1, e2, e3, e4, e5);
    center = SSmap.Vector3.create(center.x, center.y, center.z);
    // let carto = center.toCartesian3();
    var selfPosition =
      GlobalViewer.scene.globe.ellipsoid.eastNorthUpToFixedFrame(
        center.toCartesian3()
      );
    const mat = this.rotationEntity(selfPosition, 0, 0, floorRotate, 0);
    const transtion = SSmap.Matrix4.fromTranslation(
      SSmap.Vector3.create(50, -40, 59.5)
    );
    const matrix4 = SSmap.Matrix4.multiply(mat, transtion);
    // console.log(center, matrix4, "4444444444");
    arr.forEach((i) => {
      // console.log(i.transform.matrix, "88888888");
      i.transform.matrix = matrix4;
    });
    this.drawExtru(center, steps);
    // cb("456456");
    // cb(matrix4);
  },
  drawThreeBuild(
    center,
    arr1,
    arr2,
    arr3,
    arr4,
    arr5,
    arr6,
    arr7,
    arr8,
    boxColor,
    boxColor2,
    boxColor3,
    floorRotate,
    steps,
    cb
  ) {
    nowNode.enabled = false;
    let length1 = floorGeomList.length;
    for (var i = length1 - 1; i > -1; i--) {
      floorGeomList[i].delete();
      floorGeomList.splice(i, 1);
      delete floorGeomList[i];
    }
    // console.log(arr1, boxColor.r, this, "7777777777777777");
    // console.log(arr, 44444);
    // allArr.forEach((i) => {
    //   let el = this.drawLine(GlobalViewer.scene, i.arr, i.tag, i.color, 1);
    // });
    let e1 = this.drawLine(GlobalViewer.scene, arr1, "1", boxColor, 1);
    let e2 = this.drawLine(GlobalViewer.scene, arr2, "2", boxColor2, 1);
    let e3 = this.drawLine(GlobalViewer.scene, arr3, "3", boxColor, 1);
    let e4 = this.drawLine(GlobalViewer.scene, arr4, "1", boxColor, 1);
    let e5 = this.drawLine(GlobalViewer.scene, arr5, "3", boxColor2, 1);
    let e6 = this.drawLine(GlobalViewer.scene, arr6, "1", boxColor3, 1);
    let e7 = this.drawLine(GlobalViewer.scene, arr7, "3", boxColor3, 1);
    let e8 = this.drawLine(GlobalViewer.scene, arr8, "1", boxColor3, 1);
    let arr = [];
    arr.push(e1, e2, e3, e4, e5, e6, e7, e8);
    floorGeomList.push(e1, e2, e3, e4, e5, e6, e7, e8);
    center = SSmap.Vector3.create(center.x, center.y, center.z);
    // let carto = center.toCartesian3();
    var selfPosition =
      GlobalViewer.scene.globe.ellipsoid.eastNorthUpToFixedFrame(
        center.toCartesian3()
      );
    const mat = this.rotationEntity(selfPosition, 0, 0, floorRotate, 0);
    const transtion = SSmap.Matrix4.fromTranslation(
      SSmap.Vector3.create(50, -40, 59.5)
    );
    const matrix4 = SSmap.Matrix4.multiply(mat, transtion);
    // console.log(center, matrix4, "4444444444");
    arr.forEach((i) => {
      // console.log(i.transform.matrix, "88888888");
      i.transform.matrix = matrix4;
    });
    this.drawExtru(center, steps);
    // cb("456456");
    // cb(matrix4);
  },
  drawFourBuild(
    center,
    arr1,
    arr2,
    arr3,
    arr4,
    arr5,
    arr6,
    arr7,
    arr8,
    arr9,
    arr10,
    arr11,
    arr12,
    boxColor,
    boxColor2,
    boxColor3,
    floorRotate,
    steps,
    cb
  ) {
    nowNode.enabled = false;
    let length1 = floorGeomList.length;
    for (var i = length1 - 1; i > -1; i--) {
      floorGeomList[i].delete();
      floorGeomList.splice(i, 1);
      delete floorGeomList[i];
    }
    // console.log(arr1, boxColor.r, this, "7777777777777777");
    // console.log(arr, 44444);
    // allArr.forEach((i) => {
    //   let el = this.drawLine(GlobalViewer.scene, i.arr, i.tag, i.color, 1);
    // });
    let e1 = this.drawLine(GlobalViewer.scene, arr1, "1", boxColor, 1);
    let e2 = this.drawLine(GlobalViewer.scene, arr2, "2", boxColor2, 1);
    let e3 = this.drawLine(GlobalViewer.scene, arr3, "3", boxColor3, 1);
    let e4 = this.drawLine(GlobalViewer.scene, arr4, "1", boxColor, 1);
    let e5 = this.drawLine(GlobalViewer.scene, arr5, "3", boxColor, 1);
    let e6 = this.drawLine(GlobalViewer.scene, arr6, "1", boxColor, 1);
    let e7 = this.drawLine(GlobalViewer.scene, arr7, "3", boxColor3, 1);
    let e8 = this.drawLine(GlobalViewer.scene, arr8, "1", boxColor2, 1);
    let e9 = this.drawLine(GlobalViewer.scene, arr9, "3", boxColor3, 1);
    let e10 = this.drawLine(GlobalViewer.scene, arr10, "1", boxColor2, 1);
    let e11 = this.drawLine(GlobalViewer.scene, arr11, "3", boxColor2, 1);
    let e12 = this.drawLine(GlobalViewer.scene, arr12, "1", boxColor3, 1);
    let arr = [];
    arr.push(e1, e2, e3, e4, e5, e6, e7, e8, e9, e10, e11, e12);
    floorGeomList.push(e1, e2, e3, e4, e5, e6, e7, e8, e9, e10, e11, e12);
    center = SSmap.Vector3.create(center.x, center.y, center.z);
    // let carto = center.toCartesian3();
    var selfPosition =
      GlobalViewer.scene.globe.ellipsoid.eastNorthUpToFixedFrame(
        center.toCartesian3()
      );
    const mat = this.rotationEntity(selfPosition, 0, 0, floorRotate, 0);
    const transtion = SSmap.Matrix4.fromTranslation(
      SSmap.Vector3.create(50, -40, 59.5)
    );
    const matrix4 = SSmap.Matrix4.multiply(mat, transtion);
    // console.log(center, matrix4, "4444444444");
    arr.forEach((i) => {
      // console.log(i.transform.matrix, "88888888");
      i.transform.matrix = matrix4;
    });
    this.drawExtru(center, steps);
    // cb("456456");
    // cb(matrix4);
  },
  drawExtru(center, steps) {
    // return;
    console.log(steps, "111111111111");
    const worldPosition =
      GlobalViewer.scene.globe.ellipsoid.eastNorthUpToFixedFrame(
        center.toCartesian3()
      );
    let worldToLocal = worldPosition.inverted();
    let pointArr = [];
    directionVal.forEach((item) => {
      let point;
      point = SSmap.Matrix4.multiplyByVector3(worldToLocal, item);
      let rotation = SSmap.Quaternion.fromEulerAngles(
        0,
        0,
        40
      ).toRotationMatrix();
      let modelMatrix = SSmap.Matrix4.fromRotationTranslation(
        rotation,
        SSmap.Vector3.create(0, 0, 0)
      );
      let scaleMatrix = SSmap.Matrix4.fromScale(
        SSmap.Vector3.create(0.8, 0.8, 0.8)
      );
      let matrix = SSmap.Matrix4.multiply(worldPosition, modelMatrix);
      matrix = SSmap.Matrix4.multiply(matrix, scaleMatrix);
      point = SSmap.Matrix4.multiplyByVector3(matrix, point);
      pointArr.push(point);
      // rotatePoints.push(point);
    });
    // rotatePoints = pointArr;
    var altitude = SSmap.AltitudeMethod.OnTerrain;
    if (steps == 2) {
      pointArr.push(pointArr[0]);
      var polylineObj = {
        width: 3,
        alpha: 1,
        pointArr: pointArr,
        color: SSmap.Color.fromRgb(0, 0, 255, 200),
        altitude: SSmap.AltitudeMethod.Absolute,
        dash: true,
        height: 30,
        depthTest: false,
        name: "move",
      };
      var polyline = drawPolyline(polylineObj);
      floorGeomList.push(polyline);
    } else {
      var obj1 = {
        alpha: 100, //边界透明度
        pointArr: pointArr, //点坐标
        color: SSmap.Color.fromRgb(0, 102, 255, 200), //填充颜色
        borColor: SSmap.Color.fromRgb(0, 102, 255, 200), //边界颜色
        altitude: altitude, //海拔高度模式
        name: "mianhuancong", //名称
        width: 0, //边界宽度
      };
      var Aentity = drawPolygon3D(obj1);
      floorGeomList.push(Aentity);
    }
  },
  rotationEntity(mat, degX, degY, degZ, offsetHeight) {
    let carto = mat.translation().toCartographic();
    carto.height -= 30;
    carto.height += offsetHeight;
    let v3 = carto.toVector3();
    mat.setTranslation(v3);
    let rotX = SSmap.Quaternion.fromAxisAndAngle(
      SSmap.Vector3.create(1.0, 0, 0),
      degX
    ).toRotationMatrix();
    let rotY = SSmap.Quaternion.fromAxisAndAngle(
      SSmap.Vector3.create(0, 1.0, 0),
      degY
    ).toRotationMatrix();
    let rotZ = SSmap.Quaternion.fromAxisAndAngle(
      SSmap.Vector3.create(0, 0, 1.0),
      degZ + 40
    ).toRotationMatrix();

    let rotation = SSmap.Matrix3.multiply(rotX, rotY);
    rotation = SSmap.Matrix3.multiply(rotation, rotZ);

    let pos = SSmap.Vector3.create(0, 0, 0);
    let rotationMat = SSmap.Matrix4.fromRotationTranslation(rotation, pos);

    let matrix = SSmap.Matrix4.multiply(mat, rotationMat);
    return matrix;
  },
  mergeOptions(target, from) {
    if (!from) return target;
    let keys = Object.keys(from);
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      if (this.isPlainObject(from[key])) {
        target[key] = this.mergeOptions(target[key] || {}, from[key]);
      } else {
        target[key] = from[key];
      }
    }
    return target;
  },
  isPlainObject(obj) {
    let toString = Object.prototype.toString;
    let hasOwn = Object.prototype.hasOwnProperty;
    if (toString.call(obj) !== "[object Object]") {
      return false;
    }
    if (
      obj.constructor &&
      !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")
    ) {
      return false;
    }
    return true;
  },
  drawLine(scene, pointList, tag, color, opacity) {
    if (pointList.length < 2) return;
    var polylines = [];

    if (polylines.length != 0) {
      for (var k = 0; k < this.polylines.length; k++) {
        if (polylines[k].name == tag) polylines.splice(k, 1);
      }
    }

    var length = pointList.length;
    var vertices = new Float32Array(length * 1);

    for (var i = 0; i < length; i++) {
      var point = pointList[i];
      vertices[i] = point;
    }

    var vertexArray = vertices;
    var stripSize = 3 * 4; //步长（ x,y,z  * float）
    var vertexBuffer = SSmap.Buffer.createVertexBuffer(vertexArray, stripSize);
    var posAttr = SSmap.GeometryAttribute.createPositionAttribute(
      vertexBuffer,
      0,
      3
    );

    var geometry = new SSmap.Geometry(); //创建集合体
    geometry.addAttribute(posAttr);
    var material = new SSmap.Material(); //创建材质
    material.bothSided = true; //双面材质
    material.opacity = color.a; //透明度
    material.roughness = 0.45; //粗糙度
    material.shadingModel = SSmap.ShadingModel.Unlit; //无光照
    material.color = SSmap.Color.fromRgb(color.r, color.g, color.b, 1); //材质颜色 RGBA
    var renderer = new SSmap.GeometryRenderer(); //创建几何渲染器
    renderer.castShadow = true; //投射阴影
    renderer.type = SSmap.GeometryRendererType.Symbol; //符号类型渲染
    renderer.primitiveType = SSmap.PrimitiveType.TriangleList; //openGL PrimitiveType：LineStrip 线带  //TriangleStrip 面
    renderer.geometry = geometry;
    renderer.material = material;

    //var boundingsphere = SSmap.BoundingSphere.create(pointList[0], 1000);
    //var boundingVolume = SSmap.BoundingVolume.fromBoundingSphere(boundingsphere);

    var entity = new SSmap.Entity();
    entity.addComponent(renderer);
    scene.addEntity(entity);
    entity.name = tag; //添加tag, 用于删除重复物体

    // polylines.push(entity);
    return entity;
  },
};
