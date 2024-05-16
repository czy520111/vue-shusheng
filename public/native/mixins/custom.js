import { Tileset, tilesArr } from "../core/tiles.js";
// import { useUsersStore } from "../../../src/store/index.js";
import { calculatePolygonCenter, vec3ToJson } from "../editor/math.js";
let projectLayer = null;
let tileFeature = null;
let nowNode = null;
let factoryNumber = null;
let modifiedStr = null;
let frame = null;
let landNumber = null;
let ProjectFeature = null;
let directionVal = [];
let checkTiles = null;
let nowTile = null;
let layers = {};
let boxColor = {
  r: 166,
  g: 172,
  b: 227,
  a: 1,
};
let boxColor2 = {
  r: 122,
  g: 151,
  b: 227,
  a: 1,
};
let boxColor3 = {
  r: 167,
  g: 81,
  b: 223,
  a: 1,
};
export const Custom = {
  addNode(options, cb) {
    if (!options.data || typeof options.data != "object") {
      throw new TypeError("投影节点data参数需传入geojson数据");
    }

    let defaults = {
      data: null,
      mode: "WholeScene",
      textureSize: 2048,
      colorKey: "",
      style: {
        colorRgba: [255, 255, 255, 1],
        strokeColorRgba: [255, 255, 255, 1],
        selectedColorRgab: [],
        strokeAlpha: "",
        selectedColorAlpha: 1,
        strokeWidth: 0.01,
        alpha: null,
      },
    };
    options = this.mergeOptions(defaults, options);
    projectLayer = new SSmap.ProjectionLayer();
    projectLayer.sceneMode = SSmap.TextureProjectionSceneMode.WholeScene;
    projectLayer.textureSize = options.textureSize;
    projectLayer.beforeTranslucent = true;
    let nodes = [];

    let features = options.data.features; //加载后的jeojson数据
    features.forEach((feature, index) => {
      feature.properties.index = index;
      let coordinates =
        feature.geometry.type == "MultiPolygon"
          ? feature.geometry.coordinates[0]
          : feature.geometry.coordinates;

      //属性关键字重置颜色
      if (options.colorKey) {
        let value = feature.properties[options.colorKey];
        options.style.colorRgba = value;
      } else if (feature.properties.RGBA) {
        let colorArr = feature.properties.RGBA.split(",");

        let colorArrNumber = [
          +colorArr[0],
          +colorArr[1],
          +colorArr[2],
          +colorArr[3],
        ];

        options.style.colorRgba = colorArrNumber;
      }
      let data = {
        style: options.style,
        coordinates: coordinates,
        properties: feature.properties,
      };
      createNode(data);
    });

    //创建投影节点
    function createNode(data) {
      let coordinates = data.coordinates;
      let properties = data.properties;
      let style = data.style;

      let node = new SSmap.ProjectionNode();
      // let uuid = store.add(node);

      let cartoArr = new SSmap.CartographicVector();
      let points = coordinates[0];
      let newPoints = caclRoid(points);
      //   var poly = turf.polygon([points]);
      //   var maxPoly = turf.transformScale(poly, 1.2);
      //   let minPoly = turf.transformScale(poly, 0.85);
      //   var union = turf.union(maxPoly, minPoly);
      newPoints.forEach((point) => {
        let carto = SSmap.Cartographic.fromDegrees(point[0], point[1], 0);
        // console.log("88888888", carto, point);
        cartoArr.push_back(carto);
      });
      node.setPoints(cartoArr);
      cartoArr.delete();

      if (coordinates.length > 1) {
        // 挖洞
        for (let i = 1; i < coordinates.length; i++) {
          let holeList = new SSmap.CartographicVector();
          let holePoints = coordinates[i];
          holePoints.forEach((point) => {
            let carto = SSmap.Cartographic.fromDegrees(point[0], point[1], 0);
            holeList.push_back(carto);
          });
          node.setHole(holeList);
          holeList.delete();
        }
      }

      // 添加属性
      let feature = new SSmap.Feature();
      for (let key in properties) {
        feature.setProperty(key, String(properties[key]));
      }
      feature.setProperty("uuid", "777777");
      node.setFeature(feature);
      node.setColor(SSmap.Color.fromRgb(0, 0, 255, 0.8 * 255));
      if (style.selectedColorRgab.length) {
        node.setSelectedColor(SSmap.Color.fromRgb(255, 0, 0, 0.8 * 255));
      }

      if (style.strokeColorRgba.length) {
        node.setStrokeColor(SSmap.Color.fromRgb(0, 0, 255, 0.8 * 255));
      }
      node.setStrokeWidth(style.strokeWidth);

      projectLayer.addNode(node);
      projectLayer.moveToTop(node);

      nodes.push(node);
    }
    function caclRoid(points) {
      const centroid = points
        .reduce(
          (acc, point) => {
            acc[0] += point[0];
            acc[1] += point[1];
            return acc;
          },
          [0, 0]
        )
        .map((coord) => coord / points.length);

      const [Cx, Cy] = centroid;

      console.log(`质心: (${Cx}, ${Cy})`);

      // 计算新的坐标点
      const scaledPoints = points.map(([x, y]) => {
        const x_new = Cx + 1.1 * (x - Cx);
        const y_new = Cy + 1.1 * (y - Cy);
        return [x_new, y_new];
      });

      return scaledPoints;
    }

    // map.set(projectLayer, nodes);

    //返回投影层id
    // let layerId = store.add(projectLayer, options.id);
    // cb && cb(layerId);
  },
  addProjection(json) {
    this.addNode({
      data: json,
      colorKey: "",
      style: {
        colorRgba: [0, 0, 255, 0.8],
        strokeColorRgba: [0, 0, 255, 0.8],
        selectedColorRgab: [0, 255, 0, 0.8],
        strokeWidth: 1,
        selectedColorAlpha: 0.7,
        alpha: 0.7,
      },
    });
    return;
    let sceneMode = "TerrainOnly";
    console.log(json, "jsonnnnnnnnn");
    json.features.forEach((item) => {
      let projectionNode = new window.SSmap.ProjectionNode();
      let points = new window.SSmap.CartographicVector();
      item.geometry.coordinates[0].forEach((j) => {
        j.forEach((k) => {
          points.push_back(k.toCartesian3().toCartographic());
        });
      });
      projectionNode.setPoints(points);
      projectionNode.setColor(window.SSmap.Color.fromRgb(0, 0, 255, 150));
      let projectLayer = layers[sceneMode];
      projectLayer.addNode(projectionNode);
    });
  },
  //添加投影面
  addProjectionLayer(url) {
    // Native.addProjection(json);
    projectLayer = new SSmap.ProjectionLayer();
    projectLayer.sceneMode = SSmap.TextureProjectionSceneMode.WholeScene;
    let proJson = null;
    fetch(url + "/data/geojson/model-design.json")
      .then((response) => response.json())
      .then((json) => {
        console.log(json, "json");
        json.features.forEach((item) => {
          item.geometry.coordinates[0].forEach((j) => {
            j.forEach((k) => {
              k += 5;
              console.log(k, "kkkkk");
            });
          });
        });
        proJson = json;

        console.log(proJson, "projson");
      });

    // projectLayer = new SSmap.ProjectionLayer();
    // projectLayer.sceneMode = SSmap.TextureProjectionSceneMode.WholeScene;
    // let pdSource = new SSmap.ProjectionDataSource();
    pdSource.setColor(SSmap.Color.fromRgb(0, 0, 255, 150));
    pdSource.setSelectedColor(SSmap.Color.fromRgb(0, 255, 0, 128));
    pdSource.setStrokeWidth(3);
    pdSource.setStrokeColor(SSmap.Color.fromRgb(0, 0, 255, 150));
    //   pdSource.setSelectedStrokeColor(SSmap.Color.fromRgb(0, 255, 0, 128));
    pdSource.addField("Layer"); //需要拾取的属性
    pdSource.addField("area"); //需要拾取的属性
    pdSource.enabled = true;
    // pdSource.loadGeoJson(url + "/data/geojson/model-design.json");
    // projectLayer.addDataSource(pdSource);
  },
  mouseClickEvent(e, cb) {
    // const store = useUsersStore();
    // console.log(store, "123123123");
    // console.log(tilesArr, "8888888888888");
    let feature = projectLayer.getFeatureByMouse();
    // tilesArr[16].enabled = false;
    // console.log(e.arr[0], "feature8888");

    //   (projectLayer).setColor(SSmap.Color.fromRgb(0, 0, 255, 128));
    ProjectFeature = feature;
    console.log(projectLayer, "ppppppppppppp");
    tileFeature = window.GlobalViewer.scene.getFeatureByMouse();
    // console.log(tileFeature.tileset, "tileFeature666666666");
    // tileFeature = feature5;
    // console.log(feature, projectLayer, "789789", projectLayer, feature5);
    // let ce = direction.center().toVector3();
    if (nowNode && feature) {
      nowNode.setColor(SSmap.Color.fromRgb(0, 0, 255, 0.8 * 255)); //一开始颜色
      nowNode.setSelectedColor(SSmap.Color.fromRgb(0, 255, 0, 0.8 * 255)); //点击时颜色
      // (nowNode).setStrokeWidth(3);
      nowNode.setStrokeColor(SSmap.Color.fromRgb(0, 0, 255, 0.8 * 255));
    }

    if (feature) {
      Tileset.pickFeature({ x: e.x, y: e.y }, (data) => {
        let name = data.properties.name;
        name = name.slice(0, -3);
        // console.log(data, "data411");
        tilesArr.forEach((item) => {
          // console.log(item, "456456");
          if (item.url.includes(name)) {
            nowTile = item;
            console.log(nowTile, "456456");
          }
          // item.enabled = false;
        });
      });
      // createDomLabel(e);
      console.log(tileFeature, "tileFeature");
      // let dire = tileFeature.tileset.rectangle;
      // let southwest = dire.southwest().toVector3();
      // let southeast = dire.southeast().toVector3();
      // let northeast = dire.northeast().toVector3();
      // let northwest = dire.northwest().toVector3();
      // directionVal.push(southwest, southeast, northeast, northwest);
      let Layer = feature.getProperty("Layer");
      let Area = feature.getProperty("area");
      let modified = Layer.substring(0, Layer.lastIndexOf("_"));
      factoryNumber = Layer;
      landNumber = Math.round(Area * 10) / 10;
      modifiedStr = modified;
      // let polygon = feature.polygon();
      // debugger;

      nowNode = projectLayer.getNode(feature);
      //   this.oldcolor = window.nownode.color();
      nowNode.setColor(SSmap.Color.fromRgb(0, 0, 255, 0.8 * 255));
      nowNode.setSelectedColor(SSmap.Color.fromRgb(0, 255, 0, 0.8 * 255));
      nowNode.setStrokeColor(SSmap.Color.fromRgb(0, 0, 255, 0.8 * 255));
      // console.log(factoryNumber, "ffffaaa");
      cb({
        feature: true,
        factoryNumber,
        landNumber,
        modifiedStr,
      });
    }
  },
  createDomLabel(point, cb) {
    let world = SSmap.Vector3.create(point.x, point.y, point.z);
    let tohic = world.toCartesian3().toVector3();
    if (frame) {
      frame.delete();
    }
    frame = new SSmap.FrameAction();
    frame.onTriggered(() => {
      //每一帧改变div的位置
      // debugger;
      var xyposition =
        window.GlobalViewer.scene.mainCamera.worldToScreenPoint(tohic);

      cb({ x: xyposition.x, y: xyposition.y });
      // console.log("456456");
    });
    window.GlobalViewer.scene.rootEntity.addComponent(frame);
  },
  showDeitHandle(cb) {
    console.log(nowNode, "nnnnnnnnn");
    nowTile.enabled = false;
    let feature = nowNode.feature();

    let dire = nowTile.tileset().rectangle;
    let southwest = dire.southwest().toVector3();
    let southeast = dire.southeast().toVector3();
    let northeast = dire.northeast().toVector3();
    let northwest = dire.northwest().toVector3();
    directionVal.push(southwest, southeast, northeast, northwest);
    let southeastJson = vec3ToJson(southwest);
    let southwestJson = vec3ToJson(southeast);
    let northeastJson = vec3ToJson(northeast);
    let northwestJson = vec3ToJson(northwest);

    let centerJson = vec3ToJson(calculatePolygonCenter(directionVal));

    cb({
      // center: { x: center.x, y: center.y, z: center.z },
      centerJson,
    });
    // console.log(center, "dddddd");
    // feature.enabled = false;
    // feature.parent.enabled = false;
    // feature.parent.parent.enabled = false;
    // nowNode.enabled = false;

    // let style = new SSmap.TilesetStyle();
    // style.show = function (tileFeature) {
    //   let name = feature.getProperty("visible");
    //   return true;
    // };
    // tileFeature.tileset.enabled = false; //设置tiles隐藏
    // let center = tileFeature.boundingVolume.center;

    // let till = tileFeature.tileset;
    // cb({ till, center });
    // console.log(till, "tttttttttt");
  },
  //json转Vector3
  vec3ToJson(point, cb) {
    point = SSmap.Vector3.create(point.x, point.y, point.z);
    cb({ x: point.x, y: point.y, z: point.z });
  },
  drawBuild(center, arr1, arr2, arr3, floorRotate, cb) {
    console.log(arr1, boxColor.r, this, "7777777777777777");
    // console.log(arr, 44444);
    let e1 = this.drawLine(
      GlobalViewer.scene,
      arr1.position.array,
      "1",
      boxColor,
      1
    );
    let e2 = this.drawLine(
      GlobalViewer.scene,
      arr2.position.array,
      "2",
      boxColor2,
      1
    );
    let e3 = this.drawLine(
      GlobalViewer.scene,
      arr3.position.array,
      "3",
      boxColor3,
      1
    );
    let arr = [];
    arr.push(e1, e2, e3);
    center = SSmap.Vector3.create(center.x, center.y, center.z);
    // let carto = center.toCartesian3();
    var selfPosition =
      GlobalViewer.scene.globe.ellipsoid.eastNorthUpToFixedFrame(
        center.toCartesian3()
      );
    const mat = this.rotationEntity(selfPosition, 0, 0, floorRotate, 0);
    const transtion = SSmap.Matrix4.fromTranslation(
      SSmap.Vector3.create(40, -50, 59)
    );
    const matrix4 = SSmap.Matrix4.multiply(mat, transtion);
    arr.forEach((i) => {
      i.transform.matrix = matrix4;
    });
    // cb("456456");
    // cb(matrix4);
  },
  rotationEntity(mat, degX, degY, degZ, offsetHeight) {
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
  },
  mergeOptions(target, from) {
    if (!from) return target;
    let keys = Object.keys(from);
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      if (this.isPlainObject(from[key])) {
        target[key] = this.mergeOptions(target[key] || {}, from[key]);
      } else {
        target[key] = from[key];
      }
    }
    return target;
  },
  isPlainObject(obj) {
    let toString = Object.prototype.toString;
    let hasOwn = Object.prototype.hasOwnProperty;
    if (toString.call(obj) !== "[object Object]") {
      return false;
    }
    if (
      obj.constructor &&
      !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")
    ) {
      return false;
    }
    return true;
  },
  drawLine(scene, pointList, tag, color, opacity) {
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
  },
};
