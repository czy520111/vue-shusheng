//面积
let pointList = [];
let threeList = [];
let moveList = [];
let bbList = [];
let polyList = [];
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
