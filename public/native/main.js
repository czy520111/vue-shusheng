/**
 * 数生sdk鉴权
 */
export function setAuthorize() {
  GlobalViewer.setAuthorizedUrl(
    "https://www.dataarche.com:8062/authentic/license?t=2023-03-21T11:09:37.152"
  );
}

// export { setAuthorize, cameraFlyTo } from "./core/common.js";
// export { getWorldPosition } from "../editor/math.js";

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
  console.log("window.GlobalViewer.canvasEl", window.GlobalViewer);
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

// export function getWorldPosition(event, callback) {
//   var camera = window.GlobalViewer.scene.mainCamera; //获取相机

//   var hit = new SSmap.RaycastHit(); //射线投影
//   //鼠标点击的位置，通过相机视角射线获取
//   var ray = camera.screenPointToRay(event.x, event.y);
//   var rayok = window.GlobalViewer.scene.raycast(ray, hit); //判断是否存在
//   var point = null;
//   if (rayok) {
//     if (hit) {
//       point = hit.point; //Vector3
//       point = SSmap.Vector3.create(point.x, point.y, point.z); //客户端要copy拾取点
//       let pp = {
//         x: point.x,
//         y: point.y,
//         z: point.z,
//       };
//       // 调用回调函数，并传递拾取点
//       console.log(pp, "789789");
//       callback(pp);
//     }
//   }
//   hit.delete();
// }

