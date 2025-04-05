// Khởi tạo WebGL
const canvas = document.getElementById('webglCanvas');
const gl = canvas.getContext('webgl');

if (!gl) {
    console.error("WebGL không được hỗ trợ trên trình duyệt này!");
}

// Shader sources
const vertexShaderSource = `
attribute vec2 a_position;
uniform vec2 u_translation;
uniform float u_size;
uniform vec2 u_pivot;
uniform vec2 u_rotation;
uniform float x_scale;
uniform float y_scale;

void main() {
    vec2 newPosition = a_position * u_size;
    
    // Điều chỉnh pivot theo u_size
    vec2 scaledPivot = u_pivot * u_size;
    
    // 1️⃣ Đưa về pivot để scale
    vec2 centeredForScale = newPosition - scaledPivot;
    
    // 2️⃣ Scale theo từng trục x, y
    vec2 scaledPosition = centeredForScale * vec2(x_scale, y_scale);
    
    // 3️⃣ Đưa về lại vị trí cũ sau khi scale
    vec2 new_a_position = scaledPosition + scaledPivot;
    
    // 4️⃣ Đưa về pivot để xoay
    vec2 centeredForRotation = new_a_position - scaledPivot;
    
    // 5️⃣ Xoay quanh pivot
    vec2 rotatedPosition = vec2(
        centeredForRotation.x * u_rotation.y - centeredForRotation.y * u_rotation.x,
        centeredForRotation.x * u_rotation.x + centeredForRotation.y * u_rotation.y
    );
    
    // 6️⃣ Đưa về lại vị trí pivot
    vec2 finalPosition = rotatedPosition + scaledPivot;
    
    // 7️⃣ Tịnh tiến
    gl_Position = vec4(finalPosition + u_translation, 0, 1);
}
`;

const fragmentShaderSource = `
precision mediump float;
uniform vec4 u_color;
void main() {
    gl_FragColor = u_color;
}
`;

// Hàm tạo Shader
function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Lỗi biên dịch Shader:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

// Tạo & liên kết Shader
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Lỗi liên kết chương trình:', gl.getProgramInfoLog(program));
}

// Các vật thể
const shapes = {
    triangle: {
        vertices: [
            -0.5, -0.5,
             0.5, -0.5,
             0,    0.5
        ],
        vertexCount: 3,
        drawMode: gl.TRIANGLES
    },
    rectangle: {
        vertices: [
            -0.5, -0.3,  // Bottom left
             0.5, -0.3,  // Bottom right
             0.5,  0.3,  // Top right
            -0.5,  0.3   // Top left
        ],
        indices: [0, 1, 2, 0, 2, 3],
        vertexCount: 4,
        drawMode: gl.TRIANGLES
    },
    letterH: {
        vertices: [
            // Left vertical bar
            -0.4, -0.5,
            -0.2, -0.5,
            -0.2,  0.5,
            -0.4,  0.5,
            
            // Horizontal middle bar
            -0.4,  0.0,
             0.4,  0.0,
             0.4, -0.1,
            -0.4, -0.1,
            
            // Right vertical bar
             0.2, -0.5,
             0.4, -0.5,
             0.4,  0.5,
             0.2,  0.5
        ],
        indices: [
            0, 1, 2, 0, 2, 3,    // Left bar
            4, 5, 6, 4, 6, 7,    // Middle bar
            8, 9, 10, 8, 10, 11  // Right bar
        ],
        vertexCount: 12,
        drawMode: gl.TRIANGLES
    }
};

// Tạo buffer cho từng vật thể
const buffers = {};
for (const shapeName in shapes) {
    const shape = shapes[shapeName];
    
    // Create vertex buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(shape.vertices), gl.STATIC_DRAW);
    
    // Index cho buffer
    let indexBuffer = null;
    if (shape.indices) {
        indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(shape.indices), gl.STATIC_DRAW);
    }
    
    buffers[shapeName] = {
        positionBuffer,
        indexBuffer
    };
}

// Kết nối buffer với vertex shader
const positionLocation = gl.getAttribLocation(program, 'a_position');
gl.enableVertexAttribArray(positionLocation);


