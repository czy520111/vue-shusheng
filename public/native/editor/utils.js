//var viewer = GlobalViewer;
//var scene = viewer.scene;
//var globe = scene.globe;
//var camera = scene.mainCamera;
//var cameraController = camera.cameraController;

//import data from "./data.js";

var Utils = {};

//测试对象
Utils.polylines = [];           //js画线
Utils.polyline3d = null;        //折线
Utils.polygon3d = null;         //多边形
Utils.billboardEntity = null;   //billboard图片
Utils.label3d = null;           //标签
Utils.billboardCollection = null;   //billboard合集

Utils.geoPointLayer = null;     //点层
Utils.geoPickPointLayer = null; //点拾取图层
Utils.GeoJsonModel = null;      //拾取标签
Utils.GeoJsonBillboards = null; //拾取疫情标签
Utils.GeoJsonFeatures = null;   //拾取高亮显示二维面/(核酸率/疫苗率)
Utils.TrackPath = null;         //轨迹
Utils.geoLabelLayer = null;     //标签层
Utils.geoPolylineLayer = null;  //折线层
Utils.geoPolygonLayer = null;   //多边形层
Utils.PolygonQueryLayer = null; 

Utils.extrudePipe = null;       //拉伸管线
Utils.tiandituMark = null;      //天地图注记
Utils.tiandituImagery = null;   //天地图影像
Utils.tiandituZone = null;      //区划 
Utils.tilesetLayer = null;      //tileset层, 切换白模与纹理

Utils.DZSB = null;           //电子哨兵
Utils.pipeLine = null;      //地下管线

Utils.modelLayer = null;        
Utils.meshLayer1 = null;
Utils.meshLayer2 = null;
Utils.meshLayer3 = null;
Utils.waterLayer = null;
Utils.decalLayer = null;
Utils.decalLayer1 = null;
Utils.shapefileLayer = null;

//var mouseDrag = false;
// document.onmousedown = function (event) {
//     mouseDrag = true;
//     console.log('mouse down');
// };

// document.onmouseup = function(event){
//     mouseDrag = false;
//     console.log('mouse up');
// };

// document.body.onmouseup = function (event) {
//     console.log('body up');
//     const canvas = document.querySelector('#qtcanvas');
//     if (mouseDrag && event.target !== canvas) {
//     mouseDrag = false;
//     let cameraController = window.viewer.scene.mainCamera.cameraController();
//     cameraController.reset();
//     }
// };


//StringMap对象的函数 size(), set(vectorSize-1, 11),  push_back(), resize(20, 0), get()
//map对象函数 size, get, set, keys
//vector对象函数 push_back, resize, size, get, set

//起始点
Utils.startingPoint = function ()
{
    // let p = SSmap.Cartographic.fromDegrees(114.054494, 22.540745, 10000);
    // let scene = window.scene;
    // scene.mainCamera.cameraController().flyToCartographic(p, 3, 0, -90, 0);
    //or
    let camera = window.scene.mainCamera;
    camera.flyTo(
        SSmap.Cartographic.fromDegrees(114.054494, 22.540745, 6000)
      );
}

Utils.flyTo = function (lng, lat, h)
{
    let camera = window.scene.mainCamera;
    camera.flyTo(
        SSmap.Cartographic.fromDegrees(lng, lat, h)
      );
}

Utils.flyToCarto = function (carto)
{
    let camera = window.scene.mainCamera;
    camera.flyTo(
        carto
      );
}

//拾取屏幕点对应的坐标
Utils.pick = function (scene, x, y, includeTerrainSurface)
{
    if(!scene.mainCamera)
        return;

    var globe = scene.globe;
    //var ray = scene.mainCamera.cameraController.getPickRay(x, y);
    var ray = scene.mainCamera.screenPointToRay(x, y);
    var pickPos = SSmap.Cartesian3.create(0, 0, 0);
    var ret = globe.pick(ray, pickPos);

    if (ret)
    {
        if (includeTerrainSurface)
        {
            var carto = SSmap.Cartographic.fromCartesian(pickPos);
            var h = globe.getHeight(carto, true);
            carto.height = h;
            return carto.toCartesian3();
        }

        return pickPos;
    }
    
    return SSmap.Cartesian3.create(0, 0, 0);
}

//
Utils.world2ScreenPoint = function (scene, worldPos)
{
    if(!scene.mainCamera)
        return;

    return scene.mainCamera.worldToScreenPoint(worldPos);
}

//获取卡托坐标对应 mesh点高度，bug 说明， 如果只有地形， 
//获取高度位置， 不在相机范围内时， 地形数据被销毁， 此时获取高度为 -999.5xx
Utils.getMeshHeight = function(scene, carto)
{
    let v1 = SSmap.Cartographic.create(carto.longitude, carto.latitude, 0).toVector3();
    let v2 = SSmap.Cartographic.create(carto.longitude, carto.latitude, 500).toVector3();
    let ray = SSmap.Ray.create(v2, SSmap.Vector3.subtract(v1, v2).normalize());
    var hit = new SSmap.RaycastHit();

    if(hit == null || hit == undefined)
        return;
    
    let result = null;
    if (scene.raycast(ray, hit))
    {
        console.log("hit");
        result = hit.point.toCartographic();
    }
    hit.delete();

    return (result == null) ? 0.0 : result.height;
}

//获取点列表中的最小高度， 最大高度， 平均高度
Utils.getMinMaxMean = function ()
{
    let points = new SSmap.PointVector();
    points.push_back(SSmap.Vector3.create(-2400819.395672061, 5381815.703016975, 2431724.3247058773));
    points.push_back(SSmap.Vector3.create(-2396838.4163258723, 5384061.074629714, 2430715.5603749393));
    points.push_back(SSmap.Vector3.create(-2397026.8121557618, 5383971.929765949, 2430731.316087347));
    points.push_back(SSmap.Vector3.create(-2397060.3226712397, 5383959.864400212, 2430723.7015070166));
    points.push_back(SSmap.Vector3.create(-2397104.0552196135, 5383937.611659675, 2430731.6472430932));
    points.push_back(SSmap.Vector3.create(-2397085.228647451, 5383913.016420042, 2430806.2543280446));
    points.push_back(SSmap.Vector3.create(-2396990.5191654707, 5383952.860541011, 2430816.3930785935));
    points.push_back(SSmap.Vector3.create(-2396813.327910718, 5384031.22613269, 2430812.198456245));
    points.push_back(SSmap.Vector3.create(-2396838.4163258723, 5384061.074629714, 2430715.5603749393));

    // points: 要获取高度的点列表 
    // minHeight: 最小高度  
    // maxHeight: 最大高度, 
    // isMeshHeight: true: 获取mesh高度, false: 仅获取地形高度
    //calculateMinMaxMean(points, minHeight, maxHeight, isMeshHeight)

    let future = SSmap.GisUtil.calculateMinMaxMean(points, 0.0, 1000.0, false); 
    future.then(function (min, max, mean) {
        console.log("min, max, mean: " + min + ' '+ max + ' ' + mean);
    });

    points.delete();
}


//计算角度, 两个向量求角度
Utils.angleBetweenTwoVectors = function (vec1, vec2)
{
    let v1 = vec1.normalize();  //向量1归一化
    let v2 = vec2.normalize();  //向量2归一化

    let dot = SSmap.Vector3.dot(v1, v2);    //向量点乘
    let angle = Math.acos(dot) * 180.0 / Math.PI; //计算角度
    return angle;
}

//计算夹角, 这个示例是用两条向量
Utils.calculateAngle = function (list)
{
    if (list.lenght < 3)
        return;
    
    let vec1 = SSmap.Vector3.subtract(list[1], list[0]) ; //向量1
    let vec2 = SSmap.Vector3.subtract(list[1], list[2]);   //向量2

    return Utils.angleBetweenTwoVectors(vec1, vec2);
}

//角度测试
Utils.getAngleTest = function ()
{
    let list = [];
    list.push(SSmap.Vector3.create(-2402532.2333403523, 5383391.446522082, 2426504.212788312));
    list.push(SSmap.Vector3.create(-2402680.7006334886, 5383313.57741301, 2426531.4581943545));
    list.push(SSmap.Vector3.create(-2402629.022286989, 5383269.794494778, 2426678.6273100832));

    let angle = Utils.calculateAngle(list);

    console.log("角度是: " + angle);
}

//正北
Utils.trueNorth = function(scene, canvas)
{
    if (scene == undefined || canvas == undefined)
        return;
    
    var globe = scene.globe;
    if (!globe)
        return;
    
    var screenCenterX = canvas.width / 2.0;
    var screenCenterY = canvas.height / 2.0;
    var pickPt = Utils.pick(scene, screenCenterX, screenCenterY, false);
    var pick_carto = pickPt.toCartographic();

    var camera = scene.mainCamera;
    pick_carto.height = camera.transform.cartographic.height;
    pickPt = pick_carto.toCartesian3();
    camera.flyTo(SSmap.Cartographic.fromCartesian(pickPt));
}


//scene.sun.castShadow = false; //关闭整个场景的阴影
//entity.renderer.castShadow = false; //单个物体关闭阴影.

//设置太阳参数
Utils.setSun = function(scene, color, intensity, haloSize, castShadow, shadowBias)
{
    var sun = scene.sun;
    sun.color = color;
    sun.intensity = intensity;
    sun.haloSize = haloSize;
    sun.castShadow = castShadow;
    sun.shadowBias = shadowBias;
}

//设置日期时间
Utils.setDataTime = function(timeSystem, year, month, day, hour, minute)
{
    timeSystem.setYear(year);
    timeSystem.setMonth(month);
    timeSystem.setDay(day);
    timeSystem.setHour(hour);
    timeSystem.setMinute(minute);
}

//设置时间
Utils.setTime = function(timeSystem, hour, minute)
{
    if(timeSystem == undefined 
        || hour < 0 
        || hour > 24
        || minute < 0
        || minute > 60)
        return;
    timeSystem.setHour(hour);
    timeSystem.setMinute(minute);
}

//创建事件监听
Utils.frameAction = null;
Utils.createFrameAction = function (scene)
{
    if (Utils.frameAction == null)
    {
        var frameAction = new SSmap.FrameAction();
        // frameAction._onTriggered = function (deltaSeconds) {
        //     // run in every frame update, if is enabled
        //     console.log('actionframe : ' + deltaSeconds);
        // };
    
        frameAction.onTriggered(Utils.frameRate);
        scene.rootEntity.addComponent(frameAction); 
        Utils.frameAction = frameAction;
    }
    else
    {
        Utils.frameAction.delete();
        Utils.frameAction = null;
    }
}

//帧率计算
Utils.frameRateFPS = 0;
Utils.fpsTimer = 0.0;
Utils.frameRate = function (dt)
{
    Utils.fpsTimer += 0.0;
    Utils.frameRateFPS++;
    if (Utils.fpsTimer >= 1.0)
    {
        console.log('fps : ' + Utils.frameRateFPS);
        Utils.fpsTimer = dt;
        Utils.frameRateFPS = 0;
    }
}

Utils.showFPS = (function () {
    // noinspection JSUnresolvedVariable, SpellCheckingInspection
    var requestAnimationFrame =
        window.requestAnimationFrame || //Chromium  
        window.webkitRequestAnimationFrame || //Webkit 
        window.mozRequestAnimationFrame || //Mozilla Geko 
        window.oRequestAnimationFrame || //Opera Presto 
        window.msRequestAnimationFrame || //IE Trident? 
        function (callback) { //Fallback function 
            window.setTimeout(callback, 1000 / 60);
        };

    var dialog;
    var container;

    var fps = 0;
    var lastTime = Date.now();

    function setStyle(el, styles) {
        for (var key in styles) {
            el.style[key] = styles[key];
        }
    }

    function init() {
        dialog = document.createElement('dialog');
        setStyle(dialog, {
            display: 'block',
            border: 'none',
            backgroundColor: 'rgba(0, 0, 0, 1)',
            margin: 0,
            padding: '4px',
            position: 'fixed',
            top: 0,
            right: 'auto',
            bottom: 'auto',
            left: 0,
            color: '#f00',
            fontSize: '12px',
            textAlign: 'center',
            borderRadius: '0 0 4px 0'
        });
        container.appendChild(dialog);
    }

    function calcFPS() {
        offset = Date.now() - lastTime;
        fps += 1;

        if (offset >= 1000) {
            lastTime += offset;
            displayFPS(fps);
            fps = 0;
        }

        requestAnimationFrame(calcFPS);
    };

    function displayFPS(fps) {
        var fpsStr = fps + ' FPS';

        if (!dialog) {
            init();
        }

        if (fpsStr !== dialog.textContent) {
            dialog.textContent = fpsStr;
        }
    }

    return function (parent) {
        container = parent;
        calcFPS();
    };
})();

//加载精模
Utils.cfjmModel = null; //长富模型
Utils.neoModel = null;  //neo模型
Utils.syscModel = null; //sysc模型
Utils.cfjmMark = null;  //长富遮罩
Utils.neoMark = null;   //neo遮罩
Utils.syscMark = null; //sysc遮罩
Utils.bimMark = null;   //bim遮罩

//测试加载长富大厦, neo大厦, sysc大厦
Utils.loadModels = function (scene, baseUrl)
{
    if (Utils.cfjmModel == null)
    {
        Utils.cfjmModel = Utils.loadCFJMModel();
    }
    else
    {
        //Utils.cfjmModel.enabled = !Utils.cfjmModel.enabled;  //显示/隐藏
        ////or
        if(Utils.tilesetLayer)
            Utils.removeFlatenMask(Utils.tilesetLayer.tileset(), Utils.cfjmMark);
        Utils.cfjmModel.delete(); //删除测试
        Utils.cfjmModel = null;
    }
    // if (Utils.neoModel == null)
    // {
    //     Utils.neoModel = Utils.loadNEOModel();
    // }
    
    // if (Utils.syscModel == null)
    // {
    //     Utils.syscModel = Utils.loadSyscModel();
    // }
}

//加载长富大厦模型
Utils.loadCFJMModel = function ()
{
    let cfjmUrl;// = baseUrl + "data/gltf/CFJM/CFJM-0425.gltf"; //
    let cfjmPos = SSmap.Cartographic.fromDegrees(114.0553576, 22.5099829, 191.5144);
    let cfjmRotation = SSmap.Vector3.create(0, 0, 45);
    let cfjmOffset = SSmap.Vector3.create(0, 0, 0);
    let distance = SSmap.Vector2.create(1.0, 5e2);
    var cfjmModel = Utils.modelLayer(cfjmUrl, cfjmPos, cfjmRotation, cfjmOffset, distance);
    //Utils.loadModel(scene, cfjmUrl, cfjmPos, cfjmRotation);
     
    if (Utils.tilesetLayer != null)
    {
        let list = [];
        list.push(SSmap.Vector3.create(-2402532.2333403523, 5383391.446522082, 2426504.212788312));
        list.push(SSmap.Vector3.create(-2402680.7006334886, 5383313.57741301, 2426531.4581943545));
        list.push(SSmap.Vector3.create(-2402629.022286989, 5383269.794494778, 2426678.6273100832));
        list.push(SSmap.Vector3.create(-2402484.4256239715, 5383347.953930089, 2426647.7725969264));
        list.push(SSmap.Vector3.create(-2402532.2333403523, 5383391.446522082, 2426504.212788312));

        //添加遮罩
        Utils.cfjmMark = Utils.addFlattenMask(Utils.tilesetLayer.tileset(), list); 
    }
        
    return cfjmModel;
}

//加载neo模型
Utils.loadNEOModel = function ()
{
    let neoUrl = baseUrl + "data/gltf/NEO/NEO-0425.gltf";
    let neoPos = SSmap.Cartographic.fromDegrees(114.02084264, 22.5393992, 200);
    let neoRotation = SSmap.Vector3.create(0, 0, 0);
    let neoOffset = SSmap.Vector3.create(0, 0, 0);
    let distance = SSmap.Vector2.create(1.0, 5e2);
    var neoModel = Utils.modelLayer(neoUrl, neoPos, neoRotation, neoOffset, distance);

    //neo 遮罩 (隐藏3dtiles对应区域)
    if (Utils.tilesetLayer != null)
    {
        let list = [];
        list.push(SSmap.Vector3.create(-2399702.16502949,5383207.798358155,2429704.9761463483));
        list.push(SSmap.Vector3.create(-2399743.642248111,5383247.283280651,2429571.2955604224));
        list.push(SSmap.Vector3.create(-2399539.5176623305,5383354.440184869,2429538.426504724));
        list.push(SSmap.Vector3.create(-2399516.690768532,5383335.791957523,2429601.0303096455));
        list.push(SSmap.Vector3.create(-2399513.3719522506,5383328.512336286,2429618.8469450516));
        list.push(SSmap.Vector3.create(-2399515.2752947095,5383318.727486096,2429637.738557574));
        list.push(SSmap.Vector3.create(-2399523.3791697742,5383305.646435599,2429659.0809916845));
        list.push(SSmap.Vector3.create(-2399541.1034346432,5383288.96676806,2429678.9860466123));
        list.push(SSmap.Vector3.create(-2399568.228461326,5383271.342859137,2429692.860472606));
        list.push(SSmap.Vector3.create(-2399702.16502949,5383207.798358155,2429704.9761463483));

        Utils.neoMark = Utils.addFlattenMask(Utils.tilesetLayer.tileset(), list);
    }

    return neoModel;
}

//加载sysc模型
Utils.loadSyscModel = function ()
{
    let syscUrl = baseUrl + "data/gltf/SYSC/SYSC-0425.gltf";
    let syscPos = SSmap.Cartographic.fromDegrees(114.065037165749, 22.559966691104, 206.6998);
    let syscRotation = SSmap.Vector3.create(0, 0, 0);
    let syscffset = SSmap.Vector3.create(0, 0, 0);
    let distance = SSmap.Vector2.create(1.0, 5e2);
    var syscModel = Utils.modelLayer(syscUrl, syscPos, syscRotation, syscffset, distance);
    //sysc 遮罩 (隐藏3dtiles对应区域)
    if (Utils.tilesetLayer != null)
    {
        let list = [];
        list.push(SSmap.Vector3.create(-2403198.9658984966, 5380579.397321981, 2432081.5000611595));
        list.push(SSmap.Vector3.create(-2402733.961750327, 5380794.805185519, 2432067.660209918));
        list.push(SSmap.Vector3.create(-2402814.965064281, 5380938.887983297, 2431667.431221078));
        list.push(SSmap.Vector3.create(-2402858.708241017, 5380936.505087338, 2431629.320584699));
        list.push(SSmap.Vector3.create(-2403259.983664783, 5380754.760363507, 2431620.1955265347));
        list.push(SSmap.Vector3.create(-2403261.990760002, 5380743.992725455, 2431641.4402389554));
        list.push(SSmap.Vector3.create(-2403199.6508022393, 5380579.338718324, 2432080.975680422));
        list.push(SSmap.Vector3.create(-2403198.9658984966, 5380579.397321981, 2432081.5000611595));

        Utils.syscMark = Utils.addFlattenMask(Utils.tilesetLayer.tileset(), list);
    }

    return syscModel;
}

//后期处理
// const viewer = GlobalViewer;
// let postRender = viewer.RenderSystem.postRendering;
// saturation
// contrast
// sharpen
// exposure
// autoExposure
// brightThreshold
// bloomValue

//飞到长富大厦
Utils.flyToCFJM = function (scene)
{
    var p = SSmap.Cartographic.fromDegrees(114.04905529, 22.5056175, 205.91);
    scene.mainCamera.cameraController().flyToCartographic(p, 3, 27.2361, -21.032, 0);
}

//飞到neo大厦
Utils.flyToNEO = function (scene)
{
    var p = SSmap.Cartographic.fromDegrees(114.0231305, 22.5406607, 108.978);
    scene.mainCamera.cameraController().flyToCartographic(p, 3, 146.5576, -14.04752, 0);
}

//飞到sysc大厦
Utils.flyToSYSC = function (scene)
{
    var p = SSmap.Cartographic.fromDegrees(114.070118, 22.557971, 131.062);
    scene.mainCamera.cameraController().flyToCartographic(p, 3, 299.864, -11.37, 0);
}

//加载modellayer
Utils.modelLayer = function(url, carto, rotation, offset, distance, shadow)
{
    if(shadow == undefined)
        shadow = false;
    let modelLayer = new SSmap.ModelLayer();
    modelLayer.url = url;               //模型url
    modelLayer.cartographic = carto;    //卡托坐标
    modelLayer.rotation = rotation;     //旋转
    modelLayer.offset = offset;         //偏移
    modelLayer.distance = distance;     //可视距离
    modelLayer.castShadow = shadow;     //物体是否投射阴影
    modelLayer.componentComplete();     //开始加载模型

    return modelLayer;
}

// add gltf/obj/fbx/dae/... 模型
Utils.loadModelSrs = function( url, srs)
{
    var model = new SSmap.Model(url);
    model.srs = srs;
    return model;
}

Utils.modelWithCoordinates = null;
Utils.modelCoordinates = null;
Utils.addModel = function (scene, baseUrl)
{
    if (Utils.modelWithCoordinates == null)
    //if (Utils.modelCoordinates == null)
    {
        let url = baseUrl + "data/香蜜湖中区-TK.fbx";//xmh1.FBX   
        //let url = baseUrl + "data/4403060070013900046.fbx";
        let srs = "EPSG:4547";
        let model = Utils.loadModelSrs( url, srs);

        Utils.modelCoordinates = model;
        var entity = new SSmap.Entity();
        entity.addComponent(model);                 
        scene.addEntity(entity);                    //添加到rootEntity的子节点中
        Utils.modelWithCoordinates = entity;
    }
    else
    {
        console.log("model enabled changed!");
        //删除
        // Utils.modelWithCoordinates.delete();
        // Utils.modelWithCoordinates = null;
        //or 显示/隐藏
        Utils.modelWithCoordinates.enabled = !Utils.modelWithCoordinates.enabled;
        
        //or
        //Utils.modelCoordinates.entity.enabled = !Utils.modelCoordinates.entity.enabled;

        // let camera = scene.mainCamera;
        // let t = Utils.modelCoordinates.transform;
        // if (t)
        // {
        //     let cartoPos = t.cartographic;    
        //     camera.flyTo(cartoPos);
        //     console.log("fly to 香蜜湖中区")
        // }
    }
}


//添加DEM
Utils.addTerrain = function(globe, baseUrl)
{
    //globe.setTerrainProviderUrl(baseUrl + 'data/ft-dem-max14');

    let terrainProvider = new SSmap.GlobeTerrainProvider(baseUrl + 'data/ft-dem-max14');
    terrainProvider.setHeader("szvsud-license-key",
    "XbZrKCXAKXNnu5cRuyXoCmg2DU8E0ztA8/27O2AS3EtAsqU6Fymn8hqiJicChJyg");
    globe.terrainProvider = terrainProvider;
}

//设置默认地形
Utils.setDefaultTerrain = function(globe)
{
    globe.setDefaultTerrain();
}


//arcgis DOM
Utils.arcGisImageryLayer = null;
Utils.addArcGisMapServerImageryLayer = function(globe)
{
    if(Utils.arcGisImageryLayer == null)
    {
        Utils.arcGisImageryLayer = globe.addArcGisMapServerImageryLayer('https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer');
        //Utils.arcGisImageryLayer = globe.addArcGisMapServerImageryLayer('https://www.southsmart.com/arcgis/rest/services/djq3857/MapServer');
        //Utils.arcGisImageryLayer = globe.addArcGisMapServerImageryLayer('https://www.southsmart.com/arcgis/rest/services/djq4524/MapServer');
    }
    else
    {
        globe.removeImageryLayer(Utils.arcGisImageryLayer);
        Utils.arcGisImageryLayer = null;
    }
}

//加载丰图wmts服务
Utils.FTWMTS = null;
Utils.addWMTSLayer = function (globe)
{
    if (Utils.FTWMTS == null)
    {
        globe.lightingEnabled = false;
        var imageryLayer = globe.addWmsImageryLayer("IgnoreAxisOrientation=1&IgnoreGetMapUrl=1&IgnoreReportedLayerExtents=1&InvertAxisOrientation=1&crs=EPSG:4326&dpiMode=7&format=image/png&layers=wmts_4326_440300&styles=default&tileMatrixSet=c&url=https://jingzhe.szft.gov.cn/sfmap/MapTileService/wmts?SERVICE%3DWMTS%26REQUEST%3DGetCapabilities%26STORETYPE%3Dmerged-dat%26LAYER%3Dwmts_4326_440300%26PROJECTION%3D4326");
        Utils.FTWMTS = imageryLayer;
        return imageryLayer;
    }
    else
    {
        globe.removeImageryLayer(Utils.FTWMTS);
        Utils.FTWMTS = null;
        globe.lightingEnabled = !globe.lightingEnabled;    
    }
   
}


Utils.addTemplateImagery = function()
{
    //let url = 
}


//添加dom
//minLevel : 最小层级
//maxLevel : 最大层级
//url : 数据路径
//rectangle : 影像范围, 有数值一定要传, 避免请求范围以外的数据导致很多404, -180, -90, 180, 90是全球范围
Utils.imageLayer = null;
Utils.addImageryLayer = function(globe, minLevel, maxLevel, url, rectangle)
{
    // if (minLevel < 0)
    //     minLevel = 0;
    // if (maxLevel > 21)
    //     maxLevel = 21;
    
    if (url == undefined)
        url = "http://10.253.102.69/gw/OGC/Map/SZ_VEC_W4490_bld3d_2021/rest/w_shenzhen3d_2021/EPSG:4490/EPSG:4490:{z}/{y}/{x}?format=image%2Fpng";
    
    if (rectangle == undefined)
        rectangle = SSmap.Rectangle.create(-180, -90, 180, 90);
    
    var imageryProvider = new SSmap.UrlTemplateImageryProvider(
      url,    // url
      false,   // useWebMercator
      maxLevel,     // maximumLevel
      minLevel,      // minimumLevel
      256,    // tileWidth
      256,    // tileHeight
      true    // hasAlphaChannel
    );
    imageryProvider.setUrlFunctor(function (x, y, level) {
        var url = "http://10.253.102.69/gw/OGC/Map/SZ_VEC_W4490_bld3d_2021/rest/w_shenzhen3d_2021/EPSG:4490/EPSG:4490:" + (level - 9) + "/" + y + "/" + x + "?format=image%2Fpng";
        //consolg.log("url" + url);
        //imageryProvider.setImageUrl(x, y, level, url);
        return url;
        })

    imageryProvider.setHeader("szvsud-license-key",
        "XbZrKCXAKXNnu5cRuyXoCmg2DU8E0ztA8/27O2AS3EtAsqU6Fymn8hqiJicChJyg");
    var imageryLayer = new SSmap.ImageryLayer(imageryProvider, rectangle);

    Utils.imageLayer = imageryLayer;
    globe.addImageryLayer(imageryLayer);

     //删除用
    //globe.removeImageryLayer(Utils.imageLayer);

//or
    
    // var imageryLayer = globe.addWmsImageryLayer("http://10.253.102.69/gw/OGC/Map/SZ_VEC_B4490/");
    // imageryLayer.imageryProvider.setHeader("szvsud-license-key",
    // "XbZrKCXAKXNnu5cRuyXoCmg2DU8E0ztA8/27O2AS3EtAsqU6Fymn8hqiJicChJyg");
}


// type=  cva_c : 注记 img_c : 影像  vec_c : 区划
//return "https://t" + index + ".tianditu.gov.cn/DataServer?T=" + type
// + "&x={x}&y={y}&l={z}&tk=5ec3e996393521a1a9fb1681f13201ff";
//Utils.tiandituMark = null; //注记
Utils.addTiandituMark = function ()
{
    if (Utils.tiandituMark == null)
    {
        var tianditu = new SSmap.TiandituImageryLayer();
        tianditu.url = 'https://t1.tianditu.gov.cn/DataServer?T=cva_c&x={x}&y={y}&l={z}&tk=5ec3e996393521a1a9fb1681f13201ff';
        tianditu.useWebMercator = false;
        tianditu.tileWidth = 256;
        tianditu.tileHeight = 256;
        tianditu.minimumLevel = 1; 
        tianditu.maximumLevel = 17;
        tianditu.hasAlphaChannel = true;
        tianditu.isLabel = true;
        tianditu.componentComplete();
        Utils.tiandituMark = tianditu;
    }
    else
    {
        //Utils.tiandituMark.enabled = !Utils.tiandituMark.enabled;
        Utils.tiandituMark.delete();
        Utils.tiandituMark = null;
    }
}

//Utils.tiandituImagery = null;//天地图影像
Utils.addTiandituImagery = function ()
{
    if (Utils.tiandituImagery == null)
    {
        var tianditu = new SSmap.TiandituImageryLayer();
        tianditu.url = "https://t2.tianditu.gov.cn/DataServer?T=img_c&x={x}&y={y}&l={z}&tk=5ec3e996393521a1a9fb1681f13201ff";     
        tianditu.useWebMercator = false;
        tianditu.tileWidth = 256;
        tianditu.tileHeight = 256;
        tianditu.minimumLevel = 1; 
        tianditu.maximumLevel = 17;
        tianditu.hasAlphaChannel = false;
        tianditu.isLabel = false;
        tianditu.componentComplete();

        console.log("is lable : " + tianditu.isLabel);
        let layer = tianditu.layer();
        layer.alpha = 1.0;//0.2;
        Utils.tiandituImagery = tianditu;
    }
    else
    {
        //Utils.tiandituImagery.enabled = !Utils.tiandituImagery.enabled;
        Utils.tiandituImagery.delete();
        Utils.tiandituImagery = null;
    }
}

//Utils.tiandituZone = null; //天地图区划 
Utils.addTiandituZone = function ()
{
    if (Utils.tiandituZone == null)
    {
        var tianditu = new SSmap.TiandituImageryLayer();
        tianditu.url = "https://t3.tianditu.gov.cn/DataServer?T=vec_c&x={x}&y={y}&l={z}&tk=5ec3e996393521a1a9fb1681f13201ff";     
        tianditu.useWebMercator = false;
        tianditu.tileWidth = 256;
        tianditu.tileHeight = 256;
        tianditu.minimumLevel = 1; 
        tianditu.maximumLevel = 17;
        tianditu.hasAlphaChannel = false;
        tianditu.isLabel = false;
        tianditu.componentComplete();
        Utils.tiandituZone = tianditu;
    }
    else
    {
        Utils.tiandituZone.enabled = !Utils.tiandituZone.enabled;
    }
}

//添加tileset
Utils.addTilesetLayer = function (baseUrl)
{
    if (Utils.tilesetLayer == null)
    {
        let tilesetLayer = new SSmap.TilesetLayer();
        //tilesetLayer.url = baseUrl + "data/0326/tileset.json";
        //tilesetLayer.url = baseUrl + "data/14_cem/tileset.json"; //白膜
        //tilesetLayer.url = baseUrl + "holidayroad/tileset.json"; //节日大道
        //tilesetLayer.url = baseUrl + "BigData/tileset_skip2_1024/tileset.json"; 
        //tilesetLayer.url = "https://192.168.1.105:9012/2022/tileset.json"; //南通
        //or
        //window.scene.globe.show = false; //隐藏地形
        //tilesetLayer.url = "https://tile.googleapis.com/v1/3dtiles/root.json?key=AIzaSyC2mRCshUjL9fhC-QnEXa4f7ZutXAa1Q3o";

        //tilesetLayer.url = "https://oss.yishitech.com/cdtest2/tileset.json";
        //tilesetLayer.url = baseUrl + "data/byds-output/tileset.json";  //byds-output
        //tilesetLayer.url = baseUrl + "data/byds-building1-output/tileset.json"; 
        //tilesetLayer.url = baseUrl + "data/opt/tileset.json"; 
        
        //tilesetLayer.url = baseUrl + "ft_traffic2/output/tileset.json"; 
        //tilesetLayer.url = baseUrl + "benyuan/tileset.json"; //本园大厦
        //tilesetLayer.url = baseUrl + "benyuan-gz/tileset.json"; //本园大厦
        //tilesetLayer.url = baseUrl + "data/shenzhen_tileset/tileset.json";
        //tilesetLayer.url = baseUrl + "Export-480/tileset.json";
        //tilesetLayer.url = baseUrl + "BigData/tianyuanshi/tileset.json"; 
        //tilesetLayer.url = baseUrl + "futian_18square/fubao/3dtiles/tileset.json";

        //tilesetLayer.url =  "https://120.25.161.25:8061/data/shenzhen/modal/tileset.json";

        ///i3s数据测试
        //tilesetLayer.url = "https://tiles.arcgis.com/tiles/z2tnIkrLQ2BRzr6P/arcgis/rest/services/Rancho_Mesh_v17/SceneServer/layers/0";
        //tilesetLayer.url = "https://tiles.arcgis.com/tiles/z2tnIkrLQ2BRzr6P/arcgis/rest/services/Frankfurt2017_vi3s_18/SceneServer/layers/0";
        //tilesetLayer.url = "https://tiles.arcgis.com/tiles/z2tnIkrLQ2BRzr6P/arcgis/rest/services/2021_02_04_Frankfurt/SceneServer/layers/0";
        tilesetLayer.url = "https://tiles.arcgis.com/tiles/z2tnIkrLQ2BRzr6P/arcgis/rest/services/SanFrancisco_3DObjects_1_7/SceneServer/layers/0";
        //tilesetLayer.url =  baseUrl + "testdata/i3s/Rancho_Mesh_v17/nodes";
        //tilesetLayer.url =  baseUrl + "testdata/i3s/Rancho_Mesh_v17/3dSceneLayer.json";
        //tilesetLayer.url = "https://tiles.arcgis.com/tiles/z2tnIkrLQ2BRzr6P/arcgis/rest/services/Montreal_Buildings_v17_21778/SceneServer/layers/0";
        //tilesetLayer.url = "https://tiles.arcgis.com/tiles/z2tnIkrLQ2BRzr6P/arcgis/rest/services/Singapore/SceneServer/layers/0";
   
        //tilesetLayer.color = SSmap.Color.fromRgb(255, 251, 240, 255);
        //tilesetLayer.renderStyle = SSmap.RenderStyle.TextureStyle;   
        tilesetLayer.clipLevelOfDetail = true; //单体建筑设置true, 默认设置false
        tilesetLayer.skipLevelOfDetail = false; //为true: 可能导致不同层级lod数据混合叠加
        tilesetLayer.streamingMode = true;
        
        //tilesetLayer.skipLevelOfRenderable = 2; //可视化数据打开
        tilesetLayer.maximumMemoryUsage = 1024; //默认1024 
        //tilesetLayer.geometricErrorScale = 1.0; //默认1.0, 范围0.2 - 12
        tilesetLayer.componentComplete();
        Utils.tilesetLayer = tilesetLayer;

        //无光照
        // tilesetLayer.tileset().contentLoaded((entity) => {
        //     entity.travalRenderers((renderer) => {
        //         if (renderer !== undefined) {
        //             renderer.material.shadingModel = SSmap.ShadingModel.Unlit;
        //         }
        //     })
        // });

        tilesetLayer.tileset().readyPromise.then(function(){
            var cameraCon = window.scene.mainCamera.cameraController();
            ////rectangle, 2sec, pitch, head, roll
            const tileset = tilesetLayer.tileset();
            cameraCon.flyToRectangle(tileset.rectangle, 2, 0, -90, 0); 
        });
        // console.log(baseUrl + "testdata/s3m/CBD/cbd.scp");
        // const s3mLayer = new SSmap.S3MTilesLayer(baseUrl + "testdata/s3m/CBD/cbd.scp");
        // var entity = new SSmap.Entity();
        // entity.addComponent(s3mLayer);
        // window.scene.addEntity(entity);

        // s3mLayer.readyPromise.then(function(){
        //     var cameraCon = window.scene.mainCamera.cameraController();
        //     cameraCon.flyToRectangle(s3mLayer.rectangle, 2, 0, -90, 0); 
        // });


        //南通位置
        //let p = SSmap.Cartographic.fromDegrees(120.871804, 31.962974, 50000);
        //scene.mainCamera.cameraController().flyToCartographic(p, 3, 0, -90, 0);

        //Utils.flyTo(113.127311, 22.968586, 500);  //cdtest2 坐标

        //直接使用tileset加载数据
        //var tileset = new SSmap.Tileset(baseUrl + "futian_18square/fubao/3dtiles/tileset.json");
        //var tileset = new SSmap.Tileset(baseUrl + "benyuan/tileset.json");
        /*var tileset = new SSmap.Tileset(baseUrl + "BigData/terra_b3dms/tileset.json"); //广西倾斜数据
        tileset.streamingMode = true;    // default 流式加载
        tileset.skipLevelOfDetail = true; // default 跳过层级
        tileset.genMeshNormals = false; // default   生成法线
        //tileset.maximumMemoryUsage = 2048;  //默认512
        //tileset.readIDPropertyOnly = true;
        tileset.geometricErrorScale = 5.0; //默认1.0, 范围0.2 - 12
        var entity = new SSmap.Entity();
        entity.addComponent(tileset);
        scene.addEntity(entity);

        Utils.tilesetLayer = entity;
        let p = SSmap.Cartographic.fromDegrees(110.67960281314545, 23.64546562939199, 500);
        scene.mainCamera.cameraController().flyToCartographic(p, 3, 0, -90, 0);*/

        // console.log(tileset.maximumMemoryUsage);
    //     let list = [];
    //     list.push(SSmap.Vector3.create(-2402651.0859437045, 5381848.630900647, 2429801.8140677568));
    //     list.push(SSmap.Vector3.create(-2402763.1337397713, 5382040.701560827, 2429262.033130157));
    //     list.push(SSmap.Vector3.create(-2402557.4809156563, 5382141.387775577, 2429243.2674305253));
    //     list.push(SSmap.Vector3.create(-2402437.850203632, 5381932.394842722, 2429824.653807547));
     
    //         //添加遮罩
    //     Utils.bimMark = Utils.addFlattenMask(Utils.tilesetLayer.tileset(), list); 
    }
    else
    {   
        Utils.tilesetLayer.delete();
        Utils.tilesetLayer = null;
        //模型的渲染样式
        // if (Utils.tilesetLayer.renderStyle == SSmap.RenderStyle.ColorStyle)
        //     Utils.tilesetLayer.renderStyle = SSmap.RenderStyle.TextureStyle;   //使用纹理渲染
        // else
        //     Utils.tilesetLayer.renderStyle = SSmap.RenderStyle.ColorStyle;   //纯色渲染

        // var tileset = Utils.tilesetLayer.tileset()
        // var rect = tileset.rectangle;
        // console.log("rect:" + rect);
    }
}

Utils.tilesetFuBao = null;
Utils.addTilesetFuBao = function(baseUrl)
{
    if(Utils.tilesetFuBao == null)
    {
        //var tileset = new SSmap.Tileset(baseUrl + "futian_18square/fubao/3dtiles/tileset.json");
        //var tileset = new SSmap.Tileset(baseUrl + "/0709/FBSQ_1_1_3dtiles/tileset.json");
        //var tileset = new SSmap.Tileset(baseUrl + "/0709/FBSQ1_2_3dtiles/tileset.json");
        //var tileset = new SSmap.Tileset(baseUrl + "holidayroad/0524/3dtitlesjrddshu0524/shu1/tileset.json");
        //var tileset = new SSmap.Tileset(baseUrl + "fubao-iFreedo/tileset.json");
        //var tileset = new SSmap.Tileset(baseUrl + "futian_18square/hetao-0906/3dtiles/tileset.json");
        //var tileset = new SSmap.Tileset(baseUrl + "north_station/3dtiles/earths_surface/tileset.json");
        //var tileset = new SSmap.Tileset(baseUrl + "north_station/3dtiles/building/tileset.json");
        var tileset = new SSmap.Tileset(baseUrl + "LH_WTZX_0905/tileset.json");
        tileset.streamingMode = true;    // default 流式加载
        //tileset.skipLevelOfDetail = true; // default 跳过层级
        //tileset.genMeshNormals = true; // default   生成法线
        tileset.maximumMemoryUsage = 4096;  //默认512
        tileset.geometricErrorScale = 1.0;
        var entity = new SSmap.Entity();
        entity.addComponent(tileset);
        Utils.tilesetFuBao = entity;
        scene.addEntity(entity);
    }
    else
    {
        Utils.tilesetFuBao.delete();
        Utils.tilesetFuBao = null;
    }
}

Utils.bridgeEnt = null;
Utils.addTilesetBridge = function(baseUrl)
{
    if(Utils.bridgeEnt == null)
    {
        var tileset = new SSmap.Tileset(baseUrl + "BigData/bridge/tileset.json");
        tileset.streamingMode = true;    // default 流式加载
        tileset.skipLevelOfDetail = true; // default 跳过层级
        tileset.genMeshNormals = false; // default   生成法线
        tileset.maximumMemoryUsage = 2048;  //默认512
        var entity = new SSmap.Entity();
        entity.addComponent(tileset);
        scene.addEntity(entity);
        Utils.bridgeEnt = entity;
    }
    else
    {
        Utils.bridgeEnt.delete();
        Utils.bridgeEnt = null;
    }
}

//添加BIM
Utils.BIM_tilesetLayer = null; 
Utils.addBIM = function (globe, baseUrl)
{
    if (Utils.BIM_tilesetLayer == null)
    {
        var tilesetLayer = new SSmap.TilesetLayer();
        tilesetLayer.url = baseUrl + "data/3DTiles_JZ_0526/tileset.json";        //BIM  
        tilesetLayer.color = SSmap.Color.fromRgb(255, 251, 240, 255);
        tilesetLayer.clipLevelOfDetail = true;
        tilesetLayer.componentComplete();
        Utils.BIM_tilesetLayer = tilesetLayer;
       
        Utils.flyTo(113.997754, 22.549968, 500);

        if (Utils.tilesetLayer != null)
        {
            let list = [];
            list.push(SSmap.Vector3.create(-2396838.4163258723,5384061.074629714,2430715.5603749393));
            list.push(SSmap.Vector3.create(-2397026.8121557618,5383971.929765949,2430731.316087347));
            list.push(SSmap.Vector3.create(-2397060.3226712397,5383959.864400212,2430723.7015070166));
            list.push(SSmap.Vector3.create(-2397104.0552196135,5383937.611659675,2430731.6472430932));
            list.push(SSmap.Vector3.create(-2397085.228647451,5383913.016420042,2430806.2543280446));
            list.push(SSmap.Vector3.create(-2396990.5191654707,5383952.860541011,2430816.3930785935));
            list.push(SSmap.Vector3.create(-2396813.327910718,5384031.22613269,2430812.198456245));
            list.push(SSmap.Vector3.create(-2396838.4163258723,5384061.074629714,2430715.5603749393));
     
            //添加遮罩
            Utils.bimMark = Utils.addFlattenMask(Utils.tilesetLayer.tileset(), list); 
        }
        
        var plist = []; //压平的点范围
        plist.push(SSmap.Vector3.create(-2396827.023072084,5384044.761579189,2430762.3997741495));
        plist.push(SSmap.Vector3.create(-2396844.6154899057,5384059.126565873,2430713.5635993653));
        plist.push(SSmap.Vector3.create(-2397020.6863658414,5383973.673166854,2430729.113606531));
        plist.push(SSmap.Vector3.create(-2397009.208190486,5383954.839482979,2430781.792805401));
        plist.push(SSmap.Vector3.create(-2396827.023072084,5384044.761579189,2430762.3997741495));
        Utils.terrainFlattenMask = Utils.addTerrainFlattenMask(globe, plist, 40.2);
    }
    else
    {   
        //Utils.BIM_tilesetLayer.enabled = !Utils.BIM_tilesetLayer.enabled; //显示隐藏
        //or
        Utils.BIM_tilesetLayer.delete();  //删除bim
        Utils.BIM_tilesetLayer = null;
        if(Utils.terrainFlattenMask)
            globe.removeFlattenMask(Utils.terrainFlattenMask); //删除压平
    }
}

//地形压平, 察看地下管道
Utils.terrainFlattenTest = function ()
{
    let globe = window.scene.globe;

    let carto = SSmap.Vector3.create(-2396827.023072084,5384044.761579189,2430762.3997741495).toCartographic();
    carto.height += 100.0;
    Utils.flyToCarto(carto);

    var plist = []; //压平的点范围
    plist.push(SSmap.Vector3.create(-2396827.023072084,5384044.761579189,2430762.3997741495));
    plist.push(SSmap.Vector3.create(-2396844.6154899057,5384059.126565873,2430713.5635993653));
    plist.push(SSmap.Vector3.create(-2397020.6863658414,5383973.673166854,2430729.113606531));
    plist.push(SSmap.Vector3.create(-2397009.208190486,5383954.839482979,2430781.792805401));
    plist.push(SSmap.Vector3.create(-2396827.023072084, 5384044.761579189, 2430762.3997741495));
    
    Utils.terrainFlattenMask = Utils.addTerrainFlattenMask(globe, plist, -100.0);

    var polygon3d = new SSmap.Polygon3D(); //创建画面对象
    polygon3d.color = SSmap.Color.fromRgb(255, 0, 0, 255);//颜色
    polygon3d.alpha = 0.5;      //透明度
    polygon3d.fillAlpha = 0.9;  //填充透明度
    polygon3d.setFillColor(SSmap.Color.fromRgb(33, 123, 183, 255)); //填充颜色

    polygon3d.addPoint(SSmap.Vector3.create(-2396827.023072084,5384044.761579189,2430762.3997741495));
    polygon3d.addPoint(SSmap.Vector3.create(-2396844.6154899057,5384059.126565873,2430713.5635993653));
    polygon3d.addPoint(SSmap.Vector3.create(-2397020.6863658414,5383973.673166854,2430729.113606531));
    polygon3d.addPoint(SSmap.Vector3.create(-2397009.208190486, 5383954.839482979, 2430781.792805401));
    polygon3d.addPoint(SSmap.Vector3.create(-2396827.023072084, 5384044.761579189, 2430762.3997741495));

    
    polygon3d.setAltitudeMethod(SSmap.AltitudeMethod.Absolute); // Absolute / OnTerrain
    polygon3d.setAltitude(-100.0);
    polygon3d.fillMode = SSmap.FillMode.FillImage;             //设置填充方式 NoFill, FillColor, FillImage
    polygon3d.fillStyle = SSmap.BrushStyle.TexturePattern;  //贴地模式需要填充样式: SolidPattern: 填充颜色,  TexturePattern : 填充图片, 其它有点网格, 线网格等样式
    polygon3d.image = baseUrl + "symbols/Mats/102.png";    //使用纹理贴图  
    polygon3d.textureScale = SSmap.Vector2.create(3.0, 3.0);                           //纹理重复次数
    //or
    //polygon3d.waterShader = true;   //填充水面材质, 画水面, 淹没分析之类的应用


    //默认的贴地模式有效. TerrainOnly: 覆盖地面 WholeScene: 覆盖范围内的所有场景
    //polygon3d.setSceneMode(SSmap.TextureProjectionSceneMode.TerrainOnly); 
    polygon3d.draw();   //绘制

    Utils.polygon3d = polygon3d;
}


//tilesetlayer 显示/隐藏 测试
Utils.tilesetLayersetEnabled = function ()
{
    if (Utils.tilesetLayer != null)
    {
        Utils.tilesetLayer.enabled = !Utils.tilesetLayer.enabled;
    }
}

//加载3Dtiles 
Utils.load3DTiles = function (url)
{
    var tileset = new SSmap.Tileset(url);
    tileset.streamingMode = true;    // default 流式加载
    tileset.skipLevelOfDetail = false; // default 跳过层级
    tileset.genMeshNormals = false; // default   生成法线
    tileset.maximumMemoryUsage = 1024;
    //tileset.geometricErrorScale = 1.0;
    tileset.skipLevelOfRenderable = true;
    var entity = new SSmap.Entity();
    entity.addComponent(tileset);
    GlobalViewer.scene.addEntity(entity);
    return entity;
}

//为3Dtiles添加遮罩
//tileset: 3dtiles对象
//list: Vector3列表(通过在屏幕pick获取的坐标列表)
Utils.addFlattenMask = function(tileset, list)
{
    //小于等于2, 不能构成一个遮罩面
    if (list.length <= 2)
    {
        return;
    }

    var mask = new SSmap.FlattenMask();
    mask.maskHeight = 0; // maskHeight only useful for terrain mask
    
    mask.setPoints(list);
    tileset.addFlattenMask(mask);

    return mask;
}

//地形压平
Utils.terrainFlattenMask = null;   //地形修改(压平)
Utils.addTerrainFlattenMask = function (globe, list, height)
{
     //小于等于2, 不能构成一个遮罩面
     if (list.length <= 2)
     {
         return;
     }
 
     var mask = new SSmap.FlattenMask();
     mask.maskHeight = height; //设置地形高度
     
    mask.setPoints(list);
    globe.addFlattenMask(mask); //添加压平遮罩到地形
     return mask;
}

//删除遮罩
Utils.removeFlatenMask = function (tileset, mask)
{
    if (tileset != null && mask != null)
    {
        tileset.removeFlattenMask(mask);
        mask.delete();
    }
}

//树
Utils.addMeshLayer = function (baseUrl)
{
    if (Utils.meshLayer3 == null)
    {
        var shapefileLayer = new SSmap.ShapefileLayer();
        shapefileLayer.srs = "EPSG:4547";
        shapefileLayer.url = baseUrl + "data/trees.shp";
        shapefileLayer.componentComplete();
        Utils.shapefileLayer = shapefileLayer;
    
        var meshLayer = new SSmap.MeshLayer();
        meshLayer.color = SSmap.Color.fromRgb(77, 108, 43, 255);
        meshLayer.renderStyle = SSmap.RenderStyle.ColorStyle;
        meshLayer.url = baseUrl + "data/tree3.glb";
        //meshLayer.offset = SSmap.Vector3.create(0.0, 0.0, 0.0);
        //meshLayer.scale = SSmap.Vector3.create(0.01, 0.015, 0.01);
        //meshLayer.rotation = SSmap.Vector3.create(90, 0, 0);
        
        meshLayer.setInstances(Utils.shapefileLayer);
        meshLayer.componentComplete();
        Utils.meshLayer3 = meshLayer;
        console.log("load tree complete!");

        // if (Utils.decalLayer1 == null)
        // {
        //     var decalLayer = new SSmap.DecalLayer();
        //     decalLayer.addSourceLayer(meshLayer);
        //     decalLayer.componentComplete();
        //     Utils.decalLayer1 = decalLayer;
        // }
        // else
        // {
        //     Utils.decalLayer1.addSourceLayer(meshLayer);
        //     Utils.decalLayer1.changStyle();
        // }
    }
    else
    {
        Utils.meshLayer3.enabled = !Utils.meshLayer3.enabled;
        //Utils.decalLayer1.enabled = !Utils.decalLayer1.enabled;
    }
}

//绿地 道路
Utils.addDecalLayer = function (baseUrl)
{
    if (Utils.decalLayer == null)
    {
        //sx_py_1000.mesh dlm_py_1000.mesh zb_py_1000.mesh
        var meshLayer1 = new SSmap.MeshLayer();
        //meshLayer1.color = SSmap.Color.fromRgb(116, 139, 171, 255);
        //meshLayer1.color = SSmap.Color.fromRgb(255, 0, 0, 255);
        // meshLayer1.url = baseUrl + "data/roads_sk.mesh";
        meshLayer1.url = baseUrl + "data/dlm_py_1000.mesh";
        //or
        //meshLayer1.url = baseUrl + "testdata/mesh/1.mesh";
        //meshLayer1.url = baseUrl + "data/mesh/ft.mesh";
        //meshLayer1.textureUrl = baseUrl + "symbols/images/tkynejer_4K_Albedo_AO.jpg";
        meshLayer1.componentComplete();
        Utils.meshLayer1 = meshLayer1;

        var meshLayer2 = new SSmap.MeshLayer();
        meshLayer2.color = SSmap.Color.fromRgb(0, 128, 0, 128);
        meshLayer2.url = baseUrl + "data/green_sk.mesh";  
        // meshLayer2.url = baseUrl + "data/zb_py_1000.mesh";
        // meshLayer2.url = baseUrl + "data/mesh/road1.mesh";
        // meshLayer2.url = baseUrl + "data/ft-road.mesh";
        meshLayer2.componentComplete();
        Utils.meshLayer2 = meshLayer2;
        
        var decalLayer = new SSmap.DecalLayer();
        decalLayer.antiTile = SSmap.AntiTextureRep.NoTile1;   // Tile: 不做纹理重复处理 NoTile1:默认,反瓦块一样的纹理重复方案1 NoTile2: 反瓦块一样的纹理重复方案2
        decalLayer.addSourceLayer(meshLayer1);
        decalLayer.addSourceLayer(meshLayer2);
        
        decalLayer.componentComplete();

        Utils.decalLayer = decalLayer;

    }
    else
    {   //隐藏/显示测试
        //Utils.decalLayer.enabled = !Utils.decalLayer.enabled;
        Utils.meshLayer1.enabled = !Utils.meshLayer1.enabled;
        console.log("mesh layer1 :" + Utils.meshLayer1.enabled);
        
        Utils.meshLayer2.enabled = !Utils.meshLayer2.enabled;
        console.log("mesh layer2 :" + Utils.meshLayer2.enabled);
    }
    
}

//创建存放顶点数据的浮点数组
Utils.getPolylineVertexData = function(pointList)
{
    if (pointList.length < 2)
        return;
    
    var length = pointList.length;
    var vertices = new Float32Array(length * 3);

    for (var i = 0; i < length; i++)
    {
        var point = pointList[i];
        vertices[i * 3 + 0] = point.x;
        vertices[i * 3 + 1] = point.y;
        vertices[i * 3 + 2] = point.z;
    }
    return vertices;
}

//使用底层库画线
Utils.drawLine = function(scene, pointList, tag)
{
    if (scene == undefined || pointList.length < 2)
        return;
    
    var polylines = this.polylines;
    if (polylines.length != 0)
    {
        for (var k = 0; k < this.polylines.length; k++)
        {
            if (polylines[k].name == tag)
                polylines.splice(k, 1);
        }
    }

    var vertexArray = Utils.getPolylineVertexData(pointList);
    var stripSize = 3 * 4; //步长（ x,y,z  * float） 
    var vertexBuffer = SSmap.Buffer.createVertexBuffer(vertexArray, stripSize);
    var posAttr = SSmap.GeometryAttribute.createPositionAttribute(vertexBuffer, 0, 3);

    var geometry = new SSmap.Geometry();   //创建集合体
    geometry.addAttribute(posAttr);

    var material = new SSmap.Material();   //创建材质
    material.bothSided = true;          //双面材质
    material.opacity = 1.0;             //透明度
    material.shadingModel = SSmap.ShadingModel.Unlit; //无光照
    material.color = SSmap.Color.fromRgb(255, 0, 0, 255);  //材质颜色 RGBA
    
    var renderer = new SSmap.GeometryRenderer(); //创建几何渲染器
    renderer.castShadow = true;                 //投射阴影
    renderer.type = SSmap.GeometryRendererType.Symbol; //符号类型渲染
    renderer.primitiveType = SSmap.PrimitiveType.LineStrip;    //openGL PrimitiveType： 线带
    renderer.geometry = geometry;
    renderer.material = material;

    //var boundingsphere = SSmap.BoundingSphere.create(pointList[0], 1000);
    //var boundingVolume = SSmap.BoundingVolume.fromBoundingSphere(boundingsphere);
    
    var entity = new SSmap.Entity();
    entity.addComponent(renderer);
    scene.addEntity(entity);
    entity.name = tag;      //添加tag, 用于删除重复物体

    polylines.push(entity);
}

//画线
Utils.growMat = true;
Utils.createPolyline3D = function(baseUrl)
{
    if (Utils.polyline3d == null)
    {
        var polyline = new SSmap.Polyline3D(); //创建画线对象
        
        // polyline.alpha = 0.9;               //透明度
        //or
        polyline.setAltitudeMethod(SSmap.AltitudeMethod.Absolute); //Absolute OnTerrain RelativeToTerrain
        //polyline.setAltitude(70);

        //添加画线所需要的点
        polyline.addPoint(SSmap.Vector3.create(-2401102.17803038, 5381837.221917883, 2431322.4088967624));
        polyline.addPoint(SSmap.Vector3.create(-2401217.6519644577, 5382036.858405292, 2430770.1142349862));
        polyline.addPoint(SSmap.Vector3.create(-2402878.7401228216, 5381281.544949363, 2430800.6906644125));
        polyline.addPoint(SSmap.Vector3.create(-2402770.937031862, 5381018.617677656, 2431484.598601653));
        polyline.addPoint(SSmap.Vector3.create(-2402302.095332233, 5381063.218309714, 2431846.686779186));
        polyline.addPoint(SSmap.Vector3.create(-2401703.776193555, 5381301.782318114, 2431909.346477503));
        polyline.setMinDistance(5.0);
        polyline.setWidth(10);             //线宽
        //指向箭头
        // polyline.addPoint(SSmap.Vector3.create(-2.40068e+06, 5.38233e+06, 2.43069e+06));
        // polyline.addPoint(SSmap.Vector3.create(-2.40073e+06, 5.38236e+06, 2.43076e+06));
        // polyline.setWidth(20);             //线宽

        polyline.color = SSmap.Color.fromRgb(0, 255, 255, 255); //设置线颜色


        let postRender = window.globalViewer.renderSystem.postRendering();
        console.log("brightThreshold, bloomValue " + postRender.brightThreshold + postRender.bloomValue);
        //Utils.loadHDR();//添加夜晚HDR贴图
        window.globalViewer.renderSystem.postRendering().brightThreshold = 1.0; // default 2
        window.globalViewer.renderSystem.postRendering().bloomValue = 2.0;  // default 1 

        const viewer = GlobalViewer;
        let timeSystem = viewer.timeSystem;
        Utils.setTime(timeSystem, 17, 20);

        //发光和动画组合, 纹理贴图+动画组合(Repeat在有纹理时有效), 贴图优先级高于发光
        //polyline.setGlowMaterial(true); //发光
        polyline.glowPower = 0.1;
        //polyline.glowGain = 2.0;
        
        polyline.setImageUrl(baseUrl + "symbols/images/arrow3.png"); //arrow-2
        
        //点线测试
        /*polyline.dash = false;
        polyline.gapColor = SSmap.Color.fromRgb(0, 0, 0, 0); //透明
        polyline.dashLength = 16;
        polyline.dashPattern = 0xfff0; // 1111 1111 1111 0000 实线虚线3: 1, 每一位是一个单位长度
        */
        polyline.addProperty("name", "线段1");
        polyline.addProperty("pos", "福田区");
        polyline.setRepeat(20);     //纹理动画的重复数量(箭头一类动画)
        polyline.animationTimer = 1000; //动画一个周期的时间(ms), 控制动画速度 Flash: 时间1000ms以内, Twinkle:时间可以长一点
        polyline.animationType = SSmap.AnimationType.HorizontalFlow;  //VerticalFlow: 垂直流动  HorizontalFlow:水平流动, Flash: 快速闪烁(建议animationTimer时间:100) Twinkle: 渐变闪烁(建议1000以上s)
        polyline.animationRun = true;   //动画
        polyline.depthTest = false;       //关闭深度检测, 测量时使用
        polyline.useCenterline = false; //是否保留中心线, 使用纹理贴图时有效
      
        
        // polyline.draw();    //绘制
        // polyline.end();     //end之后不能添加点
        //or
        //polyline.lineTo(SSmap.Cartesian3.fromDegrees(114.55648, 22.91339, 200.0).toVector3());
        //polyline.lineTo(SSmap.Cartesian3.fromDegrees(114.55648, 22.31339, 200.0).toVector3());
        polyline.draw();
        Utils.polyline3d = polyline;
    }
    else
    {
        //Utils.polyline3d.setWidth(5.0);   //修改线宽
        //Utils.polyline3d.redraw();        //重新绘制
        //or
        // Utils.polyline3d.delete();          //删除线段对象
        // Utils.polyline3d = null;
        //or
        //Utils.growMat = !Utils.growMat;
        //Utils.polyline3d.setGlowMaterial(Utils.growMat);
        //or
        //Utils.polyline3d.glowPower = 0.5;
        //or
        //Utils.polyline3d.alpha = 0.2;
        //or
        Utils.polyline3d.useCenterline = !Utils.polyline3d.useCenterline;
    }
}

//Utils.base64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIgAAABzCAYAAABD70qIAAAJN0lEQVR4AezTA4wgBxQA0FnWtm3bDmo7qq24Oodn23Zwtm3bto25t7aNn7xB+BmU53jmjT7ZieRc7uZrGtGWdrShFm9wBVEEmamMXDccKK05xnIJt/EOLZjBUvYQAnCSTcylL19yBxcTTeXCKLjQFWOOkVzF47xLNaaxhwOcJMyDQ+xlHH/xKndwdkkuS4nMI4vru5HX+J7f+BWA3/iON3mIaziHILfykE9OOf5Idfqzg5DThIXoODOpy688w+VEEGShqJfgXK7jXu7PxN3Z5JjnRCJ4jHr0YhTrCHOwhdkMow+daMM/fMhj3MAlnEMMUUTmIIoYzuMKbuM5fqElPRnNWsISsJSBdKEOH3MXFxBNFJFEJApyIQLS1H8BN/AEn1CF1nSmLyOYxoxMTGUQXWjAJ1xHAJCb5biA71hJWEiOso1VLGQus5jBBLpRj7rUpyGNaUZbRjCDWcxjCWvZT1gKbWcps5nOUBrzFx/xIk/xJE/wOI/xKM/zLt9ShVYMYwazWcRqtnO8gDnO5WPOJkiU7XI8QBcOEBaj05xI5WQqpwjLgZMc5SD72ZfKXsA/BznMsWKofw91uJsgUaYLcjsTONPOPcBYku1xHK9qjG3PrG3v4NmjtW3btm3btu1trHdst+3u874nSSWVytbtyu37ejvv/Cb5xIs5/2/zwDhJCrENPCsaR09cEdTqLHkA/eFZ4UCmoRRGnFaJA+GHAxmCb2FEsAIbhQPZDuUwImjEOfCDn7UPRy2MJYK3kBX8SvqJyG8aRfLR1wbSA1/DhIjMwkY2kMEohAkRWYmpGQ9k5/88byZaU6VTseY7I4OBFGOvjAUyaeoLZr+TP/7siofnHvLgB2u2fOzTknUflU7xGOya27W3M2AWGdlLCgIZhAKYdNl6T7664IY3ZtV7785v8t5f1OJ9sFg6k11zu/Z2BnYWzCQTgexpA+mDPJh0/X3v1xqf+bZi6HsLmz35/dlZ2Jl0MJBVmG4DycGnMOna/ej3Z732S52G00XYWdiZdDCQBdjBBuLjNDTApGPfkz766vVfFUhXYWdhZ9LBQH7AKBuItQFKFYgCCfkS3YNA+uE9BWIpEDTjevjhE+CHoE2BKBCUY/voeZAdUatAFAi+wcBoIEPxjAJRIDgO2dFAsnC+AnE+kDLsEHcu9XAF4nwgr2FkXCATMVeBOB3IRciOuxszCm8rEGcDacUhqS5P9cCTCsTZQGZj5/hAgPsViLOBvIcxSHk391YF4mwgT6JHe4GcjyYF4mQg9ye54X8kKhWIk4HckySQ3bBGgTgZyDVJApmOVQrEuUBqcQrafWFoV30GcTKQShyZJJA9UaRAnAukGscjRRzAIShXIM4FUodTkwRyAZoViHOBNOF8eEgZyN0wCsSxQIA7kwRyvwKBflEWu1n3lAJxNpDHkJsqkAn4SIE4G8gbGJZqJ/dvWKZAAtrujwZylI4cOh1ICw6KO27YDVcqEIcDAc6KC2QCPlcgzgfyHIb+1kO6f0SzAnE+kEpsHw0kF+fp6qUCQRsOiL60PBy/6vK2ArHwBvqGA/kLqhWIArFQgk2DQHxcjiYFokAsNOEy+MGd3A9hFIgCCfkmeEAmB18rEAUS8T1G2ECyFYgCicKvWD/4EvOKAlEgEbOwoQ3Ex3GoUyAReuVwtA3E2hrlCkSBhHyLXuHnpxYpEAVioQ2PIyu8k3s52hSIAkE1ZkQ36/6lQBSIhVKMjwayIX5VIAoEL6JPNJDeuEWBKJDwbm700NAxCsT5QMqxfdypsn9ilQJxOpAXMTzu4PI6+FSBOB3IefDjrj70wjMKxOlAjtIrhwokThH+014gF+gRO2cD+QLrB3Gkvl2nQFwM5Dn0ae+NkLXxswKJo2cwR+EHBeJcIG24Ikkgw/CdAnEukCock+QRu0EoUCDOBVKGg5ME0g/5CsS5QIqwV5JAeuNbBeJcIKswPUkgPfCNAnEukGX4e5JA+iBPgTgXyGJMSRLIGP2Y62wgk5MEsg3mKRDnAinBfkgRB7ArVjsZiH5RdnmSh3TPRoMCcSwQ4N4kgdzl7Ha/AnkYfqpAfDzsdCDaze2b6izIOLzvbCAK5H2MS/WQ7h6odjYQBbICf48LxMc5uvbgcCDAyXFXHkbgVecDUSCPYOBvPaS7IyqcD0SBrMSW0UB8HKLL2wrEwu7RQPriNRgFopeW8SB6hgPZACUw6dj96PdnvfaLAukq7CzsTNKdJ4owJvyQ7v6ogUnH3/d+rfGZbyuGajhdg52FnUkHAqnC9CCQLDyMNph0TPzP8+bkqwtueGNWvffu/Cbv/UUt3geLO5PYNbdrb2dgZ8FM0o0j8ApybCC5+BKmIyZNfcHsd/LHn13x8NxDHvxgzZaPfVqy7qOdQh6DXXO79nYGzKJjcQA/Y5wNpC/yYDJhZ8qdaE3tVMKa74xMzRGLMSXuFLvIaswMvsR8ASMSsga7Bz/F3IRmGBELs7FJ+JhheBdX5Cv0DALZGKUwImjGDfDDd2HugxFBCSZHd3O3xBwYp0kLrkWvaCA+DkIFjGsk/thhOJJ+uAI1MM6RXzARXqpzqYNwCFaiFeZ/pBWNqEMNKlERUhlShRo0oAXm/0ArWkKaQ9pgOlEDPsFE+KlfOQSysAUewQqkuzPYhCIsxC8oRB7ewT24AIdhOiZha2yDbbEdtscOmILdcDJuxdv4FoWYjSKYLqgKizELP6AAeXgP9+MO3IqbcSOuxw14Ap8hDwX4Hj9jAdagASZDFuIUDIVnJbmfGxiAP+NcPIgX8DnykRfxDd7D83gU9+IC7IHtMBZ9kYtsZMG34CXgW8hCNnLQFxtgd1yHx/A6ZsP8DhbjQzyNu3EsJmIdDEXvyN8/lWzkoicGYiy2wa44B/fhETyHd1CY8Bn1JfgIz+Bm7ISs+DiShRLog3WxGTaN2Bij0QteEun8SRDREOyE43A98tEEk0FtMCjGi7gYR+EvGIdu8NqT5t8xqidGYgv8G4fjeBwXcTyOwF8xHt3hhWV+IBmPIOP/jz2wHv6Mk/EJKlCbxo9+1SjHN7gI07EthiOrs/7+/Dszzqk/KRYiBwOwHvbF8/geK9ACE1GO2cjDXZiGdTAQ3briYmc2CAWTjaH4Fy7DfXgA9+MWHIIN0QtZri74fwEuk+iobnP6aQAAAABJRU5ErkJggg==";
Utils.base641 = "iVBORw0KGgoAAAANSUhEUgAAAIgAAABzCAYAAABD70qIAAAJN0lEQVR4AezTA4wgBxQA0FnWtm3bDmo7qq24Oodn23Zwtm3bto25t7aNn7xB+BmU53jmjT7ZieRc7uZrGtGWdrShFm9wBVEEmamMXDccKK05xnIJt/EOLZjBUvYQAnCSTcylL19yBxcTTeXCKLjQFWOOkVzF47xLNaaxhwOcJMyDQ+xlHH/xKndwdkkuS4nMI4vru5HX+J7f+BWA3/iON3mIaziHILfykE9OOf5Idfqzg5DThIXoODOpy688w+VEEGShqJfgXK7jXu7PxN3Z5JjnRCJ4jHr0YhTrCHOwhdkMow+daMM/fMhj3MAlnEMMUUTmIIoYzuMKbuM5fqElPRnNWsISsJSBdKEOH3MXFxBNFJFEJApyIQLS1H8BN/AEn1CF1nSmLyOYxoxMTGUQXWjAJ1xHAJCb5biA71hJWEiOso1VLGQus5jBBLpRj7rUpyGNaUZbRjCDWcxjCWvZT1gKbWcps5nOUBrzFx/xIk/xJE/wOI/xKM/zLt9ShVYMYwazWcRqtnO8gDnO5WPOJkiU7XI8QBcOEBaj05xI5WQqpwjLgZMc5SD72ZfKXsA/BznMsWKofw91uJsgUaYLcjsTONPOPcBYku1xHK9qjG3PrG3v4NmjtW3btm3btu1trHdst+3u874nSSWVytbtyu37ejvv/Cb5xIs5/2/zwDhJCrENPCsaR09cEdTqLHkA/eFZ4UCmoRRGnFaJA+GHAxmCb2FEsAIbhQPZDuUwImjEOfCDn7UPRy2MJYK3kBX8SvqJyG8aRfLR1wbSA1/DhIjMwkY2kMEohAkRWYmpGQ9k5/88byZaU6VTseY7I4OBFGOvjAUyaeoLZr+TP/7siofnHvLgB2u2fOzTknUflU7xGOya27W3M2AWGdlLCgIZhAKYdNl6T7664IY3ZtV7785v8t5f1OJ9sFg6k11zu/Z2BnYWzCQTgexpA+mDPJh0/X3v1xqf+bZi6HsLmz35/dlZ2Jl0MJBVmG4DycGnMOna/ej3Z732S52G00XYWdiZdDCQBdjBBuLjNDTApGPfkz766vVfFUhXYWdhZ9LBQH7AKBuItQFKFYgCCfkS3YNA+uE9BWIpEDTjevjhE+CHoE2BKBCUY/voeZAdUatAFAi+wcBoIEPxjAJRIDgO2dFAsnC+AnE+kDLsEHcu9XAF4nwgr2FkXCATMVeBOB3IRciOuxszCm8rEGcDacUhqS5P9cCTCsTZQGZj5/hAgPsViLOBvIcxSHk391YF4mwgT6JHe4GcjyYF4mQg9ye54X8kKhWIk4HckySQ3bBGgTgZyDVJApmOVQrEuUBqcQrafWFoV30GcTKQShyZJJA9UaRAnAukGscjRRzAIShXIM4FUodTkwRyAZoViHOBNOF8eEgZyN0wCsSxQIA7kwRyvwKBflEWu1n3lAJxNpDHkJsqkAn4SIE4G8gbGJZqJ/dvWKZAAtrujwZylI4cOh1ICw6KO27YDVcqEIcDAc6KC2QCPlcgzgfyHIb+1kO6f0SzAnE+kEpsHw0kF+fp6qUCQRsOiL60PBy/6vK2ArHwBvqGA/kLqhWIArFQgk2DQHxcjiYFokAsNOEy+MGd3A9hFIgCCfkmeEAmB18rEAUS8T1G2ECyFYgCicKvWD/4EvOKAlEgEbOwoQ3Ex3GoUyAReuVwtA3E2hrlCkSBhHyLXuHnpxYpEAVioQ2PIyu8k3s52hSIAkE1ZkQ36/6lQBSIhVKMjwayIX5VIAoEL6JPNJDeuEWBKJDwbm700NAxCsT5QMqxfdypsn9ilQJxOpAXMTzu4PI6+FSBOB3IefDjrj70wjMKxOlAjtIrhwokThH+014gF+gRO2cD+QLrB3Gkvl2nQFwM5Dn0ae+NkLXxswKJo2cwR+EHBeJcIG24Ikkgw/CdAnEukCock+QRu0EoUCDOBVKGg5ME0g/5CsS5QIqwV5JAeuNbBeJcIKswPUkgPfCNAnEukGX4e5JA+iBPgTgXyGJMSRLIGP2Y62wgk5MEsg3mKRDnAinBfkgRB7ArVjsZiH5RdnmSh3TPRoMCcSwQ4N4kgdzl7Ha/AnkYfqpAfDzsdCDaze2b6izIOLzvbCAK5H2MS/WQ7h6odjYQBbICf48LxMc5uvbgcCDAyXFXHkbgVecDUSCPYOBvPaS7IyqcD0SBrMSW0UB8HKLL2wrEwu7RQPriNRgFopeW8SB6hgPZACUw6dj96PdnvfaLAukq7CzsTNKdJ4owJvyQ7v6ogUnH3/d+rfGZbyuGajhdg52FnUkHAqnC9CCQLDyMNph0TPzP8+bkqwtueGNWvffu/Cbv/UUt3geLO5PYNbdrb2dgZ8FM0o0j8ApybCC5+BKmIyZNfcHsd/LHn13x8NxDHvxgzZaPfVqy7qOdQh6DXXO79nYGzKJjcQA/Y5wNpC/yYDJhZ8qdaE3tVMKa74xMzRGLMSXuFLvIaswMvsR8ASMSsga7Bz/F3IRmGBELs7FJ+JhheBdX5Cv0DALZGKUwImjGDfDDd2HugxFBCSZHd3O3xBwYp0kLrkWvaCA+DkIFjGsk/thhOJJ+uAI1MM6RXzARXqpzqYNwCFaiFeZ/pBWNqEMNKlERUhlShRo0oAXm/0ArWkKaQ9pgOlEDPsFE+KlfOQSysAUewQqkuzPYhCIsxC8oRB7ewT24AIdhOiZha2yDbbEdtscOmILdcDJuxdv4FoWYjSKYLqgKizELP6AAeXgP9+MO3IqbcSOuxw14Ap8hDwX4Hj9jAdagASZDFuIUDIVnJbmfGxiAP+NcPIgX8DnykRfxDd7D83gU9+IC7IHtMBZ9kYtsZMG34CXgW8hCNnLQFxtgd1yHx/A6ZsP8DhbjQzyNu3EsJmIdDEXvyN8/lWzkoicGYiy2wa44B/fhETyHd1CY8Bn1JfgIz+Bm7ISs+DiShRLog3WxGTaN2Bij0QteEun8SRDREOyE43A98tEEk0FtMCjGi7gYR+EvGIdu8NqT5t8xqidGYgv8G4fjeBwXcTyOwF8xHt3hhWV+IBmPIOP/jz2wHv6Mk/EJKlCbxo9+1SjHN7gI07EthiOrs/7+/Dszzqk/KRYiBwOwHvbF8/geK9ACE1GO2cjDXZiGdTAQ3briYmc2CAWTjaH4Fy7DfXgA9+MWHIIN0QtZri74fwEuk+iobnP6aQAAAABJRU5ErkJggg==";

//画面
Utils.createPolygon3D = function(baseUrl)
{
    if (Utils.polygon3d == null)
    {
        var polygon3d = new SSmap.Polygon3D(); //创建画面对象
        polygon3d.color = SSmap.Color.fromRgb(255, 0, 0, 10);//颜色
        polygon3d.alpha = 1.0; //0.5;      //透明度
        polygon3d.fillAlpha = 1.0;  //填充透明度
        //polygon3d.setFillColor(SSmap.Color.fromRgb(33, 123, 183, 10)); //填充颜色

        // polygon3d.addPoint(SSmap.Vector3.create(-2401407.954, 5382591.947, 2429380.474));
        // polygon3d.addPoint(SSmap.Vector3.create(-2401490.6719, 5382552.657, 2429385.5099));
        // polygon3d.addPoint(SSmap.Vector3.create(-2401492.175, 5382588.7119, 2429305.993));
        // polygon3d.addPoint(SSmap.Vector3.create(-2401416.810, 5382619.619, 2429308.5397));
        //or
        polygon3d.addPoint(SSmap.Vector3.create(-2403907.44784, 5380534.08195, 2431460.21483));
        polygon3d.addPoint(SSmap.Vector3.create(-2405573.81627, 5379848.27136, 2431344.34874));
        polygon3d.addPoint(SSmap.Vector3.create(-2405443.20027, 5380585.80727, 2429830.69499));
        polygon3d.addPoint(SSmap.Vector3.create(-2404520.01097, 5381015.86522, 2429800.33365));

        polygon3d.addProperty("多边形", "多边形属性测试");
        polygon3d.setAltitude(10);
        polygon3d.setAltitudeMethod(SSmap.AltitudeMethod.Absolute); //绝对模式
        //polygon3d.setAltitudeMethod(SSmap.AltitudeMethod.OnTerrain);

        polygon3d.fillMode = SSmap.FillMode.FillImage;             //设置填充方式 NoFill, FillColor, FillImage
        polygon3d.fillStyle = SSmap.BrushStyle.TexturePattern;  //贴地模式需要填充样式: SolidPattern: 填充颜色,  TexturePattern : 填充图片, 其它有点网格, 线网格等样式
        polygon3d.image = baseUrl + "symbols/Mats/102.png";    //使用纹理贴图  
        polygon3d.depthTestDistance = 1e4;
       
        //polygon3d.setImageFromBase64(Utils.base64);
        polygon3d.textureScale = SSmap.Vector2.create(10.0, 10.0);                           //纹理重复次数
        //polygon3d.antiTile = SSmap.AntiTextureRep.NoTile2;   // Tile: 不做纹理重复处理 NoTile1:默认,反瓦块一样的纹理重复方案1 NoTile2: 反瓦块一样的纹理重复方案2
        //or                       
        //polygon3d.waterShader = true;   //填充水面材质, 画水面, 淹没分析之类的应用


        //默认的贴地模式有效. TerrainOnly: 覆盖地面 WholeScene: 覆盖范围内的所有场景
        //polygon3d.setSceneMode(SSmap.TextureProjectionSceneMode.TerrainOnly); 
        polygon3d.draw();   //绘制
        polygon3d.end();    //end之后不能添加点
        Utils.polygon3d = polygon3d;

    }
    else
    {
        Utils.polygon3d.delete();   //删除面对象
        Utils.polygon3d = null;
    }
}

//更换字体测试
Utils.fontList = ["宋体", "仿宋", "黑体", "楷体", "隶书", "幼圆", "等线", "微软雅黑",
    "方正舒体", "方正姚体", "华文彩云", "华文仿宋", "华文琥珀", "华文楷体",
    "华文隶书", "华文宋体", "华文细黑", "华文行楷", "华文新魏", "华文中宋"];
Utils.fontType = 0;
Utils.changedFont = function ()
{
    SSmap.FontManager.setFont(Utils.fontList[Utils.fontType]);
    Utils.fontType++;
    if (Utils.fontType >= Utils.fontList.length)
        Utils.fontType = 0;     
}

//创建一个billboard物体
Utils.createBillBoardEntity = function (baseUrl)
{
    if (Utils.billboardEntity == null)
    {
        let bbEntity = new SSmap.BillboardEntity();
        bbEntity.position = SSmap.Vector3.create(-2.39296e+06, 5.38694e+06, 2.42807e+06);
        bbEntity.scale = 1.0;
        bbEntity.imageWidth = 50;
        bbEntity.imageHeight = 35;
        bbEntity.url = baseUrl + "symbols/images/bg.png"; 

        // let strMap = new SSmap.StringMap();
        // strMap.set("name", "背景图片");
        // strMap.set("pos", "蛇口红树湾");
        // bbEntity.setProperties(strMap);
        // strMap.delete();
        //or
        bbEntity.addProperty("name", "背景图片");
        bbEntity.addProperty("pos", "蛇口红树湾");

        if (Utils.billboardCollection == null)
        {
            var bbcollection = new SSmap.BillboardCollection();
            Utils.billboardCollection = bbcollection;
        }
        bbEntity.setCollection(Utils.billboardCollection);
        Utils.billboardEntity = bbEntity;
    }
    else
    {
        Utils.billboardEntity.delete();
        Utils.billboardEntity = null;

        if (Utils.billboardCollection != null)
        {
            Utils.billboardCollection.delete();
            Utils.billboardCollection = null;
        }
    }
}

//创建一个billboard标签, 标签包含文字和图片, 可以使用外框, 如果需要图片做背景, 那么打开mix属性

Utils.createLabel3D = function (baseUrl)
{
    if (Utils.label3d == null)
    {
        var label3d = new SSmap.Label3D();
        label3d.position = SSmap.Cartographic.fromDegrees(114.06684143836947, 22.55949606964763, 405.03039819798914).toVector3(); 
  
        //label3d.frameUrl = baseUrl + "symbols/images/gallery_frame_70x71.png";
        label3d.url = baseUrl + "symbols/images/site.png";
        label3d.text = "中国人民银行";
        //label3d.background = SSmap.Color.fromRgb(0, 0, 200, 200);
        label3d.imageWidth = 20;
        label3d.imageHeight = 20; 
        label3d.fontSize = 14;
        //label3d.mix = true;
        //label3d.setAltitude(406.03);
        //label3d.setAltitudeMethod(SSmap.AltitudeMethod.Absolute);
        label3d.setAltitudeMethod(SSmap.AltitudeMethod.OnTerrain);
        //label3d.lineColor = SSmap.Color.fromRgb(0, 0, 200, 200);
        label3d.lineToGround = true;    //更新为属性

        if (Utils.billboardCollection == null)
        {
            var bbcollection = new SSmap.BillboardCollection();
            Utils.billboardCollection = bbcollection;
        }
        
        label3d.setCollection(Utils.billboardCollection);
        Utils.label3d = label3d;
    }
    else
    {
        Utils.label3d.delete();
        Utils.label3d = null;

        ////所有标签类共用
        // if (Utils.billboardCollection != null)
        // {
        //     Utils.billboardCollection.delete();
        //     Utils.billboardCollection = null;
        // }
    }
}

//标签拾取测试
Utils.BBEntityPick = function (feature, pos)
{
    if (feature)
    {
        let bbEntity = SSmap.BillboardEntity.getSelect(feature);
        if (bbEntity)
        {
            Utils.getFeatureProperty(feature);
            console.log("拾取成功, 修改坐标");
            bbEntity.position = pos;
        }
    }
}

//label3d拾取测试
Utils.Label3DPick = function (feature, pos)
{
    if (feature)
    {
        let label = SSmap.Label3D.getSelect(feature);
        if (label)
        {
            Utils.getFeatureProperty(feature);
            console.log("拾取成功, 修改坐标");
            label.position = pos;
        }
    }
}

Utils.Polyline3DPick = function (feature)
{
    if (feature)
    {
        let polyline = SSmap.Polyline3D.getSelect(feature);
        if (polyline)
        {
            Utils.getFeatureProperty(feature);
        }
    }
}

Utils.polygonHighLightTest = true; 
Utils.Polygon3DPick = function (feature)
{
    if (feature)
    {
        let polygon = SSmap.Polygon3D.getSelect(feature); //拾取面对象(拾取时高亮)
        
        if (polygon)
        {
            Utils.getFeatureProperty(feature);
            SSmap.Polygon3D.setHighLight(feature, Utils.polygonHighLightTest);  //设置面高亮
            Utils.polygonHighLightTest = !Utils.polygonHighLightTest;
        }
    }
}

//geojsonpointlayer 拾取测试
Utils.PointLayerPick = function (feature)
{
    if (feature)
    {
        let pointLayer = SSmap.GeoJsonPointLayer.getSelect(feature);
        if (pointLayer)
        {
            Utils.getFeatureProperty(feature); 
            let id = feature.getProperty("id");
            let keys = pointLayer.getKeys();

            let size = keys.size();
            for (let i = 0; i < size; i++)
            {
                let key = keys.get(i);   
                console.log(  key + " : " +  pointLayer.getPropertie(id, key));
            }
        }
    }    
}

//PolylineLayerPick
Utils.polylineHighLightTest = true;
Utils.PolylineLayerPick = function (feature)
{
    if (feature)
    {
        let polylineLayer = SSmap.GeoJsonPolylineLayer.getSelect(feature);
        if (polylineLayer)
        {
            Utils.getFeatureProperty(feature); 
            let id = feature.getProperty("id");
            let keys = polylineLayer.getKeys();
            //polylineLayer.setHighLight(Number(id), true); //拾取高亮
            polylineLayer.setHighLight(Number(id), Utils.polylineHighLightTest);
            Utils.polylineHighLightTest = !Utils.polylineHighLightTest;
            let size = keys.size();
            for (let i = 0; i < size; i++)
            {
                let key = keys.get(i);   
                console.log(  key + " : " +  polylineLayer.getPropertie(id, key));
            }
        }
    }    
}

//PolygonLayerPick
Utils.polygonHighLightTest = true;
Utils.PolygonLayerPick = function (feature)
{
    if (feature)
    {
        let polygonLayer = SSmap.GeoJsonPolygonLayer.getSelect(feature);
        if (polygonLayer)
        {
            Utils.getFeatureProperty(feature); 
            let id = feature.getProperty("id");
            console.log("id = " + id + ": " + Number(id) + ": " + parseInt(id));

            let keys = polygonLayer.getKeys();
            polygonLayer.setHighLight(Number(id), Utils.polygonHighLightTest);
            Utils.polygonHighLightTest = !Utils.polygonHighLightTest;
            
            let size = keys.size();
            for (let i = 0; i < size; i++)
            {
                let key = keys.get(i);   
                console.log(  key + " : " +  polygonLayer.getPropertie(id, key));
            }
        }
    }    
}

//LabelLayerPick(f);
Utils.LabelLayerPick = function (feature)
{
    if (feature)
    {
        let labelLayer = SSmap.GeoJsonLabelLayer.getSelect(feature);
        if (labelLayer)
        {
            Utils.getFeatureProperty(feature); 
            let id = feature.getProperty("id");
            let keys = labelLayer.getKeys();

            let size = keys.size();
            for (let i = 0; i < size; i++)
            {
                let key = keys.get(i);   
                console.log(  key + " : " +  labelLayer.getPropertie(id, key));
            }
        }
    }    
}

//获取feature中的所有属性
Utils.getFeatureProperty = function (feature)
{
    if (feature == null || feature == undefined)
        return;
    
    let nameList = feature.propertyNames();
    let size = nameList.size();

    for (let i = 0; i < size; i++)
    {
        let key = nameList.get(i);   
        let value = feature.getProperty(key);
        console.log(key + " : " + value);
    }
}


//创建一个投影标签(贴地形)
Utils.createLabelProjection = function()
{
    var labelProjection = new SSmap.LabelProjection();
    labelProjection.text = "深\n圳\n测\n试\n大\n道\n 标签投影";
    labelProjection.position = SSmap.Vector3.create(-2402660.37491221, 5383381.806121888, 2426400.6702083484);
    labelProjection.rotation = 30;
    //labelProjection.
    labelProjection.width = 500;
    labelProjection.height = 500;
}

//创建一个图片投影(贴地形)
// Utils.createTextureProjection = function (scene, baseUrl)
// {
//     //textureProjection
//     var texImage = new SSmap.TextureImage();
//     texImage.loadImage(baseUrl + "data/bg.png");
//     var tex = new SSmap.Texture();
//     tex.addTextureImage(texImage);

//     var textureProjection = new SSmap.TextureProjection();
//     textureProjection.texture = tex;
//     textureProjection.blendMode = SSmap.TextureProjectionBlendMode.AlphaBlend;
//     textureProjection.projectionType = SSmap.ProjectionType.OrthographicProjection;
//     textureProjection.width = 500.0;
//     textureProjection.height = 500.0;
//     textureProjection.nearPlane = 1.0;
//     textureProjection.farPlane = 1000.0;
//     textureProjection.showFrustum = false;

//     var entity = new SSmap.Entity();
//     entity.addComponent(textureProjection);

//     var pos = SSmap.Cartesian3.create(-2402689.89, 5382787.65, 2427702.439);
//     var carto = pos.toCartographic();
//     entity.transform.cartographic = SSmap.Cartographic.create(carto.longitude, carto.latitude, carto.height + 100.0);
//     entity.transform.lookAt(pos.toVector3());
//     scene.addEntity(entity);
// }

Utils.textureDXTcompress = false;
Utils.createTextureProjection = function (scene, baseUrl) {
  //textureProjection

  fetch(baseUrl + "data/bg.png")   //bg.png
    .then((response) => response.arrayBuffer())
    .then((data) => {
        console.log("len: " + data.byteLength);
        
        var texImage = new SSmap.TextureImage();
        texImage.width = 1920;
        texImage.height = 1080;
        texImage.mipLevels = 1;
        texImage.layers = 1;
        texImage.autoMipMaps = false;
        texImage.compressed = false;

        //dxt压缩纹理
        if (Utils.textureDXTcompress)
        {
            texImage.pixelType = SSmap.PixelType.NoPixelType;
            texImage.pixelFormat = SSmap.PixelFormat.NoSourceFormat;
            texImage.textureFormat = SSmap.TextureFormat.RGB_DXT1; 
            var buffer = new Uint8Array(data);
            console.log("buffer len " + buffer.length + " " + buffer.byteLength);
            
            texImage.setData(buffer, 8, true);     //如果为dxt数据, 设置true
        }
        else
        {
            texImage.pixelType = SSmap.PixelType.UInt8;
            texImage.pixelFormat = SSmap.PixelFormat.RGBA;
            //texImage.textureFormat = SSmap.TextureFormat.RGBAFormat; 
    
           texImage.loadImage(baseUrl + "data/bg.png");
            // var buffer = new Uint8Array(data);
            // console.log("buffer len " + buffer.length + " " + buffer.byteLength);
            
            // texImage.setData(buffer, 4, false);     //如果为dxt数据, 设置true
        }

        var tex = new SSmap.Texture();
        tex.addTextureImage(texImage);

        var textureProjection = new SSmap.TextureProjection();
        textureProjection.texture = tex;
        textureProjection.blendMode = SSmap.TextureProjectionBlendMode.AlphaBlend;
        textureProjection.projectionType = SSmap.TextureProjectionType.Orthographic; //Perspective Orthographic
        textureProjection.width = 500.0;
        textureProjection.height = 500.0;
        textureProjection.nearPlane = 1.0;
        textureProjection.farPlane = 1000.0;
        textureProjection.showFrustum = false;
        textureProjection.fov = 70;

        var entity = new SSmap.Entity();
        entity.addComponent(textureProjection);

        var pos = SSmap.Cartesian3.create(-2402689.89, 5382787.65, 2427702.439);
        var carto = pos.toCartographic();
        entity.transform.cartographic = SSmap.Cartographic.create(
            carto.longitude,
            carto.latitude,
            carto.height + 100.0
        );

        entity.transform.lookAt(pos.toVector3());
        scene.addEntity(entity);
        
    });
};

//飞线层(弧线层)
Utils.arclayer = null;  
Utils.createArcLayer = function (baseUrl)
{
    if (Utils.arclayer == null)
    {
        var arclayer = new SSmap.ArcLayer();
        //arclayer.setNDJsonFile(baseUrl + "data/heathrow-flights.ndjson");
        var startPoint = SSmap.Cartographic.fromDegrees(114.01744008667717, 22.582023967806496, 263);

        for (let i = 0; i < 10; i++)
        {
            for(let j=0;j < 10; j++)
            {
                let lon = startPoint.longitude * 180 / Math.PI + (i-5) * 1e-3;
                let lat = startPoint.latitude * 180 / Math.PI + (j-5) * 1e-3;
                let endPoint = SSmap.Cartographic.fromDegrees(lon, lat, 0);
                let height= window.scene.globe.getHeight(endPoint,false);
                //console.log('height is :'+height);  
                let baseData = {
                    "name":"深圳市",
                    "country":"china",
                    "start":[startPoint.longitude*180/Math.PI,startPoint.latitude*180/Math.PI,startPoint.height],
                    "end":[lon,lat,50],
                    "width": Math.max(i+j, 1.0)
                };
                arclayer.addString(JSON.stringify(baseData));
            }
        }

        arclayer.animationRun = true;   //是否播放动画
        arclayer.animationTimer = 1;    //动画播放周期时间3秒
        //arclayer.lineWidth = 10.0;       //线宽
        arclayer.setWidthField("width");
        arclayer.setStartColor(SSmap.Color.fromRgb(0, 200, 0, 0));
        arclayer.setEndColor(SSmap.Color.fromRgb(0, 0, 200, 0));
        arclayer.height = 1;

        arclayer.setImageUrl(baseUrl + "symbols/images/arrow-2.png");
        arclayer.create();
        Utils.arclayer = arclayer;
    }
    else
    {
        Utils.arclayer.delete();
        Utils.arclayer = null;
    }
}

//点图层
Utils.createPointLayer = function (baseUrl)
{
    if (Utils.geoPointLayer == null)
    {
        var geoPointLayer = new SSmap.GeoJsonPointLayer();
        //geoPointLayer.geoJson = baseUrl + "data/futian-point-179.json";
        geoPointLayer.geoJson = baseUrl + "data/futian-point.geojson";  //撒点的数据(坐标, 属性)
        geoPointLayer.url = baseUrl + "symbols/images/site.png";    //撒点图标
        geoPointLayer.clusteredIcon = baseUrl + "symbols/images/dot_red_32x32.png";  //聚合的图标
        geoPointLayer.clustered = true; //点聚合  true: 聚合 false: 不聚合,  默认不聚合
        geoPointLayer.width = 16;   //撒点的宽度
        geoPointLayer.height = 16;  //撒点的高度
        geoPointLayer.create(); 
        Utils.geoPointLayer = geoPointLayer;
    }
    else
    {
        Utils.geoPointLayer.delete();
        Utils.geoPointLayer = null;
    }
}

//具有拾取功能的物体
Utils.createPickPointLayer = function (baseUrl)
{
    if (Utils.geoPickPointLayer == null)
    {
        var geoPickPointLayer = new SSmap.GeoJsonPickPointLayer();
        geoPickPointLayer.geoJson = baseUrl + "data/futian-point-179.json";
        //geoPickPointLayer.geoJson = baseUrl + "data/addr_work/0221.geojson";
        //geoPickPointLayer.setAltitudeMethod(SSmap.AltitudeMethod.Absolute);
        geoPickPointLayer.color = SSmap.Color.fromRgb(255, 0, 0, 128);
        geoPickPointLayer.setAltitudeMethod(SSmap.AltitudeMethod.OnTerrain);
        geoPickPointLayer.heightOffset = 20.0;
        
        geoPickPointLayer.create(); 
        Utils.geoPickPointLayer = geoPickPointLayer;
    }
    else
    {
        // Utils.geoPickPointLayer.delete();
        // Utils.geoPickPointLayer = null;
        Utils.geoPickPointLayer.enabled = !Utils.geoPickPointLayer.enabled;
    }
}

//geojson标签, 可以拾取标签属性(参考电子哨兵)
Utils.createGeoJsonModel = function (baseUrl)
{
    if (Utils.GeoJsonModel == null)
    {      
        var GeoJsonModel = new SSmap.GeoJsonModel();
        GeoJsonModel.iconUrl = baseUrl + "symbols/images/fivestar1.png";
        GeoJsonModel.iconSize = SSmap.Vector2.create(114, 40);
       // GeoJsonModel.labelOffset = SSmap.Vector2.create(5, -20); //x, y偏移值
        GeoJsonModel.height = 0.0;
        GeoJsonModel.labelField = "name"; //MC
        GeoJsonModel.scaleByDistance = SSmap.Vector2.create(6.0e3, 0.5);
        GeoJsonModel.load(baseUrl + "data/street.geojson");
        if (Utils.tilesetLayer != null)
            GeoJsonModel.setBase3DTileset(Utils.tilesetLayer.tileset());
        
        var GeoJsonModel1 = new SSmap.GeoJsonModel();
        // GeoJsonModel1.iconUrl = baseUrl + "symbols/images/fivestar2.png";
        // GeoJsonModel1.iconSize = SSmap.Vector2.create(1, 1);
        GeoJsonModel1.labelOffset = SSmap.Vector2.create(5, 15); //x, y偏移值
        GeoJsonModel1.scaleByDistance = SSmap.Vector2.create(6.0e3, 0.5);
        GeoJsonModel1.height = 0.0;
        GeoJsonModel1.labelField = "num"; //MC
        GeoJsonModel1.load(baseUrl + "data/street.geojson");
        if (Utils.tilesetLayer != null)
            GeoJsonModel1.setBase3DTileset(Utils.tilesetLayer.tileset());

        Utils.GeoJsonModel = GeoJsonModel1;     
    }
    else
    {
        Utils.GeoJsonModel.show = false;
        // Utils.GeoJsonModel.delete(); 
        // Utils.GeoJsonModel = null;
    }
}

Utils.testString = "{\"type\":\"FeatureCollection\",\"name\":\"bing\",\"crs\":{\"type\":\"name\",\"properties\":{\"name\":\"urn:ogc:def:crs:OGC:1.3:CRS84\"}},\"features\":[{\"type\":\"Feature\",\"properties\":{\"设备类型\":\"立柱式终端\",\"区域\":\"福田区\",\"街道\":\"福保街道\",\"社区\":\"明月社区\",\"使用单位\":\"天健阳光华苑\",\"责任人\":\"聂康康\",\"负责人电话\":18503095241,\"楼栋编码\":null,\"卡口\":\"福田区天健阳光华苑\",\"进出类型\":\"进\",\"生产厂家\":\"鲲云科技\",\"产品名称\":\"防疫卫士\",\"设备编号\":\"1876484\"},\"geometry\":{\"type\":\"Point\",\"coordinates\":[114.0506128,22.5276721]}},{\"type\":\"Feature\",\"properties\":{\"设备类型\":\"立柱式终端\",\"区域\":\"福田区\",\"街道\":\"福保街道\",\"社区\":\"明月社区\",\"使用单位\":\"信托花园\",\"责任人\":\"聂康康\",\"负责人电话\":18503095241,\"楼栋编码\":null,\"卡口\":\"信托花园西门\",\"进出类型\":\"进\",\"生产厂家\":\"鲲云科技\",\"产品名称\":\"防疫卫士\",\"设备编号\":\"1876530\"},\"geometry\":{\"type\":\"Point\",\"coordinates\":[114.0468558,22.5285103]}},{\"type\":\"Feature\",\"properties\":{\"设备类型\":\"立柱式终端\",\"区域\":\"福田区\",\"街道\":\"福保街道\",\"社区\":\"明月社区\",\"使用单位\":\"信托花园\",\"责任人\":\"聂康康\",\"负责人电话\":18503095241,\"楼栋编码\":null,\"卡口\":\"信托花园正门\",\"进出类型\":\"进\",\"生产厂家\":\"鲲云科技\",\"产品名称\":\"防疫卫士\",\"设备编号\":\"1876497\"},\"geometry\":{\"type\":\"Point\",\"coordinates\":[114.0468797,22.5292842]}},{\"type\":\"Feature\",\"properties\":{\"设备类型\":\"立柱式终端\",\"区域\":\"福田区\",\"街道\":\"福保街道\",\"社区\":\"明月社区\",\"使用单位\":\"雅云轩\",\"责任人\":\"聂康康\",\"负责人电话\":18503095241,\"楼栋编码\":null,\"卡口\":\"雅云轩出入口\",\"进出类型\":\"进\",\"生产厂家\":\"鲲云科技\",\"产品名称\":\"防疫卫士\",\"设备编号\":\"1876315\"},\"geometry\":{\"type\":\"Point\",\"coordinates\":[114.049656,22.5278659]}},{\"type\":\"Feature\",\"properties\":{\"设备类型\":\"立柱式终端\",\"区域\":\"福田区\",\"街道\":\"福保街道\",\"社区\":\"明月社区\",\"使用单位\":\"阳光四季\",\"责任人\":\"聂康康\",\"负责人电话\":18503095241,\"楼栋编码\":null,\"卡口\":\"阳光四季正门\",\"进出类型\":\"进\",\"生产厂家\":\"鲲云科技\",\"产品名称\":\"防疫卫士\",\"设备编号\":\"1876542\"},\"geometry\":{\"type\":\"Point\",\"coordinates\":[114.046667,22.5290827]}},{\"type\":\"Feature\",\"properties\":{\"设备类型\":\"立柱式终端\",\"区域\":\"福田区\",\"街道\":\"福保街道\",\"社区\":\"明月社区\",\"使用单位\":\"中央花园\",\"责任人\":\"聂康康\",\"负责人电话\":18503095241,\"楼栋编码\":null,\"卡口\":\"福田区中央花园正门\",\"进出类型\":\"进\",\"生产厂家\":\"鲲云科技\",\"产品名称\":\"防疫卫士\",\"设备编号\":\"1875871\"},\"geometry\":{\"type\":\"Point\",\"coordinates\":[114.048219,22.5264707]}},{\"type\":\"Feature\",\"properties\":{\"设备类型\":\"立柱式终端\",\"区域\":\"福田区\",\"街道\":\"福保街道\",\"社区\":\"石厦社区\",\"使用单位\":\"新天时代\",\"责任人\":\"王新冰\",\"负责人电话\":13632632510,\"楼栋编码\":null,\"卡口\":\"新天时代A座入口\",\"进出类型\":\"进\",\"生产厂家\":\"鲲云科技\",\"产品名称\":\"防疫卫士\",\"设备编号\":\"1875417\"},\"geometry\":{\"type\":\"Point\",\"coordinates\":[114.0488743,22.5247275]}},{\"type\":\"Feature\",\"properties\":{\"设备类型\":\"立柱式终端\",\"区域\":\"福田区\",\"街道\":\"福保街道\",\"社区\":\"石厦社区\",\"使用单位\":\"星河明居\",\"责任人\":\"王新冰\",\"负责人电话\":13632632510,\"楼栋编码\":null,\"卡口\":\"星河明居B栋\",\"进出类型\":\"进\",\"生产厂家\":\"鲲云科技\",\"产品名称\":\"防疫卫士\",\"设备编号\":\"1876433\"},\"geometry\":{\"type\":\"Point\",\"coordinates\":[114.0475161,22.5251522]}},{\"type\":\"Feature\",\"properties\":{\"设备类型\":\"立柱式终端\",\"区域\":\"福田区\",\"街道\":\"福保街道\",\"社区\":\"石厦社区\",\"使用单位\":\"众孚大厦\",\"责任人\":\"王新冰\",\"负责人电话\":13632632510,\"楼栋编码\":null,\"卡口\":\"众孚大厦2栋幸运阁\",\"进出类型\":\"进\",\"生产厂家\":\"鲲云科技\",\"产品名称\":\"防疫卫士\",\"设备编号\":\"1876380\"},\"geometry\":{\"type\":\"Point\",\"coordinates\":[114.0470977,22.524857]}},{\"type\":\"Feature\",\"properties\":{\"设备类型\":\"立柱式终端\",\"区域\":\"福田区\",\"街道\":\"福保街道\",\"社区\":\"石厦社区\",\"使用单位\":\"众孚花园\",\"责任人\":\"王新冰\",\"负责人电话\":13632632510,\"楼栋编码\":null,\"卡口\":\"众孚花园北门入口\",\"进出类型\":\"进\",\"生产厂家\":\"鲲云科技\",\"产品名称\":\"防疫卫士\",\"设备编号\":\"1876400\"},\"geometry\":{\"type\":\"Point\",\"coordinates\":[114.0455239,22.5253981]}},{\"type\":\"Feature\",\"properties\":{\"设备类型\":\"立柱式终端\",\"区域\":\"福田区\",\"街道\":\"福保街道\",\"社区\":\"石厦社区\",\"使用单位\":\"众孚新村\",\"责任人\":\"王新冰\",\"负责人电话\":13632632510,\"楼栋编码\":null,\"卡口\":\"众孚新村\",\"进出类型\":\"进\",\"生产厂家\":\"鲲云科技\",\"产品名称\":\"防疫卫士\",\"设备编号\":\"1876432\"},\"geometry\":{\"type\":\"Point\",\"coordinates\":[114.0461321,22.5251509]}},{\"type\":\"Feature\",\"properties\":{\"设备类型\":\"立柱式终端\",\"区域\":\"福田区\",\"街道\":\"福保街道\",\"社区\":\"新港社区\",\"使用单位\":\"福田花园\",\"责任人\":\"陈伟娟\",\"负责人电话\":13691828955,\"楼栋编码\":null,\"卡口\":\"福田花园大厦\",\"进出类型\":\"进\",\"生产厂家\":\"鲲云科技\",\"产品名称\":\"防疫卫士\",\"设备编号\":\"1876467\"},\"geometry\":{\"type\":\"Point\",\"coordinates\":[114.0426088,22.5192155]}},{\"type\":\"Feature\",\"properties\":{\"设备类型\":\"立柱式终端\",\"区域\":\"福田区\",\"街道\":\"福保街道\",\"社区\":\"新港社区\",\"使用单位\":\"物业时代新居\",\"责任人\":\"陈伟娟\",\"负责人电话\":13691828955,\"楼栋编码\":null,\"卡口\":\"福田物业时代新居南门\",\"进出类型\":\"进\",\"生产厂家\":\"鲲云科技\",\"产品名称\":\"防疫卫士\",\"设备编号\":\"1877469\"},\"geometry\":{\"type\":\"Point\",\"coordinates\":[114.0449741,22.5197535]}}]}";
Utils.testString1 = "{\"type\":\"FeatureCollection\",\"name\":\"bing\",\"crs\":{\"type\":\"name\",\"properties\":{\"name\":\"urn:ogc:def:crs:OGC:1.3:CRS84\"}},\"features\":[{\"type\":\"Feature\",\"properties\":{\"设备类型\":\"立柱式终端\",\"区域\":\"福田区\",\"街道\":\"福保街道\",\"社区\":\"明月社区\",\"使用单位\":\"金地翠园\",\"责任人\":\"聂康康\",\"负责人电话\":18503095241,\"楼栋编码\":null,\"卡口\":\"金地翠园东门出入口\",\"进出类型\":\"进\",\"生产厂家\":\"鲲云科技\",\"产品名称\":\"防疫卫士\",\"设备编号\":\"1876341\"},\"geometry\":{\"type\":\"Point\",\"coordinates\":[114.0495642,22.5271691]}}]}";
Utils.bugString = "{\"type\":\"FeatureCollection\",\"name\":\"ft-area\",\"crs\":{\"type\":\"name\",\"properties\":{\"name\":\"urn:ogc:def:crs:OGC:1.3:CRS84\"}},\"features\":[{\"type\":\"Feature\",\"properties\":{\"id\":\"440304009\",\"name\":\"华强北街道 [5]\",\"leaf\":false,\"parentId\":\"all\",\"childCount\":5,\"longitude\":\"114.087081659424\",\"latitude\":\"22.5480207641002\",\"children\":[{\"id\":\"440304009001\",\"name\":\"通新岭社区\",\"leaf\":true,\"parentId\":\"440304009\",\"childCount\":0,\"longitude\":\"114.095325580498\",\"latitude\":\"22.54761950149\",\"iconType\":\"1\",\"geojson\":\"{\\\"type\\\":\\\"MultiPolygon\\\",\\\"coordinates\\\":[[[[114.091306577137,22.5433547888924],[114.09121468441,22.5433533850508],[114.091188256033,22.5449160668231],[114.091179227739,22.5454498576249],[114.091159166562,22.546840728417],[114.091156083686,22.5470544451066],[114.09115589303,22.547184577906],[114.091155804897,22.5472443198695],[114.09114589167,22.5476826116632],[114.091145389848,22.5477047943409],[114.091141568629,22.5479941916786],[114.091130030327,22.5488680071529],[114.091127262213,22.5490776319272],[114.091123705395,22.5492447484464],[114.091122201728,22.5493153650121],[114.09112211989,22.5493191952247],[114.091111418857,22.5497830187713],[114.091090143595,22.5507051952886],[114.09106659215,22.5517261011787],[114.091124324128,22.5517273413438],[114.091763062216,22.5517410640989],[114.092206549393,22.5517505906173],[114.092386939006,22.5517544666953],[114.092918907781,22.5517645256124],[114.093049530711,22.5517669960501],[114.093901442298,22.5517831047065],[114.094351394701,22.5517916131924],[114.094650254706,22.5517972636329],[114.095353601887,22.5518105637066],[114.095409303197,22.5518116168127],[114.095775297592,22.5518185379952],[114.095819521754,22.5518193743647],[114.096021309836,22.5518231901881],[114.096051303125,22.551823756761],[114.096067857845,22.5518240697251],[114.096081636358,22.5518243314278],[114.096483562267,22.5518319306991],[114.096710425246,22.5518362195659],[114.0968260259,22.5518384058178],[114.097811538971,22.5518570415692],[114.098176752755,22.5518639465639],[114.099433777447,22.5518877174442],[114.099433880869,22.551880358292],[114.099434548166,22.5518331133076],[114.099434692957,22.5518227899898],[114.099446371553,22.5509953507549],[114.099450378033,22.5507114743551],[114.099461866872,22.549897435918],[114.099463703287,22.5497889641894],[114.099470527343,22.5493857882236],[114.099482067444,22.5487039303422],[114.09948710005,22.5484065362327],[114.099488353705,22.5483324581764],[114.099505375173,22.5474320245683],[114.099506673794,22.5473807398294],[114.099510828662,22.5472162232501],[114.099534103116,22.5462941159807],[114.099537914443,22.5461431090173],[114.099539496351,22.5460804172775],[114.099546798846,22.5456921781516],[114.099567919424,22.5445693511946],[114.099579712234,22.5439423681458],[114.099587697314,22.5435178233889],[114.099347206908,22.543513009318],[114.098982444584,22.5435057068229],[114.098525705897,22.543496564315],[114.0982816218,22.5434916773991],[114.09818401478,22.5434897240715],[114.09813937783,22.5434888301455],[114.097784647444,22.5434811058684],[114.097327369163,22.5434711485747],[114.097059455729,22.5434653155719],[114.096875740423,22.5434617605518],[114.096720562404,22.5434587577155],[114.09665126964,22.5434574168264],[114.096549705605,22.5434554509084],[114.096364226728,22.5434518617141],[114.096128846269,22.5434473066479],[114.095971615997,22.5434442642414],[114.095674309122,22.543438510379],[114.095657602417,22.5434381866231],[114.09564884212,22.5434380382349],[114.095628378947,22.5434376901973],[114.095181664103,22.5434300900267],[114.094445077079,22.5434154400705],[114.093973654261,22.5434060619402],[114.093856201003,22.5434037264009],[114.093846278783,22.5434035294494],[114.093673705177,22.5434000868446],[114.093347580427,22.5433935838469],[114.093301257247,22.5433926602431],[114.093133479726,22.5433893138658],[114.09307244094,22.543388097083],[114.093061461118,22.5433878776485],[114.093044582641,22.543387541302],[114.092967812914,22.5433860088573],[114.092919447375,22.543385044784],[114.092891130421,22.5433844800098],[114.092792265251,22.5433825068972],[114.092785269425,22.5433823684016],[114.092760234997,22.5433818683786],[114.092659634135,22.5433798610918],[114.092655193283,22.5433797729582],[114.092625702714,22.5433791839023],[114.092554344208,22.5433777611748],[114.092535712054,22.5433773888554],[114.092451931212,22.5433757170158],[114.092421687911,22.5433751135707],[114.092374481597,22.5433741719805],[114.092322639278,22.5433731377602],[114.092320228196,22.5433730900961],[114.092299679587,22.5433726800052],[114.092295731563,22.5433726008649],[114.092188831849,22.5433704685723],[114.092067813679,22.5433680538926],[114.092050506226,22.543367708553],[114.0919600722,22.5433659054123],[114.091913648296,22.5433649791105],[114.091842812296,22.5433635653763],[114.091768083131,22.5433620751996],[114.0917177157,22.5433610697576],[114.09171317862,22.5433609897179],[114.091627965159,22.5433596991908],[114.091576503253,22.5433589131833],[114.091486251789,22.5433575336234],[114.091430118805,22.5433566756701],[114.091315804181,22.543354930086],[114.091306577137,22.5433547888924]]]]}\"},{\"id\":\"440304009002\",\"name\":\"福强社区\",\"leaf\":true,\"parentId\":\"440304009\",\"childCount\":0,\"longitude\":\"114.087253028691\",\"latitude\":\"22.5463865777843\",\"iconType\":\"1\",\"geojson\":\"{\\\"type\\\":\\\"MultiPolygon\\\",\\\"coordinates\\\":[[[[114.082249172062,22.543173697808],[114.081642003776,22.5431613788946],[114.081619303988,22.5444385286153],[114.081611702918,22.5448662129054],[114.081598080887,22.5456323822287],[114.081594497988,22.5458340929691],[114.081587547128,22.5470931708132],[114.081587531839,22.5470959164434],[114.081779754732,22.5470988653204],[114.082077754085,22.5471034365744],[114.082211611876,22.5471054906259],[114.082653783345,22.5471122751114],[114.082713619738,22.5471131933193],[114.082736455323,22.5471135431555],[114.083271060911,22.5471217422746],[114.083280093701,22.5471218798709],[114.083302923891,22.5471224788194],[114.083613706208,22.5471269943154],[114.083838659926,22.5471297597307],[114.08408517669,22.5471327922446],[114.084727495877,22.5471409320085],[114.085462778884,22.5471502507835],[114.085632177883,22.5471539137222],[114.085688819883,22.5471551385988],[114.08674777519,22.5471724343604],[114.086872637063,22.547174619713],[114.08785697382,22.5471918543207],[114.087923795247,22.5471930243386],[114.087923214285,22.5472455429475],[114.087912327092,22.5482301989646],[114.087910952928,22.548354509553],[114.087910391751,22.5488250654245],[114.08791038006,22.5488349894433],[114.087909977164,22.5491726390061],[114.087909856655,22.5492731058692],[114.087901057688,22.549689423628],[114.087861732133,22.5515500597875],[114.087859460446,22.5516571987208],[114.088075750096,22.5516618446185],[114.088852898343,22.5516785423309],[114.089515058373,22.551692767807],[114.089550266831,22.5516935241369],[114.089559936342,22.5516937318803],[114.090815836881,22.5517207133403],[114.09106659215,22.5517261011787],[114.091099171889,22.5503138885751],[114.09112211989,22.5493191952247],[114.091122201728,22.5493153650121],[114.091127262213,22.5490776319272],[114.091130030327,22.5488680071529],[114.091141568629,22.5479941916786],[114.091145389848,22.5477047943409],[114.091154669053,22.5472945649922],[114.091155804897,22.5472443198695],[114.09115589303,22.547184577906],[114.091156083686,22.5470544451066],[114.091159166562,22.546840728417],[114.091179227739,22.5454498576249],[114.091179805104,22.5454157589302],[114.091188256033,22.5449160668231],[114.091214500948,22.5433642803373],[114.09121468531,22.5433533850508],[114.091066340339,22.5433511187592],[114.090915006023,22.5433488066022],[114.090887035308,22.5433483803236],[114.090814346705,22.5433466401354],[114.090526264176,22.543339744134],[114.090333845231,22.5433351378064],[114.089325650359,22.5433110027006],[114.088994683658,22.5433030796734],[114.088609357436,22.5432938562265],[114.088016123246,22.5432796550321],[114.088015552176,22.5432796406429],[114.087809717145,22.5432747141568],[114.087638390899,22.5432706132482],[114.087614753118,22.5432700466754],[114.087437565092,22.5432667911296],[114.087252965752,22.5432633979875],[114.087088617346,22.543260378064],[114.086951202736,22.5432578518684],[114.086906947098,22.5432570388813],[114.086843175272,22.5432558670647],[114.086772890557,22.5432545747389],[114.08676939669,22.543254510887],[114.086760368396,22.5432543454118],[114.085308712427,22.5432276670232],[114.08528426076,22.543227236248],[114.084768284629,22.5432181342096],[114.084134893011,22.5432069610325],[114.082888591835,22.5431849771051],[114.082793669292,22.5431833025674],[114.082249172062,22.543173697808]]]]}\"},{\"id\":\"440304009004\",\"name\":\"荔村社区\",\"leaf\":true,\"parentId\":\"440304009\",\"childCount\":0,\"longitude\":\"114.084724275769\",\"latitude\":\"22.5493865429327\",\"iconType\":\"1\",\"geojson\":\"{\\\"type\\\":\\\"MultiPolygon\\\",\\\"coordinates\\\":[[[[114.08698340566,22.5516588984395],[114.087235476636,22.5516437934264],[114.087859461345,22.5516571987208],[114.087861732133,22.5515500597875],[114.087862105352,22.551532412391],[114.087909856655,22.5492731058692],[114.087909977164,22.5491726390061],[114.087910391751,22.5488250654245],[114.087910953828,22.548354509553],[114.087912327092,22.5482301989646],[114.087923214285,22.5472455429475],[114.087923795247,22.5471930243386],[114.08785697382,22.5471918543207],[114.087655710942,22.5471883298776],[114.08674777519,22.5471724343604],[114.085707049141,22.5471554371737],[114.085688819883,22.5471551385988],[114.085632177883,22.5471539137222],[114.085462778884,22.5471502507835],[114.084838706042,22.5471423421454],[114.084727495877,22.5471409320085],[114.08408517669,22.5471327922446],[114.083838659926,22.5471297597307],[114.083613706208,22.5471269943154],[114.083302923891,22.5471224788194],[114.083280093701,22.5471218798709],[114.083271060911,22.5471217422746],[114.082736455323,22.5471135431555],[114.082713619738,22.5471131933193],[114.082653783345,22.5471122751114],[114.082211611876,22.5471054906259],[114.082077754085,22.5471034365744],[114.081757311251,22.5470985208801],[114.081587531839,22.5470959164434],[114.081576791236,22.5481481160428],[114.081566331221,22.5491728422529],[114.081548885273,22.5498249352726],[114.081536783995,22.5502772412018],[114.081533273042,22.5504084909591],[114.081533204694,22.5504110396378],[114.081524343674,22.5507422590481],[114.081514190328,22.5511217675556],[114.081512917787,22.5511693228061],[114.081512658782,22.551178993216],[114.08160103516,22.551180344897],[114.081601171857,22.5515791321712],[114.081700007349,22.5516075606404],[114.08170065666,22.5516077476994],[114.083289515899,22.5516424363494],[114.083883003698,22.5516106291273],[114.083891878208,22.5516101533859],[114.083986450015,22.5516189343664],[114.083992459285,22.551619491946],[114.08443174393,22.5516225469431],[114.084920862708,22.5516259490784],[114.084921037176,22.5516259499777],[114.084924260346,22.5516259715614],[114.086158554674,22.5516448771094],[114.086183265345,22.5516452548247],[114.086185556818,22.5516452898983],[114.086187555112,22.5516453213745],[114.086608892886,22.5516517713123],[114.086619718026,22.5516519367875],[114.086972862008,22.5516595288642],[114.08698340566,22.5516588984395]]]]}\"},{\"id\":\"440304009003\",\"name\":\"华航社区\",\"leaf\":true,\"parentId\":\"440304009\",\"childCount\":0,\"longitude\":\"114.078831977026\",\"latitude\":\"22.5473278062908\",\"iconType\":\"1\",\"geojson\":\"{\\\"type\\\":\\\"MultiPolygon\\\",\\\"coordinates\\\":[[[[114.081601171857,22.5515791321712],[114.08160103516,22.551180344897],[114.081512658782,22.551178993216],[114.081512917787,22.5511693228061],[114.081514190328,22.5511217675556],[114.081531640773,22.5504694901749],[114.081536783995,22.5502772412018],[114.081548885273,22.5498249352726],[114.081566331221,22.5491728422529],[114.081582749244,22.5475644722227],[114.081583025336,22.5475373882399],[114.081587531839,22.5470959164434],[114.081587547128,22.5470931708132],[114.081594497988,22.5458340929691],[114.081598081786,22.545632383128],[114.081611702918,22.5448662129054],[114.081613669735,22.544755527046],[114.081613713802,22.5447530323266],[114.081642002876,22.5431613788946],[114.08043307033,22.5431368498857],[114.079666329038,22.543121293413],[114.079387645324,22.5431156393753],[114.079278357011,22.543113703135],[114.079278257186,22.5431137013363],[114.079205440878,22.5431124108092],[114.07890273897,22.5431055552772],[114.078741199147,22.5431018959358],[114.078301206735,22.5430931806059],[114.077830710219,22.5430838609315],[114.077822148673,22.5430836909596],[114.077800094599,22.5430832502918],[114.077589107352,22.5430790315721],[114.076680559161,22.5430608688641],[114.076551150315,22.5430582824139],[114.07629925021,22.5430532462104],[114.076165679303,22.5430505761232],[114.076165539008,22.5430583786413],[114.076156701371,22.5435503069012],[114.076140384971,22.5444581599162],[114.076134183246,22.5448032846439],[114.076124433696,22.545345769192],[114.076124089255,22.5453649175569],[114.076097192332,22.5468581599761],[114.076094446701,22.5470105590901],[114.07608878367,22.5473344103548],[114.076085579386,22.5475176517183],[114.076076825385,22.5480182746237],[114.076076523213,22.5480355622914],[114.076065302372,22.5486772465578],[114.07605811499,22.549088223243],[114.076057380244,22.5491294517628],[114.076056058241,22.5492036872005],[114.076050080447,22.5495391783904],[114.076028628918,22.5507431556721],[114.076028537187,22.5507483258746],[114.076023336408,22.5510402116365],[114.076019700449,22.5512442929898],[114.076015708358,22.5514683545809],[114.076014680433,22.5515260739692],[114.07602702183,22.5515262151628],[114.076382295407,22.5515302639106],[114.07681404823,22.5515351859001],[114.076939876874,22.5515366203188],[114.077436834143,22.5515422851484],[114.077448075668,22.551541761743],[114.077487911138,22.5515399091395],[114.077793108665,22.551525716039],[114.077940988686,22.551518838024],[114.078123703047,22.5515242168692],[114.078476347006,22.5515345986429],[114.078494811886,22.5515351427327],[114.078812319333,22.551534400792],[114.078943182382,22.5515340959219],[114.079356034154,22.5515331309493],[114.079376390308,22.5515330841845],[114.079399118874,22.5515332694449],[114.079788245631,22.5515364413537],[114.080434091061,22.551541705985],[114.080459271178,22.5515419101311],[114.081433364658,22.5515495588651],[114.081500186085,22.5515500840692],[114.08150271228,22.5515508107214],[114.081519684286,22.5515556931408],[114.081597329054,22.5515780269045],[114.081601171857,22.5515791321712]]]]}\"},{\"id\":\"440304009005\",\"name\":\"华红社区\",\"leaf\":true,\"parentId\":\"440304009\",\"childCount\":0,\"longitude\":\"114.079640300233\",\"latitude\":\"22.5537892888247\",\"iconType\":\"2\",\"geojson\":\"{\\\"type\\\":\\\"MultiPolygon\\\",\\\"coordinates\\\":[[[[114.080777861409,22.551544412045],[114.080459271178,22.5515419101311],[114.080434091061,22.551541705985],[114.079788245631,22.5515364413537],[114.079692439954,22.5515356598429],[114.079376390308,22.5515330841845],[114.079356034154,22.5515331309493],[114.078943182382,22.5515340959219],[114.078812319333,22.551534400792],[114.078494811886,22.5515351427327],[114.078476347006,22.5515345986429],[114.078475036694,22.551534559972],[114.078123703047,22.5515242168692],[114.077940988686,22.551518838024],[114.077793108665,22.551525716039],[114.077704135138,22.5515298529205],[114.077487911138,22.5515399091395],[114.077448075668,22.551541761743],[114.077436834143,22.5515422851484],[114.076939876874,22.5515366203188],[114.07681404823,22.5515351859001],[114.076382295407,22.5515302639106],[114.07602702183,22.5515262151628],[114.076014680433,22.5515260739692],[114.076208069747,22.5517105563971],[114.076273348836,22.5517947482291],[114.076659608554,22.5522929132874],[114.077147220968,22.5529217939057],[114.077315948173,22.5531394037606],[114.077645154001,22.5535639871883],[114.077693154416,22.55362589382],[114.077902411367,22.5538957758694],[114.078149118787,22.5542141736452],[114.078534096072,22.5546990143481],[114.078535813777,22.5547011772176],[114.078539591829,22.5547059346312],[114.078907728409,22.5551695657229],[114.079190109236,22.5555251963308],[114.079275536737,22.5556327840258],[114.079499440047,22.5559147673527],[114.07979397791,22.5562856783415],[114.079827652125,22.5563280831745],[114.080106906908,22.5566797468729],[114.081146748923,22.5579892137313],[114.081373333113,22.5582745443348],[114.081373369985,22.5582734606517],[114.08141384937,22.5570088969431],[114.081413414098,22.5568411958645],[114.081412388871,22.556446370104],[114.081411555199,22.5561247500572],[114.0814220332,22.5555354180252],[114.081422063777,22.555533652656],[114.081429252958,22.5551293021756],[114.081429580311,22.5551109353215],[114.0814350338,22.5548041361021],[114.081441131203,22.5544612273039],[114.081450082156,22.5539577742319],[114.081454195655,22.5537686566982],[114.081456318055,22.5536711072359],[114.081459678821,22.5535165938158],[114.081477401761,22.5527018673973],[114.081497255194,22.5517892335863],[114.081499808369,22.5516714080091],[114.081501271566,22.5516045676967],[114.081502350753,22.5515642879616],[114.08150271228,22.5515508107214],[114.081500186085,22.5515500840692],[114.081433364658,22.5515495588651],[114.080777861409,22.551544412045]]]]}\"}],\"geojson\":\"\"},\"geometry\":{\"type\":\"MultiPolygon\",\"coordinates\":[[[[114.081502350753,22.5515642879616],[114.08150271228,22.5515508107214],[114.081519684286,22.5515556931408],[114.081597329054,22.5515780269045],[114.081601171857,22.5515791321712],[114.081700007349,22.5516075606404],[114.08170065666,22.5516077476994],[114.083289515899,22.5516424363494],[114.083883003698,22.5516106291273],[114.083891878208,22.5516101533859],[114.083986450015,22.5516189343664],[114.083992459285,22.551619491946],[114.08443174393,22.5516225469431],[114.084920862708,22.5516259490784],[114.084921037176,22.5516259499777],[114.084924260346,22.5516259715614],[114.086158554674,22.5516448771094],[114.086183265345,22.5516452548247],[114.086185556818,22.5516452898983],[114.086187555112,22.5516453213745],[114.086608892886,22.5516517713123],[114.086619718026,22.5516519367875],[114.086972862008,22.5516595288642],[114.08698340566,22.5516588984395],[114.087235476636,22.5516437934264],[114.087859460446,22.5516571987208],[114.088075750096,22.5516618446185],[114.088852898343,22.5516785423309],[114.089515058373,22.551692767807],[114.089550266831,22.5516935241369],[114.089559936342,22.5516937318803],[114.090815836881,22.5517207133403],[114.09106659215,22.5517261011787],[114.091124324128,22.5517273413438],[114.091763062216,22.5517410640989],[114.092206549393,22.5517505906173],[114.092386939006,22.5517544666953],[114.092918907781,22.5517645256124],[114.093049530711,22.5517669960501],[114.093901442298,22.5517831047065],[114.094351394701,22.5517916131924],[114.094650254706,22.5517972636329],[114.095353601887,22.5518105637066],[114.095409303197,22.5518116168127],[114.095775297592,22.5518185379952],[114.095819521754,22.5518193743647],[114.096021309836,22.5518231901881],[114.096051303125,22.551823756761],[114.096067857845,22.5518240697251],[114.096081636358,22.5518243314278],[114.096483562267,22.5518319306991],[114.096710425246,22.5518362195659],[114.0968260259,22.5518384058178],[114.097811538971,22.5518570415692],[114.098176752755,22.5518639465639],[114.099433777447,22.5518877174442],[114.099433880869,22.551880358292],[114.099434548166,22.5518331133076],[114.099434692957,22.5518227899898],[114.099446371553,22.5509953507549],[114.099450378033,22.5507114743551],[114.099461866872,22.549897435918],[114.099463703287,22.5497889641894],[114.099470527343,22.5493857882236],[114.099482067444,22.5487039303422],[114.09948710005,22.5484065362327],[114.099488353705,22.5483324581764],[114.099505375173,22.5474320245683],[114.099506673794,22.5473807398294],[114.099510828662,22.5472162232501],[114.099534103116,22.5462941159807],[114.099537914443,22.5461431090173],[114.099539496351,22.5460804172775],[114.099546798846,22.5456921781516],[114.099567919424,22.5445693511946],[114.099579712234,22.5439423681458],[114.099587697314,22.5435178233889],[114.099347206908,22.543513009318],[114.098982444584,22.5435057068229],[114.098525705897,22.543496564315],[114.0982816218,22.5434916773991],[114.09818401478,22.5434897240715],[114.09813937783,22.5434888301455],[114.097784647444,22.5434811058684],[114.097327369163,22.5434711485747],[114.097059455729,22.5434653155719],[114.096875740423,22.5434617605518],[114.096720562404,22.5434587577155],[114.09665126964,22.5434574168264],[114.096549705605,22.5434554509084],[114.096364226728,22.5434518617141],[114.096128846269,22.5434473066479],[114.095971615997,22.5434442642414],[114.095674309122,22.543438510379],[114.095657602417,22.5434381866231],[114.09564884212,22.5434380382349],[114.095628378947,22.5434376901973],[114.095181664103,22.5434300900267],[114.094445077079,22.5434154400705],[114.093973654261,22.5434060619402],[114.093856201003,22.5434037264009],[114.093846278783,22.5434035294494],[114.093673705177,22.5434000868446],[114.093347580427,22.5433935838469],[114.093301257247,22.5433926602431],[114.093133479726,22.5433893138658],[114.09307244094,22.543388097083],[114.093061461118,22.5433878776485],[114.093044582641,22.543387541302],[114.092967812914,22.5433860088573],[114.092919447375,22.543385044784],[114.092891130421,22.5433844800098],[114.092792265251,22.5433825068972],[114.092785269425,22.5433823684016],[114.092760234997,22.5433818683786],[114.092659634135,22.5433798610918],[114.092655193283,22.5433797729582],[114.092625702714,22.5433791839023],[114.092554344208,22.5433777611748],[114.092535712054,22.5433773888554],[114.092451931212,22.5433757170158],[114.092421687911,22.5433751135707],[114.092374481597,22.5433741719805],[114.092322639278,22.5433731377602],[114.092320228196,22.5433730900961],[114.092299679587,22.5433726800052],[114.092295731563,22.5433726008649],[114.092188831849,22.5433704685723],[114.092067813679,22.5433680538926],[114.092050506226,22.543367708553],[114.0919600722,22.5433659054123],[114.091913648296,22.5433649791105],[114.091842812296,22.5433635653763],[114.091768083131,22.5433620751996],[114.0917177157,22.5433610697576],[114.09171317862,22.5433609897179],[114.091627965159,22.5433596991908],[114.091576503253,22.5433589131833],[114.091486251789,22.5433575336234],[114.091430118805,22.5433566756701],[114.091315804181,22.543354930086],[114.091306577137,22.5433547888924],[114.09121468441,22.5433533850508],[114.091066340339,22.5433511187592],[114.090915006023,22.5433488066022],[114.090887035308,22.5433483803236],[114.090814346705,22.5433466401354],[114.090526264176,22.543339744134],[114.090333845231,22.5433351378064],[114.089325650359,22.5433110027006],[114.088994683658,22.5433030796734],[114.088609357436,22.5432938562265],[114.088016123246,22.5432796550321],[114.088015552176,22.5432796406429],[114.087809717145,22.5432747141568],[114.087638390899,22.5432706132482],[114.087614753118,22.5432700466754],[114.087437565092,22.5432667911296],[114.087252965752,22.5432633979875],[114.087088617346,22.543260378064],[114.086951202736,22.5432578518684],[114.086906947098,22.5432570388813],[114.086843175272,22.5432558670647],[114.086772890557,22.5432545747389],[114.08676939669,22.543254510887],[114.086760368396,22.5432543454118],[114.085308712427,22.5432276670232],[114.08528426076,22.543227236248],[114.084768284629,22.5432181342096],[114.084134893011,22.5432069610325],[114.082888591835,22.5431849771051],[114.082793669292,22.5431833025674],[114.082249172062,22.543173697808],[114.081642003776,22.5431613788946],[114.08043307033,22.5431368498857],[114.079666329038,22.543121293413],[114.079387645324,22.5431156393753],[114.079278357011,22.543113703135],[114.079278257186,22.5431137013363],[114.079205440878,22.5431124108092],[114.07890273897,22.5431055552772],[114.078741199147,22.5431018959358],[114.078301206735,22.5430931806059],[114.077830710219,22.5430838609315],[114.077822148673,22.5430836909596],[114.077800094599,22.5430832502918],[114.077589107352,22.5430790315721],[114.076680559161,22.5430608688641],[114.076551150315,22.5430582824139],[114.07629925021,22.5430532462104],[114.076165679303,22.5430505761232],[114.076165539008,22.5430583786413],[114.076156701371,22.5435503069012],[114.076140384971,22.5444581599162],[114.076134183246,22.5448032846439],[114.076124433696,22.545345769192],[114.076124089255,22.5453649175569],[114.076097192332,22.5468581599761],[114.076094446701,22.5470105590901],[114.07608878367,22.5473344103548],[114.076085579386,22.5475176517183],[114.076076825385,22.5480182746237],[114.076076523213,22.5480355622914],[114.076065302372,22.5486772465578],[114.07605811499,22.549088223243],[114.076057380244,22.5491294517628],[114.076056058241,22.5492036872005],[114.076050080447,22.5495391783904],[114.076028628918,22.5507431556721],[114.076028537187,22.5507483258746],[114.076023336408,22.5510402116365],[114.076019700449,22.5512442929898],[114.076015708358,22.5514683545809],[114.076014680433,22.5515260739692],[114.076208069747,22.5517105563971],[114.076273348836,22.5517947482291],[114.076659608554,22.5522929132874],[114.077147220968,22.5529217939057],[114.077315948173,22.5531394037606],[114.077645154001,22.5535639871883],[114.077693154416,22.55362589382],[114.077902411367,22.5538957758694],[114.078149118787,22.5542141736452],[114.078534096072,22.5546990143481],[114.078535813777,22.5547011772176],[114.078539591829,22.5547059346312],[114.078907728409,22.5551695657229],[114.079190109236,22.5555251963308],[114.079275536737,22.5556327840258],[114.079499440047,22.5559147673527],[114.07979397791,22.5562856783415],[114.079827652125,22.5563280831745],[114.080106906908,22.5566797468729],[114.081146748923,22.5579892137313],[114.081373333113,22.5582745443348],[114.081373369985,22.5582734606517],[114.08141384937,22.5570088969431],[114.081413414098,22.5568411958645],[114.081412388871,22.556446370104],[114.081411555199,22.5561247500572],[114.0814220332,22.5555354180252],[114.081422063777,22.555533652656],[114.081429252958,22.5551293021756],[114.081429580311,22.5551109353215],[114.0814350338,22.5548041361021],[114.081441131203,22.5544612273039],[114.081450082156,22.5539577742319],[114.081454195655,22.5537686566982],[114.081456318055,22.5536711072359],[114.081459678821,22.5535165938158],[114.081477401761,22.5527018673973],[114.081497255194,22.5517892335863],[114.081499808369,22.5516714080091],[114.081501271566,22.5516045676967],[114.081502350753,22.5515642879616]]]]}}]}";
Utils.timer = null;
//电子哨兵
Utils.addDZSB = function (baseUrl)
{
    if (Utils.DZSB == null)
    {
        var GeoJsonModel = new SSmap.GeoJsonModel();
        GeoJsonModel.fontSize = 10;
        GeoJsonModel.iconUrl = baseUrl + "symbols/images/哨兵.png";
        GeoJsonModel.selectedIconUrl = baseUrl + "symbols/images/哨兵hover.png"; //
        GeoJsonModel.iconSize = SSmap.Vector2.create(24, 24);
        //GeoJsonModel.iconOffset = SSmap.Vector2.create(0, 12);
        GeoJsonModel.scaleByDistance = SSmap.Vector2.create(6.0e3, 0.5);
        GeoJsonModel.height = 3.0;
        //GeoJsonModel.heightField = "hight";
        //GeoJsonModel.addField("使用单位"); //需要获取的属性添加进去, 可以添加多个属性
        GeoJsonModel.addField("FID");
        GeoJsonModel.addField("设备编号");
        GeoJsonModel.addField("街道");
        GeoJsonModel.addField("社区");
        GeoJsonModel.clustered = true;
        GeoJsonModel.replace = true;
        
        GeoJsonModel.labelField = "卡口";
        //GeoJsonModel.labelField = "设备编号";   //文字标签字段
        //GeoJsonModel.labelOffset = SSmap.Vector2.create(-10, -12); //x, y偏移值
        
        if (Utils.tilesetLayer != null)
            GeoJsonModel.setBase3DTileset(Utils.tilesetLayer.tileset());
        
        
        //GeoJsonModel.load(baseUrl + "/testdata/geojson/dzsb-point.geojson"); //加载geojson文件
        //or
        //GeoJsonModel.addString(Utils.testString1);   //添加string (geojson格式 string)

        GeoJsonModel.addString(Utils.bugString); 
        Utils.DZSB = GeoJsonModel;

        // var strFlag = false;

        // Utils.timer = setInterval(function(){
        //     if(strFlag)
        //         Utils.DZSB.addString(Utils.testString);
        //     else
        //         Utils.DZSB.addString(Utils.testString1);
        //     strFlag = !strFlag;
        //     console.log("add string" + strFlag);
        // }, 5000);
    }
    else
    {
        //Utils.DZSB.addString(Utils.testString);
        clearTimeout(Utils.timer);
        Utils.timer = null;
        Utils.DZSB.delete();
        Utils.DZSB = null;
    }
}

Utils.selectRect = [];
Utils.selectPolygon = [];
//鼠标点击 拾取物体 / 拾取属性
document.onclick = function (event) 
{
    var e = event || window.event;
    var posX = 0, posY = 0;
    posX = e.clientX;
    posY = e.clientY;

    if (e)
    {
        var scene = window.scene;
        var ray = scene.mainCamera.screenPointToRay(posX, posY);
        var hit = new SSmap.RaycastHit();
        if(hit == null || hit == undefined)
            return;

        let pickPoint = SSmap.Vector3.create(-2.40124e+06, 5.38168e+06, 2.43154e+06);
        
        //raycast 拾取物体,
        if (scene.raycast(ray, hit))
        {
            var entity = hit.entity;
            if (entity)
            {
                console.log(entity.tag);
                console.log("objName " + entity.objectName);
                console.log("parentName " + entity.parent.objectName);
                let name = entity.objectName ? entity.objectName : entity.parent.objectName;
                
                if (name == "监控电子眼_180")
                {
                    console.log("播放监控视频");    
                }
                //let radius = entity.renderer.boundingVolume.boundingSphere.center;
            }
            pickPoint = hit.point;

            let point = hit.point.toCartesian3();
            let carto = SSmap.Cartographic.fromCartesian(point);
           
            console.log("pick Entity: " + carto.longitude * 180 / Math.PI + " "
                        + carto.latitude * 180 / Math.PI + " " + carto.height);
            console.log(point.x + " " + point.y + " " + point.z);

            let cameraCarto = scene.mainCamera.transform.cartographic;
            console.log("camera Pos: " + cameraCarto.longitude * 180 / Math.PI + " "
                        + cameraCarto.latitude * 180 / Math.PI + " " + cameraCarto.height);
            
            let CController = scene.mainCamera.cameraController();
            console.log(" heading, pitch, roll: " + CController.heading * 180 / Math.PI,
                        CController.pitch * 180 / Math.PI, CController.roll * 180 / Math.PI);
            
            let h = Utils.getMeshHeight(window.scene, carto);
            console.log("mesh height: " + h);
        }
        hit.delete();

        //新的建筑拾取高亮
        const sceneFeature = scene.getFeatureByMouse();
        scene.setSelectedFeature(sceneFeature);
        // if (Utils.GeoJsonFeatures)
        // {
        //     let f = Utils.GeoJsonFeatures.pickFeatureByMouse();
        //     if (f)
        //     {
        //         let polygon = f.polygon();
        //         let size = polygon.size(); //获取楼栋面
        //         for (let i = 0; i < size; i++)
        //         {
        //             console.log(polygon.get(i));
        //         }
        //         let dscs = f.getProperty("dscs");
        //         let tydzbm = f.getProperty("TYDZBM");
        //         let mc = f.getProperty("MC");
        //         console.log(dscs + " " + tydzbm + " " + mc); //楼层高度 dscs
                
        //     }
        // }
    
        //拾取标签属性 (Utils.DZSB 电子哨兵)
        let feature = SSmap.GeoJsonModel.getSelectedFeature();
        if (feature)
        {
            console.log("pick feature");
            //let property = feature.getProperty("使用单位"); //要查询的属性
            let property = feature.getProperty("设备编号"); //要查询的属性
            if (property)
            {
                console.log("设备编号: " + property);
            }
        }

        //三区图属性拾取
        let threeAreaFeature = SSmap.ProjectionLayer.globalInstance().getFeatureByMouse();
        if (threeAreaFeature)
        {
            let area = threeAreaFeature.getProperty("Id"); 
            let child = threeAreaFeature.getProperty("children");
            console.log("面积: " + area + child);
            
            //feature to node 
            // let node = SSmap.ProjectionLayer.globalInstance().getNode(threeAreaFeature);
            // if (node)
            // {
            //     node.setColor(SSmap.Color.fromRgb(255, 255, 255, 255));    
            // }
        }

        //拾取projectionnode， 设置node属性
        let threeAreaNode = SSmap.ProjectionLayer.globalInstance().getNodeByMouse();
        if (threeAreaNode)
        {
            let color = threeAreaNode.color();
            console.log("color" + color);
            threeAreaNode.setColor(SSmap.Color.fromRgb(255, 255, 255, 255));    
        }

        if (Utils.BIM_tilesetLayer != null) //拾取bim属性
        {
            let bimfeature = scene.getFeatureByMouse();
            if (bimfeature)
            {
                Utils.getFeatureProperty(bimfeature);
            }
        }

        //轨迹点拾取
        if (Utils.TrackPath)
        {
            let tpSelected = Utils.TrackPath.getSelectedByMouse();
            if (tpSelected != -1)
            {
                console.log("轨迹点 " + tpSelected);    
            }
        }

        //标签拾取测试
        if (Utils.billboardEntity)
        {
            console.log("bbEntity pick");
            let f = scene.getFeatureByMouse();
            Utils.BBEntityPick(f, pickPoint);
        }

        if (Utils.label3d)
        {
            console.log("label3d pick");
            let f = scene.getFeatureByMouse();
            Utils.Label3DPick(f, pickPoint);
        }

        if (Utils.geoPointLayer)
        {
            console.log("point layer pick");
            let f = scene.getFeatureByMouse();
            Utils.PointLayerPick(f);
        }

        if (Utils.geoPolylineLayer)
        {
            console.log("polyline layer pick");
            let f = scene.getFeatureByMouse();
            Utils.PolylineLayerPick(f);
        }

        if (Utils.geoPolygonLayer)
        {
            console.log("polygon layer pick");
            let f = scene.getFeatureByMouse();
            Utils.PolygonLayerPick(f);    
        }

        if (Utils.geoLabelLayer)
        {
            console.log("polygon layer pick");
            let f = scene.getFeatureByMouse();
            Utils.LabelLayerPick(f);  
        }

        if (Utils.polyline3d)
        {
            console.log("polyline pick");
            let f = scene.getFeatureByMouse();
            Utils.Polyline3DPick(f);
        }

        if (Utils.polygon3d)
        {
            console.log("polygon pick");
            let f = scene.getFeatureByMouse();          //绝对海拔模式拾取属性
            if (f == null)
                f = Utils.polygon3d.getFeatureByMouse();  //贴地模式拾取属性
            Utils.Polygon3DPick(f);    
        }
    }
}

//读取json文件
function XHR_CB(url, callback) {
    console.log("httpRequest");
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'text';
    xhr.open('GET', url, true);
    xhr.onload = function() {
        var response = xhr.response;
        var text = xhr.responseText;
        //console.log(text);

        if (callback != null) {
            callback.setJson(text, true, true);   //text:字符串, true: 是否替换, true:是否异步加载 
            console.log("XHR_CB setJson");
        }
    }
    xhr.send();
}

//楼栋聚合标签
Utils.BillboardsCount = 0;
Utils.createGeoJsonBillboards = function (baseUrl)
{
    if (Utils.GeoJsonBillboards == null)
    {
        const iconScale = 0.6;
        const iconSize = SSmap.Vector2.create(150 * iconScale, 38 * iconScale);
        
        const geojson = new SSmap.GeoJsonBillboards();
        geojson.iconUrl = baseUrl + "symbols/images/确密次.png";
        geojson.iconSize = iconSize;
        //geojson.iconOffset = SSmap.Vector2.create(0, -10);
        geojson.fontSize = 12;

        geojson.labelField = 'ldmc';
        geojson.labelOffset = SSmap.Vector2.create(0, -8);
        geojson.iconTextOffset = SSmap.Vector2.create(63, 22);
        geojson.iconTextFontSize = 18;
        geojson.iconTextColor = SSmap.Color.fromRgb(255, 255, 255, 255);
        //geojson.displayMode = 0;
        // if (Utils.tilesetLayer != null)
        //     geojson.setBase3DTileset(Utils.tilesetLayer.tileset());
        //geojson.load(baseUrl + 'data/json/0318结果.geojson');

        XHR_CB(baseUrl + 'data/ft4.json', geojson);
        console.log("create GeoJsonBillboards");
        geojson.setIconEnabled(0, true);  //确诊标签显示
        Utils.GeoJsonBillboards = geojson;
        Utils.BillboardsCount++;
    }
    else
    {
        //Utils.GeoJsonBillboards.show = !Utils.GeoJsonBillboards.show;
        // Utils.GeoJsonBillboards.delete(); 
        // Utils.GeoJsonBillboards = null;
        
        switch (Utils.BillboardsCount)
        {
            case 1:
                XHR_CB(baseUrl + 'data/疫情数据/1.json', Utils.GeoJsonBillboards);
                break;
            case 2:
                XHR_CB(baseUrl + 'data/疫情数据/2.json', Utils.GeoJsonBillboards);
                break;
            default:
                Utils.BillboardsCount = 0;
                break;
        }
        Utils.BillboardsCount++;
        
    }
}

//高亮用的建筑面, 用来拾取feature
Utils.HS = 0;
Utils.createGeoJsonFeatures = function (baseUrl)
{
    if (Utils.GeoJsonFeatures == null)
    {
        var geojsonFeatures = new SSmap.GeoJsonFeatures();  
        geojsonFeatures.setKeyField('TYDZBM');
        geojsonFeatures.addField("MC");
        geojsonFeatures.addField("dscs");
        geojsonFeatures.load(baseUrl + "data/futian1.geojson"); 
        console.log("创建属性拾取features");

        Utils.GeoJsonFeatures = geojsonFeatures;
    }
    else
    {
        let points = new SSmap.PointVector();
        points.push_back(SSmap.Vector3.create(-2400819.395672061, 5381815.703016975,2431724.3247058773));
        points.push_back(SSmap.Vector3.create(-2400751.383322029,5381859.0580544565, 2431692.308949298));
        points.push_back(SSmap.Vector3.create(-2400820.5155872824,5381876.950134993,2431585.582699027));
        points.push_back(SSmap.Vector3.create(-2400907.793818601,5381812.385894661,2431643.203747547));
        let list = Utils.GeoJsonFeatures.selectFeatures(points, true);

        let len = list.size();
        for (let i = 0; i < len; i++)
        {
            console.log(list.get(i));  //楼栋编码
        }

        points.delete();
    }
}


Utils.createGJsonFeatures = function ()
{
    if (Utils.GeoJsonFeatures == null)
    {
        var geojsonFeatures = new SSmap.GeoJsonFeatures();  
        //geojsonFeatures.addField('TYDZBM'); // 统一地址编码
        geojsonFeatures.setKeyField('TYDZBM');
        geojsonFeatures.addField("MC");
        geojsonFeatures.load(baseUrl + "data/futian.geojson"); 
        console.log("创建属性拾取features");

        Utils.GeoJsonFeatures = geojsonFeatures;
    }
}
Utils.SelectType = 0;
//框选
Utils.selectByRectangle = function ()
{
    Utils.createGJsonFeatures();
    Utils.SelectType = 1;
}

//多边形选择
Utils.selectByPolygon = function ()
{
    Utils.createGJsonFeatures();
    Utils.SelectType = 2;
}

//多选
Utils.multiSelect = function ()
{
    Utils.createGJsonFeatures();
    Utils.SelectType = 3;
}

Utils.buildingName = null;
Utils.buildingHLCount = 0;
Utils.addBuildingName = function () {
    if(Utils.buildingName == null)
    {
        var GeoJsonModel = new SSmap.GeoJsonModel();
        GeoJsonModel.fontSize = 12; //字体大小

        GeoJsonModel.height = 30.0; //高度
        GeoJsonModel.addField("MC");
        GeoJsonModel.iconUrl = baseUrl + "symbols/images/dot_red_32x32.png"; //图标
        GeoJsonModel.iconSize = SSmap.Vector2.create(24, 24);   //图标大小
        GeoJsonModel.selectedIconUrl = baseUrl + "symbols/images/dot_2_32x32.png";  //选中 or 高亮时的图标
        //GeoJsonModel.stroke = false;  //不要描边 , 场景中geojsonmodel有一个关闭描边, 所有geojsonmodel关闭描边.
        GeoJsonModel.labelField = "MC"; //文字标签字段
        //GeoJsonModel.labelField = "卡口"; 
        //GeoJsonModel.labelField = "路段ID";
        //GeoJsonModel.labelOffset = SSmap.Vector2.create(0, -5); //x, y偏移值
          GeoJsonModel.lineToGround = true;
        //   GeoJsonModel.lineColor = SSmap.Color.fromRgb(255, 0, 0, 255);
        GeoJsonModel.distance = SSmap.Vector2.create(5.0, 1000000);   //显示范围, 5-10000米范围
        GeoJsonModel.clustered = true;  //聚合

        if (Utils.tilesetLayer != null)
            GeoJsonModel.setBase3DTileset(Utils.tilesetLayer.tileset());

        GeoJsonModel.load(baseUrl + "data/ft0618-centroid.geojson"); //加载geojson文件 
        //GeoJsonModel.load(baseUrl + "data/电子哨兵0324.geojson"); 
        //GeoJsonModel.load(baseUrl + "data/PART_INFO_FT/BJ_NAME_电力井盖.geojson"); //电力井盖.geojson  BJ_NAME_电力井盖.geojson
        //GeoJsonModel.load(baseUrl + "data/pingshan-wgs84.geojson");
        //or
        //GeoJsonModel.addString(Utils.testString);   //添加string (geojson格式 string)
        Utils.buildingName = GeoJsonModel;
    }
    else
    {
        // Utils.buildingName.delete(); //删除测试
        // Utils.buildingName = null;
        Utils.buildingName.iconUrl = baseUrl + "symbols/images/dot_3_32x32.png";
        //or
        ///setHighlight(index, isHighlight); index: 点在geojson文件中的索引号, isHighlight: true:高亮 false:关闭高亮
        // Utils.buildingName.setHighlight(Utils.buildingHLCount, true);   //高亮测试 设置true高亮, 设置false取消高亮
        Utils.buildingHLCount++;

        if(Utils.buildingHLCount > 1)
        {
            Utils.buildingName.delete(); //删除测试
            Utils.buildingName = null;
            Utils.buildingHLCount = 0;
        }
    }
};

// GeoJsonGifLayer 继承自geojsonmodel, 文档可以参考geosjonmodel, 
// gif帧数过多, 尺寸过大会占用大量的内存,
// 建议gif图片不要大于128x128, 帧数不要超过30帧, 注意控制内存容量.
// 在网页端单个gif建议使用dom添加
Utils.geoJsonGifLayer = null;
Utils.addGeoJsonGifLayer = function () {
    if(Utils.geoJsonGifLayer == null)
    {
        var gifLayer = new SSmap.GeoJsonGifLayer();
        gifLayer.fontSize = 14;

        gifLayer.height = 20.0;
        //gifLayer.addField("MC");
        gifLayer.selectedIconUrl = baseUrl + "symbols/images/dot_red_32x32.png";
        gifLayer.gifUrl = baseUrl + "symbols/images/balloon.gif";
        gifLayer.iconSize = SSmap.Vector2.create(64, 64);
        //gifLayer.stroke = false;  //不要描边 , 场景中geojsonmodel有一个关闭描边, 所有geojsonmodel关闭描边.
        gifLayer.labelField = "MC"; //文字标签字段
        //gifLayer.labelOffset = SSmap.Vector2.create(0, -5); //x, y偏移值
        //   gifLayer.lineToGround = true;
        //   gifLayer.lineColor = SSmap.Color.fromRgb(255, 0, 0, 255);
        gifLayer.distance = SSmap.Vector2.create(5.0, 10000);   //显示范围, 5-10000米范围
        gifLayer.clustered = true;  //聚合

        if (Utils.tilesetLayer != null)
            gifLayer.setBase3DTileset(Utils.tilesetLayer.tileset());

        gifLayer.load(baseUrl + "data/ft0618-centroid.geojson"); //加载geojson文件
        Utils.geoJsonGifLayer = gifLayer;
    }
    else
    {
        //删除测试
        // Utils.geoJsonGifLayer.delete();
        // Utils.geoJsonGifLayer = null;
        //or高亮测试
        Utils.geoJsonGifLayer.setHighlight(Utils.buildingHLCount, true);   //高亮测试 设置true高亮, 设置false取消高亮
        Utils.buildingHLCount++;
    }
  
};

Utils.areaString = "{\"type\":\"FeatureCollection\",\"name\":\"ft-area\",\"crs\":{\"type\":\"name\",\"properties\":{\"name\":\"urn:ogc:def:crs:OGC:1.3:CRS84\"}},\"features\":[{\"type\":\"Feature\",\"properties\":{\"id\":\"35595e43-ab52-11ec-8411-712e366880eb\",\"name\":\"园岭\",\"adcode\":440304002,\"pid\":440304,\"level\":4,\"description\":null,\"attachments\":null,\"entity_id\":null},\"geometry\":{\"type\":\"Polygon\",\"coordinates\":[[[114.099151279734002,22.568112483325802],[114.099179541444997,22.566475099581599],[114.099224811360003,22.563709970203298],[114.099310852331001,22.559063850420898],[114.099320352106005,22.558524306286099],[114.099320796827001,22.558498784587499],[114.099389714411998,22.554595075328599],[114.099431420648997,22.5522608970468],[114.099436074115999,22.551880394158001],[114.096072351434998,22.551829131181201],[114.091077514106004,22.551752880228001],[114.087849419443998,22.551703517717801],[114.086607425333,22.551684508456901],[114.081510492218996,22.551606397176499],[114.081461676577007,22.554351648182202],[114.081448683166002,22.558360076177699],[114.081466292862004,22.558382621692498],[114.082201714942002,22.5594439220318],[114.085089111895996,22.563836328337],[114.086448086957006,22.565993054760199],[114.087103069362001,22.5668392288846],[114.087190357699996,22.566789496925502],[114.087744755192006,22.566635190789999],[114.089240662172998,22.566998617417099],[114.090914270759001,22.5673931242276],[114.092374721000994,22.567746519953999],[114.093520937446002,22.568014698563399],[114.094540037901993,22.5682714716677],[114.095057103610003,22.568407065563498],[114.095725154693994,22.5686442852945],[114.096109342863997,22.568806226266702],[114.098085802702002,22.569645147121101],[114.098469829330995,22.569816541266398],[114.098878895734003,22.570011963920201],[114.099099990476006,22.570118160179099],[114.099100675675999,22.5700985198784],[114.09913169264,22.569210061475498],[114.099151279734002,22.568112483325802]]]}}]}";

//添加三区图 (面投影, 可以拾取面属性)
Utils.ThreeAreas = null;    //三区图
Utils.createThreeAreas = function (baseUrl)
{
    if (Utils.ThreeAreas == null)
    {
        SSmap.ProjectionLayer.globalInstance.sceneMode = SSmap.TextureProjectionSceneMode.WholeScene;
        // const threeArea1 = new SSmap.ProjectionDataSource();
        // threeArea1.setColor(SSmap.Color.fromRgb(0, 0, 255, 80));
        // threeArea1.setSelectedColor(SSmap.Color.fromRgb(0, 0, 255, 128));
        // //threeArea1.setStrokeWidth(1);
        // threeArea1.setStrokeColor(SSmap.Color.fromRgb(0, 0, 255, 255));
        // //threeArea1.addField("类型");  //需要拾取的属性
        // threeArea1.addField("area");
        // //threeArea1.enabled = false;
        // threeArea1.loadGeoJson(baseUrl + 'data/threeAreas/3月7日21时/防范区.geojson');
        // SSmap.ProjectionLayer.globalInstance().addDataSource(threeArea1);

        // const threeArea2 = new SSmap.ProjectionDataSource();
        // threeArea2.setColor(SSmap.Color.fromRgb(255, 255, 0, 120));
        // threeArea2.setSelectedColor(SSmap.Color.fromRgb(255, 255, 0, 200));
        // //threeArea2.setStrokeWidth(1);
        // threeArea2.setStrokeColor(SSmap.Color.fromRgb(255, 255, 0, 255));
        // threeArea2.addField("area");    //需要拾取的属性
        // //threeArea2.enabled = false;
        // threeArea2.loadGeoJson(baseUrl + 'data/threeAreas/3月7日21时/管控区.geojson');
        // SSmap.ProjectionLayer.globalInstance().addDataSource(threeArea2);

        // const threeArea3 = new SSmap.ProjectionDataSource();
        // threeArea3.setColor(SSmap.Color.fromRgb(255, 0, 0, 120));
        // threeArea3.setSelectedColor(SSmap.Color.fromRgb(255, 0, 0, 200));
        // //threeArea3.setStrokeWidth(1);
        // threeArea3.setStrokeColor(SSmap.Color.fromRgb(255, 0, 0, 255));
        // threeArea3.addField("area"); //需要拾取的属性
        // //threeArea3.enabled = false;
        // threeArea3.loadGeoJson(baseUrl + 'data/threeAreas/3月7日21时/封控区.geojson');
        // SSmap.ProjectionLayer.globalInstance().addDataSource(threeArea3);

        /*const threeArea3 = new SSmap.ProjectionDataSource();
        threeArea3.setColor(SSmap.Color.fromRgb(94, 166, 199, 120));
        threeArea3.setSelectedColor(SSmap.Color.fromRgb(0, 160, 200, 160));
        threeArea3.setStrokeWidth(2);
        threeArea3.setStrokeColor(SSmap.Color.fromRgb(31, 209, 255, 255));
        threeArea3.addField("adcode"); //需要拾取的属性
        //threeArea3.enabled = false;
        //threeArea3.loadGeoJson(baseUrl + 'data/threeAreas/3月7日21时/封控区.geojson');
        threeArea3.addString(Utils.areaString);
        SSmap.ProjectionLayer.globalInstance().addDataSource(threeArea3);*/

        // WholeScene  TerrainOnly

        const greenField = new SSmap.ProjectionDataSource();
        greenField.setColor(SSmap.Color.fromRgb(255, 0, 0, 128));
        greenField.setSelectedColor(SSmap.Color.fromRgb(255, 255, 0, 255));
        greenField.setStrokeColor(SSmap.Color.fromRgb(0, 0, 255, 254));
        greenField.setStrokeWidth(2.0);
        //greenField.addField("Id");
        greenField.addField("children");
        //greenField.loadGeoJson(baseUrl + 'data/greenfield.geojson');
        //greenField.loadGeoJson(baseUrl + 'data/futian-polygon.geojson');
        //greenField.loadGeoJson(baseUrl + 'data/trafficArea.geojson');
        greenField.loadGeoJson(baseUrl + 'data/ft-grid.geojson');
        //greenField.loadGeoJson(baseUrl + 'data/huaqiang-dirty.geojson');
        SSmap.ProjectionLayer.globalInstance().textureSize = 4096;
        SSmap.ProjectionLayer.globalInstance().addDataSource(greenField);
       
        Utils.ThreeAreas = greenField; //SSmap.ProjectionLayer.globalInstance();
    } 
    else
    {
        //Utils.ThreeAreas.enabled = !Utils.ThreeAreas.enabled;
        Utils.ThreeAreas.delete();
        Utils.ThreeAreas = null;
    }   
}

//莲花街道
// Utils.lianHua = [
//     114.06345743236554,22.569165783561886,114.06201649615537,22.568609854422533,114.05963185640482,22.5672443087123,
//     114.05742274860677,22.56633414689809,114.05535404306671,22.565781786992194,114.05311027600229,22.565782543913784,
//     114.04984022842893,22.56607456962834,114.04777174729448,22.566075197607567,114.045808373932,22.565848029734163,
//     114.04303847581505,22.565067966541935,114.03517161655205,22.563598502343787,114.03206579598145,22.563210058488348,
//     114.02819236957767,22.562638064736653,114.02622467099235,22.56228121393691,114.02619530101683,22.562275764406408,
//     114.02617877537006,22.562272415040127,114.02625068633253,22.561617567227195,114.0262769387961,22.56148835699032,
//     114.0263510832455,22.561222753840692,114.02670615120866,22.560670607987625,114.02699717990858,22.560365290879695,
//     114.02769078868874,22.55984614744839,114.02990644247201,22.558145489055185,114.03042662373059,22.557715851042524,
//     114.03289265780778,22.555800335089657,114.03425234993936,22.554739246871232,114.03441442919035,22.55381339505269,
//     114.03514555094158,22.549482042217118,114.03524517352021,22.549227139009513,114.03537649260859,22.548390244832024,
//     114.03612671982172,22.54366513381141,114.03629360774421,22.542733613937298,114.03699111516497,22.54283731313165,
//     114.03976340602327,22.54318562788702,114.04246211253366,22.54353369574411,114.04490545754504,22.54347797068379,
//     114.05244486934554,22.543501861437814,114.06353116252157,22.543607604195774,114.06345281507227,22.554513067239427,
//     114.06345743236554,22.569165783561886
// ];
Utils.lianHua = [
    114.03572931127394,22.55011604164298,  
    114.068241417163904,22.55011604164298,
    114.068241417163904, 22.530108591864462,
    114.03572931127394, 22.530108591864462,  
    114.03572931127394, 22.55011604164298
];

Utils.hole = [
    114.045547781998494, 22.542427993811373,
    114.048419221550148, 22.535203081391387,
    114.042027952870853, 22.535203081391387,
    114.045547781998494, 22.542427993811373
];

Utils.lianHuaSubDistrict = null;
Utils.lianHuaProjectionLayer = null;
//莲花街道区域面
Utils.createSubDistrict = function ()
{
    // Utils.createXiangMiHu1();
    // Utils.createXiangMiHu2();

    if (Utils.lianHuaProjectionLayer == null)
    {
        var points = new SSmap.CartographicVector();
        let len = Utils.lianHua.length;
        for (let i = 0; i < len; i += 2)
        {
            const lng = parseFloat(Utils.lianHua[i ]);
            const lat = parseFloat(Utils.lianHua[i + 1]);
            const carto = SSmap.Cartographic.fromDegrees(lng, lat, 0);
            points.push_back(carto); //加入到数组
        }

        var hole = new SSmap.CartographicVector();
        len = Utils.hole.length;
        for (let i = 0; i < len; i += 2)
        {
            const lng = parseFloat(Utils.hole[i ]);
            const lat = parseFloat(Utils.hole[i + 1]);
            const carto = SSmap.Cartographic.fromDegrees(lng, lat, 0);
            hole.push_back(carto); //加入到数组
        }

        //测试画三区
        let lianhua = new SSmap.ProjectionNode();
        //lianhua.setColor(SSmap.Color.fromRgb(39, 41, 123, 200));
        //lianhua.setStrokeColor(SSmap.Color.fromRgb(81, 35, 235, 255));
        lianhua.setColor(SSmap.Color.fromRgb(255, 0, 0, 255));
        lianhua.setStrokeColor(SSmap.Color.fromRgb(255, 255, 235, 255));
        lianhua.setStrokeWidth(1);
        lianhua.setPoints(points);
        lianhua.setHole(hole);          //测试带有洞的多边形, 如果有多个洞, 就使用此函数添加多次(洞必须在外环的范围内)
        //SSmap.ProjectionLayer.globalInstance().addNode(lianhua);
        let projectLayer = new SSmap.ProjectionLayer();
            //以下三行用于限制投影面的高度
        // projectLayer.limitAltitude = 50; //投影的最高的海拔值
        // projectLayer.nearPlane = 1.0;   //投影的近裁切面
        // projectLayer.farPlane = 200.0;  //投影的远裁切面(最远距离)

        projectLayer.addNode(lianhua);
        projectLayer.beforeTranslucent = true;  //true: 在透明物体之前渲染(不会叠加到半透明物体上, 透过半透明物体可以看到投影面)

        Utils.lianHuaProjectionLayer = projectLayer;

        hole.delete();
        points.delete();    //删除

        Utils.lianHuaSubDistrict = lianhua;
    }
    else
    {
        //Utils.lianHuaSubDistrict.enabled = !Utils.lianHuaSubDistrict.enabled; //显示/隐藏测试
        console.log("projection layer delete");
        Utils.lianHuaProjectionLayer.delete();
        Utils.lianHuaProjectionLayer = null;
    }
}

Utils.xiangMiHu3 = [114.062387932855998, 22.568396739921099, 114.062652551164007, 22.553746120865402, 114.062931230667999, 22.542843514785499, 114.051848590831, 22.542562067215702, 114.044310789437006, 22.5424186785358, 114.041866801851995, 22.542435667760799, 114.039174910818005, 22.542044876318801, 114.036409452296994, 22.541652671690802, 114.035713959093002, 22.541537932198398, 114.035529985945004, 22.542466668956401, 114.034693075739, 22.5471791891697, 114.034546402822997, 22.548013878007598, 114.034442113061004, 22.548267164437, 114.033631532295999, 22.5525862875553, 114.033452468491006, 22.553509433302501, 114.032073495152005, 22.554548813022901, 114.029572655525996, 22.5564249582423, 114.029044662380002, 22.5568462876703, 114.026798110949997, 22.558511575735899, 114.026095073034, 22.559019648476198, 114.025798480427, 22.559320307520998, 114.025433323407995, 22.5598667437317, 114.025354310443007, 22.560131132353099, 114.025325687993003, 22.560259907352801, 114.025241756019994, 22.560913518406299, 114.025258217512999, 22.560917129211099, 114.025287482715996, 22.5609230434541, 114.027248313645998, 22.561311029792702, 114.031110619540996, 22.561944333363002, 114.034208814394006, 22.562381947530302, 114.042047440678999, 22.563975885329899, 114.044802572931999, 22.564799736415999, 114.046761466326004, 22.5650579904956, 114.048829637455995, 22.5650901484427, 114.052104543810003, 22.564849996888402, 114.054347977389, 22.564884804241899, 114.056406213252998, 22.565469871736799, 114.058598255232994, 22.566414913543401, 114.060957434263997, 22.567818054001101, 114.062387932855998, 22.568396739921099];

Utils.xiangMiHu4 =[ 114.06238659937438, 22.568397011554854,114.0609561004488,22.56781832576635,
    114.05859692078631,22.566415185454545,114.0564048782852,22.56547014384024,
    114.05434664198519,22.564885076573635,114.05210320804157,22.564850269564428,
    114.0488283012061,22.565090421667193,114.04676012973881,22.565058264037376,
    114.04480123598513,22.564800010222328,114.04204610314191,22.56397615943536,
    114.03420747531338,22.562382222605557,114.03110927988556,22.561944608852,
    114.02724697325738,22.56131130578357,114.02528614194267,22.560923319689252,
    114.02525687673437,22.560917405449885,114.02524041523834,22.560913794647064,
    114.02532434710619,22.56026018347708,114.02535296953758,22.560131408452616,
    114.02543198246796,22.559867019777094,114.02579713944593,22.559320583423048,
    114.02609373204668,22.559019924284527,114.026796769983,22.55851185135422,
    114.0290433214722,22.556846562675172,114.02957131462652,22.556425233098306,
    114.03207215431384,22.55454908719242,114.03345112768608,22.553509707092637,
    114.03363019135338,22.552586561171605,114.03444077146709,22.548267437243975,
    114.03454506120018,22.54801415075825,114.0346917339892,22.5471794617655,
    114.03552864347766,22.542466940676547,114.03571261648737,22.54153820374307,
    114.03640810982382,22.541652943145145,114.03917356885836,22.542045147404114,
    114.04186546039395,22.54243593848824,114.04430944836703,22.542418948879586,
    114.05184725099365,22.542562336407038,114.0629298926563,22.54284378229356,
    114.06265121507707,22.553746390141026,114.06238659937438,22.568397011554854
];

Utils.createXiangMiHu1 = function ()
{
    var points = new SSmap.CartographicVector();
    let len = Utils.xiangMiHu3.length;
    for (let i = 0; i < len; i += 2)
    {
        const lng = parseFloat(Utils.xiangMiHu3[i ]);
        const lat = parseFloat(Utils.xiangMiHu3[i + 1]);
        const carto = SSmap.Cartographic.fromDegrees(lng, lat, 0);
        points.push_back(carto); //加入到数组
    }

    //测试画三区
    var lianhua = new SSmap.ProjectionNode();
    //lianhua.setColor(SSmap.Color.fromRgb(39, 41, 123, 200));
    //lianhua.setStrokeColor(SSmap.Color.fromRgb(81, 35, 235, 255));
    lianhua.setColor(SSmap.Color.fromRgb(128, 0, 0, 100));
    lianhua.setStrokeColor(SSmap.Color.fromRgb(255, 255, 0, 255));
    lianhua.setStrokeWidth(1);
    lianhua.setPoints(points);
    
    //SSmap.ProjectionLayer.globalInstance().addNode(lianhua);
    //添加属性
    //let feature = new SSmap.feature();
    //feature.setProperty(key, value);  
    //lianhua.feature = feature;

    var projectLayer = new SSmap.ProjectionLayer();
    projectLayer.addNode(lianhua);
    points.delete();    //删除
}

Utils.createXiangMiHu2 = function ()
{
    var points = new SSmap.CartographicVector();
    let len = Utils.xiangMiHu4.length;
    for (let i = 0; i < len; i += 2)
    {
        const lng = parseFloat(Utils.xiangMiHu4[i ]);
        const lat = parseFloat(Utils.xiangMiHu4[i + 1]);
        const carto = SSmap.Cartographic.fromDegrees(lng, lat, 0);
        points.push_back(carto); //加入到数组
    }

    //测试画三区
    var lianhua = new SSmap.ProjectionNode();
    //lianhua.setColor(SSmap.Color.fromRgb(39, 41, 123, 200));
    //lianhua.setStrokeColor(SSmap.Color.fromRgb(81, 35, 235, 255));
    lianhua.setColor(SSmap.Color.fromRgb(0, 128, 0, 100));
    lianhua.setStrokeColor(SSmap.Color.fromRgb(0, 255, 255, 255));
    lianhua.setStrokeWidth(1);
    lianhua.setPoints(points); //多个洞需要调用多次,把洞的多边形数据传入
    //SSmap.ProjectionLayer.globalInstance().addNode(lianhua);
    var projectLayer = new SSmap.ProjectionLayer();
    projectLayer.addNode(lianhua);
    points.delete();    //删除

}

//添加路径轨迹
Utils.createTrackPath = function (baseUrl)
{
    if (Utils.TrackPath == null)
    {
        console.log("create track path");
        var trackPath = new SSmap.TrackPathRenderer();
        trackPath.setWidth(4);
        trackPath.setColor(SSmap.Color.fromRgb(16, 125, 255, 255));
        trackPath.setIconUrl(baseUrl + "symbols/images/circle.png");
        trackPath.setSelectedIconUrl(baseUrl + "symbols/images/circle_selected.png");
        trackPath.setIconSize(SSmap.Vector2.create(24, 24));
        trackPath.setIconOffset(SSmap.Vector2.create(0, 0));
        trackPath.setArrowIconUrl(baseUrl + "symbols/images/arrow.png");
        trackPath.setArrowIconSize(SSmap.Vector2.create(18, 18));
        trackPath.setArrowIconRotation(-90);
        trackPath.setFontSize(14);
        trackPath.setLabelColor(SSmap.Color.fromRgb(255, 255, 255, 255));
        trackPath.setLabelOffset(SSmap.Vector2.create(0, -10));

        var c1 = SSmap.Cartographic.fromDegrees(114.054494, 22.540745, 0);
        var c2 = SSmap.Cartographic.fromDegrees(114.064494, 22.560745, 0);
        var c3 = SSmap.Cartographic.fromDegrees(114.074494, 22.580745, 0);
        var c4 = SSmap.Cartographic.fromDegrees(114.084494, 22.500745, 0);
        trackPath.addPoint(c1, "03-21 13:00");
        trackPath.addPoint(c2, "03-22 11:14");
        trackPath.addPoint(c3, "03-23 13:34");
        trackPath.addPoint(c4, "03-24 18:27");
        Utils.TrackPath = trackPath;

        //计算轨迹路径范围
        var extent = new SSmap.Rectangle();
        extent.combinePoint(c1);
        extent.combinePoint(c2);
        extent.combinePoint(c3);
        extent.combinePoint(c4);
        var cameraCon = window.scene.mainCamera.cameraController();
        ////rectangle, 2sec, pitch, head, roll
        cameraCon.flyToRectangle(SSmap.Rectangle.create(extent.west - 0.0001, extent.south - 0.0001, extent.east + 0.0001, extent.north + 0.0001), 2, 0, -90, 0);  
        extent.delete();

        // var selected = trackPath.getSelectedByMouse();
        // console.log("selected : " + selected);
    }
    else
    {
        //Utils.TrackPath.enabled = !Utils.TrackPath.enabled;  //无效
        // var pos = Utils.TrackPath.getScreenPosition(1);
        // console.log(pos.x + " : " + pos.y);
        Utils.TrackPath.delete();
        Utils.TrackPath = null;
    }
}

Utils.cartographicToRectangle = function ()
{
    let c1 = SSmap.Cartographic.fromDegrees(114.054494, 22.540745, 0.0);
    let rect = SSmap.Rectangle.create(c1.longitude - 0.00001, c1.latitude - 0.00001, c1.longitude + 0.00001, c1.latitude + 0.00001); 
    return rect;
}

//计算所有点之间的总长
Utils.getTotleLength = function (points)
{
    let length = 0.0;
    let size = points.size();
    for (let i = 0; i < (size - 1); i++)
    {
        let p1 = points.get(i);
        let p2 = points.get(i + 1);
        let len = SSmap.Vector3.subtract(p1, p2).length();
        length += len;
    }
    return length;
}

//道路线缓冲测试
Utils.addRoadBuffer = function ()
{
    var points = new SSmap.PointVector();
    points.push_back(SSmap.Cartographic.fromDegrees(114.026, 22.5399, 0.0).toVector3());
    points.push_back(SSmap.Cartographic.fromDegrees(114.044, 22.5425, 0.0).toVector3());
    points.push_back(SSmap.Cartographic.fromDegrees(114.045, 22.5312, 0.0).toVector3());
    points.push_back(SSmap.Cartographic.fromDegrees(114.058, 22.5317, 0.0).toVector3());

    let len = Utils.getTotleLength(points);
    let roadBuffer = new SSmap.RoadBuffer();
    roadBuffer.setRoadLines(points);
    roadBuffer.width = 50.0;    //缓冲之后的道路面宽度
    roadBuffer.color = SSmap.Color.fromRgb(0, 255, 0, 128);
    //roadBuffer.url = window.baseUrl + "symbols/images/road1.png";
    roadBuffer.url = window.baseUrl + "symbols/images/flow.png";
    //roadBuffer.textureScale = SSmap.Vector2.create(1.0, 1.0);
    //roadBuffer.terrainOffset = 5.0; //基于地形， 补偿5.0米
    //roadBuffer.animationRun = true;
    roadBuffer.altitude = 60.0; //绝对海拔 60.0米
    roadBuffer.create();
}

Utils.HexagonLayer = null;
Utils.addHexCluster = function ()
{
    if (Utils.HexagonLayer == null)
    {
        console.log("hexagon layer create!");
        let hexagonLayer = new SSmap.GeoJsonHexagonLayer();
        hexagonLayer.geoJson = window.baseUrl + "testdata/geojson/ft-point.geojson";
        hexagonLayer.startColor = SSmap.Color.fromRgb(0, 255, 0, 64);
        hexagonLayer.endColor = SSmap.Color.fromRgb(255, 0, 0, 200);
        hexagonLayer.weight = 60;
        hexagonLayer.minResolution = 8;
        hexagonLayer.maxResolution = 12; //12
        hexagonLayer.create();
        Utils.HexagonLayer = hexagonLayer;
    }
    else
    {
        Utils.HexagonLayer.delete();
        Utils.HexagonLayer = null;
    }
}

//视锥体测试
Utils.addFrustum = function()
{
    let carto = SSmap.Cartographic.fromDegrees(114.054, 22.5324, 0.0);
    let cart3 = carto.toCartesian3();
    //上下方向用 eastNorthUpToFixedFrame
    let m4 = window.scene.globe.ellipsoid.eastNorthUpToFixedFrame(cart3);
    let frustum = new SSmap.Frustum3D();
    frustum.color = SSmap.Color.fromRgb(0, 255, 0, 128);
    frustum.position = carto.toVector3();
    frustum.rotation = SSmap.Quaternion.fromRotationMatrix(m4.rotationMatrix());
    frustum.create();

    let frustumEntity = frustum.createEntity();
    frustumEntity.parent = SSmap.Entity.root();
}

//分类标签
Utils.createLabelLayer = function (baseUrl)
{
    if (Utils.geoLabelLayer == null)
    {
        var geoLabelLayer = new SSmap.GeoJsonLabelLayer();
        // geoLabelLayer.geoJson = baseUrl + "data/futian-point.geojson";
        // geoLabelLayer.url = baseUrl + "symbols/images/dot_red_32x32.png";
        // geoLabelLayer.setNameField('name');
        
        var vdf = new SSmap.VDistanceDisplayField();
        var fields = new SSmap.StringVector();
        fields.push_back("DLMC");
        // fields.push_back("DLMC");
        // fields.push_back("DLMC");
        // fields.push_back("DLMC");
        // fields.push_back("DLMC");
        // fields.push_back("DLMC");
        // fields.push_back("DLMC");
        // fields.push_back("DLMC");
        // fields.push_back("DLMC");
        // fields.push_back("DLMC");
        // fields.push_back("DLMC");
        // fields.push_back("DLMC");
        // fields.push_back("DLMC");
        // fields.push_back("DLMC");

        var categorys = new SSmap.StringVector(); 
        categorys.push_back("基础地名");
        // categorys.push_back("交通设施");
        // categorys.push_back("政府机关");
        // categorys.push_back("科技教育");
        // categorys.push_back("旅游观光");
        // categorys.push_back("宾馆酒楼");
        // categorys.push_back("知名企事业");
        // categorys.push_back("医疗卫生");
        // categorys.push_back("文化体育");
        // categorys.push_back("公共服务");
        // categorys.push_back("购物中心");
        // categorys.push_back("邮政通讯");
        // categorys.push_back("连锁餐饮");
        // categorys.push_back("金融机构");
        
        vdf.push_back({ field: "L19", distanceDisplay: SSmap.Cartesian2.create(1.0, 500), scaleByDistance: SSmap.Cartesian4.create(100, 1.5, 2000, 0.5) });
        vdf.push_back({ field: "L18", distanceDisplay: SSmap.Cartesian2.create(1.0, 1000), scaleByDistance: SSmap.Cartesian4.create(200, 1.5, 4000, 0.5) });
        vdf.push_back({ field: "L17", distanceDisplay: SSmap.Cartesian2.create(1.0, 2000), scaleByDistance: SSmap.Cartesian4.create(400, 1.5, 6000, 0.5) });
        vdf.push_back({ field: "L16", distanceDisplay: SSmap.Cartesian2.create(1.0, 3500), scaleByDistance: SSmap.Cartesian4.create(600, 1.5, 8000, 0.5) });
        vdf.push_back({ field: "L15", distanceDisplay: SSmap.Cartesian2.create(1.0, 6000), scaleByDistance: SSmap.Cartesian4.create(800, 1.5, 10000, 0.5) });
        vdf.push_back({ field: "L14", distanceDisplay: SSmap.Cartesian2.create(1.0, 10000), scaleByDistance: SSmap.Cartesian4.create(1000, 1.5, 15000, 0.5) });
        vdf.push_back({ field: "L13", distanceDisplay: SSmap.Cartesian2.create(1.0, 20000), scaleByDistance: SSmap.Cartesian4.create(1200, 1.5, 20000, 0.8) });

        //geoLabelLayer.geoJson = baseUrl + "data/db.geojson";
        geoLabelLayer.geoJson = baseUrl + "data/db-4w.geojson";
        geoLabelLayer.setNameField('ALIAS');
        geoLabelLayer.setTerrainField("RH");
        geoLabelLayer.setCategory(fields, categorys);
        geoLabelLayer.setFieldsDDC(vdf);
        geoLabelLayer.usedProperties = true;
        geoLabelLayer.create();
        Utils.geoLabelLayer = geoLabelLayer;
    }
    else
    {
        Utils.geoLabelLayer.delete();
        Utils.geoLabelLayer = null;
    }
}

Utils.categoryCount = 0;
Utils.categoryEnabled = false;
Utils.category = ["基础地名", "交通设施", "政府机关", "科技教育", "旅游观光", "宾馆酒楼", "知名企事业",
                "医疗卫生", "文化体育", "公共服务", "购物中心", "邮政通讯", "连锁餐饮", "金融机构"];

Utils.testCategory = function ()
{
    if (Utils.geoLabelLayer != null)
    {
        Utils.geoLabelLayer.setCategoryEnabled(Utils.category[Utils.categoryCount], Utils.categoryEnabled);
        Utils.categoryCount++;

        if (Utils.categoryCount >= 12)
        {
            Utils.categoryCount = 0;
            Utils.categoryEnabled = !Utils.categoryEnabled;
        }  
    }
}

//创建线图层
Utils.createPolylineLayer = function (baseUrl)
{
    if (Utils.geoPolylineLayer == null)
    {
        var geoPolylineLayer = new SSmap.GeoJsonPolylineLayer();
        //geoPolylineLayer.geoJson = baseUrl + "data/futian-polyline-1370.geojson"; 
        geoPolylineLayer.geoJson = baseUrl + "data/futian_road/ft-road.geojson";
        //geoPolylineLayer.geoJson = baseUrl + "geojson-polyline/l17-20.geojson"; //l17-20.geojson 道路线L17-L20.geojson 
        //geoPolylineLayer.geoJson = baseUrl + "geojson-polyline/shenzhen-blockLine.geojson";
        geoPolylineLayer.color = SSmap.Color.fromRgb(0, 0, 255, 128);
        //geoPolylineLayer.alpha = 0.5;
        geoPolylineLayer.width = 10.0;
        //geoPolylineLayer.widthField = "width";
        //geoPolylineLayer.usedProperties = true; //使用属性(会读取geojson文件中的属性, 用于拾取属性)
        geoPolylineLayer.highLightColor = SSmap.Color.fromRgb(0, 255, 0, 255);
        geoPolylineLayer.glow = true;
        //geoPolylineLayer.animationRun = true;
        geoPolylineLayer.setAltitudeMethod(SSmap.AltitudeMethod.RelativeToTerrain); //相对于地形(实际高度 = 贴地高度 + altitude值)
        geoPolylineLayer.setAltitude(5.0);
        geoPolylineLayer.setDistanceDisplayCondition(SSmap.Vector2.create(1.0, 1.0e7));
        geoPolylineLayer.depthTest = false;  //关闭深度测试
        geoPolylineLayer.depthTestAltitude = 1e5; //相机高度小于设置海拔值时, 打开深度测试, (depthTest为false时, 此参数无效)
        geoPolylineLayer.create();
        Utils.geoPolylineLayer = geoPolylineLayer;
    }
    else
    {
        Utils.geoPolylineLayer.delete();
        Utils.geoPolylineLayer = null;
    }
}

//创建面图层
Utils.createPolygonLayer = function (baseUrl)
{
    if (Utils.geoPolygonLayer == null)
    {
        var geoPolygonLayer = new SSmap.GeoJsonPolygonLayer();
        //geoPolygonLayer.geoJson = baseUrl + "data/futian-polygon.geojson";
        geoPolygonLayer.geoJson = baseUrl + "data/polygon(10-30).geojson";
        //geoPolygonLayer.geoJson = baseUrl + "data/chedaoxian.geojson";
        //geoPolygonLayer.geoJson = baseUrl + "data/futian.geojson";

        //geoPolygonLayer.addString(Utils.polygonData);
        
        //线框
        // geoPolygonLayer.entityType = SSmap.EntityType.LINE;
        // geoPolygonLayer.lineColor = SSmap.Color.fromRgb(0, 255, 0, 128);
        // geoPolygonLayer.lineAlpha = 0.5;
        ///or 拉伸面
        geoPolygonLayer.entityType = SSmap.EntityType.PLANE;
        geoPolygonLayer.fillColor = SSmap.Color.fromRgb(0, 183, 235, 128);
        geoPolygonLayer.fillAlpha = 0.9;

        //geoPolygonLayer.depthTest = false;  //关闭深度测试
        geoPolygonLayer.depthTestAltitude = 1e3; //相机高度小于设置海拔值时, 打开深度测试, (depthTest为false时, 此参数无效)
        ///or 拉伸单体建筑
        // geoPolygonLayer.entityType = SSmap.EntityType.SINGLEBUILDING;
        // geoPolygonLayer.extrudeHeightField = "BLDG_HEIGH";
        //or 拉伸渐变建筑
        //geoPolygonLayer.entityType = SSmap.EntityType.RAMPBUILDING;
        
        geoPolygonLayer.floorsField = "UP_BLDG_FL";  //
        geoPolygonLayer.nameField = "batchid";
        geoPolygonLayer.idField = "batchid";
        //or
        // geoPolygonLayer.floorsField = "dscs"; 
        // geoPolygonLayer.nameField = "MC";
        
        geoPolygonLayer.setAltitudeMethod(SSmap.AltitudeMethod.RelativeToTerrain); //相对于地形, 实际高度 = 地形高度 + altitude值
        geoPolygonLayer.setAltitude(3.0);   //海拔高度, 或者相对于地形的高度
        geoPolygonLayer.setDistanceDisplayCondition(SSmap.Vector2.create(1.0, 1.0e6));
        //geoPolygonLayer.setAltitude(1.0);
        geoPolygonLayer.create();
        Utils.geoPolygonLayer = geoPolygonLayer;
    }
    else
    {
        //Utils.geoPolygonLayer.delete();
        //Utils.geoPolygonLayer = null;
        //or
        Utils.geoPolygonLayer.enabled = !Utils.geoPolygonLayer.enabled;
    }
}

//二维面数据查询
Utils.createPolygonQueryLayer = function (baseUrl)
{
    if (Utils.PolygonQueryLayer == null)
    {
        console.log("createPolygonQueryLayer");
        var geoPolygonQueryLayer = new SSmap.GeoJsonPolygonQueryLayer();
        geoPolygonQueryLayer.geoJson = baseUrl + "data/futian.geojson";
        
        geoPolygonQueryLayer.create();
        Utils.PolygonQueryLayer = geoPolygonQueryLayer;
    }
    else
    {
        //Utils.createPolygonQueryLayer.delete();
        //Utils.createPolygonQueryLayer = null;
        //or
        var name = Utils.PolygonQueryLayer.properties(1, "MC");
        var buildingId = Utils.PolygonQueryLayer.properties(1, "TYDZBM");
        console.log(name);
        console.log(buildingId);
        //Utils.PolygonQueryLayer.enabled = !Utils.PolygonQueryLayer.enabled;
    }
}

//创建建筑轮廓
Utils.buildingOutline = null;
Utils.addBuildingOutline = function ()
{
    if (Utils.buildingOutline == null)
    {
        let outer = new SSmap.Cartesian3Vector();
        // outer.push_back(SSmap.Cartesian3.create(-2.40226e+06, 5.38239e+06, 2.42898e+06));
        // outer.push_back(SSmap.Cartesian3.create(-2.40227e+06, 5.3824e+06, 2.42896e+06));
        // outer.push_back(SSmap.Cartesian3.create(-2.40229e+06, 5.38239e+06, 2.42896e+06));
        // outer.push_back(SSmap.Cartesian3.create(-2.40229e+06, 5.38238e+06, 2.42898e+06));
        
        outer.push_back(SSmap.Cartesian3.create(-2402745.2288059955, 5383341.776927997, 2426405.7577532944));
        outer.push_back(SSmap.Cartesian3.create(-2402800.138384711, 5383314.862062901, 2426422.171297429));
        outer.push_back(SSmap.Cartesian3.create(-2402775.8674090886, 5383294.131357006, 2426480.2005123165));
        outer.push_back(SSmap.Cartesian3.create(-2402717.45335102, 5383328.021582325, 2426463.795127074));
        
        let buildingOutline = new SSmap.BuildingOutline();
        buildingOutline.setOuter(outer);
        buildingOutline.extrudeHeight = 50.0;
        //buildingOutline.altitude = 30.0;
        buildingOutline.color = SSmap.Color.fromRgb(0, 255, 240, 255);
        buildingOutline.strokeColor = SSmap.Color.fromRgb(0, 255, 240, 255);
        buildingOutline.strokeWidth = 1.0;
        //buildingOutline.url = window.baseUrl + "symbols/images/flow3.png";
        buildingOutline.animationType = SSmap.AnimationType.Twinkle;  //水平流动:HorizontalFlow 快速闪烁:Flash 渐变闪烁:Twinkle
        buildingOutline.animationRun = true;

        buildingOutline.create();
        buildingOutline.parent = SSmap.Entity.root();
        Utils.buildingOutline = buildingOutline;
    }
    else
    {
        Utils.buildingOutline.delete();
        Utils.buildingOutline = null;
    }
}

//创建拉伸体, 支持墙体和屋顶单独贴纹理以及纹理重复
Utils.extrudeEntity = null; 
Utils.extrudeEntity1 = null;    
Utils.createExtrudeEntity = function (scene, baseUrl)
{
    if (Utils.extrudeEntity == null)
    {
        let outer = new SSmap.Cartesian3Vector();
        outer.push_back(SSmap.Cartesian3.create(-2.40226e+06, 5.38239e+06, 2.42898e+06));
        outer.push_back(SSmap.Cartesian3.create(-2.40227e+06, 5.3824e+06, 2.42896e+06));
        outer.push_back(SSmap.Cartesian3.create(-2.40229e+06, 5.38239e+06, 2.42896e+06));
        outer.push_back(SSmap.Cartesian3.create(-2.40229e+06, 5.38238e+06, 2.42898e+06));
   
        var extrudeEntity = new SSmap.ExtrudeEntity();
        extrudeEntity.setOuter(outer);
        extrudeEntity.extrudeHeight = 20.0;
        extrudeEntity.altitude = 6.8;
        //支点位置: MODELTOP   MODELCENTER   MODELBOTTOM  
        //extrudeEntity.pivot = SSmap.Pivot.MODELTOP; 
        
        //给颜色或者给贴图, 如果两个都给, 会颜色混合, color作为baseColor跟贴图颜色混合
        extrudeEntity.color = SSmap.Color.fromRgb(0, 255, 1, 255);
        extrudeEntity.roofColor = SSmap.Color.fromRgb(0, 0, 255, 255);
        //extrudeEntity.roofAlpha = 0.9;
        //or 
        //extrudeEntity.roofMap = baseUrl + "symbols/Buildings-Textures/Roof3.jpg";
        //extrudeEntity.wallMap = baseUrl + "symbols/Buildings-Textures/GR_APT2W.jpg";  //GR_APT2W.jpg  Roof3.jpg
        //or
        //extrudeEntity.waterShader = true; //填充水材质, 其它颜色,纹理贴图设置无效
        
        //extrudeEntity.bothSide = true;    //双面材质, 设置墙体透明时, 能看到顶/底的颜色
        extrudeEntity.create();

        var ent = extrudeEntity.createEntity();
        Utils.extrudeEntity = ent;
        scene.addEntity(ent);

        //entity2
        // let outer1 = new SSmap.Cartesian3Vector();
        // let size = outer.size();
        // for (let i = 0; i < size; i++)
        // {
        //     let car3 = outer.get(i);
        //     let carto = car3.toCartographic();
        //     carto.height += 20.0;
        //     outer1.push_back(carto.toCartesian3());
        // }
        // extrudeEntity.setOuter(outer1);
        // extrudeEntity.create();
        // var ent1 = extrudeEntity.createEntity();
        // Utils.extrudeEntity1 = ent1;
        // scene.addEntity(ent1);

        //entity3
        // let outer2 = new SSmap.Cartesian3Vector();
        // let size1 = outer.size();
        // for (let i = 0; i < size; i++)
        // {
        //     let car3 = outer.get(i);
        //     let carto = car3.toCartographic();
        //     carto.height += 40.0;
        //     outer2.push_back(carto.toCartesian3());
        // }
        // extrudeEntity.setOuter(outer2);
        // extrudeEntity.create();
        // var ent2 = extrudeEntity.createEntity();
        // Utils.extrudeEntity2 = ent2;
        // scene.addEntity(ent2);

        outer.delete();
        // outer1.delete();
        // outer2.delete();
        extrudeEntity.delete();
    }
    else
    {
        //迭代获取所有子renderer
        // Utils.extrudeEntity.travalRenderers(function (render) {
        //     //render.material.color = SSmap.Color.fromRgb(0, 255, 255, 255);
        //     render.material.shadingModel = SSmap.ShadingModel.Water; //设置水材质
        // });
        Utils.extrudeEntity.delete();
        Utils.extrudeEntity = null;
    }
}


Utils.shenzhen = [114.229205, 22.81253, 114.180847, 22.775728, 114.215641, 22.73557, 114.172494, 22.654368,
    114.144674, 22.714159, 114.107198, 22.722979, 114.098462, 22.747205, 114.074781, 22.740883,
    114.049797, 22.771161, 114.002971, 22.763459, 113.990863, 22.800211, 113.937829, 22.832705,
    113.910929, 22.829997, 113.89951, 22.855478, 113.841496, 22.833979, 113.837204, 22.800901,
    113.802257, 22.784863, 113.751447, 22.715381, 113.782255, 22.625713, 113.832223, 22.570246,
    113.834675, 22.539552, 113.856593, 22.539605, 113.862801, 22.475853, 113.881731, 22.446788,
    113.915758, 22.455945, 113.976531, 22.510606, 114.054702, 22.49959, 114.094093, 22.533593,
    114.153488, 22.539285, 114.165596, 22.558916, 114.232578, 22.54003, 114.325309, 22.588649,
    114.398345, 22.602848, 114.422562, 22.592744, 114.467625, 22.53338, 114.48985, 22.443647,
    114.52541, 22.440559, 114.549244, 22.46574, 114.611397, 22.482027, 114.627798, 22.502996,
    114.614539, 22.545191, 114.568097, 22.560778, 114.559054, 22.583277, 114.60289, 22.655272,
    114.431912, 22.660907, 114.428157, 22.676746, 114.445324, 22.68897, 114.403403, 22.723935,
    114.41827, 22.766327, 114.404706, 22.781305, 114.388075, 22.757191, 114.342706, 22.783642,
    114.353128, 22.806636, 114.284844, 22.808282, 114.250817, 22.781677, 114.229205, 22.81253];

Utils.minzhi = [114.018912872085522, 22.646357373612076, 114.046600682929224, 22.631791113521199,
    114.061037461815133, 22.588221434877038, 114.018522692929224, 22.585049834039459,
    113.988338212240294, 22.630133712964952, 114.018912872085522, 22.646357373612076];
//三维遮罩
Utils.mask3D = null;
Utils.addMask3D = function ()
{
    if (Utils.mask3D == null)
    {
        var outer = new SSmap.Cartesian3Vector();
        let len = Utils.shenzhen.length;
        for (let i = 0; i < len; i += 2)
        {
            const lng = parseFloat(Utils.shenzhen[i ]);
            const lat = parseFloat(Utils.shenzhen[i + 1]);
            const carto = SSmap.Cartographic.fromDegrees(lng, lat, 0);
            outer.push_back(carto.toCartesian3());
        }
        // outer.push_back(SSmap.Cartesian3.create(-2.40226e+06, 5.38239e+06, 2.42898e+06));
        // outer.push_back(SSmap.Cartesian3.create(-2.40227e+06, 5.3824e+06, 2.42896e+06));
        // outer.push_back(SSmap.Cartesian3.create(-2.40229e+06, 5.38239e+06, 2.42896e+06));
        // outer.push_back(SSmap.Cartesian3.create(-2.40229e+06, 5.38238e+06, 2.42898e+06));
     
        var inner = new SSmap.Cartesian3Vector();
        len = Utils.minzhi.length;
        for (let i = 0; i < len; i += 2)
        {
            const lng = parseFloat(Utils.minzhi[i ]);
            const lat = parseFloat(Utils.minzhi[i + 1]);
            const carto = SSmap.Cartographic.fromDegrees(lng, lat, 0);
            inner.push_back(carto.toCartesian3());
        }
   
        var extrudeEntity = new SSmap.ExtrudeEntity();
        extrudeEntity.setOuter(outer);
        extrudeEntity.setInner(inner);
        extrudeEntity.extrudeHeight = 200.0;
        extrudeEntity.color = SSmap.Color.fromRgb(0, 128, 255, 255);
        extrudeEntity.create();

        var ent = extrudeEntity.createEntity();
        Utils.mask3D = ent;
        scene.addEntity(ent);
        extrudeEntity.delete();
        outer.delete();
        inner.delete();
    }
    else
    {
        Utils.mask3D.delete();
        Utils.mask3D = null;
    }
}

//创建拉伸管线
Utils.createExtrudePipe = function ()
{
    if (Utils.extrudePipe == null)
    {
        var positions = new SSmap.Cartesian3Vector();
        positions.push_back(SSmap.Cartesian3.create(-2.4005e+06, 5.3824e+06, 2.43068e+06));
        positions.push_back(SSmap.Cartesian3.create(-2.4004e+06, 5.38233e+06, 2.43093e+06));
        positions.push_back(SSmap.Cartesian3.create(-2.40026e+06, 5.38242e+06, 2.43088e+06));
        positions.push_back(SSmap.Cartesian3.create(-2.40015e+06, 5.38235e+06, 2.43112e+06));
        positions.push_back(SSmap.Cartesian3.create(-2.40025e+06, 5.38225e+06, 2.43126e+06));

        var shape = SSmap.GisUtil.computeShape2D(3.0, 6);

        //var extrudePipe = new SSmap.ExtrudePipe();
        var extrudePipe = new SSmap.ExtrudePipe();
        extrudePipe.setPositions(positions);
        extrudePipe.setShape(shape);
        extrudePipe.run();

        var mat = new SSmap.Material();
        mat.color = SSmap.Color.fromRgb(255, 0, 0, 255);
        var ent = extrudePipe.createEntity(mat);
        Utils.extrudePipe = ent;
        scene.addEntity(ent);
        extrudePipe.delete();
    }
    else
    {
        Utils.extrudePipe.delete();
        Utils.extrudePipe = null;
    }
}

//计算物体的体积(那之前的拉伸体做测试)
Utils.geometryVolume = function ()
{
    if (Utils.extrudeEntity != null)
    {
        var renderer = Utils.extrudeEntity.renderer;
        var f = SSmap.GisUtil.calculateGeometryVolume(renderer);

        f.then(function (value) {
            console.log("geometry volume : " + value);
        });
    }
}

//体积
function geometryVolumeResult(value)
{
    console.log("geometry volume is: " + value);
}

// BMP GIF JPG JPEG PNG PBM PGM PPM XBM XPM
// 4k: 4096 x 2160
// 8k: 7680 x 4320
// 15260 x 4320 //显存太小， 调用会崩溃
// 16k: 15260 x 8640 不支持
//截图
Utils.saveImage = function ()
{
    //console.log("save image");
    //SSmap.FileSystem.saveRenderImage(1920, 1080, "renderimage", "PNG");
    //SSmap.FileSystem.saveRenderImage(4096, 2160, "renderimage", "JPEG"); 
    //SSmap.FileSystem.saveRenderImage(7680, 4320, "renderimage", "JPEG"); 
    //SSmap.FileSystem.saveRenderImage(15260, 4320, "renderimage", "JPEG"); 
    //or
    // SSmap.saveImage2Base64(400, 300, 'PNG').then(function (value)
    // {
    //     console.log(value);
    //     let byteArray = SSmap.ByteArray.fromPtr(value); //拿到一个SSmap.ByteArray 对象
    //     let base64 = byteArray.data();  //拿到base64内存数据
    //     console.log(base64);
    // });
    //or
    let color = SSmap.Color.fromRgb(255, 0, 0, 255);
    window.globalViewer.renderSystem.renderSkyline(400, 300, 2, color).then(function(value){
        //console.log(value);
        let typedArray = SSmap.ByteArray.typedArray(value); //拿到一个SSmap.ByteArray 对象
        console.log(typedArray);

        let data = new Uint8Array(typedArray);
        let blob = new Blob([data], {
                            type: "image/png",
                        });
        console.log("图片打印", blob)
    });
   
}

//强行退出，重新加载
//项目中非必要，不建议调用此功能， 用于sdk代码编辑重新运行
//退出前要自己清理项目中加载的数据， 影像，地形，模型，3dtiles等等，不然强行退出报内存泄漏。。。
Utils.forceQuit = function ()
{
    SSmap.forceExit();
    location.reload();
}

Utils.SDKVersion = function ()
{
    let version = SSmap.version();
    console.log("SDK Version : " +  version);
}


//裁切体测试
Utils.ClipVolume = null; 
Utils.testClipVolume = function (scene)
{
    if (Utils.ClipVolume == null)
    {
        let pos = SSmap.Cartographic.fromDegrees(114.0553576, 22.5099829, 30.0);
        let rotation = SSmap.Quaternion.fromEulerAngles(0, 0, 0);
        let cvEntity = this.addClipVolume(scene, pos, rotation);  
        Utils.ClipVolume = cvEntity;

        let p = SSmap.Cartographic.fromDegrees(114.0553576, 22.5099829, 500);
        scene.mainCamera.cameraController().flyToCartographic(p, 3, 0, -90, 0);
    }
    else
    {
        Utils.ClipVolume.delete();
        Utils.ClipVolume = null;
    }
}

//添加裁切体
Utils.addClipVolume = function (scene, position, rotation)
{
    let cv = new SSmap.ClipVolume();
    cv.shape = SSmap.ClipVolumeShape.Cube;         //剪切形状, 默认立方体
    cv.clipFlag = SSmap.ClipVolumeFlag.ClipAll;    //默认是全部剪切, 可选ClipGlobe, ClipScene, ClipAll
    cv.size = SSmap.Vector3.create(100, 100, 100); // 100 x 100 x 100 米的剪切体
    cv.showDebugVolume = true;                  //是否显示剪切的轮廓
    cv.objectName = "cv_test";                  //添加一个名称标识

    var entity = new SSmap.Entity();
    entity.transform.cartographic = position;   //坐标点
    var childEntity = new SSmap.Entity();          //子物体
    childEntity.parent = entity;                //设置父子结构
    childEntity.transform.rotation = rotation;  //旋转角度(四元数)
    childEntity.addComponent(cv);               //添加组件  
    scene.addEntity(entity);                    //添加到rootEntity的子节点中

    return entity;
}

//添加fps控制器(键盘鼠标, w,s,a,d键控制, 鼠标x轴控制左右旋转, 鼠标y轴控制上下旋转)
// w: 向前 s:向后 a: 左移 d:右移,
// 鼠标左键X轴拖动:左右旋转 鼠标左键Y轴拖动: 上下旋转
// 鼠标中键按下, 向下: 下移, 向上:上移
// w,s,a,d 组合 -/+ : 减速/ 加速
//BIM室内模式浏览时打开
Utils.CameraFov = 50;   //保存相机fov
Utils.FPSController = null; //fps控制器
Utils.addFPSController = function ()
{
    if (Utils.FPSController == null)
    {
        let FPSCtrl = new SSmap.FPSController();
        FPSCtrl.setAction(true);
        Utils.FPSController = FPSCtrl;
        Utils.CameraFov = window.scene.mainCamera.fov;
        window.scene.mainCamera.fov = 75;

        console.log("old fov: " + Utils.CameraFov);
    }
    else
    {
        Utils.FPSController.setAction(!Utils.FPSController.action());

        //设置原来的相机fov
        if (!Utils.FPSController.action())
        {
            window.scene.mainCamera.fov = Utils.CameraFov;
        }
    } 
}

//添加地下管线
Utils.addPipe = function (scene, baseUrl)
{
    if (Utils.pipeLine == null)
    {
        let tilesetLayer = new SSmap.TilesetLayer();
        //tilesetLayer.url = baseUrl + "data/futian-pipe/tileset.json";
        //tilesetLayer.url = baseUrl + "data/YS/tileset.json";
        tilesetLayer.url = baseUrl + "data/WS/tileset.json";
     
        tilesetLayer.color = SSmap.Color.fromRgb(255, 251, 240, 255);
        // tilesetLayer.renderStyle = SSmap.RenderStyle.ColorStyle;  
        tilesetLayer.clipLevelOfDetail = true;
         tilesetLayer.componentComplete();
        Utils.pipeLine = tilesetLayer;
        scene.globe.show = false; //隐藏地形
        //or
        //scene.globe.setDefaultTerrain();  //设置默认地形, 高度为0
        //or
        scene.globe.opacity = 0.8;  //设置地面的透明度
        //Utils.flyTo(114.05140245, 22.5344496, 100);

        let camera = window.scene.mainCamera;
        
        let p = SSmap.Cartographic.fromDegrees(114.068417, 22.51753, 39.7);
        camera.cameraController().flyToCartographic(p, 3, 346.72, -14.55, 0);
    }
    else
    {   //显示/隐藏地形
        scene.globe.show = !scene.globe.show;
        //or
        //scene.globe.setTerrainProviderUrl(window.baseUrl + 'data/ft-dem-max14');
        //or
        scene.globe.opacity = 1.0;
    }
}

//地理围栏测试
Utils.geoFencing = null;  
Utils.addGeoFencing = function ()
{
    if (Utils.geoFencing == null)
    {
        let vec3 = SSmap.Vector3.create(-2.4008e+06, 5.38223e+06, 2.43075e+06);
        let circle = SSmap.GisUtil.computeShape2GeodeticSurface(1000.0, 60, vec3); // 1000: 半径 , 60:圆弧细分数 , vec3: 中心点
        //or
        // let positions = new SSmap.Cartesian3Vector();
        // positions.push_back(SSmap.Cartesian3.create(-2401337.658521618, 5382318.731108139, 2430032.3037992488));
        // positions.push_back(SSmap.Cartesian3.create(-2403067.038169773, 5381539.839092472, 2430047.6816503555));
        // positions.push_back(SSmap.Cartesian3.create(-2403265.691728874, 5381964.447919825, 2428918.2055893387));
        // positions.push_back(SSmap.Cartesian3.create(-2401564.0811817464, 5382723.96959504, 2428918.1918774224));

        let geoFencing = new SSmap.GeoFencing();
        geoFencing.setOuter(circle);    //设置外轮廓坐标列表, 可以根据需要传入一组坐标列表
        //or
        //geoFencing.setOuter(positions); 

        geoFencing.extrudeHeight = 300.0; //拉伸高度
        geoFencing.setAnimationRun(true);   //是否有动画
        geoFencing.setRange(0.01);

        //geoFencing.url = window.baseUrl + "symbols/images/flow.png";
        //geoFencing.url = window.baseUrl + "symbols/images/flow3.png";
        geoFencing.url = window.baseUrl + "symbols/images/flow4.png";
        geoFencing.cw = true;       //动画方向 S纹理动画, 正转,反转. T纹理动画: 从下到上, 从上到下
        geoFencing.animationDirection = SSmap.AnimatingUVCoords.VDirection; //UDirection(S纹理动画) : 水平方向, VDirection(T纹理动画):垂直方向
        geoFencing.textureScale = SSmap.Vector2.create(50.0, 2.0); //纹理缩放 

        //geoFencing.setColorRamp(SSmap.Color.fromRgb(0, 255, 0, 255), SSmap.Color.fromRgb(255, 0, 0, 255)); //渐变颜色(底部到顶部渐变)
        geoFencing.create();

        Utils.geoFencing = geoFencing;
    }
    else
    {   
        //显示/隐藏测试
        //Utils.geoFencing.enabled = !Utils.geoFencing.enabled;

        //删除测试
        Utils.geoFencing.delete();
        Utils.geoFencing = null;
    }
    
}


//热力图
Utils.heatmap = null;      
Utils.createHeatmap = function (baseUrl)
{
    if (Utils.heatmap == null)
    {
        var heatmap = new SSmap.Heatmap();
        //heatmap.geoJson = baseUrl + "data/futian-point.geojson"; 
        //heatmap.geoJson = baseUrl + "testdata/geojson/south-north-heat.geojson";
        heatmap.geoJson = baseUrl + "data/heatmap(2points).geojson";
        //heatmap.geoJson = baseUrl + "data/data-home.geojson";
        //heatmap.addString(Utils.headMapData);
        //heatmap.weightField = "heat";
        heatmap.setColorRamp(SSmap.Color.fromRgb(0, 255, 0, 255), SSmap.Color.fromRgb(255, 0, 0, 255));
        heatmap.addGradientStop(0.35, SSmap.Color.fromRgb(0, 255, 255, 255)); // offset: 0.35 color: c
        heatmap.addGradientStop(0.70, SSmap.Color.fromRgb(255, 255, 0, 255));
        heatmap.radius = 200;  ///500 50

        heatmap.readyPromise.then(function () {
            console.log("max valueu : " + heatmap.calculatedMaxValue()); //返回计算的最大值
        });

        heatmap.create();
        Utils.heatmap = heatmap;
    }
    else
    {
        Utils.heatmap.delete();
        Utils.heatmap = null;
    }
}

//三维热力图
Utils.heatmap3d = null;  
Utils.createHeatmap3D = function (baseUrl)
{
    if (Utils.heatmap3d == null)
    {
        let heatmap3d = new SSmap.Heatmap3D();
        heatmap3d.geoJson = baseUrl + "data/futian-point.geojson";
        heatmap3d.setColorRamp(SSmap.Color.fromRgb(0, 255, 0, 255), SSmap.Color.fromRgb(255, 0, 0, 255));
        heatmap3d.radius = 200;
        heatmap3d.transparent = false;    //带透明的三维热力图 , 默认为true
        heatmap3d.create();
        Utils.heatmap3d = heatmap3d;
        heatmap3d.readyPromise.then(function () {
            console.log("3d max valueu : " + heatmap3d.calculatedMaxValue()); //返回计算的最大值
        });
        
    }    
}

Utils.BIMTileset = null;
Utils.TilesetEntity = null;
Utils.BIMPullOut = null;
Utils.addBIMFloors = function (scene, baseUrl)
{
    if (Utils.BIMTileset == null)
    {
        //let tileset = new SSmap.Tileset(baseUrl + "data/xiangmihu_3dtiles/tileset.json");
        let tileset = new SSmap.Tileset(baseUrl + "data/BIM/深圳香蜜湖国际交流中心(分层)/tileset.json"); 
        //let tileset = new SSmap.Tileset(baseUrl + "data/BIM/MXY_MAX_3DTILES_g1/tileset.json");
        //113.99841, 22.5495, 500
        //let tileset = new SSmap.Tileset(baseUrl + "data/BIM/福田妇儿医院/tileset.json");
        // 114.06555, 22.545489, 500
        //let tileset = new SSmap.Tileset(baseUrl +"data/BIM/福投控大厦建筑模型/tileset.json");
        //114.06125, 22.569636, 500
        //let tileset = new SSmap.Tileset(baseUrl +"data/BIM/恒裕金龙大厦/tileset.json");
        //114.04977, 22.51002, 500
        //let tileset = new SSmap.Tileset(baseUrl +"data/BIM/深港科创综合服务中心/tileset.json");
        //114.03633, 22.55215, 500
        //let tileset = new SSmap.Tileset(baseUrl + "data/BIM/天健天骄西筑项目/tileset.json");
        //114.023858, 22.54714, 500
        //let tileset = new SSmap.Tileset(baseUrl +"data/BIM/香蜜湖/tileset.json");
        //114.04255, 22.566128, 500
        //let tileset = new SSmap.Tileset(baseUrl +"data/BIM/中粮大悦城/tileset.json");
        
        // let tileset = new SSmap.Tileset("http://10.253.102.69/gw/TILE_3D_MODEL/3D/QX_FT/tileset.json");
        // tileset.setHeater("XbZrKCXAKXNnu5cRuyXoCmg2DU8E0ztA8/27O2AS3EtAsqU6Fymn8hqiJicChJyg");

        let entity = new SSmap.Entity();
        entity.addComponent(tileset);
        scene.addEntity(entity);

        Utils.BIMTileset = tileset;
        Utils.TilesetEntity = entity;
        
        //Utils.flyTo(114.023858, 22.54714, 500);
        let p = SSmap.Cartographic.fromDegrees(114.0337386, 22.603996, 500);
        scene.mainCamera.cameraController().flyToCartographic(p, 3, 0, -90, 0);
        tileset.readyPromise.then(function () {
            console.log("then ");
            setTimeout(function () {
            console.log("create BIMPullOut");
            let bimPullOut = new SSmap.BIMPullOut(Utils.BIMTileset);
            Utils.BIMPullOut = bimPullOut;

            let floors = bimPullOut.floors();   //取出所有的楼层名称
            let size = floors.size();

            for (let i = 0; i < size; i++)
            {
                let floorName = floors.get(i);   
                console.log( "floor: " + floorName);  //楼层名称
            }
            }, 10000)
        });
    }
    
}

//抽出一层
Utils.bimPullOut = function ()
{
    if (Utils.BIMPullOut != null)
    {
        console.log("bim pull out");
        //Utils.BIMPullOut.move("F04_AS", SSmap.Vector3.create(0.0, 0.0, 100.0)); // F04_AS 楼层名称,  vector3: lng, lat, height (单位是米, 会转换为对应经纬度值)
        Utils.BIMPullOut.move("WAIKE", SSmap.Vector3.create(0, 0.0, 100.0));
    }
}

//还原
Utils.bimReset = function ()
{
    if (Utils.BIMPullOut != null)
    {
        console.log("bim reset");
        Utils.BIMPullOut.reset();    
    }
}

Utils.buildingHeight = null;
//建筑控高分析
Utils.buildingHeightRestriction = function ()
{
    console.log("building Height Restriction");
    if (Utils.buildingHeight == null)
    {
        let plane = new SSmap.Polygon3D();
        plane.color = SSmap.Color.fromRgb(0, 240, 120, 128);//颜色
        plane.alpha = 0.5;      //透明度
        plane.fillAlpha = 0.5;  //填充透明度
        plane.setAltitude(10);
        plane.setAltitudeMethod(SSmap.AltitudeMethod.Absolute); //绝对模式, 贴于地形之上
        plane.setFillColor(SSmap.Color.fromRgb(0, 255, 0, 128));
        plane.addPoint(SSmap.Vector3.create(-2401469.458, 5382345.588, 2429863.9276));
        plane.addPoint(SSmap.Vector3.create(-2403508.326, 5381397.997, 2429943.705));
        plane.addPoint(SSmap.Vector3.create(-2403778.869, 5381775.772, 2428843.392));
        plane.addPoint(SSmap.Vector3.create(-2401615.949, 5382759.165, 2428806.615));
        plane.draw();   //绘制
        plane.end();    //end之后不能添加点
        plane.tag = "plane";
    
        let polygon = new SSmap.Polygon3D();
        polygon.color = SSmap.Color.fromRgb(255, 0, 0, 255);//颜色
        polygon.alpha = 0.5;      //透明度
        polygon.fillAlpha = 0.5;  //填充透明度
        polygon.setAltitudeMethod(SSmap.AltitudeMethod.OnTerrain); //贴于地形之上
        polygon.setFillColor(SSmap.Color.fromRgb(255, 0, 0, 255));
        polygon.addPoint(SSmap.Vector3.create(-2401469.458, 5382345.588, 2429863.9276));
        polygon.addPoint(SSmap.Vector3.create(-2403508.326, 5381397.997, 2429943.705));
        polygon.addPoint(SSmap.Vector3.create(-2403778.869, 5381775.772, 2428843.392));
        polygon.addPoint(SSmap.Vector3.create(-2401615.949, 5382759.165, 2428806.615));

        polygon.setLimitHeight(10.1);
       
        polygon.draw();   //绘制
        polygon.end();    //end之后不能添加点
        polygon.tag = "polygon";

        let entity = new SSmap.Entity();
        plane.parent = entity;
        polygon.parent = entity;
        Utils.buildingHeight = entity;

        window.scene.addEntity(entity);
    }
    else
    {
        
    }
}

//监控摄像头模型, 点击播放视频
Utils.CCTVCamera = null;
Utils.addCameraModel = function ()
{
    if (Utils.CCTVCamera == null)
    {
        let cctvUrl = baseUrl + "data/camera_180.glb"; 
        let cctvmPos = SSmap.Cartographic.fromDegrees(114.051514, 22.510255, 4.0000);
        let cctvRotation = SSmap.Vector3.create(0, 0, 0);
        let cctvOffset = SSmap.Vector3.create(0, 0, 0);
        let distance = SSmap.Vector2.create(1.0, 1e4);
        var cctvModel = Utils.modelLayer(cctvUrl, cctvmPos, cctvRotation, cctvOffset, distance);

        let camera = window.scene.mainCamera;
        var p = SSmap.Cartographic.fromDegrees(114.051507, 22.510365, 9.6);
        camera.cameraController().flyToCartographic(p, 3, 175, -11.6, 0);
    }
}

//计算挖填方时, 要先飞到挖填方范围上方, 这时地形会更新. 
//更新后的地形, 计算精度更高
Utils.cutAndFillVolume = null;
Utils.cutAndFillVolumeState = false;
Utils.addCutFillVolume = function ()
{
    if (Utils.cutAndFillVolume == null)
    {
        let cutAndFillVolume = new SSmap.CutAndFillVolume();
        //cutAndFillVolume.baseHeight = 35;
        //cutAndFillVolume.lineColor = SSmap.Color.fromRgb(255, 0, 0, 255);
        //cutAndFillVolume.fillVolumeColor = SSmap.Color.fromRgb(0, 255, 0, 255);
        //cutAndFillVolume.cutVolumeColor = SSmap.Color.fromRgb(0, 0, 255, 255);
        cutAndFillVolume.addPoint(SSmap.Vector3.create(-2401102.17803038, 5381837.221917883, 2431322.4088967624));
        cutAndFillVolume.addPoint(SSmap.Vector3.create(-2401217.6519644577, 5382036.858405292, 2430770.1142349862));
        cutAndFillVolume.addPoint(SSmap.Vector3.create(-2402878.7401228216, 5381281.544949363, 2430800.6906644125));
        cutAndFillVolume.addPoint(SSmap.Vector3.create(-2402770.937031862, 5381018.617677656, 2431484.598601653));
        cutAndFillVolume.addPoint(SSmap.Vector3.create(-2402302.095332233, 5381063.218309714, 2431846.686779186));
        cutAndFillVolume.addPoint(SSmap.Vector3.create(-2401703.776193555, 5381301.782318114, 2431909.346477503));
        cutAndFillVolume.computeCutVolume();

        cutAndFillVolume.readyPromise.then(function () {
            console.log("minHeight : maxHeight : cutVolume : fillVolume: "
                + cutAndFillVolume.minHeight() + " "
                + cutAndFillVolume.maxHeight() + " "
                + cutAndFillVolume.cutVolume() + " "
                + cutAndFillVolume.fillVolume());
        });
        Utils.cutAndFillVolume = cutAndFillVolume;
    }
    else
    {
        if (!Utils.cutAndFillVolumeState)
        {
            Utils.cutAndFillVolume.baseHeight = 40;
            Utils.cutAndFillVolume.computeCutVolume();
            Utils.cutAndFillVolume.readyPromise.then(function () {
                console.log("minHeight1 : maxHeight1 : cutVolume1 : fillVolume1: "
                    + Utils.cutAndFillVolume.minHeight() + " "
                    + Utils.cutAndFillVolume.maxHeight() + " "
                    + Utils.cutAndFillVolume.cutVolume() + " "
                    + Utils.cutAndFillVolume.fillVolume());
            });

            Utils.cutAndFillVolumeState = true;
        }
        else
        {
            Utils.cutAndFillVolumeState = false;
            Utils.cutAndFillVolume.delete();
            Utils.cutAndFillVolume = null;
        }
    }
}

//坡向分析, 坡度分析随后添加
Utils.slopeAndAspect = null;
Utils.addSlopeAndAspect = function ()
{
    if (Utils.slopeAndAspect == null)
    {
        let slopeAndAspect = new SSmap.SlopeAndAspect();
        slopeAndAspect.add(SSmap.Vector3.create(-2.40149e+06, 5.38153e+06, 2.43172e+06));
        slopeAndAspect.add(SSmap.Vector3.create(-2.40162e+06, 5.38167e+06, 2.43123e+06));
        slopeAndAspect.add(SSmap.Vector3.create(-2.40223e+06, 5.38143e+06, 2.43119e+06));
        slopeAndAspect.add(SSmap.Vector3.create(-2.40219e+06, 5.3813e+06, 2.43165e+06));
        slopeAndAspect.create();
        Utils.slopeAndAspect = slopeAndAspect;
    }
    else
    {
        Utils.slopeAndAspect.delete();
        Utils.slopeAndAspect = null;
    }
}

//圆柱, 圆锥
Utils.cylinder3d = null;
Utils.addCylinder = function ()
{
    if (Utils.cylinder3d == null)
    {
        let cylinder = new SSmap.Cylinder3D();
        cylinder.position = SSmap.Vector3.create(-2.40226e+06, 5.38239e+06, 2.42898e+06);
        cylinder.topRadius = 20.0;
        cylinder.bottomRadius = 100.0
        cylinder.height = 100.0;
        cylinder.color = SSmap.Color.fromRgb(0, 0, 255, 255);
        cylinder.create();

        let cylinderEntity = cylinder.createEntity();
        cylinderEntity.parent = SSmap.Entity.root();
        Utils.cylinder3d = cylinderEntity;
    }
    else
    {
        Utils.cylinder3d.delete();
        Utils.cylinder3d = null;
    }
}

//拉伸圆柱体(纹理动画)
Utils.cylinderAnim = null;
Utils.addCylinderAnimation = function (baseUrl)
{
    if (Utils.cylinderAnim == null)
    {
        console.log("cylinder create");
        let cylinderAnim = new SSmap.CylinderAnimation();
        cylinderAnim.position = SSmap.Vector3.create(-2.40226e+06, 5.38239e+06, 2.42898e+06);
        cylinderAnim.url = baseUrl + "symbols/images/cylinderimage.png";
        cylinderAnim.extrudeHeight = 100.0; //拉伸高度
        cylinderAnim.alpha = 0.9;
        cylinderAnim.radius = 50.0; //半径
        cylinderAnim.textureScale = SSmap.Vector2.create(1.0, 1.0);
        cylinderAnim.cw = false;
        cylinderAnim.animationTimer = 5.0; //动画时间 5sec转一周
        cylinderAnim.create();    //开始创建
        Utils.cylinderAnim = cylinderAnim;
    }
    else
    {
        //Utils.cylinderAnim.animationTimer = 100;
        //or
        Utils.cylinderAnim.delete();
        Utils.cylinderAnim = null;
    }
}

//物体自身旋转(spin) 
Utils.rotationEntity = function (mat, degX, degY, degZ, offsetHeight)
{
    let carto = mat.translation().toCartographic();
    carto.height += offsetHeight;
    let v3 = carto.toVector3();
    mat.setTranslation(v3);
    
    let rotX = SSmap.Quaternion.fromAxisAndAngle(SSmap.Vector3.create(1.0, 0, 0), degX).toRotationMatrix();
    let rotY = SSmap.Quaternion.fromAxisAndAngle(SSmap.Vector3.create(0, 1.0, 0), degY).toRotationMatrix();
    let rotZ = SSmap.Quaternion.fromAxisAndAngle(SSmap.Vector3.create(0, 0, 1.0), degZ).toRotationMatrix();

    let rotation = SSmap.Matrix3.multiply(rotX, rotY);
    rotation = SSmap.Matrix3.multiply(rotation, rotZ);

    let pos = SSmap.Vector3.create(0, 0, 0);
    let rotationMat = SSmap.Matrix4.fromRotationTranslation(rotation, pos);

    let matrix = SSmap.Matrix4.multiply(mat, rotationMat);
    return matrix;
}

//面物体
Utils.plane3d = null;
Utils.addPlane = function ()
{
    if (Utils.plane3d == null)
    {
        let plane = new SSmap.Plane3D();
        //plane.position = SSmap.Cartographic.fromDegrees(114.054, 22.5324, 500.0).toVector3(); 
        plane.position = SSmap.Vector3.create(-2.40226e+06, 5.38239e+06, 2.42898e+06);
        //plane.url = window.baseUrl + "symbols/images/cylinderimage.png"; 
        //plane.url = window.baseUrl + "symbols/images/balloon.gif";
        plane.width = 40.0;
        plane.height = 30.0;
        plane.mirror = true; //镜面
        plane.create();
        let planeEntity = plane.createEntity();

        //垂直
        //let matrix = Utils.rotationEntity(planeEntity.transform.matrix, 90, -90, 0, 10.0);
        //planeEntity.transform.matrix = matrix;
        //or 平放
        planeEntity.transform.cartographic = SSmap.Cartographic.fromDegrees(114.054, 22.5324, 50.0);

        planeEntity.parent = SSmap.Entity.root();
        Utils.plane3d = planeEntity;

        var p = SSmap.Cartographic.fromDegrees(114.0535242831173, 22.53218191247994, 60.54395066352315);
        window.scene.mainCamera.cameraController().flyToCartographic(p, 3, 53.6,  -4.32372, 0);
    }
    else
    {
        Utils.plane3d.delete();
        Utils.plane3d = null;
    }
}

//面动画
Utils.planeAnim = null;
Utils.addPlaneAnimation = function ()
{
    if (Utils.planeAnim == null)
    {
        let planeAnim = new SSmap.PlaneAnimation();
        planeAnim.position = SSmap.Cartographic.fromDegrees(114.054, 22.5324, 30.0).toVector3(); 
        planeAnim.url = window.baseUrl + "symbols/images/cylinderimage.png";
        planeAnim.width = 40.0;
        planeAnim.height = 30.0;
        planeAnim.textureScale = SSmap.Vector2.create(1.0, 1.0);
        planeAnim.cw = true;
        planeAnim.animationRun = true;
        planeAnim.animationTimer = 5.0;
        planeAnim.create();
        Utils.planeAnim = planeAnim;
    }
    else
    {
        Utils.planeAnim.delete();
        Utils.planeAnim = null;
    }
}

//金字塔物体
Utils.pyramid3d = null;
Utils.addPyramid = function ()
{
    if (Utils.pyramid3d == null)
    {
        let pyramid = new SSmap.Pyramid3D();
        pyramid.position = SSmap.Cartographic.fromDegrees(114.054, 22.5324, 30.0).toVector3(); 
        pyramid.color = SSmap.Color.fromRgb(0, 240, 0, 255);
        pyramid.width = 5.0;
        pyramid.length = 10.0;
        pyramid.height = 5.0;
        pyramid.create();

        let pyramidEntity = pyramid.createEntity();
        pyramidEntity.parent = SSmap.Entity.root();
        Utils.pyramid3d = pyramidEntity;
    }
    else
    {
        Utils.pyramid3d.delete();
        Utils.pyramid3d = null;
    }
}
//金字塔跳到动画
Utils.pyramidAnim = null;
Utils.addPyramidAnim = function ()
{
    if (Utils.pyramidAnim == null)
    {
        let pyramidAnim = new SSmap.PyramidAnimation();
        pyramidAnim.position = SSmap.Cartographic.fromDegrees(114.054, 22.5324, 30.0).toVector3(); 
        pyramidAnim.color = SSmap.Color.fromRgb(255, 240, 0, 255);
        pyramidAnim.width = 5.0;
        pyramidAnim.length = 10.0;
        pyramidAnim.height = 5.0;
        pyramidAnim.floatHeight = 10.0;
        pyramidAnim.create();

        Utils.pyramidAnim = pyramidAnim;
    }
    else
    {
        Utils.pyramidAnim.scale = SSmap.Vector3.create(5.0, 5.0, 2.0);;
        // Utils.pyramidAnim.delete();
        // Utils.pyramidAnim = null;
    }
}

//球形物体
Utils.sphere3d = null;
Utils.addSphere = function ()
{
    if (Utils.sphere3d == null)
    {
        let sphere = new SSmap.Sphere3D();
        sphere.radii = SSmap.Vector3.create(100.0, 100.0, 100.0);
        sphere.color = SSmap.Color.fromRgb(0, 255, 0, 255);
        sphere.position = SSmap.Cartographic.fromDegrees(114.054, 22.5324, 30.0).toVector3(); 
        sphere.create();

        let sphereEntity = sphere.createEntity();
        sphereEntity.parent = SSmap.Entity.root();
        Utils.sphere3d = sphereEntity;
    }
    else
    {
        Utils.sphere3d.delete();
        Utils.sphere3d = null;
    }
}

//球形动画
Utils.sphereAnim = null;
Utils.addSphereAnim = function ()
{
    if (Utils.sphereAnim == null)
    {
        let sphereAnim = new SSmap.SphereAnimation();
        sphereAnim.radii = SSmap.Vector3.create(100.0, 100.0, 100.0);
        sphereAnim.color = SSmap.Color.fromRgb(0, 255, 255, 255);
        sphereAnim.position = SSmap.Cartographic.fromDegrees(114.054, 22.5324, 30.0).toVector3(); 
        sphereAnim.maxScale = SSmap.Vector3.create(10.0, 10.0, 10.0);
        sphereAnim.create();

        Utils.sphereAnim = sphereAnim;
    }
    else
    {
        Utils.sphereAnim.delete();
        Utils.sphereAnim = null;
    }
}

Utils.arrow = null;
Utils.addArrow = function ()
{
    if (Utils.arrow == null)
    {
        let points = new SSmap.PointVector();
        points.push_back(SSmap.Vector3.create(-2.40121e+06, 5.38201e+06, 2.43086e+06));
        points.push_back(SSmap.Vector3.create(-2.402e+06, 5.38164e+06, 2.43091e+06));
        points.push_back(SSmap.Vector3.create(-2.40291e+06, 5.38123e+06, 2.43091e+06));

        let arrow = new SSmap.Arrow3D();
        arrow.width = 300.0;
        arrow.positions = points;
        arrow.type = SSmap.ArrowType.GenerateArrow;   // GenerateArrow MarchingArrow DoubleHeadedArrow
        arrow.extrudeEntity = 30.0;
        let arrowPoints = arrow.getArrow();     //计算箭头的多边形范围
        
        //用生成的箭头多边形, 创建贴地/绝对高度多边形
        var polygon3d = new SSmap.Polygon3D(); //创建画面对象
        polygon3d.color = SSmap.Color.fromRgb(255, 0, 0, 255);//颜色
        polygon3d.alpha = 0.5;      //透明度
        polygon3d.fillAlpha = 0.9;  //填充透明度
        polygon3d.setFillColor(SSmap.Color.fromRgb(240, 0, 0, 255)); //填充颜色

        //添加点
        let size = arrowPoints.size();
        for (let i = 0; i < size; i++)
        {
            polygon3d.addPoint(arrowPoints.get(i));
        }
        
        polygon3d.setAltitude(50);
        //polygon3d.setAltitudeMethod(SSmap.AltitudeMethod.Absolute); // Absolute / OnTerrain

        //polygon3d.fillMode = SSmap.FillMode.FillImage;             //设置填充方式 NoFill, FillColor, FillImage
        polygon3d.image = baseUrl + "symbols/images/bg.png";    //使用纹理贴图
        polygon3d.textureScale = SSmap.Vector2.create(10.0, 10.0);                         //纹理重复次数

        //默认的贴地模式有效. TerrainOnly: 覆盖地面 WholeScene: 覆盖范围内的所有场景
        //polygon3d.setSceneMode(SSmap.TextureProjectionSceneMode.TerrainOnly); 
        polygon3d.draw();   //绘制
        
        arrow.delete();
        arrowPoints.delete();
        Utils.arrow = polygon3d;
    }
    else
    {
        Utils.arrow.delete();
        Utils.arrow = null;
    }
}

//3d箭头(拉伸)
Utils.arrow3d = null;
Utils.addArrow3d = function ()
{
    if (Utils.arrow3d == null)
    {
        let points = new SSmap.PointVector();
        points.push_back(SSmap.Vector3.create(-2.40121e+06, 5.38201e+06, 2.43086e+06));
        points.push_back(SSmap.Vector3.create(-2.402e+06, 5.38164e+06, 2.43091e+06));
        points.push_back(SSmap.Vector3.create(-2.40291e+06, 5.38123e+06, 2.43091e+06));

        let arrow = new SSmap.Arrow3D();
        arrow.width = 300.0;            //箭头宽度, 根据传入的三个点的长度, 设置适当的宽度值
        arrow.positions = points;       //传入箭头的头, 中, 尾至少三个点
        arrow.extrudeHeight = 30.0;     //拉伸的高度
        arrow.type = SSmap.ArrowType.DoubleHeadedArrow;   // GenerateArrow MarchingArrow DoubleHeadedArrow
        arrow.color = SSmap.Color.fromRgb(0, 255, 0, 240);  //颜色
        arrow.create();     //计算箭头顶点, 法线, 纹理坐标

        let arrowEntity = arrow.createEntity();  //创建箭头物体
        arrowEntity.parent = SSmap.Entity.root();
        Utils.arrow3d = arrowEntity;

        arrow.delete();
    }
    else
    {
        Utils.arrow3d.delete();
        Utils.arrow3d = null;
    }
}


//墙体
Utils.wall3d = null;
Utils.addWall = function ()
{
    if (Utils.wall3d == null)
    {
        let points = new SSmap.PointVector();

        points.push_back(SSmap.Vector3.create(-2.40207e+06, 5.38164e+06, 2.43085e+06));
        points.push_back(SSmap.Vector3.create(-2.4021e+06, 5.38148e+06, 2.43141e+06));
        points.push_back(SSmap.Vector3.create(-2.40229e+06, 5.38131e+06, 2.43142e+06));
        points.push_back(SSmap.Vector3.create(-2.40249e+06, 5.38123e+06, 2.43139e+06));
        points.push_back(SSmap.Vector3.create(-2.40262e+06, 5.38113e+06, 2.43153e+06));
        points.push_back(SSmap.Vector3.create(-2.4027e+06, 5.38104e+06, 2.43161e+06));
        points.push_back(SSmap.Vector3.create(-2.40291e+06, 5.38095e+06, 2.43155e+06));

        let wall = new SSmap.Wall3D();
        wall.url = baseUrl + "symbols/images/flow.png";
        wall.positions = points;

        //统一高度
        //wall.minHeight = 10.0;
        //wall.maxHeight = 100.0;
        //or
        wall.extrudeHeight = 100.0; //拉伸高度
        wall.textureScale = SSmap.Vector2.create(3.0, 1.0);
        wall.create();

        let wallEntity = wall.createEntity();
        wallEntity.parent = SSmap.Entity.root();
        Utils.wall3d = wallEntity;
    }
    else
    {
        Utils.wall3d.delete();
        Utils.wall3d = null;
    }
}

//墙体动画
Utils.wallAnim = null;
Utils.addWallAnim = function ()
{
    if (Utils.wallAnim == null)
    {
        let points = new SSmap.PointVector();
        points.push_back(SSmap.Vector3.create(-2.40207e+06, 5.38164e+06, 2.43085e+06));
        points.push_back(SSmap.Vector3.create(-2.4021e+06, 5.38148e+06, 2.43141e+06));
        points.push_back(SSmap.Vector3.create(-2.40229e+06, 5.38131e+06, 2.43142e+06));
        points.push_back(SSmap.Vector3.create(-2.40249e+06, 5.38123e+06, 2.43139e+06));
        points.push_back(SSmap.Vector3.create(-2.40262e+06, 5.38113e+06, 2.43153e+06));
        points.push_back(SSmap.Vector3.create(-2.4027e+06, 5.38104e+06, 2.43161e+06));
        points.push_back(SSmap.Vector3.create(-2.40291e+06, 5.38095e+06, 2.43155e+06));

        let wallAnim = new SSmap.WallAnimation();
        wallAnim.color = SSmap.Color.fromRgb(255, 200, 0, 255);
        wallAnim.animationTimer = 0.5;      //0.5sec
        //wallAnim.url = baseUrl + "symbols/images/flow.png";
        wallAnim.animationType = SSmap.AnimationType.Flash;  //水平流动:HorizontalFlow 快速闪烁:Flash 渐变闪烁:Twinkle
        wallAnim.positions = points;
        //统一高度
        //wallAnim.minHeight = 10.0;
        //wallAnim.maxHeight = 100.0;
        //or
        wallAnim.extrudeHeight = 100.0;

        wallAnim.textureScale = SSmap.Vector2.create(3.0, 1.0);  
        wallAnim.create();

        Utils.wallAnim = wallAnim;
    }
    else
    {
        Utils.wallAnim.delete();
        Utils.wallAnim = null;
    }
}

//夜景
Utils.NightSceneModel = null;
Utils.nightScene = function()
{  
    if (Utils.NightSceneModel == null)
    {
        //let url = baseUrl + "data/nightScene/lighting/1.gltf";
        //let url = baseUrl + "data/nightScene/22/22.gltf";
        let url = baseUrl + "data/nightScene/0210/0210.gltf";
        //let url = baseUrl + "data/nightScene/ludeng-dian/ld.gltf";
        //let url = baseUrl + "data/nightScene/ludeng-juguang/ld.gltf";
        let pos = SSmap.Cartographic.fromDegrees(114.054677, 22.540567, 20);
        let rotation = SSmap.Vector3.create(0, 0, 0);
        let offset = SSmap.Vector3.create(0, 0, 0);
        let distance = SSmap.Vector2.create(1.0, 1e4);
    
        var model = Utils.modelLayer(url, pos, rotation, offset, distance);
        Utils.NightSceneModel = model;

        const viewer = GlobalViewer;
        let timeSystem = viewer.timeSystem;
        Utils.setTime(timeSystem, 18, 40);

        
        let postRender = window.globalViewer.renderSystem.postRendering();
        console.log("brightThreshold, bloomValue " + postRender.brightThreshold + postRender.bloomValue);
        //Utils.loadHDR();//添加夜晚HDR贴图
        window.globalViewer.renderSystem.postRendering().brightThreshold = 2.0; // default 2
        window.globalViewer.renderSystem.postRendering().bloomValue = 3.0;  // default 1 
        //or
        // let bjModel = new SSmap.Model(bjUrl);
        // let entity = new SSmap.Entity();
        // entity.addComponent(bjModel);
        // entity.transform.cartographic = SSmap.Cartographic.fromDegrees(114.054677, 22.540567, 20);
        // entity.parent = SSmap.Entity.root();
        // Utils.BJModel = entity;    
        
        var p = SSmap.Cartographic.fromDegrees(114.054677, 22.540567, 100);
        window.scene.mainCamera.cameraController().flyToCartographic(p, 3, 27.2361, -21.032, 0);
    }
    else
    {
        //Utils.BJModel.enabled = !Utils.BJModel.enabled;
        let timeSystem = GlobalViewer.timeSystem;
        Utils.setTime(timeSystem, 9, 0);

        window.globalViewer.renderSystem.postRendering().brightThreshold = 2.0; // default 2
        window.globalViewer.renderSystem.postRendering().bloomValue = 1.0;  // default 1 
        //如果之前是夜晚HDR，那么换白天的HDR贴图
        Utils.NightSceneModel.delete();
        Utils.NightSceneModel = null;
    }
}


Utils.BJModel = null;
Utils.loadBJ = function()
{  
    if (Utils.BJModel == null)
    {
        //let bjUrl = baseUrl + "futian_18square/fubao/models/FB_bujian.glb";
        //let bjUrl = baseUrl + "jrdd_gltf_20230719/03_glb/ft_bujian3(2018).glb"; 
        let bjUrl = baseUrl + "jrdd_gltf_20230719/03/ft_bujian3(2018)/ft_bujian3(2018).glb"; 
        let bjPos = SSmap.Cartographic.fromDegrees(114.05467,  22.54056, 10.5);
        let bjRotation = SSmap.Vector3.create(0, 0, 0);
        let bjoffset = SSmap.Vector3.create(0, 0, 0);
        let distance = SSmap.Vector2.create(1.0, 5e5);
    
        var bjModel = Utils.modelLayer(bjUrl, bjPos, bjRotation, bjoffset, distance);
        Utils.BJModel = bjModel;
   
        var p = SSmap.Cartographic.fromDegrees(114.05103, 22.50731, 1000.0);
        window.scene.mainCamera.cameraController().flyToCartographic(p, 3, 27.2361, -21.032, 0);
    }
    else
    {
        //Utils.BJModel.enabled = !Utils.BJModel.enabled;
        Utils.BJModel.delete();
        Utils.BJModel = null;
    }
}

Utils.terrainModel = null;
Utils.loadTerrain = function()
{
    if (Utils.terrainModel == null)
    {
        let modelUrl = baseUrl + "futian_18square/fubao/models/FB_dixing.glb";
        let modelPos = SSmap.Cartographic.fromDegrees(114.05467, 22.54056, 0.5);
        let modelRotation = SSmap.Vector3.create(0, 0, 0);
        let modeloffset = SSmap.Vector3.create(0, 0, 0);
        let distance = SSmap.Vector2.create(1.0, 1e4);
    
        var model = Utils.modelLayer(modelUrl, modelPos, modelRotation, modeloffset, distance, false);
        Utils.terrainModel = model;
   
        var p = SSmap.Cartographic.fromDegrees(114.047426, 22.5034446, 800);
        window.scene.mainCamera.cameraController().flyToCartographic(p, 3, 27.2361, -21.032, 0);
    }
    else
    {
        //Utils.BJModel.enabled = !Utils.BJModel.enabled;
        Utils.terrainModel.delete();
        Utils.terrainModel = null;
    }
}

Utils.treeModels = [null];
Utils.treeArray = [];
Utils.loadTrees = function()
{  
    let size = Utils.treeArray.length;
    if (size == 0)
    {
        let treeUrls = [
            "futian_18square/fubao/models/FB_shu_1.glb",
            "futian_18square/fubao/models/FB_shu_2.glb",
            "futian_18square/fubao/models/FB_shu_3.glb",
            "futian_18square/fubao/models/FB_shu_4.glb",
            "futian_18square/fubao/models/FB_shu_5.glb",
            "futian_18square/fubao/models/FB_shu_6.glb"        
        ];

        let treePos = SSmap.Cartographic.fromDegrees(114.054677, 22.540567, 0.5);
        let treeRotation = SSmap.Vector3.create(0, 0, 0);
        let treeoffset = SSmap.Vector3.create(0, 0, 0);
        let distance = SSmap.Vector2.create(1.0, 4e2);
        
        let size = treeUrls.length;

        for(let i = 0; i < size; i++)
        {
            let treeUrl = baseUrl + treeUrls[i];
            let treeModel = Utils.modelLayer(treeUrl, treePos, treeRotation, treeoffset, distance, true);
            Utils.treeArray.push(treeModel);
        }
    }
    else
    {
        for(let i = 0; i < size; i++)
        {
            Utils.treeArray[i].delete();
        }
        Utils.treeArray = [];
    }
}

Utils.treeEntity = null;
Utils.addSpeedTree = function()
{
    if(Utils.treeEntity == null)
    {
        console.log("load trees");
        let trees = new SSmap.Forest();
        trees.loadFromGeojson(window.baseUrl + "testdata/geojson/ft-point.geojson");
        //trees.loadFromGeojson(window.baseUrl + "futian_18square/trees/fb-trees.geojson");
        //trees.loadFromGeojson(window.baseUrl + "industrial_parks/Tree_w84.geojson");
        //trees.loadFromTree(window.baseUrl + "testdata/tree/SRT2/FPear3.gltf");
        //trees.loadFromTree(window.baseUrl + "testdata/tree/SRT4/FPear4.gltf");
        trees.loadFromTree(window.baseUrl + "testdata/tree/SugarMeple_SRT/SugarMaple.gltf", true);
        //trees.loadFromTree(window.baseUrl + "testdata/tree/zonglv/zhonglvshu.gltf");
        trees.scale = 0.2;
        trees.lod0 = 150;
        trees.lod1 = 500;
        trees.lod2 = 600;
        trees.lod3 = 800;

        let treeEntity = new SSmap.Entity();
        treeEntity.addComponent(trees);
        //treeEntity.parent = SSmap.Entity.root();
        //GlobalViewer.scene.addEntity(treeEntity);
        Utils.treeEntity = treeEntity;

        //Utils.flyTo(113.930397051, 22.6339379087, 100.0);
        Utils.flyTo(114.047426, 22.5034446, 800);
    }
    else
    {
        Utils.treeEntity.delete();
        Utils.treeEntity = null;
    }
}

Utils.objectUrls = [
    // "futian_18square/fubao/models/FB_xiaopin_1.glb",
    // "futian_18square/fubao/models/FB_xiaopin_2.glb",
    // "futian_18square/fubao/models/FB_xiaopin_3.glb",

    // "industrial_parks/Tree02_02/TREE_02_01.glb",
    // "industrial_parks/Tree06_04/Tree06_04.glb",
    "futian_18square/fubao/models/FB_shu_1.glb",
    "futian_18square/fubao/models/FB_shu_2.glb",
    "futian_18square/fubao/models/FB_shu_3.glb",
    "futian_18square/fubao/models/FB_shu_4.glb",
    "futian_18square/fubao/models/FB_shu_5.glb",
    "futian_18square/fubao/models/FB_shu_6.glb" 
];

Utils.tileObjectArray = [];
Utils.addTileObjects = function()
{
    console.log("tile instances");

    let size = Utils.tileObjectArray.length;
    if(size == 0 )
    {
        size = Utils.objectUrls.length;
        for( let i=0; i < size; i++ )
        {
            let tileOjb = new SSmap.TileObjects();
            tileOjb.transform.cartographic = SSmap.Cartographic.fromDegrees(114.054677, 22.540567, 0.5);
            //tileOjb.transform.cartographic = SSmap.Cartographic.fromDegrees(113.930397051, 22.6339379087, 0.0);
            tileOjb.parent = SSmap.Entity.root();
            tileOjb.cullDistance = 5000.0;
            tileOjb.level = 18;
            tileOjb.geometryError = 12;
            tileOjb.load(window.baseUrl + Utils.objectUrls[i]);
            Utils.tileObjectArray.push(tileOjb);
        }

        //Utils.flyTo(113.930397051, 22.6339379087, 100.0);
        Utils.flyTo(114.047426, 22.5034446, 800);
    }
    else
    {
        for( let i=0; i < size; i++ )
        {
            Utils.tileObjectArray[i].delete();
        }
        Utils.tileObjectArray = [];
    }
   
}

//添加一个模型动画
Utils.modelAnimation = null;
Utils.animator = null;
Utils.animatorCount = 1;
Utils.addModelAnmation = function()
{
    if(Utils.modelAnimation == null)
    {
        let modelUrl = baseUrl + "data/logo/logo.glb";
        let model = new SSmap.Model(modelUrl);
        
        model.readyPromise.then(function(){
            let animator = model.modelAnimation();
            if(animator != null)
            {
                Utils.animator = animator;
                console.log("animator");
            }
        });
        let entity = new SSmap.Entity();
        entity.addComponent(model);
        entity.transform.cartographic = SSmap.Cartographic.fromDegrees(114.054677, 22.540567, 20);
        entity.parent = SSmap.Entity.root();
        Utils.modelAnimation = entity;
        let carto = SSmap.Cartographic.fromDegrees(114.054677, 22.540567, 80.0); //SSmap.Vector3.create(-2.40017e+06, 5.38293e+06, 2.42986e+06).toCartographic();
        //carto.height += 100.0;
        Utils.flyToCarto(carto);
    }
    else
    {
        //test
        // Utils.modelAnimation.delete(); 
        // Utils.modelAnimation = null;
        //or

        if(Utils.animatorCount == 0)
            Utils.animator.loopCount = -1; //循环播放
        else
            Utils.animator.loopCount = 1; //播放一次
        console.log("clip count: " + Utils.animatorCount);
        Utils.animator.setCurrentClip(Utils.animatorCount); //切换动画片段
        Utils.animator.stop();
        Utils.animator.start(); //播放模型动画
        Utils.animatorCount++;
        Utils.animatorCount %= Utils.animator.clipCount;
    }
}


//加载HDR
// paul_lobe_haus_2k.hdr potsdamer_platz_2k.hdr  schadowplatz_2k.hdr
// skate_park_2k.hdr  urban_street_03_2k.hdr
Utils.loadHDR = function ()
{
    let indirectLight = window.scene.indirectLight; 
    indirectLight.intensity = 5000.0;  // 默认30000
    indirectLight.diffuseIntensity = 0.1;   //1.0
    indirectLight.specularIntensity = 0.1;   //1.0
    indirectLight.rotation = 120.0;    
    //indirectLight.loadFromUrl(baseUrl + "symbols/hdr/paul_lobe_haus_2k.hdr");
    //indirectLight.loadFromUrl(baseUrl + "symbols/hdr/clarens_night_02_2k.hdr"); //moonless_golf_2k.hdr hansaplatz_2k.hdr satara_night_2k.hdr
    //indirectLight.loadFromUrl(baseUrl + "symbols/hdr/hansaplatz_2k.hdr"); 
    //indirectLight.loadFromUrl(baseUrl + "symbols/hdr/satara_night_2k.hdr");
    indirectLight.loadFromUrl(baseUrl + "symbols/hdr/shanghai_bund_2k.hdr");
}

//AO参数
Utils.SSAO = function ()
{
    let ssao = window.globalViewer.renderSystem.ssao;
    ssao.quality = 2.0;    //0~3, default 2
    ssao.radius = 2.0;     //2.0
    ssao.amount = 2.2;     //2.2
    ssao.fadeIn = 0.657;     //0.657 
}


//轨迹动画(沿着轨迹运动), 有贴地和非贴地两种模式
Utils.trackAnimationEntity = null;
Utils.trackAnimation = null;
Utils.addTrackAnimation = function ()
{
    if (Utils.trackAnimationEntity == null)
    { 
        let carto = SSmap.Cartographic.fromDegrees(114.055648, 22.51339, 30.0); //SSmap.Vector3.create(-2.40017e+06, 5.38293e+06, 2.42986e+06).toCartographic();
        carto.height += 100.0;
        Utils.flyToCarto(carto);
        
        let points = new SSmap.PointVector();
        // points.push_back(SSmap.Vector3.create(-2.40017e+06, 5.38293e+06, 2.42986e+06));
        // points.push_back(SSmap.Vector3.create(-2.40097e+06, 5.38251e+06, 2.43001e+06));
        // points.push_back(SSmap.Vector3.create(-2.40156e+06, 5.38223e+06, 2.43002e+06));
        // points.push_back(SSmap.Vector3.create(-2.40204e+06, 5.38201e+06, 2.43004e+06));
        points.push_back(SSmap.Cartesian3.fromDegrees(114.055648, 22.51339, 30.0).toVector3());
        points.push_back(SSmap.Cartesian3.fromDegrees(114.054770, 22.51868, 400.0).toVector3());
        points.push_back(SSmap.Cartesian3.fromDegrees(114.051510, 22.52840, 500.00).toVector3());
        points.push_back(SSmap.Cartesian3.fromDegrees(114.044110, 22.54248, 30.0).toVector3());

        let trackAnim = new SSmap.TrackAnimation();
        //trackAnim.model = window.baseUrl + "testdata/models/dae/cars/hongseqiaoche.DAE";
        trackAnim.model = window.baseUrl + "testdata/models/gltf_glb/CesiumMilkTruck.glb";
        //trackAnim.geoJson = window.baseUrl + "testdata/geojson/test-polyline.geojson";
        //trackAnim.points = points;  //路径点
        //or 添加实时点
        trackAnim.addRealtimePoint(SSmap.Cartesian3.fromDegrees(114.05631, 22.51206, 20.0).toVector3());
        trackAnim.addRealtimePoint(SSmap.Cartesian3.fromDegrees(114.05605, 22.51270, 50.0).toVector3());
   
        trackAnim.altitudeOffset = 0.1;  //海拔补偿
        trackAnim.speed = 10.0;    //速度
        trackAnim.scale = SSmap.Vector3.create(10.0, 10.0, 10.0); //模型缩放
        trackAnim.clampedTerrain = false;    //是否贴地形? true: 贴地形 false: 使用点的海拔值
        trackAnim.helicopterMode = true;    //直升机模式, true:物体始终垂直与地面, false: 物体会根据前面的高度, 调整前进的角度
        trackAnim.setRotateX(90.0); //模型X轴旋转, 根据模型进行旋转
        trackAnim.setRotateZ(90.0); //模型Y轴旋转, 根据模型进行旋转
        trackAnim.componentComplete();
        Utils.trackAnimation = trackAnim;
        let entity = new SSmap.Entity();
        entity.addComponent(trackAnim);
        entity.parent = SSmap.Entity.root();
        Utils.trackAnimationEntity = entity;

        points.delete();
    }
    else
    {
        //Utils.trackAnimationEntity.delete();
        //Utils.trackAnimationEntity = null;
        //or 添加实时点
        Utils.trackAnimation.addRealtimePoint(SSmap.Cartesian3.fromDegrees(114.05585, 22.51316, 50.0).toVector3());
    }
}

//轨迹动画层(多轨迹动画)
Utils.trackAnimationLayer = null;
Utils.addTrackAnimationLayer = function ()
{
    if (Utils.trackAnimationLayer == null)
    {
        Utils.flyTo(114.055648, 22.51339, 100.0);
        
        let trackAnimationLayer = new SSmap.TrackAnimationLayer();
        //trackAnimationLayer.model = window.baseUrl + "testdata/models/dae/cars/hongseqiaoche.DAE";
        trackAnimationLayer.model = window.baseUrl + "testdata/models/gltf_glb/CesiumMilkTruck.glb";
        trackAnimationLayer.geoJson = window.baseUrl + "testdata/geojson/test-polyline.geojson";
        trackAnimationLayer.scale = 2.0;
        trackAnimationLayer.rotateX = 90.0;
        trackAnimationLayer.rotateY = 90.0;
        trackAnimationLayer.speed = 20.0;
        //trackAnimationLayer.altitudeOffset = 0.1; // 海拔修正, 补偿0.1米, 贴地模式使用较多
        trackAnimationLayer.componentComplete();

        let entity = new SSmap.Entity();
        entity.addComponent(trackAnimationLayer);
        entity.parent = SSmap.Entity.root();
        Utils.trackAnimationLayer = entity;
    }
    else
    {
        Utils.trackAnimationLayer.delete();
        Utils.trackAnimationLayer = null;
    }
}

//实时交通模拟
Utils.realtimeTracking = null;
Utils.addRealtimeTracking = function()
{
    if(Utils.realtimeTracking == null)
    {
        let url = window.baseUrl + "testdata/json/hist_vehicle_info_t=5_s=10.0_offline_v20231016.json";
        fetch(url).then((response)=>response.json()).then((data)=>{
            console.log(data.length);
            var tracksData = [];
            
            data.forEach(element => {
                let trackMap = new SSmap.TrackMap(); // TrackMap结构 (key, value), 有以下方法 size(), get(index), set(key, value), keys()
                for(key in element)
                {
                    //console.log(key, element[key]);
                    let elementData = element[key];
                    let routeArray = elementData.route;
                    let cartoVector = new SSmap.CartographicVector();
    
                    for( let i=0; i<routeArray.length; i++)
                    {
                        let route = routeArray[i];
                        let carto = SSmap.Cartographic.fromDegrees(
                                    parseFloat(route[0]),
                                    parseFloat(route[1]),
                                    0);
                        cartoVector.push_back(carto);
                    }

                    trackMap.set(key, {
                        type: parseInt(elementData.type),
                        name: key,
                        route: cartoVector
                    }); 
                }
                console.log(trackMap);
                tracksData.push(trackMap);
            });
            
            let modelList = new SSmap.StringVector();
            modelList.push_back(window.baseUrl + "data/car/XJC_YH.glb");
            modelList.push_back(window.baseUrl + "data/car/XHC_YH.glb");
            modelList.push_back(window.baseUrl + "data/car/PK_YH.glb");
            modelList.push_back(window.baseUrl + "data/car/JP_YH.glb");
            modelList.push_back(window.baseUrl + "data/car/XJC_YH.glb");
            
            GlobalViewer.renderSystem.antiAliasing = SSmap.AntiAliasing.FXAA; //SSmap.AntiAliasing.TAA 运动场景使用FXAA

            let realtimeTracking = new SSmap.RealtimeTracking();
            realtimeTracking.setModels(modelList);
            realtimeTracking.clampedTerrain = true; //是否贴地(本测试为交通模拟)
            realtimeTracking.scale = 1.0;   //模型的缩放比
            realtimeTracking.altitudeOffset = 0.05; //海拔补偿
            realtimeTracking.rotateX = 90;
            realtimeTracking.rotateY = 90;

            for(let i=0; i<tracksData.length; i++)
            {
                realtimeTracking.addTracking(tracksData[i], 5); //添加数据,  5: 持续时间5sec 
            }
            realtimeTracking.componentComplete();
    
            let entity = new SSmap.Entity();
            entity.addComponent(realtimeTracking);
            entity.parent = SSmap.Entity.root();
            Utils.realtimeTracking = entity;
        });
    }
    else
    {
        Utils.realtimeTracking.delete();
        Utils.realtimeTracking = null;
    }
}

//相机动画(加载max导出的路径)
Utils.cameraAnimation = null;
Utils.addCameraAnimation = function()
{
    if(Utils.cameraAnimation == null)
    {
        let cameraAnim = new SSmap.CameraAnimation();
        cameraAnim.add(window.baseUrl + "data/camAnim_glb/C02.glb",
                        SSmap.Cartographic.fromDegrees(114.0369, 22.551, 50.0),
                        SSmap.Vector3.create(0.0, 0.0, -90.0),
                        true);
        Utils.cameraAnimation = cameraAnim;
    }
    else
    {
        Utils.cameraAnimation.setRunning(!Utils.cameraAnimation.isRunning());
    }
}

//风向图
Utils.windLayer = null;
Utils.addWindLayer = function()
{
    if(Utils.windLayer == null)
    {
        let windLayer = new SSmap.WindLayer();
        windLayer.url = window.baseUrl + "testdata/json/netcdf.json";
        windLayer.create();
        Utils.windLayer = windLayer;
        GlobalViewer.scene.addEntity(windLayer);
    }
    else
    {
        Utils.windLayer.delete();
        Utils.windLayer = null;
    }
}

Utils.riverAnimation = null;
Utils.addRiverAnimation = function()
{
    if(Utils.riverAnimation == null)
    {
        let outer = new SSmap.Cartesian3Vector();
        let url = window.baseUrl + "data/rivers3.geojson";
        fetch(url).then((response)=>response.json()).then((json)=>{

            let pointArray = turf.coordAll(json.features[0]);
         
            for(var index in pointArray)
            {
                outer.push_back(SSmap.Cartesian3.fromDegrees(pointArray[index][0], pointArray[index][1], pointArray[index][2]));
            }
            let river = new SSmap.RiverAnimation();
            river.setOuter(outer);
            river.perPositionHeight = true;
            //river.animationRun = true; //播放动画, 默认true
            //river.loop = false; //循环播放动画, 默认true
            river.waterLevel = 20.0; //设置水面高度, 默认是传入点的最高值
            GlobalViewer.renderSystem.antiAliasing = SSmap.AntiAliasing.NoAA; //SSmap.AntiAliasing.TAA  TAA NoAA FXAA
            river.create();
            let material = river.material();
            let waterParam = material.waterParameters();
            waterParam.waterColor = SSmap.Color.fromRgb(0, 255, 0, 255);
            waterParam.flowAngle = 180; //0-360 水流角度
            waterParam.flowSpeed = 1.0; // 默认1.0 , 水流速度
            waterParam.bumpTilling = 5.0;// 默认3.0, 浪大小
            Utils.riverAnimation = river;
        })
        
    }
    else
    {
        GlobalViewer.renderSystem.antiAliasing = SSmap.AntiAliasing.TAA; 
        Utils.riverAnimation.delete();
        Utils.riverAnimation = null;
    }
}

Utils.polylineVolume = null;
Utils.addPolylineVolume = function()
{
    if(Utils.polylineVolume == null)
    {
        console.log("add polylinevolume");
        let shape = SSmap.GisUtil.computeCircle(10.0, 6);
        let shape1 = SSmap.GisUtil.computeCircle(10.0, 36);

        console.log("add PointVector");
        let positions = new SSmap.PointVector();
        positions.push_back(SSmap.Cartesian3.fromDegrees(114.05631, 22.51206, 20.0).toVector3());
        positions.push_back(SSmap.Cartesian3.fromDegrees(114.05631, 22.51270, 30.0).toVector3());
        let positions1 = new SSmap.PointVector();
        positions1.push_back(SSmap.Cartesian3.fromDegrees(114.05605, 22.51270, 20.0).toVector3());
        positions1.push_back(SSmap.Cartesian3.fromDegrees(114.05585, 22.51316, 30.0).toVector3());
        
        let segmentVector = new SSmap.VPolylineVolumeSegment();
     
        segmentVector.push_back({
            polyline : positions,
            color : SSmap.Color.fromRgb(0, 255, 0, 255),
            sharpId : 0,
            tag : "Pipe_0"
        });

        segmentVector.push_back({
            polyline : positions1,
            color : SSmap.Color.fromRgb(0, 0, 255, 255),
            sharpId : 1,
            tag : "Pipe_1"
        });
        console.log("segmentVector size: " + segmentVector.size());


        let polylineVolume = new SSmap.PolylineVolume();
        
        polylineVolume.addShape(10.0, 6, false);    //radius: 半径, subdivision:段数, replace:是否替换
        polylineVolume.addShape(10.0, 36, false);
        polylineVolume.addShape(shape, false);      //shape: 二维面, replace:是否替换
        polylineVolume.addShape(shape1, false);

        polylineVolume.addVector(segmentVector);//添加多个管段 (一个连续的线数据是一个段)
        //or 添加单个段
        // polylineVolume.add({
        //     polyline : positions,
        //     color : SSmap.Color.fromRgb(0, 255, 0, 255),
        //     sharpId : 0,
        //     tag : "Pipe_0"
        // });
        // polylineVolume.add({
        //     polyline : positions1,
        //     color : SSmap.Color.fromRgb(0, 0, 255, 255),
        //     sharpId : 1,
        //     tag : "Pipe_1"
        // });
        polylineVolume.create();

    }
    else
    {
        Utils.polylineVolume.delete();
        Utils.polylineVolume = null;
    }
}

Utils.drainwell = null;
Utils.addDrainwell = function()
{
    if(Utils.drainwell == null)
    {
        console.log("add drainwell");
        let drainwell = new SSmap.Drainwell();
        let vdp = new SSmap.VDrainwellPart();

        for(let i=0; i<3; i++)
        {
            // let drainwellPart = new SSmap.DrainwellPart();
            // drainwellPart.color = SSmap.Color.fromRgb( Math.random() * 255,
            //                                            Math.random() * 255, 
            //                                            Math.random() * 255, 
            //                                            255);
            // drainwellPart.height = 100.0;
            // drainwellPart.position = SSmap.Cartesian3.fromDegrees(
            //     114.05 + Math.random() / 100.0,
            //     22.51 + Math.random() / 100.0,
            //     20.0
            // ).toVector3();
            // drainwellPart.shapeIndex = (Math.random() * 100) % 2; 
            // drainwellPart.tag = "drainwell_" + i;
            // vdp.push_back(drainwellPart);
            vdp.push_back({
                position : SSmap.Cartesian3.fromDegrees(
                    114.05 + Math.random() / 100.0,
                    22.51 + Math.random() / 100.0,
                    20.0).toVector3(),
                height : 100.0,
                color : SSmap.Color.fromRgb( Math.random() * 255,
                                                       Math.random() * 255, 
                                                       Math.random() * 255, 
                                                       255),
                shapeIndex : (Math.random() * 100) % 3, //这里测试使用了三种外形
                tag : "drainwell_" + i
            });
        }

        console.log("vpd size: "+vdp.size());
        console.log(vdp.get(0).tag);

        let extriorRing = new SSmap.VVector2();
        extriorRing.push_back(SSmap.Vector2.create(-10, -8));
        extriorRing.push_back(SSmap.Vector2.create(10, -8));
        extriorRing.push_back(SSmap.Vector2.create(10, 8));
        extriorRing.push_back(SSmap.Vector2.create(-10, 8));
        console.log("ext ring szie" + extriorRing.size());

        let interiorRing = new SSmap.VVector2();
        interiorRing.push_back(SSmap.Vector2.create(-9, -7));
        interiorRing.push_back(SSmap.Vector2.create(9, -7));
        interiorRing.push_back(SSmap.Vector2.create(9, 7));
        interiorRing.push_back(SSmap.Vector2.create(-9, 7));
        console.log("interior ring szie" + interiorRing.size());

        drainwell.addShape(10.0, 8.0, 36, false); //外径10米, 内径8米, 正36面管井(类似圆)
        drainwell.addShape(8.0, 6.0, 6, false); //外径10米, 内径8米, 正6面体管井
        drainwell.addShape(extriorRing, interiorRing, false);  //添加一个长方体管井
        //添加一个数据
        drainwell.add({
            position : SSmap.Cartesian3.fromDegrees(
                114.05 + Math.random() / 100.0,
                22.51 + Math.random() / 100.0,
                20.0).toVector3(),
            height : 100.0,
            color : SSmap.Color.fromRgb( Math.random() * 255,
                                                   Math.random() * 255, 
                                                   Math.random() * 255, 
                                                   255),
            shapeIndex : (Math.random() * 100) % 3, //这里测试使用了三种外形
            tag : "drainwell_" + 3
        });
        drainwell.addVector(vdp); //添加多个数据
        drainwell.create();
    }
    else
    {
        Utils.drainwell.delete();
        Utils.drainwell = null;
    }
}

Utils.pipeUrls = [
    "BigData/GW/JL_LINE/tileset.json",
    "BigData/GW/JL_POINT/tileset.json",
    "BigData/GW/WS_LINE/tileset.json",
    "BigData/GW/WS_POINT/tileset.json",
    "BigData/GW/YS_LINE/tileset.json",
    "BigData/GW/YS_POINT/tileset.json"
];
Utils.pipeEntity = [];
Utils.addPipeTest = function()
{
    if(Utils.pipeEntity.length == 0 )
    {
        let size = Utils.pipeUrls.length;
        for(let i=0; i<size; i++)
        {
            Utils.pipeEntity.push(Utils.load3DTiles(baseUrl + Utils.pipeUrls[i]));
        }
    }
    else
    {
        let size = Utils.pipeEntity.length;
        for( let i=0; i<size; i++)
        {
            Utils.pipeEntity[i].delete();
        }
        Utils.pipeEntity = [];
    }
    let camera = window.scene.mainCamera;
    let p = SSmap.Cartographic.fromDegrees(114.05111134125728, 22.503346206666585, 296);
    camera.cameraController().flyToCartographic(p, 3, 354.8219159456377, -10.9018048007765510, 0);
}


Utils.videoTest = function() {
    let video = document.createElement("video");
    //video.src = baseUrl + "/data/mp4/trailer.mp4";
    video.src = baseUrl + "/testdata/video/crossing.mp4";
    video.width = 854;
    video.height = 480;
    video.autoplay = "autoplay";//自动播放

    let canvas = document.createElement("canvas");
    canvas.width = 854;
    canvas.height = 480;
    let context = canvas.getContext("2d");

    let texImage = new SSmap.TextureImage();
    texImage.width = 854;
    texImage.height = 480;
    texImage.mipLevels = 1;
    texImage.layers = 1;
    texImage.autoMipMaps = false;
    texImage.pixelType = SSmap.PixelType.UInt8;//贴图的像素类型
    texImage.pixelFormat = SSmap.PixelFormat.RGBA;   //RGBA  BGRA

    window.textureProjection = new SSmap.TextureProjection();
    window.textureProjection.blendMode = SSmap.TextureProjectionBlendMode.AlphaBlend;
    window.textureProjection.projectionType = SSmap.TextureProjectionType.Perspective
    window.textureProjection.width = 8.54;
    window.textureProjection.height = 4.8;
    window.textureProjection.nearPlane = 1;
    window.textureProjection.farPlane = 1000.0;//距离
    window.textureProjection.showFrustum = true;
    window.textureProjection.textureFlip = true;
    window.textureProjection.fov = 75;
    window.textureProjection.aspect  = 1.5;

    let tex = new SSmap.Texture();
    tex.addTextureImage(texImage);
    let entity = new SSmap.Entity();//存放投影
    entity.objectName = "video";
           
    window.textureProjection.texture = tex;
    entity.addComponent(window.textureProjection);
    
    const carto = SSmap.Cartographic.fromDegrees(114.054, 22.5324, 500.0);
    const target = SSmap.Cartesian3.fromDegrees(114.054, 22.5324, 0.0).toVector3();
    entity.transform.cartographic = carto;
    entity.transform.lookAt(target);
    entity.parent = SSmap.Entity.root();

    GlobalViewer.renderSystem.antiAliasing = SSmap.AntiAliasing.NoAA; //TAA:动态反锯齿(正常模式) NoAA:无反锯齿(视频播放时) FXAA:运动场景使用, 不同使用场景需要进行切换 
    GlobalViewer.addEventListener("update", function (dt) {
        context.drawImage(video, 0, 0, 854.0, 480.0);
        const imgData = context.getImageData(0, 0, 854.0, 480.0).data;
        texImage.setData(imgData, 4, false);
    });      
}

//键盘事件 keydown
document.onkeydown=function(event){
    var e = event || window.event || arguments.callee.caller.arguments[0];
    console.log(e.key);
    //if (e && e.keyCode == 71)// 按键G
    // if(e && (e.key == "g" || e.key == "G"))
    // { 
    //     Utils.GeoJsonBillboards.setIconEnabled(1, true);    //密接显示
    //     Utils.GeoJsonBillboards.setIconEnabled(2, true);    //次密接显示
    // }
    if(Utils.videoCorrection == null)
        return;

    switch(e.key)
    {
        case "F1":
        {
            let tl = Utils.videoCorrection.topLeft;
            Utils.videoCorrection.topLeft = SSmap.Vector2.create(tl.x - 0.01, tl.y);
            break;
        }
        case "F2":
        {
            let tl = Utils.videoCorrection.topLeft;
            Utils.videoCorrection.topLeft = SSmap.Vector2.create(tl.x + 0.01, tl.y);
            break;
        }
        case "F3":
        {
            let tr = Utils.videoCorrection.topRight;
            Utils.videoCorrection.topRight = SSmap.Vector2.create(tr.x - 0.01, tr.y);
            break;
        }
        case "F4":
        {
            let tr = Utils.videoCorrection.topRight;
            Utils.videoCorrection.topRight = SSmap.Vector2.create(tr.x + 0.01, tr.y);
            break;
        }
        //bottomLeft bottomRight
        case "+":
        {
            Utils.videoCorrection.constrast += 0.01;
            console.log(Utils.videoCorrection.constrast);
            break;
        }
        case "-":
        {
            Utils.videoCorrection.constrast -= 0.01;
            console.log(Utils.videoCorrection.constrast);
            break;
        }
        case ">":
        {
            Utils.videoCorrection.saturation += 0.01;
            console.log(Utils.videoCorrection.saturation);
            break;
        }
        case "<":
        {
            Utils.videoCorrection.saturation -= 0.01;
            console.log(Utils.videoCorrection.saturation);
            break;
        }
        case "PageUp":
        {
            Utils.videoCorrection.brightness += 0.01;
            console.log(Utils.videoCorrection.brightness);
            break;
        }
        case "PageDown":
        {
            Utils.videoCorrection.brightness -= 0.01;
            console.log(Utils.videoCorrection.brightness);
            break;
        }
        case "a":
        {
            let angle = Utils.videoCorrection.angle;
            Utils.videoCorrection.angle = angle + 1.0;
            console.log(Utils.videoCorrection.angle);
            break;
        }
        case "b":
        {
            let angle = Utils.videoCorrection.angle;
            Utils.videoCorrection.angle = angle - 1.0;
            console.log(Utils.videoCorrection.angle);
            break;
        }
        case "c":
        {
            Utils.videoCorrection.useMask = !Utils.videoCorrection.useMask;
            console.log(Utils.videoCorrection.useMask);
            break;
        } 
        case "e":
        {
            Utils.videoCorrection.border -= 1;
            console.log(Utils.videoCorrection.border);
            break;
        } 
        case "f":
        {
            Utils.videoCorrection.border += 1;
            console.log(Utils.videoCorrection.border);
            break;
        }
        default:
            return; // 什么都没按就退出吧。
        
    }
    e.preventDefault();
};

Utils.videoCorrection = null;
Utils.videoCorrectionTest = function(){
    if(Utils.videoCorrection == null)
    {
        let video = document.createElement("video");
        //video.src = baseUrl + "/data/mp4/trailer.mp4";
        video.src = baseUrl + "/testdata/video/crossing.mp4";
        video.width = 854;
        video.height = 480;
        video.autoplay = "autoplay";//自动播放
        video.loop = true;
    
        let canvas = document.createElement("canvas");
        canvas.width = 854;
        canvas.height = 480;
        let context = canvas.getContext("2d");
    
        let texImage = new SSmap.TextureImage();
        texImage.width = 854;
        texImage.height = 480;
        texImage.mipLevels = 1;
        texImage.layers = 1;
        texImage.autoMipMaps = false;
        texImage.pixelType = SSmap.PixelType.UInt8;//贴图的像素类型
        texImage.pixelFormat = SSmap.PixelFormat.RGBA;  //BGRA  RGBA
    
        window.textureProjection = new SSmap.TextureProjection();
        window.textureProjection.blendMode = SSmap.TextureProjectionBlendMode.AlphaBlend;
        window.textureProjection.projectionType = SSmap.TextureProjectionType.Orthographic  //Orthographic Perspective
        window.textureProjection.width = 854;
        window.textureProjection.height = 480;
        window.textureProjection.nearPlane = 1;
        window.textureProjection.farPlane = 1000.0;//距离
        window.textureProjection.showFrustum = true;  //显示视锥体
        window.textureProjection.textureFlip = false;
        window.textureProjection.fov = 75;
        window.textureProjection.aspect  = 1.5;
    
        const tex = new SSmap.Texture();
        tex.addTextureImage(texImage);
        let videoCorrection = new SSmap.VideoCorrection();
        videoCorrection.setSourceTexture(tex);
        //videoCorrection.parent = SSmap.Entity.root();
        Utils.videoCorrection = videoCorrection;
  
        let destinationTexture = videoCorrection.destinationTexture();     
        window.textureProjection.texture = destinationTexture;
        
        //or
        //window.textureProjection.texture = tex;

        let entity = new SSmap.Entity();//存放投影
        entity.objectName = "video";
        entity.addComponent(window.textureProjection);
        window.textureProjectionEntity = entity;
        
        const carto = SSmap.Cartographic.fromDegrees(114.054, 22.5324, 500.0);
        const target = SSmap.Cartesian3.fromDegrees(114.054, 22.5324, 0.0).toVector3();
        entity.transform.cartographic = carto;
        entity.transform.lookAt(target);
        entity.parent = SSmap.Entity.root();
    
        GlobalViewer.renderSystem.antiAliasing = SSmap.AntiAliasing.NoAA; //TAA:动态反锯齿(正常模式) NoAA:无反锯齿(视频播放时) FXAA:运动场景使用, 不同使用场景需要进行切换 
        window.eventListenerUpdate = GlobalViewer.addEventListener("update", function (dt) {
            context.drawImage(video, 0, 0, 854.0, 480.0);
            const imgData = context.getImageData(0, 0, 854.0, 480.0).data;
            texImage.setData(imgData, 4, false);
        }); 
    }
    else
    {
        GlobalViewer.renderSystem.antiAliasing = SSmap.AntiAliasing.TAA;
        GlobalViewer.removeEventListener(window.eventListenerUpdate);
        
        Utils.videoCorrection.delete();
        Utils.videoCorrection = null;
        window.textureProjectionEntity.delete();
    }

}

//等值线/等值面
Utils.contourLayer = null;
Utils.contourLayerTest = function(){
    if(Utils.contourLayer == null)
    {
        let contourLayer = new SSmap.ContourLayer();
        contourLayer.geoJson = window.baseUrl + "data/litedata/ca-transit-stops.geojson";
        contourLayer.cellSize = 1000; //网格大小, 范围1-1000, 单位米
        //contourLayer.geoJson = window.baseUrl + "data/futian-point.geojson";
        //contourLayer.cellSize = 200;
        let vd1 = new SSmap.Vdouble();
        vd1.push_back(1.0);
        //阈值参数 1: 线宽 2: 颜色 3: 阈值(一个值生成等值线, 两个值生成等值面)
        contourLayer.setThreshold(vd1, 4, SSmap.Color.fromRgb(255, 0, 0, 255));
        let vd2 = new SSmap.Vdouble();
        vd2.push_back(5.0);
        contourLayer.setThreshold(vd2, 4, SSmap.Color.fromRgb(0, 255, 0, 255));
        let vd3 = new SSmap.Vdouble();
        vd3.push_back(6.0);
        vd3.push_back(10.0);
        contourLayer.setThreshold(vd3, 4, SSmap.Color.fromRgb(0, 0, 255, 255) );
        contourLayer.create();
        Utils.contourLayer = contourLayer;

        vd1.delete();
        vd2.delete();
        vd3.delete();

        // ca-transit
        let camera = window.scene.mainCamera;
        camera.flyTo(
            SSmap.Cartographic.fromDegrees(-116.676999, 32.429834, 57552)
          );
    }
    else
    {
        Utils.contourLayer.delete();
        Utils.contourLayer = null;
    }
}

//以下部分为粒子效果

//创建粒子效果
Utils.createParticle = function (lonlat, options) {
    // emitter
    var emitter = new SSmap.ParticleEmitter();
    emitter.shapeType = options.shapeType;
    emitter.shapeSize = options.shapeSize;
    emitter.fillShape = options.fillShape;
    emitter.size = options.size;
    emitter.endSize = options.endSize;
    emitter.sizeVariation = options.sizeVariation;
    emitter.emitRate = options.emitRate;
    emitter.lifeSpan = options.lifeSpan;

    // velocity
    var vec = new SSmap.ParticlePointDirection();
    vec.x = options.velocity[0];
    vec.y = options.velocity[1];
    vec.z = options.velocity[2];
    vec.xVariation = options.velocityVariation[0];
    vec.yVariation = options.velocityVariation[1];
    vec.zVariation = options.velocityVariation[2];
    emitter.velocity = vec;

    // acceleration
    var acc = new SSmap.ParticlePointDirection();
    acc.x = options.acceleration[0];
    acc.y = options.acceleration[1];
    acc.z = options.acceleration[2];
    acc.xVariation = options.accelerationVariation[0];
    acc.yVariation = options.accelerationVariation[1];
    acc.zVariation = options.accelerationVariation[2];
    emitter.acceleration = acc;

    // renderer
    var renderer = new SSmap.ImageParticleRenderer();
    renderer.color = options.color;
    renderer.colorVariation = options.colorVariation;
    renderer.alpha = options.alpha;
    renderer.alphaVariation = options.alphaVariation;
    renderer.alignedAxis = options.alignedAxis;
    renderer.blendMode = options.blendMode;
    renderer.image = window.baseUrl + options.image;

    // particle
    var particleSystem = new SSmap.ParticleSystem();
    particleSystem.addEmitter(emitter);
    particleSystem.addRenderer(renderer);

    // entity
    var entity = new SSmap.Entity();
    entity.transform.cartographic = lonlat;
    entity.addComponent(particleSystem);
    GlobalViewer.scene.addEntity(entity);

    return particleSystem;
}

//火
Utils.addFire = function ()
{
    // create fire
    Utils.createParticle(
    SSmap.Cartographic.fromDegrees(114.054494, 22.540745, 30),
    {
        shapeType: SSmap.ParticleShapeType.Rectangle, // [Line, Rectangle, Ellipse]
        shapeSize: SSmap.Vector2.create(40, 20),
        fillShape: true,
        emitRate: 200,
        lifeSpan: 4000,
        size: SSmap.Vector2.create(16, 16),
        endSize: SSmap.Vector2.create(2, 2),
        sizeVariation: SSmap.Vector2.create(0, 0),
        velocity: [0, 0, 0],
        velocityVariation: [1, 1, 0],
        acceleration: [0, 0, 8],
        accelerationVariation: [1, 1, 0],
        alignedAxis: SSmap.Vector3.create(0, 0, 0),
        blendMode: SSmap.ParticleBlendMode.NormalBlend,   //NormalBlend   AdditiveBlend
        //color: SSmap.Color.fromRgbF(1, 0.25, 0.06, 1),
        color: SSmap.Color.fromRgb(254, 138, 73, 255),
        colorVariation: 0.1,
        alpha: 0.35,
        alphaVariation: 0.1,
        image: "symbols/particle/glowdot2.png", //glowdot.png"
    });
}

//烟
Utils.addSmoke = function ()
{
    // create white/gray/black smoke
    Utils.createParticle(
    SSmap.Cartographic.fromDegrees(114.054494, 22.540745, 30),
    {
        shapeType: SSmap.ParticleShapeType.Rectangle, // [Line, Rectangle, Ellipse]
        shapeSize: SSmap.Vector2.create(40, 20),
        fillShape: true,
        emitRate: 120,
        lifeSpan: 10000,
        size: SSmap.Vector2.create(8, 8),
        endSize: SSmap.Vector2.create(35, 35),
        sizeVariation: SSmap.Vector2.create(6, 6),
        velocity: [0.5, 0.5, 0.2],
        velocityVariation: [2, 2, 0],
        acceleration: [1, 1, 4],
        accelerationVariation: [1, 1, 1],
        alignedAxis: SSmap.Vector3.create(0, 0, 0),
        blendMode: SSmap.ParticleBlendMode.NormalBlend,
        //color: SSmap.Color.fromRgb(50, 50, 50, 255), //灰烟
        color: SSmap.Color.fromRgb(25, 25, 25, 255), //黑烟
        //color: SSmap.Color.fromRgbF(1, 1, 1, 1),  //白烟
        colorVariation: 0,
        alpha: 0.15, //0.4
        alphaVariation: 0.05,
        image: "symbols/particle/smoke.png",
    });
}

//水柱
Utils.addWater = function ()
{
    // create water
    Utils.createParticle(
    SSmap.Cartographic.fromDegrees(114.054, 22.540755, 30),
    {
        shapeType: SSmap.ParticleShapeType.Ellipse, // [Line, Rectangle, Ellipse]
        shapeSize: SSmap.Vector2.create(1, 1),
        fillShape: true,
        emitRate: 1200,
        lifeSpan: 1500,
        size: SSmap.Vector2.create(1, 1),
        endSize: SSmap.Vector2.create(3, 3),
        sizeVariation: SSmap.Vector2.create(0, 0),
        velocity: [15, 0, 0],
        velocityVariation: [0, 0, 1.2],
        acceleration: [20, 0, 0],
        accelerationVariation: [0, 0, 0.5],
        alignedAxis: SSmap.Vector3.create(1, 0, 0),
        blendMode: SSmap.ParticleBlendMode.AdditiveBlend,
        color: SSmap.Color.fromRgb(220, 235, 255, 255),
        colorVariation: 0,
        alpha: 0.8,
        alphaVariation: 0,
        image: "symbols/particle/pressuriseWater.png",
    });
}

//雨
Utils.addRain = function ()
{
    console.log("create rain");
    Utils.createParticle(
        SSmap.Cartographic.fromDegrees(114.054494, 22.541745, 1500),
        {
            shapeType: SSmap.ParticleShapeType.Ellipse, // [Line, Rectangle, Ellipse]
            shapeSize: SSmap.Vector2.create(10000, 8000),
            fillShape: true,
            emitRate: 5000,
            lifeSpan: 3000,
            size: SSmap.Vector2.create(12, 30),
            endSize: SSmap.Vector2.create(12, 30),
            sizeVariation: SSmap.Vector2.create(2, 6),
            velocity: [0, 0, -400],
            velocityVariation: [1, 1, 0],
            acceleration: [0, 0, -300],
            accelerationVariation: [1, 1, 0],
            alignedAxis: SSmap.Vector3.create(0.1, 0.1, 1),
            blendMode: SSmap.ParticleBlendMode.AdditiveBlend,
            color: SSmap.Color.fromRgb(220, 235, 255, 255),
            colorVariation: 0,
            alpha: 0.6,
            alphaVariation: 0.2,
            image: "symbols/particle/rain.png",
        });
}

//雪
Utils.addSnow = function ()
{
    console.log("create snow");
    Utils.createParticle(
        SSmap.Cartographic.fromDegrees(114.054494, 22.541745, 1000),
        {
            shapeType: SSmap.ParticleShapeType.Ellipse, // [Line, Rectangle, Ellipse]
            shapeSize: SSmap.Vector2.create(5000, 3000),
            fillShape: true,
            emitRate: 1300,
            lifeSpan: 35000,
            size: SSmap.Vector2.create(3, 3),
            endSize: SSmap.Vector2.create(3, 3),
            sizeVariation: SSmap.Vector2.create(1, 1),
            velocity: [0, 0, -2],
            velocityVariation: [2, 2, 0],
            acceleration: [0, 0, -2],
            accelerationVariation: [1, 1, 0],
            alignedAxis: SSmap.Vector3.create(0, 0, 0),
            blendMode: SSmap.ParticleBlendMode.AdditiveBlend,
            color: SSmap.Color.fromRgb(255, 255, 255, 255),
            colorVariation: 0,
            alpha: 0.8,
            alphaVariation: 0.0,
            image: "symbols/particle/snow.png",
        });
}

//雾
Utils.addFog = function ()
{
    console.log("create fog");
    Utils.createParticle(
        SSmap.Cartographic.fromDegrees(114.054494, 22.541745, 50),
        {
            shapeType: SSmap.ParticleShapeType.Ellipse, // [Line, Rectangle, Ellipse]
            shapeSize: SSmap.Vector2.create(540, 400),
            fillShape: true,
            emitRate: 1400,
            lifeSpan: 10000,
            size: SSmap.Vector2.create(12, 12),
            endSize: SSmap.Vector2.create(12, 12),
            sizeVariation: SSmap.Vector2.create(5, 5),
            velocity: [0.2, 0.2, 0.2],
            velocityVariation: [0.2, 0.2, 0.2],
            acceleration: [0.5, 0.5, -0.8],
            accelerationVariation: [1, 1, 1],
            alignedAxis: SSmap.Vector3.create(0, 0, 0),
            blendMode: SSmap.ParticleBlendMode.AdditiveBlend,
            color: SSmap.Color.fromRgb(180, 180, 180, 255),
            colorVariation: 0,
            alpha: 0.08,
            alphaVariation: 0.0,
            image: "symbols/particle/smoke.png",
        });
}

//以下部分为后期特效功能

//扩散
Utils.addDiffusion =  function() {
    const shaderCode = `#version 300 es
        precision highp float;
        precision highp sampler2D;

        layout(location = 0) out vec4 FragColor;

        in vec2 v_textureCoordinates;

        uniform sampler2D colorTexture;       // 内置颜色缓存
        uniform sampler2D depthTexture;       // 内置深度缓存
        uniform mat4 inverseViewMatrix;       // 内置变量(ViewSpace->WorldSpace)
        uniform vec4 nearPlanes;              // 内置变量(近面视口坐标L,B,R,T)
        
        uniform vec4 u_scanColor;           //扫描颜色
        uniform vec3 centerEC;              //中心
        uniform float u_radius;             //扫描半径
        uniform float u_alpha;              //透明度

        vec3 computePositionEC(vec2 uv, float depth)
        {
            vec3 pos = vec3(mix(nearPlanes.xy, nearPlanes.zw, uv), -1.0);
            return pos * depth;
        }

        void main()
        {
            vec2 uv = v_textureCoordinates;

            float depth = texture(depthTexture, uv).x;
            vec3 positionEC = computePositionEC(uv, depth);
            
            float dist = length(positionEC - centerEC); 
            vec4 color = texture(colorTexture, uv);
     
            if(dist < u_radius)
            {
                float factor =  dist / u_radius;
                factor = pow(factor, 2.0);
                //float factor = 1.0 -abs(u_radius - dist) / u_radius;
                FragColor = mix(color, u_scanColor, factor * u_alpha);
            }
            else
                FragColor = color;
        }
    `;

    const material = new SSmap.Material(); //测试, 正式使用需要保存起来, 关闭时要删除

    let keys = new SSmap.StringVector();
    //keys.push_back("key1"); //为shader添加定义
    material.shaderProgram = SSmap.ShaderProgram.createViewportQuadShader(shaderCode, keys);
    keys.delete();

    const postProcess = new SSmap.PostProcess(); //测试, 正式使用需要保存起来, 关闭时要删除
    postProcess.material = material;
    material.setParameterColor("u_scanColor", SSmap.Color.fromRgb(205, 130, 5, 255));
    GlobalViewer.renderSystem.addPostProcess(postProcess);
    const maxRadius = 2000.0;
    const duration = 2.0;
    
    var timer = 0.0;
    var alpha = 0.0;
    GlobalViewer.addEventListener("update", function (dt) {
        const viewMatrix = GlobalViewer.scene.mainCamera.viewMatrix();
        const center = SSmap.Matrix4.multiplyByVector3(
            viewMatrix,
            SSmap.Cartesian3.fromDegrees(114.054494, 22.540745, 10).toVector3());
        
        timer += dt;
        if (timer > duration)
            timer %= duration;
        
        if (timer > (duration * 0.6)) {
            alpha = 1.0 - timer / duration + 0.2;
        }
        else
            alpha = 1.0;
        
        let radius = (timer / duration) * maxRadius;
        material.setParameterVec3("centerEC", center);
        material.setParameterFloat("u_radius", radius);
        material.setParameterFloat("u_alpha", alpha);
    });
}

//水波纹
Utils.addWaterWava =  function() {
    const shaderCode = `#version 300 es
        precision highp float;
        precision highp sampler2D;

        layout(location = 0) out vec4 FragColor;

        in vec2 v_textureCoordinates;

        uniform sampler2D colorTexture;       // 内置颜色缓存
        uniform sampler2D depthTexture;       // 内置深度缓存
        uniform mat4 inverseViewMatrix;       // 内置变量(ViewSpace->WorldSpace)
        uniform vec4 nearPlanes;              // 内置变量(近面视口坐标L,B,R,T)
        
        uniform vec4 u_scanColor;           //扫描颜色
        uniform vec3 centerEC;              //中心
        uniform float u_maxRadius;          //扫描最大半径
        uniform float u_alpha;              //透明度
        uniform float czm_frameNumber;

        vec3 computePositionEC(vec2 uv, float depth)
        {
            vec3 pos = vec3(mix(nearPlanes.xy, nearPlanes.zw, uv), -1.0);
            return pos * depth;
        }

        void circle(out vec4 color, float dist, float diff)
        {
            float radius = fract((czm_frameNumber - diff) / 60.0) * u_maxRadius;
            if(dist < radius)
            {
                float factor =  dist / radius;
                factor = pow(factor, 2.0);
                color = mix(color, u_scanColor, factor);
            }
        }

        void main()
        {
            vec2 uv = v_textureCoordinates;

            float depth = texture(depthTexture, uv).x;
            vec3 positionEC = computePositionEC(uv, depth);
            
            float dist = length(positionEC - centerEC); 
            vec4 color = texture(colorTexture, uv);
            
            //circle(color, dist, 0.0);
            //circle(color, dist, 10.0);

            float radius = fract((czm_frameNumber -15.0) / 90.0) * u_maxRadius;
            float radius1 = fract((czm_frameNumber - 55.0) / 90.0) * u_maxRadius;
            float radius2 = fract((czm_frameNumber - 80.0) / 90.0) * u_maxRadius;

            if(dist < radius)
            {
                float factor =  dist / radius;
                factor = pow(factor, 2.0);
                color = mix(color, u_scanColor, factor);
            }

            if(dist < radius1)
            {
                float factor =  dist / radius1;
                factor = pow(factor, 2.0);
                color = mix(color, u_scanColor, factor);
            }

            if(dist < radius2)
            {
                float factor =  dist / radius2;
                factor = pow(factor, 2.0);
                color = mix(color, u_scanColor, factor);
            }
       
            FragColor = color;  
        }
    `;

    const material = new SSmap.Material(); //测试, 正式使用需要保存起来, 关闭时要删除

    let keys = new SSmap.StringVector();
    //keys.push_back("key1"); //为shader添加定义
    material.shaderProgram = SSmap.ShaderProgram.createViewportQuadShader(shaderCode, keys);
    keys.delete();

    const postProcess = new SSmap.PostProcess(); //测试, 正式使用需要保存起来, 关闭时要删除
    postProcess.material = material;
    GlobalViewer.renderSystem.addPostProcess(postProcess);
    const maxRadius = 2000.0;
    const duration = 2.0;
    
    var timer = 0.0;
    var alpha = 0.0;
    GlobalViewer.addEventListener("update", function (dt) {
        const viewMatrix = GlobalViewer.scene.mainCamera.viewMatrix();
        const center = SSmap.Matrix4.multiplyByVector3(
            viewMatrix,
            SSmap.Cartesian3.fromDegrees(114.054494, 22.540745, 10).toVector3());
        
        timer += dt;
        if (timer > duration)
            timer %= duration;
        
        if (timer > (duration * 0.6)) {
            alpha = 1.0 - timer / duration + 0.2;
        }
        else
            alpha = 1.0;
        
        //let radius = (timer / duration) * maxRadius;
        material.setParameterVec3("centerEC", center);
        material.setParameterFloat("u_maxRadius", maxRadius);
        material.setParameterFloat("u_alpha", alpha);
        material.setParameterColor("u_scanColor", SSmap.Color.fromRgb(205, 130, 5, 255));
    });
}

//模糊
Utils.addPPBlur =  function() {
    const shaderCode = `#version 300 es
        precision highp float;
        precision highp sampler2D;

        layout(location = 0) out vec4 FragColor;

        in vec2 v_textureCoordinates;
        uniform float height;
        uniform float width;
        uniform sampler2D colorTexture;       // 内置颜色缓存
        
        const int SAMPLES = 9;
        void main()
        {
            vec2 st = v_textureCoordinates;
            float wr = float(1.0 / width);
            float hr = float(1.0 / height);
            vec4 result = vec4(0.0);
            int count = 0;
            for(int i = -SAMPLES; i <= SAMPLES; ++i)
            {
                for(int j = -SAMPLES; j <= SAMPLES; ++j)
                {
                    vec2 offset = vec2(float(i) * wr, float(j) * hr);
                    result += texture(colorTexture, st + offset);
                    ++count;
                }
            }
            result = result / float(count);
            FragColor = result;
        }
    `;

    const material = new SSmap.Material(); //测试, 正式使用需要保存起来, 关闭时要删除

    let keys = new SSmap.StringVector();
    //keys.push_back("key1"); //为shader添加定义
    material.shaderProgram = SSmap.ShaderProgram.createViewportQuadShader(shaderCode, keys);
    keys.delete();

    const postProcess = new SSmap.PostProcess(); //测试, 正式使用需要保存起来, 关闭时要删除
    postProcess.material = material;
    GlobalViewer.renderSystem.addPostProcess(postProcess);

    GlobalViewer.addEventListener("update", function () {
        var width = GlobalViewer.canvas.width;
        var height = GlobalViewer.canvas.height;

        material.setParameterFloat("width", width);
        material.setParameterFloat("height", height);
    });
}

//亮度对比度
Utils.addBrightnessContrast =  function() {
    const brightnessContrastShader = `#version 300 es
        precision highp float;
        precision highp sampler2D;

        layout(location = 0) out vec4 FragColor;

        in vec2 v_textureCoordinates;
        uniform float contrast;
        uniform float brightness;
        uniform sampler2D colorTexture;       // 内置颜色缓存
        
        const float czm_epsilon7 = 0.0000001;
        const vec4 K_HSB2RGB = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 czm_HSBToRGB(vec3 hsb)
        {
            vec3 p = abs(fract(hsb.xxx + K_HSB2RGB.xyz) * 6.0 - K_HSB2RGB.www);
            return hsb.z * mix(K_HSB2RGB.xxx, clamp(p - K_HSB2RGB.xxx, 0.0, 1.0), hsb.y);
        }

        const vec4 K_RGB2HSB = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
        vec3 czm_RGBToHSB(vec3 rgb)
        {
            vec4 p = mix(vec4(rgb.bg, K_RGB2HSB.wz), vec4(rgb.gb, K_RGB2HSB.xy), step(rgb.b, rgb.g));
            vec4 q = mix(vec4(p.xyw, rgb.r), vec4(rgb.r, p.yzx), step(p.x, rgb.r));

            float d = q.x - min(q.w, q.y);
            return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + czm_epsilon7)), d / (q.x + czm_epsilon7), q.x);
        }

        void main()
        {
            vec3 sceneColor = texture(colorTexture, v_textureCoordinates).xyz;
            sceneColor = czm_RGBToHSB(sceneColor);
            sceneColor.z += brightness;
            sceneColor = czm_HSBToRGB(sceneColor);
        
            float factor = (259.0 * (contrast + 255.0)) / (255.0 * (259.0 - contrast));
            sceneColor = factor * (sceneColor - vec3(0.5)) + vec3(0.5);
            FragColor = vec4(sceneColor, 1.0);
        }
    `;

    const material = new SSmap.Material();

    let keys = new SSmap.StringVector();
    //keys.push_back("key1"); //为shader添加定义
    material.shaderProgram = SSmap.ShaderProgram.createViewportQuadShader(brightnessContrastShader, keys);
    keys.delete();

    const postProcess = new SSmap.PostProcess();
    postProcess.material = material;
    GlobalViewer.renderSystem.addPostProcess(postProcess);

    GlobalViewer.addEventListener("update", function () {
        material.setParameterFloat("contrast", 0.5);  //0-10
        material.setParameterFloat("brightness", 0.1); //0-1
    });
}

//黑白
Utils.addBlackAndWhite =  function() {
    const blackAndWhiteShader = `#version 300 es
        precision highp float;
        precision highp sampler2D;

        layout(location = 0) out vec4 FragColor;

        in vec2 v_textureCoordinates;

        uniform float gradations;
        uniform sampler2D colorTexture;       // 内置颜色缓存

        float czm_luminance(vec3 rgb)
        {
            // Algorithm from Chapter 10 of Graphics Shaders.
            const vec3 W = vec3(0.2125, 0.7154, 0.0721);
            return dot(rgb, W);
        }
   
        void main()
        {
            vec3 rgb = texture(colorTexture, v_textureCoordinates).rgb;
            float luminance = czm_luminance(rgb);
            float darkness = luminance * gradations;
            darkness = (darkness - fract(darkness)) / gradations;
            FragColor = vec4(vec3(darkness), 1.0);
        }
    `;

    const material = new SSmap.Material();  //测试, 正式使用需要保存起来, 关闭时要删除

    let keys = new SSmap.StringVector();
    //keys.push_back("key1"); //为shader添加定义
    material.shaderProgram = SSmap.ShaderProgram.createViewportQuadShader(blackAndWhiteShader, keys);
    keys.delete();
    
    const postProcess = new SSmap.PostProcess(); //测试, 正式使用需要保存起来, 关闭时要删除
    postProcess.material = material;
    GlobalViewer.renderSystem.addPostProcess(postProcess);

    GlobalViewer.addEventListener("update", function () {
       
        material.setParameterFloat("gradations", 10); //1-20
    });
}


//夜视
Utils.addNightVision =  function() {
    const nightVisionShader = `#version 300 es
        precision highp float;
        precision highp sampler2D;

        layout(location = 0) out vec4 FragColor;

        in vec2 v_textureCoordinates;

        uniform sampler2D colorTexture;       // 内置颜色缓存
        uniform float czm_frameNumber;

        float rand(vec2 co)
        {
            return fract(sin(dot(co.xy ,vec2(12.9898, 78.233))) * 43758.5453);
        }
        
        void main(void)
        {
            float noiseValue = rand(v_textureCoordinates + sin(czm_frameNumber)) * 0.1;
            vec3 rgb = texture(colorTexture, v_textureCoordinates).rgb;
            vec3 green = vec3(0.0, 1.0, 0.0);
            FragColor = vec4((noiseValue + rgb) * green, 1.0);
        }
    `;

    const material = new SSmap.Material(); //测试, 正式使用需要保存起来, 关闭时要删除

    let keys = new SSmap.StringVector();
    //keys.push_back("key1"); //为shader添加定义
    material.shaderProgram = SSmap.ShaderProgram.createViewportQuadShader(nightVisionShader, keys);
    keys.delete();

    const postProcess = new SSmap.PostProcess(); //测试, 正式使用需要保存起来, 关闭时要删除
    postProcess.material = material;
    GlobalViewer.renderSystem.addPostProcess(postProcess);
}

//景深
Utils.addDepthOfField =  function() {
    const depthOfFieldShader = `#version 300 es
        precision highp float;
        precision highp sampler2D;

        layout(location = 0) out vec4 FragColor;

        in vec2 v_textureCoordinates;
        uniform sampler2D depthTexture;       // 内置深度缓存
        uniform sampler2D colorTexture;       // 内置颜色缓存
        uniform sampler2D blurTexture;       // 内置
        uniform float focalDistance;
        uniform vec4 nearPlanes;              // 内置变量(近面视口坐标L,B,R,T)
        uniform vec2 czm_currentFrustum;
        uniform mat4 czm_inverseProjection;
        uniform float czm_log2FarDepthFromNearPlusOne;

        vec4 toEye(vec2 uv, float depth)
        {
            vec2 xy = vec2((uv.x * 2.0 - 1.0), ((1.0 - uv.y) * 2.0 - 1.0));
            vec4 posInCamera = czm_inverseProjection * vec4(xy, depth, 1.0);
            posInCamera = posInCamera / posInCamera.w;
            return posInCamera;
        }

        float computeDepthBlur(float depth)
        {
            float f;
            if (depth < focalDistance)
            {
                f = (focalDistance - depth) / (focalDistance - czm_currentFrustum.x);
            }
            else
            {
                f = (depth - focalDistance) / (czm_currentFrustum.y - focalDistance);
                f = pow(f, 0.1);
            }
            f *= f;
            f = clamp(f, 0.0, 1.0);
            return pow(f, 0.5);
        }

        float czm_reverseLogDepth(float logZ)
        {
            float near = czm_currentFrustum.x;
            float far = czm_currentFrustum.y;
            float log2Depth = logZ * czm_log2FarDepthFromNearPlusOne;
            float depthFromNear = pow(2.0, log2Depth) - 1.0;
            return far * (1.0 - near / (depthFromNear + near)) / (far - near);

            return logZ;
        }

        float czm_readDepth(sampler2D depthTexture, vec2 texCoords)
        {
            return czm_reverseLogDepth(texture(depthTexture, texCoords).x);
        }

        void main(void)
        {
            vec2 st = v_textureCoordinates;
            float depth = czm_readDepth(depthTexture, v_textureCoordinates);
            vec4 posInCamera = toEye(v_textureCoordinates, depth);
            float d = computeDepthBlur(-posInCamera.z);
            //FragColor = mix(texture(colorTexture, v_textureCoordinates), texture(blurTexture, v_textureCoordinates), d);

            // if((st.x > 0.2) && (st.x < 0.5) && (st.y > 0.2) && (st.y < 0.5) )
            //     FragColor = vec4(0.0, 1.0, 0.0, 1.0);
            // else
                 FragColor = texture(colorTexture, v_textureCoordinates);
        }
    `;

    const gaussianBlurShader = `#version 300 es
        precision highp float;
        precision highp sampler2D;

        layout(location = 0) out vec4 FragColor;

        #define SAMPLES 8
        uniform float delta;
        uniform float sigma;
        uniform float direction; // 0.0 for x direction, 1.0 for y direction

        //uniform float czm_pixelRatio;
        uniform sampler2D colorTexture;
        uniform vec4 czm_viewport;

        //#ifdef USE_STEP_SIZE
        uniform float stepSize;
        // #else
        // uniform vec2 step;
        // #endif
        const float czm_twoPi = 6.283185307179586;
        const float czm_pixelRatio = 1.0;

        in vec2 v_textureCoordinates;

        //  Incremental Computation of the Gaussian:
        //  https://developer.nvidia.com/gpugems/GPUGems3/gpugems3_ch40.html

        void main()
        {
            vec2 st = v_textureCoordinates;
            vec2 dir = vec2(1.0 - direction, direction);

        //#ifdef USE_STEP_SIZE
             vec2 step = vec2(stepSize * (czm_pixelRatio / czm_viewport.zw));
        // #else
        //      vec2 step = step;
        // #endif

            vec3 g;
            g.x = 1.0 / (sqrt(czm_twoPi) * sigma);
            g.y = exp((-0.5 * delta * delta) / (sigma * sigma));
            g.z = g.y * g.y;

            vec4 result = texture(colorTexture, st) * g.x;
            for (int i = 1; i < SAMPLES; ++i)
            {
                g.xy *= g.yz;

                vec2 offset = float(i) * dir * step;
                result += texture(colorTexture, st - offset) * g.x;
                result += texture(colorTexture, st + offset) * g.x;
            }

            // if(st.x < 0.3 && st.y < 0.3)
            //     FragColor = vec4(1.0, 0.0, 0.0, 1.0);
            // else
                FragColor = result;
        }
    `;

    const material = new SSmap.Material(); //测试, 正式使用需要保存起来, 关闭时要删除
    let keys = new SSmap.StringVector();
    //keys.push_back("key1"); //为shader添加定义

    material.shaderProgram = SSmap.ShaderProgram.createViewportQuadShader(depthOfFieldShader, keys);
    const postProcess = new SSmap.PostProcess(); //测试, 正式使用需要保存起来, 关闭时要删除
    postProcess.material = material;
    
    const gaussXMat = new SSmap.Material(); //测试, 正式使用需要保存起来, 关闭时要删除
    gaussXMat.shaderProgram = SSmap.ShaderProgram.createViewportQuadShader(gaussianBlurShader, keys);
    const gaussPSX = new SSmap.PostProcess(); //测试, 正式使用需要保存起来, 关闭时要删除
    gaussPSX.material = gaussXMat;

    const gaussYMat = new SSmap.Material(); //测试, 正式使用需要保存起来, 关闭时要删除
    gaussYMat.shaderProgram = SSmap.ShaderProgram.createViewportQuadShader(gaussianBlurShader, keys);
    const gaussPSY = new SSmap.PostProcess();
    gaussPSY.material = gaussYMat;
    keys.delete();

    GlobalViewer.renderSystem.addPostProcess(gaussPSX);
    GlobalViewer.renderSystem.addPostProcess(gaussPSY);
    GlobalViewer.renderSystem.addPostProcess(postProcess);

    GlobalViewer.addEventListener("update", function () {
        //gaussMaterial.setParameterFloat("stepSize", );
        gaussXMat.setParameterFloat("stepSize", 2.0);   //1-2
        gaussXMat.setParameterFloat("delta", 1.0);      //1
        gaussXMat.setParameterFloat("sigma", 3.0);      //2
        gaussXMat.setParameterFloat("direction", 0.0); //0.0: x 方向 1.0: y方向

        gaussYMat.setParameterFloat("stepSize", 2.0);   //1-2
        gaussYMat.setParameterFloat("delta", 1.0);      //1
        gaussYMat.setParameterFloat("sigma", 3.0);      //1-5
        gaussYMat.setParameterFloat("direction", 1.0); //0.0: x 方向 1.0: y方向
        
        material.setParameterFloat("focalDistance", 1000.0); //1-1000
    });
}

//泛光
Utils.addBloom = function () {
    const brightnessContrastShader = `#version 300 es
        precision highp float;
        precision highp sampler2D;

        layout(location = 0) out vec4 FragColor;

        in vec2 v_textureCoordinates;
        uniform float contrast;
        uniform float brightness;
        uniform sampler2D colorTexture;       // 内置颜色缓存
        
        const float czm_epsilon7 = 0.0000001;
        const vec4 K_HSB2RGB = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 czm_HSBToRGB(vec3 hsb)
        {
            vec3 p = abs(fract(hsb.xxx + K_HSB2RGB.xyz) * 6.0 - K_HSB2RGB.www);
            return hsb.z * mix(K_HSB2RGB.xxx, clamp(p - K_HSB2RGB.xxx, 0.0, 1.0), hsb.y);
        }

        const vec4 K_RGB2HSB = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
        vec3 czm_RGBToHSB(vec3 rgb)
        {
            vec4 p = mix(vec4(rgb.bg, K_RGB2HSB.wz), vec4(rgb.gb, K_RGB2HSB.xy), step(rgb.b, rgb.g));
            vec4 q = mix(vec4(p.xyw, rgb.r), vec4(rgb.r, p.yzx), step(p.x, rgb.r));

            float d = q.x - min(q.w, q.y);
            return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + czm_epsilon7)), d / (q.x + czm_epsilon7), q.x);
        }

        void main()
        {
            vec3 sceneColor = texture(colorTexture, v_textureCoordinates).xyz;
            sceneColor = czm_RGBToHSB(sceneColor);
            sceneColor.z += brightness;
            sceneColor = czm_HSBToRGB(sceneColor);
        
            float factor = (259.0 * (contrast + 255.0)) / (255.0 * (259.0 - contrast));
            sceneColor = factor * (sceneColor - vec3(0.5)) + vec3(0.5);
            FragColor = vec4(sceneColor, 1.0);
        }
    `;

    const bloomShader = `#version 300 es
        precision highp float;
        precision highp sampler2D;

        layout(location = 0) out vec4 FragColor;

        in vec2 v_textureCoordinates;
        uniform sampler2D colorTexture;       // 内置颜色缓存
        uniform sampler2D bloomTexture;
        uniform bool glowOnly;

        void main(void)
        {
            vec4 color = texture(colorTexture, v_textureCoordinates);

            vec4 bloom = texture(bloomTexture, v_textureCoordinates);
            FragColor = glowOnly ? bloom : bloom + color;
        }
    `;
    let keys = new SSmap.StringVector();
    //keys.push_back("key1"); //为shader添加定义
    const contrastMaterial = new SSmap.Material(); //测试, 正式使用需要保存起来, 关闭时要删除
    contrastMaterial.shaderProgram = SSmap.ShaderProgram.createViewportQuadShader(brightnessContrastShader, keys);
    const contrastPs = new SSmap.PostProcess(); //测试, 正式使用需要保存起来, 关闭时要删除
    contrastPs.material = contrastMaterial;

    const bloomMaterial = new SSmap.Material(); //测试, 正式使用需要保存起来, 关闭时要删除
    bloomMaterial.shaderProgram = SSmap.ShaderProgram.createViewportQuadShader(bloomShader, keys);
    const bloomPs = new SSmap.PostProcess();  //测试, 正式使用需要保存起来, 关闭时要删除
    bloomPs.material = bloomMaterial;

    GlobalViewer.renderSystem.addPostProcess(contrastPs);
    //GlobalViewer.renderSystem.addPostProcess(bloomPs);

    keys.delete();
    
    bloomPs.bloomValue = 100.0;
    GlobalViewer.addEventListener("update", function () {
        contrastMaterial.setParameterFloat("contrast", 128);  //0-10
        contrastMaterial.setParameterFloat("brightness", 0.5);

        bloomMaterial.setParameterFloat("glowOnly", true); //true false
    });
}

//RGB遮罩
Utils.addRGBMix = function() {
    const rgbShader = `#version 300 es
        precision highp float;
        precision highp sampler2D;

        layout(location = 0) out vec4 FragColor;

        in vec2 v_textureCoordinates;

        uniform sampler2D colorTexture;       // 内置颜色缓存
        uniform float czm_frameNumber;
        uniform vec4 u_color;

        void main(void)
        {
            vec4 color = texture(colorTexture, v_textureCoordinates);
            vec3 rgb = color.rgb - u_color.rgb;
            //FragColor = vec4(rgb, 1.0);
            FragColor = vec4(rgb, 1.0);
        }
    `;
    

    const material = new SSmap.Material();

    let keys = new SSmap.StringVector();
    //keys.push_back("key1"); //为shader添加定义
    material.shaderProgram = SSmap.ShaderProgram.createViewportQuadShader(rgbShader, keys);
    keys.delete();

    const postProcess = new SSmap.PostProcess();
    postProcess.material = material;
    GlobalViewer.renderSystem.addPostProcess(postProcess);

    GlobalViewer.addEventListener("update", function () {
        material.setParameterColor("u_color", SSmap.Color.fromRgb(0, 0, 255, 255));
    });
}

//添加水印
Utils.addWaterMark = function(baseUrl) {
    const rgbShader = `#version 300 es
        precision highp float;
        precision highp sampler2D;

        layout(location = 0) out vec4 FragColor;

        in vec2 v_textureCoordinates;

        uniform sampler2D colorTexture;       // 内置颜色缓存
        uniform sampler2D markTexture;       
        uniform float czm_frameNumber;

        void main(void)
        {
            vec2 uv = v_textureCoordinates;
            vec4 color = texture(colorTexture, uv);

   
            if( (uv.y > 0.85 && uv.y < 0.95)
                && (uv.x > 0.25 && uv.x < 0.75))
            {
                vec4 texColor = texture(markTexture, vec2((uv.x - 0.25) * 2.0 , (uv.y - 0.85) * 10.0));
                color.rgb = mix(color.rgb, texColor.rgb, texColor.a);
            }
            FragColor = color;
        }
    `;

    var texImage = new SSmap.TextureImage();
    texImage.loadImage(baseUrl + "symbols/images/watermark.png");
    var tex = new SSmap.Texture();
    tex.addTextureImage(texImage);
    const material = new SSmap.Material();
    let keys = new SSmap.StringVector();
    material.shaderProgram = SSmap.ShaderProgram.createViewportQuadShader(rgbShader, keys);
    material.setParameterTex("markTexture", tex);
    keys.delete();
    const postProcess = new SSmap.PostProcess();
    postProcess.material = material;
    GlobalViewer.renderSystem.addPostProcess(postProcess);
}

//天际线
Utils.addSkyline = function() {
    const skylineShader = `#version 300 es
    precision highp float;
    precision highp sampler2D;

    layout(location = 0) out vec4 FragColor;

    in vec2 v_textureCoordinates;

    uniform sampler2D colorTexture;
    uniform sampler2D depthTexture;
    uniform float u_width;
    uniform vec4 u_color;
    const float MAX_DEPTH_VALUE = 16777216.0;

    void main()
    {
        ivec2 uv = ivec2(gl_FragCoord.xy);
          
        // const float MAX_DEPTH_VALUE = 16777216.0;
        float fMinDepth = MAX_DEPTH_VALUE;
        float fMaxDepth = 0.0;

        ivec2 texSize = ivec2(textureSize(depthTexture, 0).xy);
        int samples = int(ceil((u_width + 1.0) / 2.0));

        bool glow = false;
        for (int y = -samples; y <= samples; ++y) 
        {
            for (int x = -samples; x <= samples; ++x) 
            {
                ivec2 st = clamp(uv+ivec2(x, y), ivec2(0), texSize-1);
                float fDepth = texelFetch(depthTexture, st, 0).x;
                fMinDepth = min(fMinDepth, fDepth);
                fMaxDepth = max(fMaxDepth, fDepth);
                if(fMinDepth < MAX_DEPTH_VALUE 
                    && fMaxDepth == MAX_DEPTH_VALUE
                    && (x == 0 || y == 0))
                    {
                        glow = true;
                        break;
                    }        
            }
        }

        vec4 finalColor;
        bool isEdge = false;//uv.x == 0 || uv.x == texSize.x-1 || uv.y == 0 || uv.y == texSize.y-1;

        float fEdge = float(!isEdge && fMinDepth < MAX_DEPTH_VALUE && fMaxDepth == MAX_DEPTH_VALUE);
        
        if(glow)
            finalColor = vec4(1.0);
        else
            finalColor = u_color;

        vec4 color = texture(colorTexture, v_textureCoordinates);
        FragColor = vec4(mix(color.rgb, finalColor.rgb, fEdge), 1.0);
    }
    `;

    const material = new SSmap.Material(); //测试, 正式使用需要保存起来, 关闭时要删除
    let keys = new SSmap.StringVector();
    //keys.push_back("key1"); //为shader添加定义
    material.shaderProgram = SSmap.ShaderProgram.createViewportQuadShader(skylineShader, keys);
    keys.delete();

    material.setParameterFloat("u_width", 3.0);
    material.setParameterColor("u_color", SSmap.Color.fromRgb(255, 0, 0, 255 ));
    const postProcess = new SSmap.PostProcess();  //测试, 正式使用需要保存起来, 关闭时要删除
    postProcess.material = material;
    GlobalViewer.renderSystem.addPostProcess(postProcess);
}

//屏幕雨
Utils.addScreenRaindrops = function () {
    const shaderCode = `#version 300 es
    precision highp float;
    precision highp sampler2D;

    layout(location = 0) out vec4 FragColor;

    in vec2 v_textureCoordinates;

    uniform sampler2D colorTexture;
    uniform float tiltAngle;
    uniform float rainSize;
    uniform float rainSpeed;
    
    uniform float czm_frameNumber;
    uniform vec4 czm_viewport;

    float hash(float x)
    {
        return fract(sin(x * 133.3) * 13.13);
    }

    void main(void) 
    {
        float time = czm_frameNumber / rainSpeed;
        vec2 resolution = czm_viewport.zw;
        vec2 uv = (gl_FragCoord.xy * 2. - resolution.xy) / min(resolution.x, resolution.y);
        vec3 c = vec3(0.6, 0.7, 0.8);
        float a = tiltAngle;
        float si = sin(a);
        float co = cos(a);
        uv *= mat2(co, -si, si, co);
        uv *= length(uv + vec2(0, 4.9)) * rainSize + 1.0;
        float v = 1.0 - sin(hash(floor(uv.x * 100.0)) * 2.0);
        float b = clamp(abs(sin(20. * time * v + uv.y * (5.0 / (2. + v)))) - 0.95, 0., 1.) * 20.0;
        c *= v * b;
        FragColor = mix(texture(colorTexture, v_textureCoordinates), vec4(c, 1), 0.5);
    }`;

    const material = new SSmap.Material();   //测试, 正式使用需要保存起来, 关闭时要删除
    let keys = new SSmap.StringVector();
    //keys.push_back("key1"); //为shader添加定义
    material.shaderProgram = SSmap.ShaderProgram.createViewportQuadShader(shaderCode, keys);
    keys.delete();
    
    const postProcess = new SSmap.PostProcess();  //测试, 正式使用需要保存起来, 关闭时要删除
    postProcess.material = material;
    GlobalViewer.renderSystem.addPostProcess(postProcess);

    GlobalViewer.addEventListener("update", function () {

        material.setParameterFloat("rainSize", 0.3);
        material.setParameterFloat("rainSpeed", 200);
        material.setParameterFloat("tiltAngle", -0.6);
    });
}

//屏幕雪
Utils.addScreenSnow = function () {
    const shaderCode = `#version 300 es
    precision highp float;
    precision highp sampler2D;

    layout(location = 0) out vec4 FragColor;

    in vec2 v_textureCoordinates;

    uniform sampler2D colorTexture;
    uniform float snowSpeed;
    uniform float snowSize;
    uniform vec4 czm_viewport;
    uniform float czm_frameNumber;

    float snow(vec2 uv,float scale)
    {
        float time = czm_frameNumber / snowSpeed;
        float w = smoothstep(1.0, 0.0, -uv.y  * (scale / 10.0));
        if(w < 0.1)
            return 0.0;

        uv += time / scale;
        uv.y += time * 2.0 / scale;
        uv.x += sin( uv.y + time * 0.5) / scale;
        uv *= scale;
        vec2 s = floor(uv);
        vec2 f = fract(uv);
        vec2 p = vec2(0.0);
        float k = 3.0;
        float d;
        p = 0.5 + 0.35 * sin(11.0 * fract(sin(( s + p + scale) * mat2( 7, 3, 6, 5)) * 5.0)) - f;
        d = length(p);
        k = min(d, k);
        k = smoothstep(0.0, k, sin(f.x + f.y) * snowSize);
        return k * w;
    }
    void main(void)
    {
        vec2 resolution = czm_viewport.zw;
        vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy ) / min(resolution.x, resolution.y);
        vec3 finalColor = vec3(0.0);
        
        float c = 0.0;
        c += snow(uv, 30.0) * 0.0;
        c += snow(uv, 20.0) * 0.0;
        c += snow(uv, 15.0) * 0.0;
        c += snow(uv, 10.0);
        c += snow(uv, 8.0);
        c += snow(uv, 6.0);
        c += snow(uv, 5.0);

        finalColor = vec3(c);
        FragColor = mix(texture(colorTexture,v_textureCoordinates), vec4(finalColor, 1.0), 0.5);
    }`;
    const material = new SSmap.Material();  //测试, 正式使用需要保存起来, 关闭时要删除
    let keys = new SSmap.StringVector();
    //keys.push_back("key1"); //为shader添加定义
    material.shaderProgram = SSmap.ShaderProgram.createViewportQuadShader(shaderCode, keys);
    keys.delete();

    const postProcess = new SSmap.PostProcess();  //测试, 正式使用需要保存起来, 关闭时要删除
    postProcess.material = material;
    GlobalViewer.renderSystem.addPostProcess(postProcess);

    GlobalViewer.addEventListener("update", function () {

        material.setParameterFloat("snowSize", 0.02);
        material.setParameterFloat("snowSpeed", 60.0);
    });
}

//马赛克
Utils.AddMosaic = function () {
    const shaderCode = `#version 300 es
    precision highp float;
    precision highp sampler2D;

    layout(location = 0) out vec4 FragColor;

    in vec2 v_textureCoordinates;
    
    uniform sampler2D colorTexture;
    uniform sampler2D depthTexture;
    uniform vec4 czm_viewport;//视口 获取屏幕宽高
    uniform float mosaicWidth;

    const int K_WIDTH = 20;

    void main(void)
    {
        vec2 step = 1.0 / czm_viewport.zw;
        vec2 integralPos = v_textureCoordinates - mod(v_textureCoordinates, mosaicWidth * step);
        vec3 averageValue = vec3(0.0); //初始 (0.0,0.0,0.0)

        for (int i = 0; i < K_WIDTH; i++)
        {
            for (int j = 0; j < K_WIDTH; j++)
            {
                averageValue += texture(colorTexture, integralPos + step * vec2(i, j)).rgb;
            }
        }
        averageValue /= float(K_WIDTH * K_WIDTH);
        FragColor = vec4(averageValue, 1.0);         
    }`;
    const material = new SSmap.Material();  //测试, 正式使用需要保存起来, 关闭时要删除
    let keys = new SSmap.StringVector();
    //keys.push_back("key1"); //为shader添加定义
    material.shaderProgram = SSmap.ShaderProgram.createViewportQuadShader(shaderCode, keys);
    keys.delete();

    const postProcess = new SSmap.PostProcess();  //测试, 正式使用需要保存起来, 关闭时要删除
    postProcess.material = material;
    GlobalViewer.renderSystem.addPostProcess(postProcess);

    GlobalViewer.addEventListener("update", function ()
    {
        material.setParameterFloat("mosaicWidth", 30.0);//格子宽度
    });
			           
}

//radar
Utils.AddRadar = function () {
    const shaderCode = `#version 300 es
    precision highp float;
    precision highp sampler2D;

    #define SMOOTH(r,R) (1.0 - smoothstep( R - 1.0, R + 1.0, r))
    #define RANGE(a,b,x) ( step(a, x) * (1.0 - step(b, x)) )
    #define RS(a,b,x) ( smoothstep(a - 1.0, a + 1.0, x) * (1.0 - smoothstep(b - 1.0, b + 1.0, x) ) )
    #define MOV(a,b,c,d,t) (vec2(a * cos(t) + b * cos(0.1 * (t)), c * sin(t) + d * cos(0.1 * (t))))

    layout(location = 0) out vec4 FragColor;

    in vec2 v_textureCoordinates;

    uniform sampler2D colorTexture;       // 内置颜色缓存
    uniform sampler2D depthTexture;       // 内置深度缓存
    uniform mat4 inverseViewMatrix;       // 内置变量(ViewSpace->WorldSpace)
    uniform vec4 nearPlanes;              // 内置变量(近面视口坐标L,B,R,T)
    uniform vec4 czm_viewport;          //视口 获取屏幕宽高
    uniform float iTime;                //时间
    uniform float u_radius;             //扫描半径
    uniform vec3 centerEC;              //中心
    uniform vec4 u_scanColor;           //扫描颜色

    const vec3 blue1 = vec3(0.0, 0.85, 1.00);
    const vec3 blue2 = vec3(0.0, 0.98, 0.50);
    const vec3 blue3 = vec3(0.35, 0.76, 0.83);
    const vec3 blue4 = vec3(0.0, 0.969, 0.49);
    const vec3 blue5 = vec3(0.0, 0.4, 1.0);
    const vec3 red = vec3(1.00, 0.38, 0.227);
    const float M_PI = 3.1415926535897932384626433832795;

    vec3 computePositionEC(vec2 uv, float depth)
    {
        vec3 pos = vec3(mix(nearPlanes.xy, nearPlanes.zw, uv), -1.0);
        return pos * depth;
    }

    float movingLine(vec2 uv, vec3 center, float radius)
    {
        //angle of the line
        float theta0 = 90.0 * iTime;
        float depth = texture(depthTexture, uv).x;
        vec3 positionEC = computePositionEC(uv, depth);
        vec2 d = (positionEC - center).xy;
        float r = length(positionEC - center);
        if(r < radius)
        {
            //compute the distance to the line theta=theta0
            vec2 p = radius*vec2(cos(theta0 * M_PI / 180.0),
                                -sin(theta0 * M_PI / 180.0));
            float l = length( d - p * clamp( dot(d, p) / dot(p, p), 0.0, 1.0) );
            d = normalize(d);
            //compute gradient based on angle difference to theta0
            float theta = mod(180.0 * atan(d.y, d.x) / M_PI + theta0, 360.0);
            float gradient = clamp(1.0 - theta / 90.0, 0.0, 1.0);
            return SMOOTH(l, 1.0) + 0.5  * gradient;
        }
        else 
            return 0.0;
    }

    float triangles(vec2 uv, vec3 center, float radius)
    {
        float depth = texture(depthTexture, uv).x;
        vec3 positionEC = computePositionEC(uv, depth);
        vec3 d = positionEC - center;

        return RS(-80.0, 0.0, d.x - radius) * (1.0 - smoothstep( 70.0 + d.x - radius, 90.0 + d.x - radius, abs(d.y)))
             + RS( 0.0, 80.0, d.x + radius) * (1.0 - smoothstep( 70.0 - d.x - radius, 90.0 - d.x - radius, abs(d.y)))
             + RS(-80.0, 0.0, d.y - radius) * (1.0 - smoothstep( 70.0 + d.y - radius, 90.0 + d.y - radius, abs(d.x)))
             + RS( 0.0, 80.0, d.y + radius) * (1.0 - smoothstep( 70.0-d.y - radius, 90.0 - d.y - radius, abs(d.x)));
    }

    float dots(vec2 uv, vec2 center, float radius)
    {
        vec2 d = uv - center;
        float r = sqrt( dot( d, d ) );
        if( r <= 2.5 )
            return 1.0;
        if( ( r<= radius) && ( (abs(d.y+0.5)<=1.0) && ( mod(d.x+1.0, 50.0) < 2.0 ) ) )
            return 1.0;
        else if ( (abs(d.y + 0.5) <= 1.0) && ( r >= 50.0 ) && ( r < 115.0 ) )
            return 0.5;
        else
            return 0.0;
    }

    float circle(vec2 uv, vec3 center, float radius, float width)
    {
        float depth = texture(depthTexture, uv).x;
        vec3 positionEC = computePositionEC(uv, depth);
        float r = length(positionEC - center);
        return SMOOTH(r - width / 2.0, radius) - SMOOTH(r + width / 2.0, radius);
    }

    float circle3(vec2 uv, vec3 center, float radius, float width)
    {
        float depth = texture(depthTexture, uv).x;
        vec3 positionEC = computePositionEC(uv, depth);
        vec3 d = positionEC - center;
        float r = length(d);
        d = normalize(d);
        float theta = 180.0 * (atan(d.y, d.x) / M_PI);
        return smoothstep(2.0, 2.1, abs(mod(theta + 2.0, 45.0) - 2.0)) *
            mix( 0.5, 1.0, step(45.0, abs(mod(theta, 180.0) - 90.0)) ) *
            (SMOOTH(r - width / 2.0, radius) - SMOOTH(r + width / 2.0, radius));
    }

    float circle2(vec2 uv, vec3 center, float radius, float width, float opening)
    {
        float depth = texture(depthTexture, uv).x;
        vec3 positionEC = computePositionEC(uv, depth);
        vec3 d = positionEC - center;
        float r = length(d);
        d = normalize(d);
        if( abs(d.y) > opening )
            return SMOOTH(r - width / 2.0, radius) - SMOOTH(r  +width / 2.0, radius);
        else
            return 0.0;
    }


    float crossLine(vec2 uv, vec3 center, float radius)
    {
        float depth = texture(depthTexture, uv).x;
        vec3 positionEC = computePositionEC(uv, depth);
        vec3 d = positionEC - center;
        float r = length(d);

        int x = int(d.x);
        int y = int(d.y);
       if( (r < radius) && ( abs(x-y) < 10 || abs(x+y) < 10 ) )
            return 1.0;
        else 
            return 0.0;
    }

   void main(void)
    {
        vec3 finalColor;
        vec2 uv = v_textureCoordinates;

        //center of the image
        vec3 c = centerEC;
        finalColor.rgb = vec3( crossLine(uv, c, 2400.0) ) * blue2;
        finalColor += ( circle(uv, c, 1000.0, 10.0) + circle(uv, c, 1650.0, 10.0) ) * blue1;
        finalColor += (circle(uv, c, 2400.0, 10.0) ) * blue4; //+ dots(uv,c,240.0)) * blue4;
        finalColor += circle3(uv, c, 3130.0, 20.0) * blue1;
        finalColor += triangles(uv, c, 3150.0 + 300.0 * sin(iTime)) * blue2;
        finalColor += movingLine(uv, c, 2400.0) * blue3;
        finalColor += circle(uv, c, 100.0, 10.0) * blue5;
        finalColor += circle2(uv, c, 2620.0, 15.0, 0.5+0.2 * cos(iTime)) * blue5;
     
        vec4 color = texture(colorTexture, v_textureCoordinates);
        if(finalColor.r > 0.1 || finalColor.g > 0.1 || finalColor.b > 0.1)
            FragColor = vec4(finalColor.rgb, 1.0);
        else
            FragColor = color;

    }`;
    const material = new SSmap.Material(); //测试, 正式使用需要保存起来, 关闭时要删除
    let keys = new SSmap.StringVector();
    //keys.push_back("key1"); //为shader添加定义
    material.shaderProgram = SSmap.ShaderProgram.createViewportQuadShader(shaderCode, keys);
    keys.delete();

    const postProcess = new SSmap.PostProcess(); //测试, 正式使用需要保存起来, 关闭时要删除
    postProcess.material = material;
    GlobalViewer.renderSystem.addPostProcess(postProcess);
    //var duration = 2.0
    var timer = 0.0;
    GlobalViewer.addEventListener("update", function (dt)
    {
        timer += dt;
        const viewMatrix = GlobalViewer.scene.mainCamera.viewMatrix();
        const center = SSmap.Matrix4.multiplyByVector3( viewMatrix,
                                                    SSmap.Cartesian3.fromDegrees(114.054494, 22.540745, 10).toVector3());
        
        material.setParameterVec3("centerEC", center);
        material.setParameterFloat("u_radius", 1000.0);
        material.setParameterColor("u_scanColor", SSmap.Color.fromRgb(205, 130, 5, 255));
        material.setParameterFloat("iTime", timer);
    });
			           
}

//晃动
Utils.AddQuake = function () {
    const shaderCode = `#version 300 es
    precision highp float;
    precision highp sampler2D;

    layout(location = 0) out vec4 FragColor;

    in vec2 v_textureCoordinates;
    
    uniform sampler2D colorTexture;
    uniform sampler2D depthTexture;
    uniform vec4 czm_viewport;  //视口 获取屏幕宽高

    uniform float iTime;
    uniform float maxshake;				// max shake amount , default 0.05
    const int octaves = 3;
 
    float random (in vec2 st)
    {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    float noise(in vec2 st)
    {
        vec2 i = floor(st);
        vec2 f = fract(st);
        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }

    float fbm(in vec2 p)
    {
        float value = 0.0;
        float freq = 1.13;
        float amp = 0.57;    
        for (int i = 0; i < octaves; i++)
        {
            value += amp * (noise((p - vec2(1.0)) * freq));
            freq *= 1.61;
            amp *= 0.47;
        }
        return value;
    }

    float pat(in vec2 p)
    {
        float time = iTime * 0.75;
        vec2 aPos = vec2(sin(time * 0.035), sin(time * 0.05)) * 3.;
        vec2 aScale = vec2(3.25);
        float a = fbm(p * aScale + aPos);
        vec2 bPos = vec2(sin(time * 0.09), sin(time * 0.11)) * 1.2;
        vec2 bScale = vec2(0.75);
        float b = fbm((p + a) * bScale + bPos);
        vec2 cPos = vec2(-0.6, -0.5) + vec2(sin(-time * 0.01), sin(time * 0.1)) * 1.9;
        vec2 cScale = vec2(1.25);
        float c = fbm((p + b) * cScale + cPos);
        return c;
    }

    vec2 Shake(float maxshake, float mag)
    {
        float speed = 20.0 * mag;
        float shakescale = maxshake * mag;
        
        float time = iTime*speed;			// speed of shake
        
        vec2 p1 = vec2(0.25, 0.25);
        vec2 p2 = vec2(0.75, 0.75);
        p1 += time;
        p2 += time;
        
        // random shake is just too violent...
    #ifdef RANDOM
        float val1 = random(p1);
        float val2 = random(p2);
    #else
        
        float val1 = pat(p1);
        float val2 = pat(p2);
    #endif
        val1 = clamp(val1, 0.0, 1.0);
        val2 = clamp(val2, 0.0, 1.0);
        
        return vec2(val1 * shakescale, val2 * shakescale);
    }

    void main(void)
    {
        float mag = 0.5 + sin(iTime) * 0.5;

        vec2 shakexy = Shake(maxshake, mag);
        
        vec2 uv = v_textureCoordinates;
        uv *= 1.0 - (maxshake * mag);
        vec3 col = texture(colorTexture, uv + shakexy).xyz;
        
        FragColor = vec4(col, 1.0);
    }`;
    const material = new SSmap.Material(); //测试, 正式使用需要保存起来, 关闭时要删除
    let keys = new SSmap.StringVector();
    //keys.push_back("key1"); //为shader添加定义
    material.shaderProgram = SSmap.ShaderProgram.createViewportQuadShader(shaderCode, keys);
    keys.delete();

    const postProcess = new SSmap.PostProcess(); //测试, 正式使用需要保存起来, 关闭时要删除
    postProcess.material = material;
    GlobalViewer.renderSystem.addPostProcess(postProcess);
    material.setParameterFloat("maxshake", 0.05);

    var timer = 0.0;
    GlobalViewer.addEventListener("update", function (dt)
    {
        timer += dt;
        material.setParameterFloat("iTime", timer);
    });
			           
}