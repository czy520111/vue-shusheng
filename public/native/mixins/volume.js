//体积
// let pointList = [];
let Height = 0;
let referHeight = 0;
let Areas = 0;
let threeList = [];
let bbList = [];
let polyList = [];
let pointList = [];
let moveList = [];
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
    //   Height = height;
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