// uniform locations
const sizeLocation = gl.getUniformLocation(program, "u_size");
const translationLocation = gl.getUniformLocation(program, "u_translation");
const colorLocation = gl.getUniformLocation(program, "u_color");
const pivotLocation = gl.getUniformLocation(program, "u_pivot");
const rotationLocation = gl.getUniformLocation(program, "u_rotation");
const xScaleLocation = gl.getUniformLocation(program, "x_scale");
const yScaleLocation = gl.getUniformLocation(program, "y_scale");

// giá trị thay đổi default
const objects = {
    triangle: {
        visible: true,
        translation: [0, 0],
        size: 0.3,
        pivot: [0, 0.5],// Đặt pivot là điểm gốc
        color: [1, 0, 0, 1], // Red
        angle: 0,
        x_scale: 1,
        y_scale: 1
    },
    rectangle: {
        visible: true,
        translation: [0, 0],
        size: 0.3,
        pivot: [-0.5, -0.3], // Đặt pivot là điểm gốc
        color: [0, 1, 0, 1], // Green
        angle: 0,
        x_scale: 1,
        y_scale: 1
    },
    letterH: {
        visible: true,
        translation: [0, 0],
        size: 0.3,
        pivot: [-0.4, -0.5], // Đặt pivot là điểm gốc
        color: [0, 0, 1, 1], // Blue
        angle: 0,
        x_scale: 1,
        y_scale: 1
    }
}

// Chọn vật thể
let selectedObject = "triangle";

// giá trị animation 
let isChaosMode = false;
let velocities = {};
let chaosAnimationId = null;
let lastTime = performance.now();
let isModified = false;

// constant
const SPEED = 0.25;
const SCALE_RANGE = [0.5, 1.5];
const TRANSLATE_RANGE = [-0.8, 0.8];
const ROTATION_SPEED = 1.0;

// Color 
const rainbowColors = {
    "Đỏ": [1, 0, 0, 1],
    "Cam": [1, 0.5, 0, 1],
    "Vàng": [1, 1, 0, 1],
    "Lục": [0, 1, 0, 1],
    "Lam": [0, 0, 1, 1],
    "Chàm": [0.29, 0, 0.51, 1],
    "Tím": [0.58, 0, 0.83, 1]
};

// Khởi tạo vận tốc
function initializeVelocities() {
    velocities = {};
    for (const shapeName in objects) {
        velocities[shapeName] = {
            translation: [randomInRange(-SPEED, SPEED), randomInRange(-SPEED, SPEED)],
            scale: [randomInRange(-SPEED, SPEED), randomInRange(-SPEED, SPEED)],
            rotation: randomInRange(-ROTATION_SPEED, ROTATION_SPEED)
        };
    }
}

// Drawing 
function drawScene() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // Draw each visible object
    for (const shapeName in objects) {
        const object = objects[shapeName];
        if (!object.visible) continue;
        
        const shape = shapes[shapeName];
        const buffer = buffers[shapeName];
        
        // Bind appropriate buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer.positionBuffer);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        
        if (buffer.indexBuffer) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indexBuffer);
        }
        
        // Set uniforms
        gl.uniform1f(sizeLocation, object.size);
        gl.uniform2fv(translationLocation, object.translation);
        gl.uniform2fv(pivotLocation, object.pivot);
        gl.uniform4fv(colorLocation, object.color);
        gl.uniform2fv(rotationLocation, [Math.sin(object.angle), Math.cos(object.angle)]);
        gl.uniform1f(xScaleLocation, object.x_scale);
        gl.uniform1f(yScaleLocation, object.y_scale);
        
        // Draw
        if (shape.indices) {
            gl.drawElements(shape.drawMode, shape.indices.length, gl.UNSIGNED_SHORT, 0);
        } else {
            gl.drawArrays(shape.drawMode, 0, shape.vertexCount);
        }
    }
}

// Utility functions
function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

