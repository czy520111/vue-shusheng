//计算两点之间距离
export function distanceBetweenPoints(point1, point2) {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  const dz = point2.z - point1.z;

  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

//点是否在线上
export function isPointOnLine(point, start, end, lineWidth) {
  // 计算线段的参数方程
  const t =
    ((point.x - start.x) * (end.x - start.x) +
      (point.y - start.y) * (end.y - start.y) +
      (point.z - start.z) * (end.z - start.z)) /
    ((end.x - start.x) ** 2 + (end.y - start.y) ** 2 + (end.z - start.z) ** 2);

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
        (end.x - start.x) ** 2 + (end.y - start.y) ** 2 + (end.z - start.z) ** 2
      );
    // 判断点到直线的距离是否小于线段的宽度
    if (distance <= lineWidth) {
      return true; // 点在线段上
    }
  }

  return false; // 点不在线段上
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
//比较数组的值
export function compareArrays(arr1, arr2) {
  const set1 = new Set(arr1);
  const set2 = new Set(arr2);

  if (set1.size !== set2.size) {
    return false; // 数组长度不同，值必然不同
  }

  for (const item of set1) {
    if (!set2.has(item)) {
      return false; // 发现不同的值
    }
  }

  return true; // 没有发现不同的值，数组相同
}

// 重新计算顶点坐标
export function recomputeVertices(centerX, centerY, centerZ, vertices) {
  const newVertices = [];
  for (const vertex of vertices) {
    const newX = vertex.x - centerX;
    const newY = vertex.y - centerY;
    const newZ = vertex.z - centerZ;
    newVertices.push({ x: newX, y: newY, z: newZ });
  }
  return newVertices;
}
//重新加位置坐标
export function addcomputeVertices(centerX, centerY, centerZ, vertices) {
  const newVertices = [];
  for (const vertex of vertices) {
    const newX = vertex.x + centerX;
    const newY = vertex.y + centerY;
    const newZ = vertex.z + centerZ;
    newVertices.push({ x: newX, y: newY, z: newZ });
  }
  return newVertices;
}
