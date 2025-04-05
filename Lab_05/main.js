import * as THREE from "./node_modules/three/build/three.module.js"
console.log("Three.js đã load: ", THREE)
import { TeapotGeometry } from 'three/examples/jsm/geometries/TeapotGeometry.js';
function init() {
    // 1. Tạo cảnh (scene)
    var scene = new THREE.Scene();

    // Tạo vật thể và add vào scene
    var box = getBox(1, 1, 1);
    box.position.y = box.geometry.parameters.height/2;
    box.position.z = 2;

    var plane = getPlane(7, 5);
    plane.rotation.x = Math.PI / 2;

    var Sphere = getSphere(1, 32, 16)
    Sphere.position.y = 1;
    Sphere.position.x = 2;
    Sphere.position.z = 1;

    var teapot = getTeapot(1, 18); 
    teapot.position.x = -3;
    teapot.position.y = 1;
    console.log(teapot);

    var torus = getTorus(1, 0.4, 16, 100);
    torus.position.z = -2;
    torus.position.y = 1.3;
    
    scene.add(box);
    scene.add(plane);
    scene.add(Sphere);
    scene.add(teapot);
    scene.add(torus);
    
    // 2. Tạo camera
    var camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth/window.innerHeight,
        1,
        1000
    );
    camera.position.x = 1
    camera.position.y = 2
    camera.position.z = 5
    camera.lookAt(new THREE.Vector3(0, 0, 0))
    
    // 3. Tạo renderer và gán vào thẻ <div id="webgl">
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('webgl').appendChild(renderer.domElement);
    renderer.render(
        scene,
        camera
    );
} 

function getBox(w, h, d){
    var geometry = new THREE.BoxGeometry(w, h, d);
    var material = new THREE.MeshBasicMaterial({
        color: 0x00ff00
    });
    var mesh = new THREE.Mesh(
        geometry,
        material
    );
    
    return mesh;
}

function getPlane(w, h){
    var geometry = new THREE.PlaneGeometry(w, h);
    var material = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        side: THREE.DoubleSide
    });
    var mesh = new THREE.Mesh(
        geometry,
        material
    );

    return mesh;
}

function getSphere(r, w, h){
    var geometry = new THREE.SphereGeometry(r, w, h)
    var material = new THREE.MeshBasicMaterial({
        color: 0x0000ff
    });
    var mesh = new THREE.Mesh(
        geometry,
        material
    );

    return mesh
}

function getTeapot(r, s) {
    var geometry = new TeapotGeometry(r, s);
    var material = new THREE.MeshBasicMaterial({
        color: 0xffff00
    });
    var mesh = new THREE.Mesh(geometry, material);

    return mesh;
}

function getTorus(r, t, w, h) {
    var geometry = new THREE.TorusGeometry(r, t, w, h);
    var material = new THREE.MeshBasicMaterial({
        color: 0x00ffff
    });
    var mesh = new THREE.Mesh(geometry, material);

    return mesh;
}

init();