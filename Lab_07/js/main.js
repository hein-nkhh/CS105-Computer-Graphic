import * as THREE from '../node_modules/three/build/three.module.js';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
console.log("Three.js đã load:", THREE);

let camera;
let controls;

function init() {
    var scene = new THREE.Scene(); 
    var gui = new dat.GUI();

    // Initalize objects
    var sphereMaterial = getMaterial('phong', 'rgb(255, 255, 255)');
    var sphere = getSphere(sphereMaterial, 1, 24); 

    var planeMaterial = getMaterial('phong', 'rgb(255, 255, 255)');
    var plane = getPlane(planeMaterial, 300);

    var lightLeft = getSpotLight(1000, 'rgb(255, 220, 180)');
    var lightRight = getSpotLight(1000, 'rgb(255, 220, 180)');

    // manipulate objects 
    sphere.position.y = sphere.geometry.parameters.radius;
    plane.rotation.x = Math.PI/2; 
    plane.position.y = -1;

    lightLeft.position.x = -5;
    lightLeft.position.y = 2;
    lightLeft.position.z = -4;

    lightRight.position.x = 5;
    lightRight.position.y = 2;
    lightRight.position.z = -4;

    // manipulate materials

    // load the cube map 
    var path = 'Rainbow/';
    var format = '.jpg';
    var urls = [
        path + 'posx' + format, path + 'negx' + format, 
        path + 'posy' + format, path + 'negy' + format, 
        path + 'posz' + format, path + 'negz' + format
    ];
    var reflectionCube = new THREE.CubeTextureLoader().load(urls);
    //reflectionCube.format = THREE.RGBFormat;
    reflectionCube.encoding = THREE.sRGBEncoding;

    scene.background = reflectionCube;

    var loader = new THREE.TextureLoader();
    planeMaterial.map = loader.load('Concrete_texture_3.jpg');
    planeMaterial.bumpMap = loader.load('Concrete_texture_3.jpg');
    planeMaterial.roughnessMap = loader.load('Concrete_texture_3.jpg');
    planeMaterial.bumpScale = 0.01;
    planeMaterial.metalness = 0.1; 
    planeMaterial.roughness = 0.7;
    planeMaterial.envMap = reflectionCube;

    sphereMaterial.map = loader.load('concrete_texture2.jpg');
    sphereMaterial.roughnessMap = loader.load('concrete_texture2.jpg');
    sphereMaterial.envMap = reflectionCube;

    var maps = ['map', 'bumpMap','roughnessMap'];
    maps.forEach(function(mapName) {
        var texture = planeMaterial[mapName];
        texture.wrapS = THREE.RepeatWrapping; // Lặp lại texture theo chiều ngang
        texture.wrapT = THREE.RepeatWrapping; // Lặp lại texture theo chiều dọc
        texture.repeat.set(15, 15); // Lặp lại 5 lần theo cả 2 chiều
    });
    // dat.gui 

    plane.name = 'plane-1';

    var folder1 = gui.addFolder('light_1');
    folder1.add(lightLeft, 'intensity', 0, 1000);
    folder1.add(lightLeft.position, 'x', -5, 15);
    folder1.add(lightLeft.position, 'y', -5, 15);
    folder1.add(lightLeft.position, 'z', -5, 15);

    var folder2 = gui.addFolder('light_2');
    folder2.add(lightRight, 'intensity', 0, 1000);
    folder2.add(lightRight.position, 'x', -5, 15);
    folder2.add(lightRight.position, 'y', -5, 15);
    folder2.add(lightRight.position, 'z', -5, 15);

    var folder3 = gui.addFolder('materials');
    folder3.add(sphereMaterial, 'shininess', 0, 1000);
    folder3.add(planeMaterial, 'shininess', 0, 1000);
    folder3.open();

    scene.add(sphere);
    scene.add(plane);
    scene.add(lightLeft);
    scene.add(lightRight);

    camera = new THREE.PerspectiveCamera(
        45, 
        window.innerWidth/window.innerHeight,
        1, 
        1000
    );

    camera.position.x = 2; 
    camera.position.y = 3;
    camera.position.z = 5;
    camera.lookAt( new THREE.Vector3(0, 0, 0));

    var renderer = new THREE.WebGLRenderer(); 
    renderer.shadowMap.enabled = true; // Bật đổ bóng
    // Kích thước renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor('rgb(120, 120, 120)');
    document.getElementById('webgl').appendChild(renderer.domElement); // Thêm canvas vào thẻ id=webgl

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; 
    controls.dampingFactor = 0.05; // Giảm tốc độ di chuyển của camera

    update(renderer, scene, camera);

    return scene;
}

