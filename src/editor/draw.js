//画线
export function drawPolyline(opt) {
  var polyline = new SSmap.Polyline3D();
  for (var i = 0; i < opt.pointArr.length; i++) {
    polyline.addPoint(opt.pointArr[i]);
  }
  polyline.alpha = opt.alpha >= 1 ? 0.99 : opt.alpha;
  polyline.color = opt.color;
  polyline.depthTest = opt.depthTest;
  polyline.setWidth(opt.width);
  polyline.setAltitudeMethod(opt.altitude);
  polyline.setAltitude(0.1);
  polyline.setMinDistance(5.0);
  polyline.name = opt.name;
  polyline.addProperty("name", opt.name);
  polyline.draw();
  polyline.end();
  return polyline;
}
//标签
export function drawLabel(opt) {
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
}

//绘制面
export function drawPolygon3D(opt) {
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
}

/**
 * 绘制多边形体
 * @param {Object} height 高度
 * @param {Object} alpha 透明度
 * @param {Object} pointArr 节点数组 Cartesian3格式
 * @param {Object} color 颜色
 * @param {Object} name 名称
 */
export function drawPolygonGeometry(opt) {
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
}