// Update UI controls to reflect selected object
function updateControls() {
    const obj = objects[selectedObject];
    
    document.getElementById("translateX").value = obj.translation[0];
    document.getElementById("translateY").value = obj.translation[1];
    document.getElementById("scaleX").value = obj.x_scale;
    document.getElementById("scaleY").value = obj.y_scale;
    document.getElementById("rotateSlider").value = (obj.angle * 180 / Math.PI) % 360;
    
    document.getElementById("translateXValue").textContent = obj.translation[0].toFixed(2);
    document.getElementById("translateYValue").textContent = obj.translation[1].toFixed(2);
    document.getElementById("scaleXValue").textContent = obj.x_scale.toFixed(2);
    document.getElementById("scaleYValue").textContent = obj.y_scale.toFixed(2);
    document.getElementById("rotateValue").textContent = ((obj.angle * 180 / Math.PI) % 360).toFixed(0);
    
    // Set color dropdown
    const colorDropdown = document.getElementById("colorDropdown");
    for (const colorName in rainbowColors) {
        const colorValues = rainbowColors[colorName];
        if (colorValues.toString() === obj.color.toString()) {
            colorDropdown.value = colorName;
            break;
        }
    }

    // Update visibility checkboxes
    document.getElementById("triangleVisible").checked = objects.triangle.visible;
    document.getElementById("rectangleVisible").checked = objects.rectangle.visible;
    document.getElementById("letterHVisible").checked = objects.letterH.visible;
}

// Animation update function
function updateChaosMovement(currentTime) {
    if (!isChaosMode) return;

    const deltaTime = (currentTime - lastTime) / 500;
    lastTime = currentTime;

    for (const shapeName in objects) {
        const object = objects[shapeName];
        const velocity = velocities[shapeName];
        
        // Update position, scale, and rotation
        object.translation[0] += velocity.translation[0] * deltaTime;
        object.translation[1] += velocity.translation[1] * deltaTime;
        object.x_scale += velocity.scale[0] * deltaTime;
        object.y_scale += velocity.scale[1] * deltaTime;
        object.angle += velocity.rotation * deltaTime;
        
        // Bounce off edges
        if (object.translation[0] < TRANSLATE_RANGE[0] || object.translation[0] > TRANSLATE_RANGE[1]) {
            velocity.translation[0] *= -1;
        }
        if (object.translation[1] < TRANSLATE_RANGE[0] || object.translation[1] > TRANSLATE_RANGE[1]) {
            velocity.translation[1] *= -1;
        }
        
        // Keep scale within range
        if (object.x_scale < SCALE_RANGE[0] || object.x_scale > SCALE_RANGE[1]) {
            velocity.scale[0] *= -1;
        }
        if (object.y_scale < SCALE_RANGE[0] || object.y_scale > SCALE_RANGE[1]) {
            velocity.scale[1] *= -1;
        }
    }

    // Update controls if the selected object changes
    if (selectedObject) {
        updateControls();
    }
    
    drawScene();
    chaosAnimationId = requestAnimationFrame(updateChaosMovement);
}

// Reset all objects
function resetObjects() {
    objects.triangle = {
        visible: objects.triangle.visible,
        translation: [0, 0],
        size: 0.3,
        pivot: [0, 0.5],// Đặt pivot là điểm gốc
        color: [1, 0, 0, 1], // Red
        angle: 0,
        x_scale: 1,
        y_scale: 1
    };
    
    objects.rectangle = {
        visible: objects.rectangle.visible,
        translation: [0, 0],
        size: 0.3,
        pivot: [-0.5, -0.3], // Đặt pivot là điểm gốc
        color: [0, 1, 0, 1], // Green
        angle: 0,
        x_scale: 1,
        y_scale: 1
    };
    
    objects.letterH = {
        visible: objects.letterH.visible,
        translation: [0, 0],
        size: 0.3,
        pivot: [-0.4, -0.5], // Đặt pivot là điểm gốc
        color: [0, 0, 1, 1], // Blue
        angle: 0,
        x_scale: 1,
        y_scale: 1
    };
    
    updateControls();
    drawScene();
}

function resetChaosMode() {
    isChaosMode = false;
    if (chaosAnimationId) {
        cancelAnimationFrame(chaosAnimationId);
        chaosAnimationId = null;
    }

    resetObjects();

    const chaosButton = document.getElementById("toggleChaos");
    chaosButton.textContent = "🎲 Bật chế độ ngẫu nhiên";
}

