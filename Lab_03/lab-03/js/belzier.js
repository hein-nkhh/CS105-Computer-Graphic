// Biến lưu trữ các điểm điều khiển Bézier
let controlPoints = [];
let isDragging = false;
let selectedPoint = null;
let bezierMode = false;

// Khởi tạo Bézier mode
function initBezierMode() {
    bezierMode = true;
    controlPoints = [];
    resetBezierCanvas();
    drawControlPoints();
    updatePointsList();
}

// Thêm điểm điều khiển mới
function addControlPoint(x, y) {
    const canvas = document.getElementById("graphCanvas");
    const mathX = (x - canvas.width / 2) / 50;
    const mathY = -(y - canvas.height / 2) / 50;

    controlPoints.push({ x: mathX, y: mathY });

    console.log("Added Control Point:", { x: mathX, y: mathY }); // Kiểm tra giá trị điểm

    drawBezierCurve();  // Gọi lại để vẽ điểm
}


// Cập nhật danh sách điểm hiển thị
function updatePointsList() {
    const pointsList = document.getElementById("points-list");
    if (!pointsList) return;
    
    pointsList.innerHTML = "";
    
    if (controlPoints.length === 0) {
        return;
    }
    
    const table = document.createElement("table");
    table.innerHTML = `
        <tr>
            <th>Điểm</th>
            <th>x</th>
            <th>y</th>
        </tr>
    `;
    
    controlPoints.forEach((point, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>P${index}</td>
            <td>${point.x.toFixed(2)}</td>
            <td>${point.y.toFixed(2)}</td>
        `;
        table.appendChild(row);
    });
    
    pointsList.appendChild(table);
}

// Vẽ các điểm điều khiển
function drawControlPoints() {
    const canvas = document.getElementById("graphCanvas");
    const ctx = canvas.getContext("2d");

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2); // Dịch hệ tọa độ
    ctx.scale(50, -50); // Lật trục y để đúng với toán học

    controlPoints.forEach((point, index) => {
        console.log("Drawing Point:", point.x, point.y); // Kiểm tra xem có tọa độ nào không

        ctx.beginPath();
        ctx.arc(point.x, point.y, 0.1, 0, Math.PI * 2);
        ctx.fillStyle = "red";
        ctx.fill();
    });

    ctx.restore();
}


// Tính giá trị của đường cong Bézier tại tham số t bằng thuật toán de Casteljau
function bezierPoint(points, t) {
    if (points.length === 1) {
        return points[0];
    }
    
    const newPoints = [];
    for (let i = 0; i < points.length - 1; i++) {
        newPoints.push({
            x: (1 - t) * points[i].x + t * points[i + 1].x,
            y: (1 - t) * points[i].y + t * points[i + 1].y
        });
    }
    
    return bezierPoint(newPoints, t);
}

// Vẽ đường cong Bézier
function drawBezierCurve() {
    resetBezierCanvas();

    if (controlPoints.length < 2) {
        drawControlPoints();
        return;
    }

    const canvas = document.getElementById("graphCanvas");
    const ctx = canvas.getContext("2d");

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(50, -50);

    // Vẽ đường cong Bézier
    ctx.beginPath();
    for (let i = 0; i <= 100; i++) {
        const t = i / 100;
        const point = bezierPoint(controlPoints, t);
        if (i === 0) {
            ctx.moveTo(point.x, point.y);
        } else {
            ctx.lineTo(point.x, point.y);
        }
    }
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 0.05;
    ctx.stroke();

    ctx.restore();

    // 📌 GỌI `drawControlPoints()` SAU CÙNG ĐỂ KHÔNG BỊ XÓA
    drawControlPoints();
}


// Reset canvas cho chế độ Bézier
function resetBezierCanvas() {
    const canvas = document.getElementById("graphCanvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Vẽ trục tọa độ
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(50, -50);
    
    ctx.beginPath();
    ctx.moveTo(-canvas.width / 100, 0);
    ctx.lineTo(canvas.width / 100, 0);
    ctx.moveTo(0, -canvas.height / 100);
    ctx.lineTo(0, canvas.height / 100);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 0.02;
    ctx.stroke();
    
    ctx.restore();
}

// Xử lý sự kiện click chuột để thêm điểm điều khiển
function handleBezierClick(event) {
    if (!bezierMode) return;
    
    const canvas = document.getElementById("graphCanvas");
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    addControlPoint(x, y);
}

// Xử lý sự kiện chuột di chuyển để kéo điểm điều khiển
function handleBezierMouseDown(event) {
    if (!bezierMode) return;
    
    const canvas = document.getElementById("graphCanvas");
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Chuyển đổi tọa độ canvas thành tọa độ toán học
    const mathX = (x - canvas.width / 2) / 50;
    const mathY = -(y - canvas.height / 2) / 50;
    
    // Kiểm tra xem đã click vào điểm điều khiển nào chưa
    for (let i = 0; i < controlPoints.length; i++) {
        const point = controlPoints[i];
        const distance = Math.sqrt(Math.pow(point.x - mathX, 2) + Math.pow(point.y - mathY, 2));
        
        if (distance < 0.2) {
            isDragging = true;
            selectedPoint = i;
            return;
        }
    }
}

function handleBezierMouseMove(event) {
    if (!bezierMode || !isDragging) return;
    
    const canvas = document.getElementById("graphCanvas");
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Chuyển đổi tọa độ canvas thành tọa độ toán học
    const mathX = (x - canvas.width / 2) / 50;
    const mathY = -(y - canvas.height / 2) / 50;
    
    // Cập nhật vị trí điểm điều khiển đang được kéo
    controlPoints[selectedPoint].x = mathX;
    controlPoints[selectedPoint].y = mathY;
    
    drawBezierCurve();
    updatePointsList();
}

function handleBezierMouseUp() {
    isDragging = false;
    selectedPoint = null;
}

function clearBezierPoints() {
    controlPoints = [];
    resetBezierCanvas();
    updatePointsList();
}

// Thoát khỏi chế độ Bézier
function exitBezierMode() {
    bezierMode = false;
    controlPoints = [];
}

// Export các hàm để sử dụng từ file khác
window.bezierFunctions = {
    initBezierMode,
    drawBezierCurve,
    clearBezierPoints,
    exitBezierMode,
    handleBezierClick,
    handleBezierMouseDown,
    handleBezierMouseMove,
    handleBezierMouseUp
};