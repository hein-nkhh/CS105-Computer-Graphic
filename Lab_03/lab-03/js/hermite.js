// Biến lưu trữ các điểm điều khiển và vector tiếp tuyến Hermite
let hermitePoints = [];
let hermiteTangents = [];
let isHermiteMode = false;
let isDraggingHermite = false;
let selectedHermitePoint = null;
let selectedHermiteTangent = null;
let tangentScale = 0.2; // Scale để hiển thị vector tiếp tuyến

// Khởi tạo Hermite mode
function initHermiteMode() {
    isHermiteMode = true;
    hermitePoints = [];
    hermiteTangents = [];
    resetHermiteCanvas();
    updateHermitePointsList();
}

// Thêm điểm điều khiển Hermite mới
function addHermitePoint(x, y) {
    const canvas = document.getElementById("graphCanvas");
    const mathX = (x - canvas.width / 2) / 50;
    const mathY = -(y - canvas.height / 2) / 50;

    // Thêm điểm và vector tiếp tuyến mặc định
    hermitePoints.push({ x: mathX, y: mathY });
    hermiteTangents.push({ x: 1, y: 0 }); // Vector tiếp tuyến mặc định (1, 0)

    console.log("Added Hermite Point:", { x: mathX, y: mathY });

    drawHermiteCurve();
    updateHermitePointsList();
}