// export { default as Point } from "./mixins/point.js";
//点击点位
const bbList = [];
export const Point = {
  getWorldPosition(event, callback) {
    var camera = window.GlobalViewer.scene.mainCamera; //获取相机

    var hit = new SSmap.RaycastHit(); //射线投影
    //鼠标点击的位置，通过相机视角射线获取
    var ray = camera.screenPointToRay(event.x, event.y);
    var rayok = window.GlobalViewer.scene.raycast(ray, hit); //判断是否存在
    var point = null;
    if (rayok) {
      if (hit) {
        point = hit.point; //Vector3
        point = SSmap.Vector3.create(point.x, point.y, point.z); //客户端要copy拾取点
        let pp = {
          x: point.x,
          y: point.y,
          z: point.z,
        };
        // 调用回调函数，并传递拾取点
        // console.log(pp, "789789");
        callback(pp);
      }
    }
    hit.delete();
  },

  checkPoint(poi, url, callback) {
    let point = SSmap.Vector3.create(poi.x, poi.y, poi.z);
    let la = point.toCartographic().toDegrees();
    // console.log(la.latitude, url, "789789");
    let Geoobj = {
      position: point, //坐标
      name: "zuobiao",
      url: "src/images/circle.png", //路径
      scale: 0.5, //比例
      altitude: 10, //海拔，非必填
      // imageWidth:0,
      // imageHeight:0,
      // altitudeMethod: SSmap.AltitudeMethod.Absolute(), //Absolute 绝对海拔  OnTerrain 贴地 RelativeToTerrain 贴地并相对海拔
    };
    var Billboard = this.addBillboard(Geoobj, url);
    bbList.push(Billboard);
    console.log("la", la);

    let tohic = point.toCartesian3().toVector3();
    let frameAction = new SSmap.FrameAction();
    frameAction.onTriggered(() => {
      //每一帧改变div的位置
      // debugger;
      // let elem = document.querySelector(".text-info");
      var xyposition =
        window.GlobalViewer.scene.mainCamera.worldToScreenPoint(tohic);
      // console.log(xyposition, "xyposition");
      // elem.style.bottom = 0.1 - xyposition.y + elem.clientHeight / 2 + "px";
      // elem.style.left = 0.1 + xyposition.x - elem.clientWidth * 1.8 + "px";
      // console.log("456456");
      let wPosition = {
        x: xyposition.x,
        y: xyposition.y,
        z: xyposition.z,
      };
      let pointLa = {
        latitude: la.latitude,
        longitude: la.longitude,
        height: la.height,
        xyposition: wPosition,
      };
      callback(pointLa);
    });
    window.GlobalViewer.scene.rootEntity.addComponent(frameAction);
  },
  addBillboard(opt, url) {
    console.log(url, "url");
    // let url = window.document.location.href;

    let baseUrl = url;
    console.log(baseUrl, opt.url, "6666666");
    let bbEntity = new SSmap.BillboardEntity();
    bbEntity.position = opt.position; //坐标
    bbEntity.scale = opt.scale == undefined ? 1.0 : opt.scale; //比例
    if (opt.url) {
      bbEntity.url = baseUrl + "/" + opt.url; //图片路径
    }
    console.log(bbEntity.url, "uuuuuuuuuuu");
    if (opt.imageWidth) {
      bbEntity.imageWidth = opt.imageWidth; //图片宽度
    }
    if (opt.imageHeight) {
      bbEntity.imageHeight = opt.imageHeight; //图片高度
    }
    //海拔
    if (opt.altitude) {
      bbEntity.setAltitude(opt.altitude); //海拔值
    }
    //海拔模式
    if (opt.altitudeMethod) {
      bbEntity.setAltitudeMethod(opt.altitudeMethod);
    }
    //设置属性 属性的value只能是字符串类型
    opt.name
      ? bbEntity.addProperty("name", opt.name)
      : bbEntity.addProperty("name", "Billboardpoint");
    bbEntity.addProperty("pos", "蛇口红树湾");

    bbEntity.setCollection(SSmap.BillboardCollection.Instance()); //存储到Collection集合中
    bbEntity.name = opt.name || "Billboardpoint";
    return bbEntity;
  },
  clearMear() {
    let length2 = bbList.length;
    for (var i = length2 - 1; i > -1; i--) {
      bbList[i].delete();
      bbList.splice(i, 1);
      delete bbList[i];
    }
  },
};
//线长
let pointLineList = [];
let entityAllList = [];
let linedistance = 0;
let lineList = [];
let nodeMoveList = [];
let laberMoveList = [];
let labelList = [];
let polyList = [];
let checkPoint = false;
let mouseMoveListener = null;
let checkFeature = null;
let worPos = null;
export const Measurement = {
  MouseMoveEvent(point) {
    point = SSmap.Vector3.create(point.x, point.y, point.z);
    if (nodeMoveList.length > 0) {
      nodeMoveList[nodeMoveList.length - 1].delete(); //删除鼠标移动中前一帧创建的线实体
    }
    nodeMoveList = [];
    if (laberMoveList.length > 0) {
      laberMoveList[laberMoveList.length - 1].delete(); //删除鼠标移动中前一帧创建的线实体
    }
    laberMoveList = [];
    if (pointLineList.length > 0) {
      var pointArr = new Array();
      pointArr.push(pointLineList[pointLineList.length - 1]);
      pointArr.push(point);

      var polylineObj = {
        width: 1.5,
        alpha: 1,
        pointArr: pointArr,
        color: SSmap.Color.fromRgb(83, 255, 26, 255),
        altitude: SSmap.AltitudeMethod.Absolute,
        depthTest: false,
        name: "move",
      };
      var polyline = this.drawPolyline(polylineObj);
      nodeMoveList.push(polyline);
    }
  },
  mouseClickEvent(point, url) {
    point = SSmap.Vector3.create(point.x, point.y, point.z);
    //鼠标左键点击
    if (pointLineList.length == 0) {
      linedistance = 0; //清空上次测量结果
    }

    pointLineList.push(point); //记录点击的节点坐标

    let Geoobj = {
      position: point, //坐标
      name: "zuobiao",
      url: "src/images/point.png", //路径
      scale: 0.5, //比例
      altitude: 10, //海拔，非必填

      // imageWidth:0,
      // imageHeight:0,
      altitudeMethod: SSmap.AltitudeMethod.Absolute, //Absolute 绝对海拔  OnTerrain 贴地 RelativeToTerrain 贴地并相对海拔
    };
    var Billboard = this.addBillboard(Geoobj, url);
    Billboard.objectName = "bill";
    bbList.push(Billboard);

    //两个节点确定一条线
    if (pointLineList.length > 1) {
      var pointArr = new Array();
      pointArr.push(pointLineList[pointLineList.length - 2]);
      pointArr.push(pointLineList[pointLineList.length - 1]);
      var polylineObj = {
        width: 3,
        alpha: 1,
        pointArr: pointArr,
        color: SSmap.Color.fromRgb(83, 255, 26, 255),
        altitude: SSmap.AltitudeMethod.Absolute,
        depthTest: false,
        name: "polyline",
        // id: "measure",
      };
      var polyline = this.drawPolyline(polylineObj);
      entityAllList.push(polyline);
      lineList.push(polyline);
      //水平距离
      var distance = SSmap.Cartesian3.distance(
        pointLineList[pointLineList.length - 2].toCartesian3(),
        pointLineList[pointLineList.length - 1].toCartesian3()
      ).toFixed(2);
      //累积多个节点的距离，总长度
      var opt = {
        num1: linedistance,
        num2: distance,
      };
      linedistance = this.numAdd(opt);
      //标签
      var labelObj = {
        position: point,
        text: linedistance.toFixed(2).toString() + "m",
        fontSize: 20,
        fontColor: SSmap.Color.fromRgb(255, 255, 26, 255),
        translucencyByDistance: SSmap.Vector4.create(30000, 1.0, 1.0e5, 0.7),
        name: "label",
        // id: "measure",
      };
      var label3d = this.addLabel3D(labelObj);
      entityAllList.push(label3d);
      // let lableEntity = new SSmap.VisualEntity();
      // lableEntity.addComponent(label3d);
      // GlobalViewer.scene.addEntity(lableEntity);
    }
  },
  ContextMenuEvent() {
    if (nodeMoveList.length > 0) {
      nodeMoveList[nodeMoveList.length - 1].delete(); //删除鼠标移动中前一帧创建的线实体
    }
    nodeMoveList = [];
    if (laberMoveList.length > 0) {
      laberMoveList[laberMoveList.length - 1].delete(); //删除鼠标移动中前一帧创建的线实体
    }
    laberMoveList = [];
    pointLineList = [];
  },
  updataLine() {
    let pointList = [];
    let length3 = labelList.length;
    for (var i = length3 - 1; i > -1; i--) {
      labelList[i].delete();
      labelList.splice(i, 1);
      delete labelList[i];
    }
    let total = 0;
    for (let i = 1; i < bbList.length; i++) {
      total += this.distanceBetweenPoints(
        bbList[i - 1].position,
        bbList[i].position
      );
      var labelObj = {
        position: bbList[i].position,
        text: total.toFixed(2).toString() + "m",
        fontSize: 20,
        fontColor: SSmap.Color.fromRgb(255, 255, 26, 255),
        translucencyByDistance: SSmap.Vector4.create(30000, 1.0, 1.0e5, 0.7),
        name: "label",
        // id: "measure",
      };
      var label3d = this.addLabel3D(labelObj);
      labelList.push(label3d);
    }
    bbList.forEach((item) => {
      pointList.push(item.position);
      var labelObj = {
        position: item.position,
        text: total.toFixed(2).toString() + "m",
        fontSize: 20,
        fontColor: SSmap.Color.fromRgb(255, 255, 26, 255),
        translucencyByDistance: SSmap.Vector4.create(30000, 1.0, 1.0e5, 0.7),
        name: "label",
        // id: "measure",
      };
    });

    // console.log(labelList, "777", total);
    let polylineObj = {
      width: 3,
      alpha: 1,
      pointArr: pointList,
      color: SSmap.Color.fromRgb(83, 255, 26, 255),
      altitude: SSmap.AltitudeMethod.Absolute,
      depthTest: false,
      name: "polyline",
      // id: "measure",
    };
    let length = entityAllList.length;
    for (var i = length - 1; i > -1; i--) {
      entityAllList[i].delete();
      entityAllList.splice(i, 1);
      delete entityAllList[i];
    }
    let length1 = polyList.length;
    for (var i = length1 - 1; i > -1; i--) {
      polyList[i].delete();
      polyList.splice(i, 1);
      delete polyList[i];
    }

    let polyline = this.drawPolyline(polylineObj);
    polyList.push(polyline);
  },
  mouseDown(cb) {
    // point = SSmap.Vector3.create(point.x, point.y, point.z);
    let feature = window.GlobalViewer.scene.getFeatureByMouse();
    checkFeature = feature;
    if (feature && feature.parent.objectName == "bill") {
      checkPoint = true;
      // let position = feature.parent.position;
      // if (mouseMoveListener) {
      //   document
      //     .getElementById("qtcanvas")
      //     .removeEventListener("mousemove", mouseMoveListener);
      // }
      // mouseMoveListener = (e) => movePoint(e, feature);
      cb(mouseMoveListener);
      // document
      //   .getElementById("qtcanvas")
      //   .addEventListener("mousemove", mouseMoveListener);
      // console.log("获取点图层属性", feature);
    }
  },
  mouseUp(cb) {
    checkPoint = false;
    // document.getElementById("qtcanvas").style.cursor = "default";
    let cameraCtrl = GlobalViewer.scene.mainCamera.cameraController();
    cameraCtrl.enableInputs = true;
    // console.log(lineList, "+++", bbList);
    this.updataLine();
    cb(mouseMoveListener);
    if (mouseMoveListener) {
      // document
      //   .getElementById("qtcanvas")
      //   .removeEventListener("mousemove", mouseMoveListener);
      mouseMoveListener = null; // 置空变量
    }
    // document
    //   .getElementById("qtcanvas")
    //   .removeEventListener("mousedown", mouseDown);
    // document.getElementById("qtcanvas").addEventListener("mousedown", setPoint);
  },
  movePoint(e) {
    if (checkPoint == false) return;

    let cameraCtrl = GlobalViewer.scene.mainCamera.cameraController();
    cameraCtrl.enableInputs = false;
    let newPosition = this.getWorldPosition({ x: e.x, y: e.y });
    // newPosition = SSmap.Vector3.create(
    //   newPosition.x,
    //   newPosition.y,
    //   newPosition.z
    // );
    checkFeature.parent.position.x = newPosition.x;
    checkFeature.parent.position.y = newPosition.y;
    checkFeature.parent.position.z = newPosition.z;
    this.updataLine();
  },
  setPoint() {
    let feature = window.GlobalViewer.scene.getFeatureByMouse();
    if (feature && feature.parent.objectName == "bill") {
      this.mouseDown();
    }
  },
  dblClickEvent(event, url) {
    let feature = window.GlobalViewer.scene.getFeatureByMouse();
    let point = this.getWorldPosition({ x: event.x, y: event.y });
    point = SSmap.Vector3.create(point.x, point.y, point.z);
    if (feature) {
      console.log(event.x, feature, "666666666666666");
      // if (feature.parent.objectName == "polyline") {
      // console.log("获取线图层属性", feature);
      let Geoobj = {
        position: point, //坐标
        name: "zuobiao",
        url: "src/images/point.png", //路径
        scale: 0.5, //比例
        altitude: 10, //海拔，非必填

        // imageWidth:0,
        // imageHeight:0,
        altitudeMethod: SSmap.AltitudeMethod.Absolute, //Absolute 绝对海拔  OnTerrain 贴地 RelativeToTerrain 贴地并相对海拔
      };
      // console.log(polyList, 555);

      let originalLength = bbList.length; // 保存原始长度

      for (let i = 1; i < originalLength; i++) {
        let p1 = bbList[i - 1].position;
        let p2 = bbList[i].position;
        let p3 = point;
        let result = this.isPointOnLine(p3, p1, p2, 30);
        if (result) {
          // console.log(i, "789789");
          var Billboard = this.addBillboard(Geoobj, url);
          Billboard.objectName = "bill";
          bbList.splice(i, 0, Billboard);
          originalLength++; // 每次插入一个元素，原始长度加一
          this.updataLine();
          return;
        }
      }
      // } else if (feature.parent.objectName == "bill") {
      //   // console.log("获取点图层属性", feature);
      // }
    }
  },
  addBillboard(opt, url) {
    // console.log(url, opt.position.x, "url");
    // let url = document.location.href;

    let baseUrl = url;
    console.log(baseUrl, opt.url, "6666666");
    let bbEntity = new SSmap.BillboardEntity();
    bbEntity.position = opt.position; //坐标
    bbEntity.scale = opt.scale == undefined ? 1.0 : opt.scale; //比例
    if (opt.url) {
      bbEntity.url = baseUrl + "/" + opt.url; //图片路径
    }
    console.log(bbEntity.url, "uuuuuuuuuuu");
    if (opt.imageWidth) {
      bbEntity.imageWidth = opt.imageWidth; //图片宽度
    }
    if (opt.imageHeight) {
      bbEntity.imageHeight = opt.imageHeight; //图片高度
    }
    //海拔
    if (opt.altitude) {
      bbEntity.setAltitude(opt.altitude); //海拔值
    }
    //海拔模式
    if (opt.altitudeMethod) {
      bbEntity.setAltitudeMethod(opt.altitudeMethod);
    }
    //设置属性 属性的value只能是字符串类型
    opt.name
      ? bbEntity.addProperty("name", opt.name)
      : bbEntity.addProperty("name", "Billboardpoint");
    bbEntity.addProperty("pos", "蛇口红树湾");

    bbEntity.setCollection(SSmap.BillboardCollection.Instance()); //存储到Collection集合中
    bbEntity.name = opt.name || "Billboardpoint";
    return bbEntity;
  },
  drawPolyline(opt) {
    var polyline = new SSmap.Polyline3D();
    for (var i = 0; i < opt.pointArr.length; i++) {
      polyline.addPoint(opt.pointArr[i]);
    }
    polyline.alpha = opt.alpha >= 1 ? 0.99 : opt.alpha;
    polyline.color = opt.color;
    polyline.depthTest = opt.depthTest;
    polyline.setWidth(opt.width);
    polyline.setAltitudeMethod(opt.altitude);
    // polyline.setAltitude(10);
    opt.height ? polyline.setAltitude(opt.height) : polyline.setAltitude(10);
    polyline.setMinDistance(5.0);
    polyline.name = opt.name;
    polyline.dash = opt.dash ? opt.dash : false;
    polyline.addProperty("name", opt.name);
    polyline.draw();
    polyline.end();
    return polyline;
  },
  addLabel3D(opt) {
    var label3d = new SSmap.Label3D();
    label3d.position = opt.position;
    if (opt.text != "" && opt.text != undefined) {
      label3d.text = opt.text;
    }
    label3d.fontSize = opt.fontSize; //字体大小
    label3d.fontColor = opt.fontColor; //字体颜色，白色
    if (opt.strokeColor) {
      label3d.strokeColor = opt.strokeColor; //描边颜色，黑边
    }
    if (opt.background) {
      label3d.background = opt.background; //背景颜色
    }
    if (opt.url) {
      label3d.url = window.document.location.origin + "/" + opt.url; //图片路径
    }
    if (opt.vertical) {
      label3d.vertical = opt.vertical;
    }
    if (opt.horizontal) {
      label3d.horizontal = opt.horizontal;
    }
    if (opt.imageWidth) {
      label3d.imageWidth = opt.imageWidth;
    }
    if (opt.imageHeight) {
      label3d.imageHeight = opt.imageHeight;
    }
    if (opt.offset) {
      label3d.offset = opt.offset; //偏移量
    }
    if (opt.scaleByDistance) {
      label3d.setScaleByDistance(opt.scaleByDistance); //缩放比
    }
    if (opt.translucencyByDistance) {
      label3d.setTranslucencyByDistance(opt.translucencyByDistance); //缩放控制透明度
    }
    if (window.billboardCollection == null) {
      var bbcollection = new SSmap.BillboardCollection();
      window.billboardCollection = bbcollection;
    }

    label3d.name = opt.name;
    label3d.addProperty("name", opt.name);
    if (opt.id) {
      label3d.id = opt.id;
      label3d.addProperty("id", opt.id);
    }
    label3d.setCollection(window.billboardCollection);
    return label3d;
  },
  numAdd(opt) {
    var baseNum, baseNum1, baseNum2;
    try {
      baseNum1 = opt.num1.toString().split(".")[1].length;
    } catch (e) {
      baseNum1 = 0;
    }
    try {
      baseNum2 = opt.num2.toString().split(".")[1].length;
    } catch (e) {
      baseNum2 = 0;
    }
    baseNum = Math.pow(10, Math.max(baseNum1, baseNum2));
    return (opt.num1 * baseNum + opt.num2 * baseNum) / baseNum;
  },
  distanceBetweenPoints(point1, point2) {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    const dz = point2.z - point1.z;

    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  },
  getWorldPosition(event) {
    var camera = window.GlobalViewer.scene.mainCamera; //获取相机

    var hit = new SSmap.RaycastHit(); //射线投影
    //鼠标点击的位置，通过相机视角射线获取
    var ray = camera.screenPointToRay(event.x, event.y);
    var rayok = window.GlobalViewer.scene.raycast(ray, hit); //判断是否存在
    var point = null;
    if (rayok) {
      if (hit) {
        point = hit.point; //Vector3
        point = SSmap.Vector3.create(point.x, point.y, point.z); //客户端要copy拾取点
        let pp = {
          x: point.x,
          y: point.y,
          z: point.z,
        };
        // 调用回调函数，并传递拾取点
        // console.log(pp, "789789");
        // callback(pp);
        return pp;
      }
    }
    hit.delete();
  },
  isPointOnLine(point, start, end, lineWidth) {
    // 计算线段的参数方程
    const t =
      ((point.x - start.x) * (end.x - start.x) +
        (point.y - start.y) * (end.y - start.y) +
        (point.z - start.z) * (end.z - start.z)) /
      ((end.x - start.x) ** 2 +
        (end.y - start.y) ** 2 +
        (end.z - start.z) ** 2);

    // 判断点是否在线段的范围内
    if (t >= 0 && t <= 1) {
      // 计算点到直线的距离
      const distance =
        Math.abs(
          (end.y - start.y) * (start.z - point.z) -
            (end.z - start.z) * (start.y - point.y) +
            ((end.z - start.z) * (start.x - point.x) -
              (end.x - start.x) * (start.z - point.z)) +
            ((end.x - start.x) * (start.y - point.y) -
              (end.y - start.y) * (start.x - point.x))
        ) /
        Math.sqrt(
          (end.x - start.x) ** 2 +
            (end.y - start.y) ** 2 +
            (end.z - start.z) ** 2
        );
      // 判断点到直线的距离是否小于线段的宽度
      if (distance <= lineWidth) {
        return true; // 点在线段上
      }
    }

    return false; // 点不在线段上
  },
};

