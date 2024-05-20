import { getWorldPosition } from "../editor/math";
//线长
let pointLineList = [];
let entityAllList = [];
let linedistance = 0;
let lineList = [];
let nodeMoveList = [];
let laberMoveList = [];
let labelList = [];
let polyList = [];
let bbList = [];
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
  mouseDown(e, cb) {
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
      // this.movePoint(e, feature);
      // debugger;
      cb(checkFeature);
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
    // if (mouseMoveListener) {
    //   // document
    //   //   .getElementById("qtcanvas")
    //   //   .removeEventListener("mousemove", mouseMoveListener);
    //   mouseMoveListener = null; // 置空变量
    // }
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
    // console.log(e, checkPoint, "5555555", checkFeature, newPosition.x);
    newPosition = SSmap.Vector3.create(
      newPosition.x,
      newPosition.y,
      newPosition.z
    );
    checkFeature.parent.position = newPosition;
    // checkFeature.parent.position.y = newPosition.y;
    // checkFeature.parent.position.z = newPosition.z;
    this.updataLine();
  },
  setPoint(e, cb) {
    let feature = window.GlobalViewer.scene.getFeatureByMouse();
    if (feature && feature.parent.objectName == "bill") {
      // debugger;
      checkFeature = feature;
      // feature.parent.position.x = 0;

      // this.mouseDown(e);
      cb(feature);
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
  
  clearMeasure() {
    if (bbList.length > 0) {
      let length = entityAllList.length;
      for (var i = length - 1; i > -1; i--) {
        entityAllList[i].delete();
        entityAllList.splice(i, 1);
        delete entityAllList[i];
      }
      let length2 = labelList.length;
      for (var i = length2 - 1; i > -1; i--) {
        labelList[i].delete();
        labelList.splice(i, 1);
        delete labelList[i];
      }
      let length3 = bbList.length;
      for (var i = length3 - 1; i > -1; i--) {
        bbList[i].delete();
        bbList.splice(i, 1);
        delete bbList[i];
      }
      let length1 = polyList.length;
      for (var i = length1 - 1; i > -1; i--) {
        polyList[i].delete();
        polyList.splice(i, 1);
        delete polyList[i];
      }
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
