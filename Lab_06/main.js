let camera, renderer, scene, box, plane;
const lookAtTarget = new THREE.Vector3(0,0,0);
function init() {
    scene = new THREE.Scene();
    plane = getPlane(7);
    box = getBox(1, 1, 1);

    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth/window.innerHeight,
        1,
        1000
    );


    plane.rotation.x = Math.PI/2;

    box.position.y = box.geometry.parameters.height/2;    

    scene.add(plane);
    scene.add(box);


    
    camera.position.z = 7;
    camera.position.x = 1;
    camera.position.y = 2;
    
    camera.lookAt(lookAtTarget);

    renderer = new THREE.WebGLRenderer( {antialias: true} );
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000);
    document.getElementById('webgl').appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040, 0.6); // soft white light
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    scene.add(directionalLight);

    setupControls();

    render();

}

function render() {
    renderer.render(
        scene,
        camera
    )
}
function setupControls() {
    // Rotation controls
    const rotationXSlider = document.getElementById('RotationX');
    const rotationYSlider = document.getElementById('RotationY');
    const rotationZSlider = document.getElementById('RotationZ');

    const rotationXValue = document.getElementById('rotationXValue');
    const rotationYValue = document.getElementById('rotationYValue');
    const rotationZValue = document.getElementById('rotationZValue');

    rotationXSlider.addEventListener('input', function() {
        const degrees = parseInt(this.value);
        const radians = degrees * (Math.PI / 180);
        box.rotation.x = radians;
        rotationXValue.textContent = degrees;
        render();
    });

    rotationYSlider.addEventListener('input', function() {
        const degrees = parseInt(this.value);
        const radians = degrees * (Math.PI / 180);
        box.rotation.y = radians;
        rotationYValue.textContent = degrees;
        render();
    });

    rotationZSlider.addEventListener('input', function() {
        const degrees = parseInt(this.value);
        const radians = degrees * (Math.PI / 180);
        box.rotation.z = radians;
        rotationZValue.textContent = degrees;
        render();
    });
    // Location controls
    const LocationXSlider = document.getElementById('LocationX');
    const LocationYSlider = document.getElementById('LocationY');
    const LocationZSlider = document.getElementById('LocationZ');

    const LocationXValue = document.getElementById('LocationXValue');
    const LocationYValue = document.getElementById('LocationYValue');
    const LocationZValue = document.getElementById('LocationZValue');

    LocationXSlider.addEventListener('input', function() {
        const location = parseFloat(this.value);
        box.position.x = location;
        LocationXValue.textContent = location;
        render();
    });
    LocationYSlider.addEventListener('input', function() {
        const location = parseFloat(this.value);
        box.position.y = location;
        LocationYValue.textContent = location;
        render();
    });
    LocationZSlider.addEventListener('input', function() {
        const location = parseFloat(this.value);
        box.position.z = location;
        LocationZValue.textContent = location;
        render();
    });

    // Scale controls
    const ScaleXSlider = document.getElementById('ScaleX');
    const ScaleYSlider = document.getElementById('ScaleY');
    const ScaleZSlider = document.getElementById('ScaleZ');

    const ScaleXValue = document.getElementById('ScaleXValue');
    const ScaleYValue = document.getElementById('ScaleYValue');
    const ScaleZValue = document.getElementById('ScaleZValue');

    ScaleXSlider.addEventListener('input', function() {
        const scale = parseFloat(this.value);
        box.scale.x = scale;
        ScaleXValue.textContent = scale;
        render();
    });
    ScaleYSlider.addEventListener('input', function() {
        const scale = parseFloat(this.value);
        box.scale.y = scale;
        ScaleYValue.textContent = scale;
        render();
    });
    ScaleZSlider.addEventListener('input', function() {
        const scale = parseFloat(this.value);
        box.scale.z = scale;
        ScaleZValue.textContent = scale;
        render();
    });

    // Camera controls
    const CameraXSlider = document.getElementById('LAX');
    const CameraYSlider = document.getElementById('LAY');
    const CameraZSlider = document.getElementById('LAZ');

    const CameraXValue = document.getElementById('LookAtXValue');
    const CameraYValue = document.getElementById('LookAtYValue');
    const CameraZValue = document.getElementById('LookAtZValue');

    CameraXSlider.addEventListener('input', function() {
        const location = parseFloat(this.value);
        CameraXValue.textContent = location;
        camera.lookAt(lookAtTarget.x + location, lookAtTarget.y, lookAtTarget.z);
        lookAtTarget.x = location;
        render();
    });

    CameraYSlider.addEventListener('input', function() {

        const location = parseFloat(this.value);
        CameraYValue.textContent = location;
        camera.lookAt(lookAtTarget.x, lookAtTarget.y + location, lookAtTarget.z);
        lookAtTarget.y = location; 
        render();
    });

    CameraZSlider.addEventListener('input', function() {
        const location = parseFloat(this.value);
        CameraZValue.textContent = location;
        camera.lookAt(lookAtTarget.x, lookAtTarget.y, lookAtTarget.z + location);
        lookAtTarget.z = location;
        render();
    }); 
}

function getBox(w, h, d) {
    var geometry = new THREE.BoxGeometry(w, h, d);
    var material = new THREE.MeshLambertMaterial({
        color: 0x0000ff 
    });
    var mesh = new THREE.Mesh(
        geometry,
        material
    );

    return mesh;
}

function getPlane(size) {
    var geometry = new THREE.PlaneGeometry(size, size);
    var material = new THREE.MeshLambertMaterial({
        color: 0x888888,
        side: THREE.DoubleSide 
    });
    var mesh = new THREE.Mesh(
        geometry,
        material
    );

    return mesh;
}

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
});

init();