//面积
let pointList = [];
let threeList = [];
let moveList = [];
export const Area = {
  mouseClickEvent(point, url) {
    point = SSmap.Vector3.create(point.x, point.y, point.z);
    pointList.push(point);
    let la = point.toCartographic().toDegrees();
    let Geoobj = {
      position: point, //坐标
      name: "zuobiao",
      url: "src/images/point.png", //路径
      scale: 0.5, //比例
      altitude: 10, //海拔，非必填
      // imageWidth:0,
      // imageHeight:0,
      altitudeMethod: SSmap.AltitudeMethod.Absolute, //Absolute 绝对海拔  OnTerrain 贴地 RelativeToTerrain 贴地并相对海拔
    };
    var Billboard = this.addBillboard(Geoobj, url);
    bbList.push(Billboard);
    if (pointList.length > 0) {
      let obj = {
        width: 3,
        alpha: 1,
        pointArr: pointList,
        color: SSmap.Color.fromRgb(83, 255, 26, 255),
        altitude: SSmap.AltitudeMethod.Absolute,
        depthTest: false,
        height: 1,
        name: "polyline",
      };
      let tLine = this.drawPolyline(obj);
      threeList.push(tLine);
      let area = this.calSpaceArea(pointList);
      // let position = point.toCartesian3().toCartographic();

      // console.log("area", area);
    }
  },
  mousemoveEvent(point) {
    point = SSmap.Vector3.create(point.x, point.y, point.z);
    if (moveList.length > 0) {
      moveList[moveList.length - 1].delete(); //删除鼠标移动中前一帧创建的线实体
      moveList.splice(0, moveList.length);
    }
    if (polyList.length > 0) {
      polyList[polyList.length - 1].delete(); //删除鼠标移动中前一帧创建的面实体
      polyList.splice(0, polyList.length);
    }
    let pointArr = new Array();
    let polyArr = new Array();
    pointArr.push(pointList[pointList.length - 1]);
    pointArr.push(point);
    //   polyArr.push((pointList), point);
    pointList.forEach((item) => {
      polyArr.push(item);
    });
    polyArr.push(point);
    //   polyArr.push(point);
    //
    let obj = {
      width: 3,
      alpha: 1,
      pointArr: pointArr,
      color: SSmap.Color.fromRgb(83, 255, 26, 255),
      altitude: SSmap.AltitudeMethod.Absolute,
      depthTest: false,
      height: 1,
      name: "polyline",
    };
    let movePoly = this.drawPolyline(obj);
    moveList.push(movePoly);
    if (pointList.length > 1) {
      let altitude = SSmap.AltitudeMethod.OnTerrain;
      let polygongeometryObj = {
        fillAlpha: 0.5,
        pointArr: polyArr,
        color: SSmap.Color.fromRgb(0, 240, 120, 255),
        borColor: SSmap.Color.fromRgb(83, 255, 26, 255),
        altitude: altitude,
        name: "topology",
        width: 1,
      };
      let polyGeometry = this.drawPolygon3D(polygongeometryObj);
      polyList.push(polyGeometry);
    }
  },
  ContextMenuEvent() {
    console.log("ContextMenuEvent");
    if (pointList.length < 3) return;

    pointList.push(pointList[0]);
    let obj = {
      width: 3,
      alpha: 1,
      pointArr: pointList,
      color: SSmap.Color.fromRgb(83, 255, 26, 255),
      altitude: SSmap.AltitudeMethod.Absolute,
      height: 1,
      depthTest: false,
      name: "polyline",
    };
    let tLine = this.drawPolyline(obj);
    threeList.push(tLine);
    let area = this.calSpaceArea(pointList);
    let center = this.calculatePolygonCenter(pointList);
    let labelObj = {
      position: center,
      text: area.toFixed(2).toString() + "㎡",
      fontSize: 20,
      fontColor: SSmap.Color.fromRgb(255, 255, 26, 255),
      translucencyByDistance: SSmap.Vector4.create(30000, 1.0, 1.0e5, 0.7),
      name: "label",
      // id: "measure",
    };
    let label3d = this.drawLabel(labelObj);
    threeList.push(label3d);
    let pointArr = [];
    pointList.forEach((item) => {
      // point.toCartesian3().toCartographic()
      pointArr.push(item);
    });
    //   let polygongeometryObj = {
    //     height: 10,
    //     alpha: 0.8,
    //     pointArr,
    //     color: SSmap.Color.fromRgb(83, 255, 26, 255),
    //     name: "polygongeometry",
    //   };
    let altitude = SSmap.AltitudeMethod.OnTerrain;
    let polygongeometryObj = {
      fillAlpha: 0.5,
      pointArr: pointArr,
      color: SSmap.Color.fromRgb(0, 240, 120, 255),
      borColor: SSmap.Color.fromRgb(83, 255, 26, 255),
      altitude: altitude,
      name: "topology",
      width: 1,
    };

    let polyGeometry = this.drawPolygon3D(polygongeometryObj);
    //   let polyGeometry = drawPolygonGeometry(polygongeometryObj);
    threeList.push(polyGeometry);
    let length1 = moveList.length;
    for (var i = length1 - 1; i > -1; i--) {
      moveList[i].delete();
      moveList.splice(i, 1);
      delete moveList[i];
    }
    let length2 = polyList.length;
    for (var i = length2 - 1; i > -1; i--) {
      polyList[i].delete();
      polyList.splice(i, 1);
      delete polyList[i];
    }
    // endarea();
    // console.log("area", area, center);
  },

  addBillboard(opt, url) {
    console.log(url, "url");
    // let url = window.document.location.href;

    let baseUrl = url;
    console.log(baseUrl, opt.url, "6666666");
    let bbEntity = new SSmap.BillboardEntity();
    bbEntity.position = opt.position; //坐标
    bbEntity.scale = opt.scale == undefined ? 1.0 : opt.scale; //比例
    if (opt.url) {
      bbEntity.url = baseUrl + "/" + opt.url; //图片路径
    }
    console.log(bbEntity.url, "uuuuuuuuuuu");
    if (opt.imageWidth) {
      bbEntity.imageWidth = opt.imageWidth; //图片宽度
    }
    if (opt.imageHeight) {
      bbEntity.imageHeight = opt.imageHeight; //图片高度
    }
    //海拔
    if (opt.altitude) {
      bbEntity.setAltitude(opt.altitude); //海拔值
    }
    //海拔模式
    if (opt.altitudeMethod) {
      bbEntity.setAltitudeMethod(opt.altitudeMethod);
    }
    //设置属性 属性的value只能是字符串类型
    opt.name
      ? bbEntity.addProperty("name", opt.name)
      : bbEntity.addProperty("name", "Billboardpoint");
    bbEntity.addProperty("pos", "蛇口红树湾");

    bbEntity.setCollection(SSmap.BillboardCollection.Instance()); //存储到Collection集合中
    bbEntity.name = opt.name || "Billboardpoint";
    return bbEntity;
  },
  drawPolygon3D(opt) {
    var polygon3d = new SSmap.Polygon3D();
    polygon3d.fillAlpha = opt.fillAlpha >= 1 ? 0.99 : opt.fillAlpha || 0.99; //填充透明度
    polygon3d.color = opt.borColor; //边界颜色
    polygon3d.setWidth(opt.width); //边界宽度
    polygon3d.alpha = opt.alpha >= 1 ? 0.99 : opt.alpha || 0.99; //alpha透明度不能设置为1.0 //边界透明度
    polygon3d.setFillColor(opt.color); //填充颜色，颜色，画笔类型
    opt.pointArr.forEach((item) => {
      //vector3格式
      polygon3d.addPoint(item);
    });
    polygon3d.setAltitudeMethod(opt.altitude); //海拔高度模式

    polygon3d.name = opt.name;
    polygon3d.addProperty("name", opt.name);
    polygon3d.addProperty("多边形", "多边形属性测试");
    if (opt.id) {
      polygon3d.id = opt.id;
      polygon3d.addProperty("id", opt.id);
    }
    polygon3d.tag = "多边形属性测试tag";
    polygon3d.draw();
    polygon3d.end();
    return polygon3d;
  },
  drawLabel(opt) {
    var label3d = new SSmap.Label3D();
    label3d.position = opt.position;
    if (opt.text != "" && opt.text != undefined) {
      label3d.text = opt.text;
    }
    label3d.fontSize = opt.fontSize; //字体大小
    label3d.fontColor = opt.fontColor; //字体颜色，白色
    if (opt.strokeColor) {
      label3d.strokeColor = opt.strokeColor; //描边颜色，黑边
    }
    if (opt.background) {
      label3d.background = opt.background; //背景颜色
    }
    if (opt.url) {
      label3d.url = window.document.location.origin + "/" + opt.url; //图片路径
    }
    if (opt.vertical) {
      label3d.vertical = opt.vertical;
    }
    if (opt.horizontal) {
      label3d.horizontal = opt.horizontal;
    }
    if (opt.imageWidth) {
      label3d.imageWidth = opt.imageWidth;
    }
    if (opt.imageHeight) {
      label3d.imageHeight = opt.imageHeight;
    }
    if (opt.offset) {
      label3d.offset = opt.offset; //偏移量
    }
    if (opt.scaleByDistance) {
      label3d.setScaleByDistance(opt.scaleByDistance); //缩放比
    }
    if (opt.translucencyByDistance) {
      label3d.setTranslucencyByDistance(opt.translucencyByDistance); //缩放控制透明度
    }
    if (window.billboardCollection == null) {
      var bbcollection = new SSmap.BillboardCollection();
      window.billboardCollection = bbcollection;
    }
    if (opt.labelHeight) {
      label3d.labelHeight = opt.labelHeight;
    }

    label3d.name = opt.name;
    label3d.addProperty("name", opt.name);
    if (opt.id) {
      label3d.id = opt.id;
      label3d.addProperty("id", opt.id);
    }
    label3d.setCollection(window.billboardCollection);
    return label3d;
  },
  drawPolyline(opt) {
    var polyline = new SSmap.Polyline3D();
    for (var i = 0; i < opt.pointArr.length; i++) {
      polyline.addPoint(opt.pointArr[i]);
    }
    polyline.alpha = opt.alpha >= 1 ? 0.99 : opt.alpha;
    polyline.color = opt.color;
    polyline.depthTest = opt.depthTest;
    polyline.setWidth(opt.width);
    polyline.setAltitudeMethod(opt.altitude);
    // polyline.setAltitude(10);
    opt.height ? polyline.setAltitude(opt.height) : polyline.setAltitude(10);
    polyline.setMinDistance(5.0);
    polyline.name = opt.name;
    polyline.dash = opt.dash ? opt.dash : false;
    polyline.addProperty("name", opt.name);
    polyline.draw();
    polyline.end();
    return polyline;
  },
  //获取面积
  calSpaceArea(pointArray) {
    var n = pointArray.length;
    var area = 0;

    // 使用 Shoelace 公式计算面积
    for (var i = 0; i < n; i++) {
      var j = (i + 1) % n;
      area += pointArray[i].x * pointArray[j].y;
      area -= pointArray[j].x * pointArray[i].y;
    }
    area = Math.abs(area) / 2;

    return area;
  },
  calculatePolygonCenter(vertices) {
    var centerX = 0;
    var centerY = 0;
    var centerZ = 0;
    let point = null;
    var n = vertices.length;

    // 计算所有顶点的坐标之和
    for (var i = 0; i < n; i++) {
      centerX += vertices[i].x;
      centerY += vertices[i].y;
      centerZ += vertices[i].z;
    }

    // 求平均值
    centerX /= n;
    centerY /= n;
    centerZ /= n;

    // 返回中心点的坐标
    point = SSmap.Vector3.create(centerX, centerY, centerZ);
    return point;
  },
  drawPolyline(opt) {
    var polyline = new SSmap.Polyline3D();
    for (var i = 0; i < opt.pointArr.length; i++) {
      polyline.addPoint(opt.pointArr[i]);
    }
    polyline.alpha = opt.alpha >= 1 ? 0.99 : opt.alpha;
    polyline.color = opt.color;
    polyline.depthTest = opt.depthTest;
    polyline.setWidth(opt.width);
    polyline.setAltitudeMethod(opt.altitude);
    // polyline.setAltitude(10);
    opt.height ? polyline.setAltitude(opt.height) : polyline.setAltitude(10);
    polyline.setMinDistance(5.0);
    polyline.name = opt.name;
    polyline.dash = opt.dash ? opt.dash : false;
    polyline.addProperty("name", opt.name);
    polyline.draw();
    polyline.end();
    return polyline;
  },
  clearMeasure() {
    if (threeList.length > 0) {
      pointList.splice(0, pointList.length);
      let length = threeList.length;
      for (var i = length - 1; i > -1; i--) {
        threeList[i].delete();
        threeList.splice(i, 1);
        delete threeList[i];
      }
      let length1 = moveList.length;
      for (var i = length1 - 1; i > -1; i--) {
        moveList[i].delete();
        moveList.splice(i, 1);
        delete moveList[i];
      }
      let length2 = polyList.length;
      for (var i = length2 - 1; i > -1; i--) {
        polyList[i].delete();
        polyList.splice(i, 1);
        delete polyList[i];
      }
      let length3 = bbList.length;
      for (var i = length3 - 1; i > -1; i--) {
        bbList[i].delete();
        bbList.splice(i, 1);
        delete bbList[i];
      }
    }
  },
};