function getSphere(material, size, segments) {
    var geometry = new THREE.SphereGeometry(size, segments, segments);
    var mesh = new THREE.Mesh (
        geometry, 
        material
    );
    mesh.castShadow = true;

    return mesh; 
}

function getMaterial(type, color) {
    var selectedMaterial;
    var materialOptions = {
        color: color === undefined ? 'rgb(255, 255, 255)' : color,
    };

    switch (type) {
        case 'basic':
            selectedMaterial = new THREE.MeshBasicMaterial(materialOptions);
            break;
        case 'lambert':
            selectedMaterial = new THREE.MeshLambertMaterial(materialOptions);
            break;
        case 'phong':
            selectedMaterial = new THREE.MeshPhongMaterial(materialOptions);
            break;
        case 'standard':
            selectedMaterial = new THREE.MeshStandardMaterial(materialOptions);
            break;
        default:
            selectedMaterial = new THREE.MeshBasicMaterial(materialOptions);
    }

    return selectedMaterial;
}

function getBox(w, h, d) {
    var geometry = new THREE.BoxGeometry(w, h, d);
    var material = new THREE.MeshPhongMaterial( {
        color: 'rgb(120, 120, 120)'
    });

    var mesh = new THREE.Mesh (
        geometry, 
        material
    );
    mesh.castShadow = true; // Bật đổ bóng cho hình hộp

    return mesh; 
}

function getBoxGrid(amount, separationMultiplier) {
    var group = new THREE.Group();

    for (var i = 0; i < amount; i++) {
        var obj = getBox(1, 1, 1);
        obj.position.x = i * separationMultiplier;
        obj.position.y = obj.geometry.parameters.height / 2;
        group.add(obj);
        for (var j = 0; j < amount; j++) {
            var obj2 = getBox(1, 1, 1);
            obj2.position.x = i * separationMultiplier;
            obj2.position.z = j * separationMultiplier;
            obj2.position.y = obj2.geometry.parameters.height / 2;
            group.add(obj2);
        }
    }

    group.position.x = -(separationMultiplier * (amount - 1)) / 2;
    group.position.z = -(separationMultiplier * (amount - 1)) / 2;

    return group;
}

function getPlane(material, size) {
    var geometry = new THREE.PlaneGeometry(size, size);
    material.side = THREE.DoubleSide; // Bật cả 2 mặt của mặt phẳng
    var mesh = new THREE.Mesh (
        geometry, 
        material
    );
    mesh.receiveShadow = true; // Bật đổ bóng cho mặt phẳng

    return mesh; 
}

function getPointLight(intensity) {
    var light = new THREE.PointLight(0xffffff, intensity);
    light.castShadow = true; // Bật đổ bóng cho ánh sáng

    return light;
}

function getSpotLight(intensity, color) {
    color = color === undefined ? 'rgb(255, 255, 255)' : color;

    var light = new THREE.SpotLight(color, intensity);
    light.castShadow = true;
    light.penumbra = 0.5;

    light.shadow.bias = 0.001;
    light.shadow.mapSize.width = 2048; // Kích thước bản đồ bóng
    light.shadow.mapSize.height = 2048; // Kích thước bản đồ bóng

    return light;
}

function getDirectionalLight(intensity) {
    var light = new THREE.DirectionalLight(0xffffff, intensity);
    light.castShadow = true; // Bật đổ bóng cho ánh sáng

    light.shadow.camera.left = -5; 
    light.shadow.camera.right = 5;
    light.shadow.camera.top = 5;
    light.shadow.camera.bottom = -5;

    return light;
}

function getAmbientLight(intensity) {
    var light = new THREE.AmbientLight('rgb(35, 82, 129)', intensity);
    light.castShadow = true; // Bật đổ bóng cho ánh sáng

    return light;
}

function update(renderer, scene, camera) {
    controls.update(); // Cập nhật điều khiển camera

    renderer.render(
        scene,
        camera
    );

    requestAnimationFrame(function() {
        update(renderer, scene, camera);
    })
}

window.scene = init();