<template>
  <div class="ui-wrapper">
    <el-tooltip content="我的位置" placement="top">
      <el-button
        class="IMhome"
        type="primary"
        icon="el-icon-s-home"
        circle
        @click="flyToHome"
      ></el-button>
    </el-tooltip>

    <el-button
      type="primary"
      icon="el-icon-picture-outline"
      size="small"
      @click="opencrop()"
    >
      html对象
    </el-button>

    <el-button
      type="primary"
      icon="el-icon-picture-outline"
      size="small"
      @click="deletedomHtml()"
    >
      移除对象
    </el-button>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      longitude: 0,
      latitude: 0,
      bubbleshow: false,
      idnum: 0,
    };
  },
  created() {
    window.initScene = () => {
      window.viewer = window.GlobalViewer;
      this.draw();
      window.HtmldomList = []; //节点参数集合
      //监听鼠标移除canvas
      //document.getElementById("qtcanvas").addEventListener("mouseout", this.canvasMouse);
      window.viewer.setAuthorizedUrl(
        `https://www.dataarche.com:8062/authentic/license?t=2023-03-21T11:09:37.152`
      );
    };
  },
  methods: {
    draw() {
      this.flyToHome();
      this.addTiandituImagery();
    },

    addTiandituImagery() {
      if (!window.nowLayer) {
        //需要在QGIS中正常加载后，拿到图层属性的中source对应的链接
        let wmtsurl =
          "crs=EPSG:3857&format=image/jpeg&layers=World_Imagery&styles=default&tileMatrixSet=default028mm&url=https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/WMTS";
        //let wmtsurl ="IgnoreAxisOrientation=1&IgnoreGetMapUrl=1&IgnoreReportedLayerExtents=1&InvertAxisOrientation=1&crs=EPSG:4326&dpiMode=7&format=image/png&layers=wmts_4326_440300&styles=default&tileMatrixSet=c&url=https://jingzhe.szft.gov.cn/sfmap/MapTileService/wmts?SERVICE%3DWMTS%26REQUEST%3DGetCapabilities%26STORETYPE%3Dmerged-dat%26LAYER%3Dwmts_4326_440300%26PROJECTION%3D4326";
        window.nowLayer = window.viewer.scene.globe.addWmsImageryLayer(wmtsurl);
        window.viewer.scene.globe.lightingEnabled = false;
      }
    },
    addTiandituImagery1() {
      let scene = window.viewer.scene;
      let globe = scene.globe;
      globe.lightingEnabled = true;
      let imageLayer = new SSmap.TiandituImageryLayer();
      imageLayer.url =
        "https://t1.tianditu.gov.cn/DataServer?T=img_c&x={x}&y={y}&l={z}&tk=f6362cc90bd27c5445afaae2febf5745";
      imageLayer.useWebMercator = false;
      imageLayer.tileWidth = 256;
      imageLayer.tileHeight = 256;
      imageLayer.minimumLevel = 1;
      imageLayer.maximumLevel = 17;
      imageLayer.hasAlphaChannel = false;
      imageLayer.isLabel = false;
      imageLayer.componentComplete();
      return imageLayer;
    },
    opencrop() {
      document
        .getElementById("qtcanvas")
        .addEventListener("click", this.mouseClickEvent);
      document.getElementById("qtcanvas").style.cursor = "crosshair";
    },
    //移除domHtml
    deletedomHtml() {
      let fbubble = document.getElementById("bubbleContent");
      for (var i = 0; i < fbubble.childNodes.length; i++) {
        fbubble.removeChild(fbubble.childNodes[i]);
        window.HtmldomList.shift();
        i--;
      }

      //删除帧率监听
      window.videoInterval.delete();
      window.videoInterval = null;
    },
    //鼠标点击事件
    mouseClickEvent(event) {
      var nowidnum = this.idnum;
      if (window.viewer.scene == undefined) return;
      // //获取相机
      var camera = window.viewer.scene.mainCamera;
      var hit = new SSmap.RaycastHit(); //射线投影
      //鼠标点击的位置，通过相机视角射线获取
      var ray = camera.screenPointToRay(event.x, event.y);
      var rayok = window.viewer.scene.raycast(ray, hit); //判断是否存在
      var point = 0;
      var tohic = null;
      if (rayok) {
        if (hit) {
          //获取坐标
          point = hit.point; //Vector3
          //Vector3转笛卡尔
          tohic = point.toCartesian3().toVector3();
        }
      }
      hit.delete();

      //鼠标左键点击
      if (event.button == 0) {
        var nowid = "trackPopUpContent" + nowidnum;
        let opt = {
          id: nowid, //唯一 和 HTMLdiv中的一致
          HTMLdiv: `<div id="${nowid}" class="leaflet-popup leaflet-popup-content-wrapper"        style="background: transparent; position: absolute;text-align: center;">
                      <div class="leaflet-popup-content-wrapper" style="background:#FFF;text-align: center;overflow-y: auto;padding: 1px;text-align: left;border-radius: 5px;">
                          <div id="trackPopUpLink" class="leaflet-popup-content" style="max-width:300px;max-height:500px">
                          <h5>定位气泡</h5>
                          </div>
                      </div>
                      <div class="leaflet-popup-tip-container" style="height: initial;margin: 0 auto;width: 40px;height: 20px;position: relative;overflow: hidden;">
                          <div class="leaflet-popup-tip" style="transform: inherit; width:3px; height:25px; background: #409EFF; margin: auto; box-shadow:#409EFF 0px 1px 10px;">
                          </div>
                          <div style="box-shadow: 0px 0px 8px #409EFF;width:8px;height:8px;background:#409EFF;margin:auto;border-radius:50%;"></div>
                      </div>
                  </div>`,
          Offset: {
            x: 0,
            y: 0,
          }, //偏移量
          coordinate: tohic, //笛卡尔坐标参数
        };
        window.HtmldomList.push(opt);
        this.addHtmldom();
        this.drawcallbackevent();
      }
      this.idnum++;
    },
    addHtmldom() {
      //bubbleContent的html 在map3d.vue中
      let fbubble = document.getElementById("bubbleContent");
      let htmlnum = 0;
      var camera = window.viewer.scene.mainCamera;
      //生成HTML的参数
      if (window.videoInterval == undefined || window.videoInterval == null) {
        window.videoInterval = new SSmap.FrameAction();
        window.videoInterval.onTriggered(function () {
          //console.log("帧率秒数",deltaSeconds);
          //添加气泡的HTML
          for (let i = htmlnum; i < window.HtmldomList.length; i++) {
            let Htmldom = window.HtmldomList[i];
            fbubble.innerHTML += Htmldom.HTMLdiv;
            htmlnum += 1;
          }
          for (var j = 0; j < window.HtmldomList.length; j++) {
            var canvasHeight = window.viewer.scene.canvas.height;
            let Htmldom = window.HtmldomList[j];
            var xyposition = camera.worldToScreenPoint(Htmldom.coordinate);
            var nowbubble = document.getElementById(Htmldom.id);
            if (xyposition.z > -1 && xyposition.z < 1) {
              nowbubble.style.bottom =
                0.1 + canvasHeight - xyposition.y + Htmldom.Offset.y + "px";
              nowbubble.style.left =
                0.1 +
                xyposition.x +
                -(nowbubble.scrollWidth / 2) +
                Htmldom.Offset.x +
                "px";
            }
          }
        });

        if (window.videoInterval != undefined && window.videoInterval != null) {
          window.viewer.scene.rootEntity.addComponent(window.videoInterval);
        }
      }
    },
    drawcallbackevent() {
      document
        .getElementById("qtcanvas")
        .removeEventListener("click", this.mouseClickEvent); //关闭鼠标点击事件
      document.getElementById("qtcanvas").style.cursor = "default"; //鼠标箭头恢复
    },
    flyToHome() {
      let scene = window.viewer.scene;
      let camera = scene.mainCamera;
      let position = SSmap.Cartographic.fromDegrees(
        114.054494,
        22.540745,
        1300
      );
      camera.flyTo(position);
    },
    //监听canvas鼠标移动事件
    canvasMouse() {
      document.getElementById("qtcanvas").click();
    },
  },
};
</script>

<style scoped>
.ui-wrapper {
  position: absolute;
  width: 100%;
  top: 6px;
}

.IMhome {
  position: absolute;
  right: 6px;
}
</style>
