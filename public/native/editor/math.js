//计算两点之间距离
export function distanceBetweenPoints(point1, point2) {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  const dz = point2.z - point1.z;

  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
//通过鼠标拾取世界坐标
export function pickWorldPositionByMouse(x, y) {
  let scene = GlobalViewer.scene;
  let ray = scene.mainCamera.screenPointToRay(x, y);
  let hit = new SSmap.RaycastHit();
  let point = null;
  if (scene.raycast(ray, hit)) {
    point = hit.point; //Vector3
    //客户端不能直接使用hit.point,重新拷贝一次
    point = SSmap.Vector3.create(point.x, point.y, point.z);
  }
  hit.delete();
  return point;
}
// Vector3转JSON
export function vec3ToJson(points) {
  let isArray = Array.isArray(points);
  points = isArray ? points : [points];
  let list = [];
  points.forEach((item) => {
    let obj = {};
    obj.x = item.x;
    obj.y = item.y;
    obj.z = item.z;
    list.push(obj);
  });
  return isArray ? list : list[0];
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
//旋转多边形形
export function rotateRectangle(center, vertices, angle) {
  let angleInRadians = ((45 + angle) * Math.PI) / 180;
  let arr = [];
  vertices.map(function (point) {
    // 将顶点坐标减去中心点坐标
    var x = point.x - center.x;
    var y = point.y - center.y;
    var z = point.z - center.z;

    // 应用绕 y 轴的旋转矩阵
    var rotatedX = x * Math.cos(angleInRadians) - z * Math.sin(angleInRadians);
    var rotatedZ = x * Math.sin(angleInRadians) + z * Math.cos(angleInRadians);

    // 将旋转后的顶点坐标加上中心点坐标
    let vec = SSmap.Vector3.create(
      rotatedX + center.x,
      y + center.y,
      rotatedZ + center.z
    );
    arr.push(vec);
  });
  return arr;
}

//使用底层库画线
export function drawLine(scene, pointList, tag, color, opacity) {
  debugger;
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
  var vertexBuffer = SSmap.Buffer.createVertexBuffer(pointList, stripSize);
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
}

export function rotationEntity(mat, degX, degY, degZ, offsetHeight) {
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
}

//已知中心点和长，计算四个顶点
export function calculateSquareVertices(centerX, centerY, sideLength) {
  var halfLength = sideLength / 2;

  // 顺时针旋转45度
  var rotateAngle = (45 * Math.PI) / 180;

  // 顶点相对中心点的位置
  var topLeft = { x: -halfLength, y: -halfLength };
  var topRight = { x: halfLength, y: -halfLength };
  var bottomRight = { x: halfLength, y: halfLength };
  var bottomLeft = { x: -halfLength, y: halfLength };

  // 顶点相对中心点的旋转后位置
  var rotatedTopLeft = {
    x: topLeft.x * Math.cos(rotateAngle) - topLeft.y * Math.sin(rotateAngle),
    y: topLeft.x * Math.sin(rotateAngle) + topLeft.y * Math.cos(rotateAngle),
  };

  var rotatedTopRight = {
    x: topRight.x * Math.cos(rotateAngle) - topRight.y * Math.sin(rotateAngle),
    y: topRight.x * Math.sin(rotateAngle) + topRight.y * Math.cos(rotateAngle),
  };

  var rotatedBottomRight = {
    x:
      bottomRight.x * Math.cos(rotateAngle) -
      bottomRight.y * Math.sin(rotateAngle),
    y:
      bottomRight.x * Math.sin(rotateAngle) +
      bottomRight.y * Math.cos(rotateAngle),
  };

  var rotatedBottomLeft = {
    x:
      bottomLeft.x * Math.cos(rotateAngle) -
      bottomLeft.y * Math.sin(rotateAngle),
    y:
      bottomLeft.x * Math.sin(rotateAngle) +
      bottomLeft.y * Math.cos(rotateAngle),
  };

  // 平移旋转后的顶点到原中心点位置
  var rotatedVertices = [
    { x: centerX + rotatedTopLeft.x, y: centerY + rotatedTopLeft.y, z: 10 },
    { x: centerX + rotatedTopRight.x, y: centerY + rotatedTopRight.y, z: 10 },
    {
      x: centerX + rotatedBottomRight.x,
      y: centerY + rotatedBottomRight.y,
      z: 10,
    },
    {
      x: centerX + rotatedBottomLeft.x,
      y: centerY + rotatedBottomLeft.y,
      z: 10,
    },
  ];

  var vertices = [];
  rotatedVertices.forEach((vertex) => {
    vertices.push(SSmap.Vector3.create(vertex.x, vertex.y, vertex.z));
  });

  return vertices;
}

// 计算两点之间的距离
function distance(point1, point2) {
  return Math.sqrt(
    Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2)
  );
}

// 计算中心点
function calculateCenter(vertices) {
  let sumX = 0,
    sumY = 0;
  for (let vertex of vertices) {
    sumX += vertex.x;
    sumY += vertex.y;
  }
  return { x: sumX / vertices.length, y: sumY / vertices.length };
}

// 旋转点
function rotatePoint(point, angle, center) {
  const radians = (angle * Math.PI) / 180;
  const cosAngle = Math.cos(radians);
  const sinAngle = Math.sin(radians);
  const translatedX = point.x - center.x;
  const translatedY = point.y - center.y;
  const x = translatedX * cosAngle - translatedY * sinAngle;
  const y = translatedX * sinAngle + translatedY * cosAngle;
  return { x: x + center.x, y: y + center.y };
}

// 计算旋转后的顶点
export function rotateRectangleVertices(vertices, angle) {
  const center = calculateCenter(vertices);
  const rotatedVertices = [];
  for (let vertex of vertices) {
    const rotatedPoint = rotatePoint(vertex, angle, center);
    rotatedVertices.push({ x: rotatedPoint.x, y: rotatedPoint.y, z: vertex.z });
  }
  let arr = [];
  rotatedVertices.map(function (point) {
    let vec = SSmap.Vector3.create(point.x, point.y, point.z);
    arr.push(vec);
  });
  return arr;
}