// Cập nhật danh sách điểm hiển thị
function updateHermitePointsList() {
    const pointsList = document.getElementById("hermite-points-list");
    if (!pointsList) return;
    
    pointsList.innerHTML = "";
    
    if (hermitePoints.length === 0) {
        return;
    }
    
    
    hermitePoints.forEach((point, index) => {
        const tangent = hermiteTangents[index];
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>P${index}</td>
            <td>${point.x.toFixed(2)}</td>
            <td>${point.y.toFixed(2)}</td>
            <td>T${index}</td>
            <td>${tangent.x.toFixed(2)}</td>
            <td>${tangent.y.toFixed(2)}</td>
        `;
        table.appendChild(row);
    });
    
    pointsList.appendChild(table);
}

// Vẽ các điểm điều khiển và vector tiếp tuyến
function drawHermiteControlPoints() {
  const canvas = document.getElementById("graphCanvas");
  const ctx = canvas.getContext("2d");

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(50, -50);

  // Vẽ các điểm điều khiển
  hermitePoints.forEach((point, index) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 0.1, 0, Math.PI * 2);
      ctx.fillStyle = "blue";
      ctx.fill();
      
      // Vẽ vector tiếp tuyến
      const tangent = hermiteTangents[index];
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
      ctx.lineTo(point.x + tangent.x * tangentScale, point.y + tangent.y * tangentScale);
      ctx.strokeStyle = "red";
      ctx.lineWidth = 0.05;
      ctx.stroke();
      
      // Vẽ mũi tên ở đầu vector tiếp tuyến
      const arrowLength = 0.1;  // Độ dài mũi tên
      const arrowAngle = Math.PI / 6;  // Góc của mũi tên

      // Tính toán hai điểm để vẽ mũi tên
      const arrowX1 = point.x + tangent.x * tangentScale - arrowLength * Math.cos(Math.atan2(tangent.y, tangent.x) - arrowAngle);
      const arrowY1 = point.y + tangent.y * tangentScale - arrowLength * Math.sin(Math.atan2(tangent.y, tangent.x) - arrowAngle);

      const arrowX2 = point.x + tangent.x * tangentScale - arrowLength * Math.cos(Math.atan2(tangent.y, tangent.x) + arrowAngle);
      const arrowY2 = point.y + tangent.y * tangentScale - arrowLength * Math.sin(Math.atan2(tangent.y, tangent.x) + arrowAngle);

      // Vẽ mũi tên
      ctx.beginPath();
      ctx.moveTo(point.x + tangent.x * tangentScale, point.y + tangent.y * tangentScale);  // Đầu mũi tên
      ctx.lineTo(arrowX1, arrowY1);  // Cánh trái của mũi tên
      ctx.moveTo(point.x + tangent.x * tangentScale, point.y + tangent.y * tangentScale);  // Đầu mũi tên
      ctx.lineTo(arrowX2, arrowY2);  // Cánh phải của mũi tên
      ctx.strokeStyle = "red";
      ctx.lineWidth = 0.05;
      ctx.stroke();
  });

  ctx.restore();
}


// Hàm nội suy Hermite giữa hai điểm và vector tiếp tuyến tương ứng theo công thức chính xác
function hermiteInterpolation(p0, p1, v0, v1, t) {
    // Các hệ số Hermite theo công thức được cung cấp:
    // p(t) = (2t³ + 3t² + 1)p₀ + (-2t³ + 3t²)p₁ + (t³ - 2t² + t)v₀ + (t³ - t²)v₁
    const h0 = 2*t*t*t - 3*t*t + 1;     // (2t³ - 3t² + 1)
    const h1 = -2*t*t*t + 3*t*t;         // (-2t³ + 3t²)
    const h2 = t*t*t - 2*t*t + t;        // (t³ - 2t² + t)
    const h3 = t*t*t - t*t;              // (t³ - t²)
    
    return {
        x: h0 * p0.x + h1 * p1.x + h2 * v0.x + h3 * v1.x,
        y: h0 * p0.y + h1 * p1.y + h2 * v0.y + h3 * v1.y
    };
}

// Vẽ đường cong Hermite
function drawHermiteCurve() {
  resetHermiteCanvas();

  if (hermitePoints.length < 2) {
      drawHermiteControlPoints();
      return;
  }

  const canvas = document.getElementById("graphCanvas");
  const ctx = canvas.getContext("2d");

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(50, -50);

  // Vẽ đường cong Hermite giữa các cặp điểm liên tiếp
  for (let i = 0; i < hermitePoints.length - 1; i++) {
      const p0 = hermitePoints[i];
      const p1 = hermitePoints[i + 1];
      const v0 = hermiteTangents[i];
      const v1 = hermiteTangents[i + 1];
      
      ctx.beginPath();
      
      // Nội suy và vẽ nhiều điểm để tạo đường cong
      for (let step = 0; step <= 500; step++) {  // Tăng số bước lên 200
          const t = step / 500;  // Sử dụng 200 bước thay vì 100
          const point = hermiteInterpolation(p0, p1, v0, v1, t);
          
          if (step === 0) {
              ctx.moveTo(point.x, point.y);
          } else {
              ctx.lineTo(point.x, point.y);
          }
      }
      
      ctx.strokeStyle = "blue";
      ctx.lineWidth = 0.05;
      ctx.stroke();
  }

  ctx.restore();

  // Vẽ các điểm điều khiển và vector tiếp tuyến sau cùng
  drawHermiteControlPoints();
}

// Reset canvas cho chế độ Hermite
function resetHermiteCanvas() {
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
// Xử lý sự kiện click chuột để thêm điểm điều khiển
function handleHermiteClick(event) {
  if (!isHermiteMode) return;
  
  const canvas = document.getElementById("graphCanvas");
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  // Kiểm tra xem đã click vào điểm hay vector tiếp tuyến chưa
  if (!checkHermitePointSelection(x, y)) {
      // Nếu không click vào bất kỳ điểm hoặc vector nào, thì thêm điểm điều khiển
      addHermitePoint(x, y);
  } else {
      // Nếu click vào điểm hoặc vector tiếp tuyến, dừng việc kéo
      isDraggingHermite = false;
      selectedHermitePoint = null;
      selectedHermiteTangent = null;
      drawHermiteCurve(); // Cập nhật lại việc vẽ đường cong sau khi dừng kéo
  }
}


// Kiểm tra xem click có trúng điểm điều khiển hoặc vector tiếp tuyến không
function checkHermitePointSelection(x, y) {
    const canvas = document.getElementById("graphCanvas");
    const mathX = (x - canvas.width / 2) / 50;
    const mathY = -(y - canvas.height / 2) / 50;
    
    // Kiểm tra vector tiếp tuyến trước (vì nó nhỏ hơn và nằm trên điểm)
    for (let i = 0; i < hermitePoints.length; i++) {
        const point = hermitePoints[i];
        const tangent = hermiteTangents[i];
        const tangentEndX = point.x + tangent.x * tangentScale;
        const tangentEndY = point.y + tangent.y * tangentScale;
        
        const distanceToTangent = Math.sqrt(Math.pow(tangentEndX - mathX, 2) + Math.pow(tangentEndY - mathY, 2));
        
        if (distanceToTangent < 0.2) {
            isDraggingHermite = true;
            selectedHermitePoint = i;
            selectedHermiteTangent = true;
            return true;
        }
    }
    
    // Sau đó kiểm tra các điểm điều khiển
    for (let i = 0; i < hermitePoints.length; i++) {
        const point = hermitePoints[i];
        const distance = Math.sqrt(Math.pow(point.x - mathX, 2) + Math.pow(point.y - mathY, 2));
        
        if (distance < 0.2) {
            isDraggingHermite = true;
            selectedHermitePoint = i;
            selectedHermiteTangent = false;
            return true;
        }
    }
    
    return false;
}

// Xử lý sự kiện chuột nhấn để bắt đầu kéo
function handleHermiteMouseDown(event) {
    if (!isHermiteMode) return;
    
    const canvas = document.getElementById("graphCanvas");
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    checkHermitePointSelection(x, y);
}

// Xử lý sự kiện chuột di chuyển để kéo điểm hoặc vector tiếp tuyến
function handleHermiteMouseMove(event) {
  if (!isHermiteMode || !isDraggingHermite) return;
  
  const canvas = document.getElementById("graphCanvas");
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  const mathX = (x - canvas.width / 2) / 50;
  const mathY = -(y - canvas.height / 2) / 50;
  
  if (selectedHermiteTangent) {
      // Nếu đang kéo vector tiếp tuyến
      const point = hermitePoints[selectedHermitePoint];
      
      // Tính toán vector tiếp tuyến mới (từ điểm đến vị trí chuột)
      const newTangent = {
          x: (mathX - point.x) / tangentScale,
          y: (mathY - point.y) / tangentScale
      };
      
      hermiteTangents[selectedHermitePoint] = newTangent;
  } else {
      // Nếu đang kéo điểm điều khiển
      hermitePoints[selectedHermitePoint].x = mathX;
      hermitePoints[selectedHermitePoint].y = mathY;
  }
  
  drawHermiteCurve();  // Vẽ lại đường cong sau mỗi lần di chuyển
  updateHermitePointsList();  // Cập nhật danh sách điểm
}


// Xử lý sự kiện chuột thả
// Xử lý sự kiện chuột thả
function handleHermiteMouseUp() {
  isDraggingHermite = false; // Đặt lại trạng thái khi chuột thả ra
  selectedHermitePoint = null;
  selectedHermiteTangent = null; // Đảm bảo rằng không còn kéo vector tiếp tuyến
}


// Xóa tất cả các điểm và vẽ lại
function clearHermitePoints() {
    hermitePoints = [];
    hermiteTangents = [];
    resetHermiteCanvas();
    updateHermitePointsList();
}

// Thoát khỏi chế độ Hermite
function exitHermiteMode() {
    isHermiteMode = false;
    hermitePoints = [];
    hermiteTangents = [];
}

// Export các hàm để sử dụng từ file khác
window.hermiteFunctions = {
    initHermiteMode,
    drawHermiteCurve,
    clearHermitePoints,
    exitHermiteMode,
    handleHermiteClick,
    handleHermiteMouseDown,
    handleHermiteMouseMove,
    handleHermiteMouseUp
};