// Event listeners for controls
function setupEventListeners() {
    // Object selection
    document.getElementById("objectDropdown").addEventListener("change", function(event) {
        selectedObject = event.target.value;
        updateControls();
    });

    // Visibility controls
    document.getElementById("triangleVisible").addEventListener("change", function(event) {
        objects.triangle.visible = event.target.checked;
        drawScene();
    });
    
    document.getElementById("rectangleVisible").addEventListener("change", function(event) {
        objects.rectangle.visible = event.target.checked;
        drawScene();
    });
    
    document.getElementById("letterHVisible").addEventListener("change", function(event) {
        objects.letterH.visible = event.target.checked;
        drawScene();
    });

    // Translation controls
    document.getElementById("translateX").addEventListener("input", function(event) {
        objects[selectedObject].translation[0] = parseFloat(event.target.value);
        document.getElementById("translateXValue").innerText = objects[selectedObject].translation[0].toFixed(2);
        drawScene();
        isModified = true;
    });

    document.getElementById("translateY").addEventListener("input", function(event) {
        objects[selectedObject].translation[1] = parseFloat(event.target.value);
        document.getElementById("translateYValue").innerText = objects[selectedObject].translation[1].toFixed(2);
        drawScene();
        isModified = true;
    });

    // Scale controls
    document.getElementById("scaleX").addEventListener("input", function(event) {
        objects[selectedObject].x_scale = parseFloat(event.target.value);
        document.getElementById("scaleXValue").innerText = objects[selectedObject].x_scale.toFixed(2);
        drawScene();
        isModified = true;
    });

    document.getElementById("scaleY").addEventListener("input", function(event) {
        objects[selectedObject].y_scale = parseFloat(event.target.value);
        document.getElementById("scaleYValue").innerText = objects[selectedObject].y_scale.toFixed(2);
        drawScene();
        isModified = true;
    });

    // Rotation control
    document.getElementById("rotateSlider").addEventListener("input", function(event) {
        objects[selectedObject].angle = parseFloat(event.target.value) * Math.PI / 180;
        document.getElementById("rotateValue").innerText = event.target.value;
        drawScene();
        isModified = true;
    });

    // Pivot point controls

    // Color control
    document.getElementById("colorDropdown").addEventListener("change", function(event) {
        objects[selectedObject].color = rainbowColors[event.target.value];
        drawScene();
        isModified = true;
    });

    // Chaos mode toggle
    document.getElementById("toggleChaos").addEventListener("click", function() {
        isChaosMode = !isChaosMode;
        this.textContent = isChaosMode ? "⏹ Dừng ngẫu nhiên" : "🎲 Bật chế độ ngẫu nhiên";
        if (isChaosMode) {
            lastTime = performance.now();
            initializeVelocities();
            requestAnimationFrame(updateChaosMovement);
        } else if (chaosAnimationId) {
            cancelAnimationFrame(chaosAnimationId);
            chaosAnimationId = null;
        }
    });

    // Reset button
    document.getElementById("resetButton").addEventListener("click", resetChaosMode);
}


// Grid creation function
function createGrid() {
    const gridContainer = document.getElementById('grid-container');
    const cellSize = 40;
    const cols = Math.ceil(window.innerWidth / cellSize);
    const rows = Math.ceil(window.innerHeight / cellSize);

    gridContainer.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
    gridContainer.style.gridTemplateRows = `repeat(${rows}, ${cellSize}px)`;

    gridContainer.innerHTML = '';

    for (let i = 0; i < cols * rows; i++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        
        cell.addEventListener('mouseenter', () => {
            requestAnimationFrame(() => {
                cell.style.transform = 'scale(1.08)';
                cell.style.transition = 'transform 0.12s ease-out';
            });
        });

        cell.addEventListener('mouseleave', () => {
            requestAnimationFrame(() => {
                cell.style.transform = 'scale(1)';
                cell.style.transition = 'transform 0.25s ease-out';
            });
        });

        gridContainer.appendChild(cell);
    }
}

// Before unload warning
window.addEventListener("beforeunload", function (event) {
    if (isModified) {
        event.returnValue = "Bạn có chắc muốn rời đi không?";
    }
});

// Resize observer
const resizeObserver = new ResizeObserver(entries => {
    requestAnimationFrame(() => {
        createGrid();
    });
});

resizeObserver.observe(document.body);

// Initialize
function initialize() {
    gl.clearColor(0, 0, 0, 0);
    setupEventListeners();
    createGrid();
    updateControls();
    drawScene();
}

// Start initialization when DOM is loaded
window.addEventListener('DOMContentLoaded', initialize);