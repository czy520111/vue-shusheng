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
//创建球体
export function createSphere(position, radius, color) {
  let sphere = new SSmap.Sphere3D();
  sphere.radii = SSmap.Vector3.create(100.0, 100.0, 100.0);
  sphere.color = SSmap.Color.fromRgb(0, 255, 0, 255);
  sphere.position = SSmap.Cartographic.fromDegrees(
    114.054,
    22.5324,
    30.0
  ).toVector3();
  sphere.create();

  let sphereEntity = sphere.createEntity();
  sphereEntity.parent = SSmap.Entity.root();
  Utils.sphere3d = sphereEntity;
}
