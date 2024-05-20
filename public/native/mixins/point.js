//点击点位
const bbList = [];
let coorFrame = null;
export const Point = {
  getWorldPosition(event, callback) {
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
        callback(pp);
      }
    }
    hit.delete();
  },

  checkPoint(poi, url, callback) {
    let point = SSmap.Vector3.create(poi.x, poi.y, poi.z);
    let la = point.toCartographic().toDegrees();
    // console.log(la.latitude, url, "789789");
    let Geoobj = {
      position: point, //坐标
      name: "zuobiao",
      url: "src/images/circle.png", //路径
      scale: 0.5, //比例
      altitude: 10, //海拔，非必填
      // imageWidth:0,
      // imageHeight:0,
      // altitudeMethod: SSmap.AltitudeMethod.Absolute(), //Absolute 绝对海拔  OnTerrain 贴地 RelativeToTerrain 贴地并相对海拔
    };
    var Billboard = this.addBillboard(Geoobj, url);
    bbList.push(Billboard);
    console.log("la", la);

    let tohic = point.toCartesian3().toVector3();
    if (coorFrame) {
      coorFrame.delete();
    }
    coorFrame = new SSmap.FrameAction();
    coorFrame.onTriggered(() => {
      //每一帧改变div的位置
      // debugger;
      // let elem = document.querySelector(".text-info");
      var xyposition =
        window.GlobalViewer.scene.mainCamera.worldToScreenPoint(tohic);
      // console.log(xyposition, "xyposition");
      // elem.style.bottom = 0.1 - xyposition.y + elem.clientHeight / 2 + "px";
      // elem.style.left = 0.1 + xyposition.x - elem.clientWidth * 1.8 + "px";
      // console.log("456456");
      let wPosition = {
        x: xyposition.x,
        y: xyposition.y,
        z: xyposition.z,
      };
      let pointLa = {
        latitude: la.latitude,
        longitude: la.longitude,
        height: la.height,
        xyposition: wPosition,
      };
      callback(pointLa);
    });
    window.GlobalViewer.scene.rootEntity.addComponent(coorFrame);
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
  clearMeasure() {
    let length2 = bbList.length;
    for (var i = length2 - 1; i > -1; i--) {
      bbList[i].delete();
      bbList.splice(i, 1);
      delete bbList[i];
    }
  },
};
