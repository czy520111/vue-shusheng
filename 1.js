 //物体自身旋转(spin)
 rotationEntity(mat, degX, degY, degZ, offsetHeight) {
  let carto = mat.translation().toCartographic();
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
   degZ
  ).toRotationMatrix();

  let rotation = SSmap.Matrix3.multiply(rotX, rotY);
  rotation = SSmap.Matrix3.multiply(rotation, rotZ);

  let pos = SSmap.Vector3.create(0, 0, 0);
  let rotationMat = SSmap.Matrix4.fromRotationTranslation(rotation, pos);

  let matrix = SSmap.Matrix4.multiply(mat, rotationMat);
  return matrix;
 }