//体积
// let pointList = [];
let Height = 0;
let referHeight = 0;
let Areas = 0;
export const Volume = {
  mouseClickEvent(point, url, cb) {
    point = SSmap.Vector3.create(point.x, point.y, point.z);
    let Geoobj = {
      position: point, //坐标
      name: "zuobiao",
      url: "src/images/circle.png", //路径
      scale: 0.5, //比例
      altitude: 10, //海拔，非必填
      // imageWidth:0,
      // imageHeight:0,
      altitudeMethod: SSmap.AltitudeMethod.Absolute, //Absolute 绝对海拔  OnTerrain 贴地 RelativeToTerrain 贴地并相对海拔
    };
    var Billboard = this.addBillboard(Geoobj, url);
    bbList.push(Billboard);

    pointList.push(point);
    let la = point.toCartographic().toDegrees();
    if (pointList.length > 0) {
      let obj = {
        width: 3,
        alpha: 1,
        pointArr: pointList,
        color: SSmap.Color.fromRgb(83, 255, 26, 255),
        altitude: SSmap.AltitudeMethod.Absolute,
        depthTest: false,
        name: "polyline",
      };
      let tLine = this.drawPolyline(obj);
      threeList.push(tLine);
      // let area = calSpaceArea(pointList);
      cb(pointList.length);
      // console.log("area", area);
    }
  },

  mousemoveEvent(point) {
    point = SSmap.Vector3.create(point.x, point.y, point.z);
    if (moveList.length > 0) {
      moveList[moveList.length - 1].delete(); //删除鼠标移动中前一帧创建的线实体
      moveList.splice(0, moveList.length);
    }
    if (polyList.length > 0) {
      polyList[polyList.length - 1].delete(); //删除鼠标移动中前一帧创建的面实体
      polyList.splice(0, polyList.length);
    }
    let pointArr = new Array();
    let polyArr = new Array();
    pointArr.push(pointList[pointList.length - 1]);
    pointArr.push(point);
    //   polyArr.push((pointList), point);
    pointList.forEach((item) => {
      polyArr.push(item);
    });
    polyArr.push(point);
    let exArr = new Array();
    pointList.forEach((item) => {
      exArr.push(item.toCartesian3().toCartographic().toCartesian3());
    });
    exArr.push(point.toCartesian3().toCartographic().toCartesian3());
    //   polyArr.push(point);
    //
    let obj = {
      width: 3,
      alpha: 1,
      pointArr: pointArr,
      color: SSmap.Color.fromRgb(83, 255, 26, 255),
      altitude: SSmap.AltitudeMethod.Absolute,
      depthTest: false,
      name: "polyline",
    };
    let movePoly = this.drawPolyline(obj);
    moveList.push(movePoly);
    if (pointList.length > 1) {
      let polygongeometryObj = {
        height: 20,
        alpha: 0.8,
        pointArr: exArr,
        color: SSmap.Color.fromRgb(83, 255, 26, 255),
        name: "polygongeometry",
        // id: "measure",
      };

      let polyGeometry = this.drawPolygonGeometry(polygongeometryObj);
      polyList.push(polyGeometry);
    }
  },
  ContextMenuEvent(e) {
    if (pointList.length < 3) return;
    console.log(e, "eeeeeeeeee");
    referHeight = e.y;
    console.log("ContextMenuEvent");
    pointList.push(pointList[0]);
    let obj = {
      width: 3,
      alpha: 1,
      pointArr: pointList,
      color: SSmap.Color.fromRgb(83, 255, 26, 255),
      altitude: SSmap.AltitudeMethod.Absolute,
      depthTest: false,
      name: "polyline",
    };
    let tLine = this.drawPolyline(obj);
    threeList.push(tLine);
    let area = this.calSpaceArea(pointList);
    Areas = area;
    let pointArr = [];
    pointList.forEach((item) => {
      pointArr.push(item);
    });
    let exArr = new Array();
    pointList.forEach((item) => {
      exArr.push(item.toCartesian3().toCartographic().toCartesian3());
    });

    let polygongeometryObj = {
      height: 10,
      alpha: 0.8,
      pointArr: exArr,
      color: SSmap.Color.fromRgb(83, 255, 26, 255),
      name: "polygongeometry",
      // id: "measure",
    };

    let polyGeometry = this.drawPolygonGeometry(polygongeometryObj);
    threeList.push(polyGeometry);
    let length1 = moveList.length;
    for (var i = length1 - 1; i > -1; i--) {
      moveList[i].delete();
      moveList.splice(i, 1);
      delete moveList[i];
    }
    let length2 = polyList.length;
    for (var i = length2 - 1; i > -1; i--) {
      polyList[i].delete();
      polyList.splice(i, 1);
      delete polyList[i];
    }
  },
  sureVlo(point, event) {
    console.log(event.x, event.y, "4444444444");
    point = SSmap.Vector3.create(point.x, point.y, point.z);
    point = point.toCartesian3().toCartographic(); //转换为经纬度

    let bHeight = referHeight - event.y;
    Height = bHeight * 10;
    console.log(point.height, "666666", event.x, event.y);
    if (polyList.length > 0) {
      polyList[polyList.length - 1].delete(); //删除鼠标移动中前一帧创建的面实体
      polyList.splice(0, polyList.length);
    }
    let exArr = new Array();
    pointList.forEach((item) => {
      exArr.push(item.toCartesian3().toCartographic().toCartesian3());
    });

    let polygongeometryObj = {
      height: bHeight * 10,
      alpha: 0.8,
      pointArr: exArr,
      color: SSmap.Color.fromRgb(83, 255, 26, 255),
      name: "polygongeometry",
      // id: "measure",
    };
    let polyGeometry = this.drawPolygonGeometry(polygongeometryObj);
    polyList.push(polyGeometry);
  },
  sureClick() {
    if (polyList.length > 0) {
      polyList[polyList.length - 1].delete(); //删除鼠标移动中前一帧创建的面实体
      polyList.splice(0, polyList.length);
    }
    let exArr = new Array();
    pointList.forEach((item) => {
      exArr.push(item.toCartesian3().toCartographic().toCartesian3());
    });
    //   Height.value = height;
    let center = this.calculatePolygonCenter(pointList);
    //   center.y *= 2;
    let text = Height * Areas;
    let labelObj = {
      // labelHeight: 800,
      position: center,
      text: text.toFixed(2).toString() + "m³",
      fontSize: 20,
      fontColor: SSmap.Color.fromRgb(255, 255, 26, 255),
      translucencyByDistance: SSmap.Vector4.create(30000, 1.0, 1.0e5, 0.7),
      name: "label",
      // id: "measure",
    };
    console.log(Height, "Height");
    let label3d = this.drawLabel(labelObj);
    threeList.push(label3d);
    let polygongeometryObj = {
      height: Height,
      alpha: 0.8,
      pointArr: exArr,
      color: SSmap.Color.fromRgb(83, 255, 26, 255),
      name: "polygongeometry",
      // id: "measure",
    };
    let polyGeometry = this.drawPolygonGeometry(polygongeometryObj);
    polyList.push(polyGeometry);
  },
  addBillboard(opt, url) {
    console.log(url, "url");
    // let url = window.document.location.href;

    let baseUrl = url;
    console.log(baseUrl, opt.url, "6666666");
    let bbEntity = new SSmap.BillboardEntity();
    bbEntity.position = opt.position; //坐标
    bbEntity.scale = opt.scale == undefined ? 1.0 : opt.scale; //比例
    if (opt.url) {
      bbEntity.url = baseUrl + "/" + opt.url; //图片路径
    }
    console.log(bbEntity.url, "uuuuuuuuuuu");
    if (opt.imageWidth) {
      bbEntity.imageWidth = opt.imageWidth; //图片宽度
    }
    if (opt.imageHeight) {
      bbEntity.imageHeight = opt.imageHeight; //图片高度
    }
    //海拔
    if (opt.altitude) {
      bbEntity.setAltitude(opt.altitude); //海拔值
    }
    //海拔模式
    if (opt.altitudeMethod) {
      bbEntity.setAltitudeMethod(opt.altitudeMethod);
    }
    //设置属性 属性的value只能是字符串类型
    opt.name
      ? bbEntity.addProperty("name", opt.name)
      : bbEntity.addProperty("name", "Billboardpoint");
    bbEntity.addProperty("pos", "蛇口红树湾");

    bbEntity.setCollection(SSmap.BillboardCollection.Instance()); //存储到Collection集合中
    bbEntity.name = opt.name || "Billboardpoint";
    return bbEntity;
  },
  drawPolyline(opt) {
    var polyline = new SSmap.Polyline3D();
    for (var i = 0; i < opt.pointArr.length; i++) {
      polyline.addPoint(opt.pointArr[i]);
    }
    polyline.alpha = opt.alpha >= 1 ? 0.99 : opt.alpha;
    polyline.color = opt.color;
    polyline.depthTest = opt.depthTest;
    polyline.setWidth(opt.width);
    polyline.setAltitudeMethod(opt.altitude);
    // polyline.setAltitude(10);
    opt.height ? polyline.setAltitude(opt.height) : polyline.setAltitude(10);
    polyline.setMinDistance(5.0);
    polyline.name = opt.name;
    polyline.dash = opt.dash ? opt.dash : false;
    polyline.addProperty("name", opt.name);
    polyline.draw();
    polyline.end();
    return polyline;
  },
  drawPolygonGeometry(opt) {
    let geometry = new SSmap.Cartesian3Vector();
    opt.pointArr.forEach((item) => {
      geometry.push_back(item);
    });
    let extrudeEntity = new SSmap.ExtrudeEntity();
    extrudeEntity.setOuter(geometry);
    extrudeEntity.extrudeHeight = opt.height; // 几何体的高度
    extrudeEntity.alpha = opt.alpha >= 1 ? 1 : opt.alpha;
    extrudeEntity.roofAlpha = opt.alpha >= 1 ? 1 : opt.alpha; //顶部透明度
    extrudeEntity.color = opt.color;
    extrudeEntity.roofColor = opt.color; //顶部填充颜色
    if (opt.altitude) {
      extrudeEntity.altitude = opt.altitude;
    }
    if (opt.roofImageUrl) {
      extrudeEntity.roofMap =
        window.document.location.origin + "/" + opt.roofImageUrl;
    }
    if (opt.wallImageUrl) {
      extrudeEntity.wallMap =
        window.document.location.origin + "/" + opt.wallImageUrl;
    }
    if (opt.roofscale) {
      extrudeEntity.roofTextureScale = opt.roofscale;
    }
    if (opt.wallscale) {
      extrudeEntity.wallTextureScale = opt.wallscale;
    }

    extrudeEntity.create();
    let entity = extrudeEntity.createEntity();
    window.GlobalViewer.scene.addEntity(entity);
    entity.name = opt.name;
    if (opt.id) {
      entity.id = opt.id;
    }
    if (opt.name) {
      entity.tag = opt.name;
    }
    extrudeEntity.delete();
    geometry.delete();
    return entity;
  },
  drawLabel(opt) {
    var label3d = new SSmap.Label3D();
    label3d.position = opt.position;
    if (opt.text != "" && opt.text != undefined) {
      label3d.text = opt.text;
    }
    label3d.fontSize = opt.fontSize; //字体大小
    label3d.fontColor = opt.fontColor; //字体颜色，白色
    if (opt.strokeColor) {
      label3d.strokeColor = opt.strokeColor; //描边颜色，黑边
    }
    if (opt.background) {
      label3d.background = opt.background; //背景颜色
    }
    if (opt.url) {
      label3d.url = window.document.location.origin + "/" + opt.url; //图片路径
    }
    if (opt.vertical) {
      label3d.vertical = opt.vertical;
    }
    if (opt.horizontal) {
      label3d.horizontal = opt.horizontal;
    }
    if (opt.imageWidth) {
      label3d.imageWidth = opt.imageWidth;
    }
    if (opt.imageHeight) {
      label3d.imageHeight = opt.imageHeight;
    }
    if (opt.offset) {
      label3d.offset = opt.offset; //偏移量
    }
    if (opt.scaleByDistance) {
      label3d.setScaleByDistance(opt.scaleByDistance); //缩放比
    }
    if (opt.translucencyByDistance) {
      label3d.setTranslucencyByDistance(opt.translucencyByDistance); //缩放控制透明度
    }
    if (window.billboardCollection == null) {
      var bbcollection = new SSmap.BillboardCollection();
      window.billboardCollection = bbcollection;
    }
    if (opt.labelHeight) {
      label3d.labelHeight = opt.labelHeight;
    }

    label3d.name = opt.name;
    label3d.addProperty("name", opt.name);
    if (opt.id) {
      label3d.id = opt.id;
      label3d.addProperty("id", opt.id);
    }
    label3d.setCollection(window.billboardCollection);
    return label3d;
  },
  //获取面积
  calSpaceArea(pointArray) {
    var n = pointArray.length;
    var area = 0;

    // 使用 Shoelace 公式计算面积
    for (var i = 0; i < n; i++) {
      var j = (i + 1) % n;
      area += pointArray[i].x * pointArray[j].y;
      area -= pointArray[j].x * pointArray[i].y;
    }
    area = Math.abs(area) / 2;

    return area;
  },
  calculatePolygonCenter(vertices) {
    var centerX = 0;
    var centerY = 0;
    var centerZ = 0;
    let point = null;
    var n = vertices.length;

    // 计算所有顶点的坐标之和
    for (var i = 0; i < n; i++) {
      centerX += vertices[i].x;
      centerY += vertices[i].y;
      centerZ += vertices[i].z;
    }

    // 求平均值
    centerX /= n;
    centerY /= n;
    centerZ /= n;

    // 返回中心点的坐标
    point = SSmap.Vector3.create(centerX, centerY, centerZ);
    return point;
  },
  clearMeasure() {
    if (threeList.length > 0) {
      pointList.splice(0, pointList.length);
      let length = threeList.length;
      for (var i = length - 1; i > -1; i--) {
        threeList[i].delete();
        threeList.splice(i, 1);
        delete threeList[i];
      }
      let length1 = moveList.length;
      for (var i = length1 - 1; i > -1; i--) {
        moveList[i].delete();
        moveList.splice(i, 1);
        delete moveList[i];
      }
      let length2 = polyList.length;
      for (var i = length2 - 1; i > -1; i--) {
        polyList[i].delete();
        polyList.splice(i, 1);
        delete polyList[i];
      }
      let length3 = bbList.length;
      for (var i = length3 - 1; i > -1; i--) {
        bbList[i].delete();
        bbList.splice(i, 1);
        delete bbList[i];
      }
    }
  },
};
