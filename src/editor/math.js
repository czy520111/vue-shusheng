//计算两点之间距离
export function distanceBetweenPoints(point1, point2) {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  const dz = point2.z - point1.z;

  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
//获取世界坐标
export function getWorldPosition(event) {
  var camera = window.GlobalViewer.scene.mainCamera; //获取相机

  var hit = new SSmap.RaycastHit(); //射线投影
  //鼠标点击的位置，通过相机视角射线获取
  var ray = camera.screenPointToRay(event.x, event.y);
  var rayok = window.GlobalViewer.scene.raycast(ray, hit); //判断是否存在
  var point = 0;
  if (rayok) {
    if (hit) {
      point = hit.point; //Vector3
    }
  }
  hit.delete();
  return point;
}
//获取面积
export function calSpaceArea(pointArray) {
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
}

// 计算多边形的中心点
export function calculatePolygonCenter(vertices) {
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
}
