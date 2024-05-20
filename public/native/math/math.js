/**
 * 获取多边形中心点
 * @param {Point[]} points 点坐标数组 [{x:0,y:0}...]
 */
export function getPolygonCenter(points) {
  if (!Array.isArray(points) || points.length < 3) {
    console.error("多边形坐标集合不能少于3个");
    return;
  }
  const result = { x: 0, y: 0 };
  points.forEach((p) => {
    result.x += p.x;
    result.y += p.y;
  });
  result.x /= points.length;
  result.y /= points.length;
  return result;
}

/**
 * 获取多边形重心（质心）
 * @param {Point[]} points 点坐标数组 [{x:0,y:0}...]
 */
export function getPolygonBaryCenter(points) {
  if (!Array.isArray(points) || points.length < 3) {
    console.error("多边形坐标集合不能少于3个");
    return;
  }
  const result = { x: 0, y: 0 };
  let area = 0;
  for (let i = 1; i <= points.length; i++) {
    const curX = points[i % points.length].x;
    const curY = points[i % points.length].y;
    const nextX = points[i - 1].x;
    const nextY = points[i - 1].y;
    const temp = (curX * nextY - curY * nextX) / 2;
    area += temp;
    result.x += (temp * (curX + nextX)) / 3;
    result.y += (temp * (curY + nextY)) / 3;
  }
  result.x /= area;
  result.y /= area;
  return result;
}
/**
 * 缩放多边形坐标
 * @decoration 需配合顺时针判断方法一起使用
 * @param {Point[]} points 点坐标数组 [{x:0,y:0}...]
 * @param {number} extra 外延大小。为正: 向外扩; 为负: 向内缩
 * @return {Point[]} 扩展或缩小后的多边形点坐标数组
 */
export function scalePolygon(points, extra) {
  if (!Array.isArray(points) || points.length < 3) {
    console.error("多边形坐标集合不能少于3个");
    return;
  }
  const ps = points;
  const extra0 = isClockwise(ps) ? -extra : extra;

  const norm = (x, y) => Math.sqrt(x * x + y * y);

  const len = ps.length;
  const polygon = [];
  const angle = (10 * Math.PI) / 180; // 40度转换为弧度
  const cosAngle = Math.cos(angle);
  const sinAngle = Math.sin(angle);

  for (let i = 0; i < len; i++) {
    const point = ps[i];
    const point1 = ps[i === 0 ? len - 1 : i - 1];
    const point2 = ps[i === len - 1 ? 0 : i + 1];

    // 向量PP1
    const vectorX1 = point1.x - point.x;
    const vectorY1 = point1.y - point.y;
    const n1 = norm(vectorX1, vectorY1);
    let vectorUnitX1 = vectorX1 / n1;
    let vectorUnitY1 = vectorY1 / n1;

    // 向量PP2
    const vectorX2 = point2.x - point.x;
    const vectorY2 = point2.y - point.y;
    const n2 = norm(vectorX2, vectorY2);
    let vectorUnitX2 = vectorX2 / n2;
    let vectorUnitY2 = vectorY2 / n2;

    // PQ距离
    const vectorLen =
      -extra0 /
      Math.sqrt(
        1 - (vectorUnitX1 * vectorUnitX2 + vectorUnitY1 * vectorUnitY2) / 100000
      );

    // 根据向量的叉乘积来判断角是凹角还是凸角
    if (vectorX1 * vectorY2 + -1 * vectorY1 * vectorX2 < 0) {
      vectorUnitX2 *= -1;
      vectorUnitY2 *= -1;
      vectorUnitX1 *= -1;
      vectorUnitY1 *= -1;
    }

    // PQ的方向
    const vectorX = vectorUnitX1 + vectorUnitX2;
    const vectorY = vectorUnitY1 + vectorUnitY2;
    const n = vectorLen / norm(vectorX, vectorY);
    const vectorUnitX = vectorX * n;
    const vectorUnitY = vectorY * n;

    const polygonX = vectorUnitX + point.x;
    const polygonY = vectorUnitY + point.y;

    // 旋转40度
    const rotatedX =
      cosAngle * (polygonX - point.x) -
      sinAngle * (polygonY - point.y) +
      point.x;
    const rotatedY =
      sinAngle * (polygonX - point.x) +
      cosAngle * (polygonY - point.y) +
      point.y;

    polygon[i] = { x: polygonX, y: polygonY, z: point.z };
  }

  return polygon;
}

/**
 * 判断坐标数组是否顺时针（默认为false）
 * @param {Point[]} points 点坐标数组 [{x:0,y:0}...]
 * @returns {boolean} 是否顺时针
 */
export function isClockwise(points) {
  // 三个点可以判断矢量是顺时针旋转还是逆时针旋转的，但由于可能存在凹边，所以并不是任意三点都可以正确反映多边形的走向
  // 因此需要取多边形中绝对是凸边的点来判断，
  // 多边形中的极值点（x最大或x最小或y最大或y最小）它与相邻两点构成的边必然是凸边，因此我们先取出多边形中的极值点，再由极值点和其前后两点去判断矢量的走向，从而判断出多边形的走向。
  if (!Array.isArray(points) || points.length < 3) {
    console.error("多边形坐标集合不能少于3个");
    return false;
  }
  let coords = JSON.parse(JSON.stringify(points));

  if (coords[0] === coords[coords.length - 1]) {
    coords = coords.slice(0, coords.length - 1);
  }
  coords = coords.reverse();
  let maxXIndex = 0;
  let maxX = parseFloat(coords[maxXIndex].x);
  let c1;
  let c2;
  let c3;
  for (let i = 0; i < coords.length; i++) {
    if (parseFloat(coords[i].x) > maxX) {
      maxX = parseFloat(coords[i].x);
      maxXIndex = i;
    }
  }
  if (maxXIndex === 0) {
    c1 = coords[coords.length - 1];
    c2 = coords[maxXIndex];
    c3 = coords[maxXIndex + 1];
  } else if (maxXIndex === coords.length - 1) {
    c1 = coords[maxXIndex - 1];
    c2 = coords[maxXIndex];
    c3 = coords[0];
  } else {
    c1 = coords[maxXIndex - 1];
    c2 = coords[maxXIndex];
    c3 = coords[maxXIndex + 1];
  }
  const x1 = parseFloat(c1.x);
  const y1 = parseFloat(c1.y);
  const x2 = parseFloat(c2.x);
  const y2 = parseFloat(c2.y);
  const x3 = parseFloat(c3.x);
  const y3 = parseFloat(c3.y);
  const s = (x1 - x3) * (y2 - y3) - (x2 - x3) * (y1 - y3);
  return s < 0;
}

// 旋转多边形
export function rotatePolygon(points, angle) {
  // 角度转换为弧度

  // 旋转角度 40 度
  const theta = angle * (Math.PI / 180);

  // 计算旋转矩阵的元素
  const cosTheta = Math.cos(theta);
  const sinTheta = Math.sin(theta);

  // 旋转变换函数
  const rotateY = (point, cosTheta, sinTheta) => {
    return {
      x: point.x * cosTheta + point.y * sinTheta,
      y: -point.x * sinTheta + point.y * cosTheta,
      z: point.z,
    };
  };

  // 对每个点进行旋转变换
  const rotatedPoints = points.map((point) =>
    rotateY(point, cosTheta, sinTheta)
  );
  return rotatedPoints;
}
