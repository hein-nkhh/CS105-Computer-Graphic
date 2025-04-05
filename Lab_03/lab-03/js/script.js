function evaluatePolynomial(coefficients, x) {
    let degree = coefficients.length - 1;
    return coefficients.reduce((sum, coeff, index) => sum + coeff * Math.pow(x, degree - index), 0);
}

function generatePointsFromPolynomial(coefficients, range, step) {
    let points = [];
    for (let x = range[0]; x <= range[1]; x += step) {
        points.push({ x: x, y: evaluatePolynomial(coefficients, x) });
    }
    return points;
}
 // Cờ kiểm soát việc tự động đặt giá trị mặc định

 let isFirstLoad = true; // Biến kiểm tra lần đầu tiên tải trang
 let hasReset = false; // Biến kiểm tra khi người dùng reset
 
 function updateCoefficientInputs(useDefault = false) {
     let degree = parseInt(document.getElementById("degree").value);
     let coefficientContainer = document.getElementById("coefficients");
     coefficientContainer.innerHTML = "";
 
     // Hệ số mặc định cho bậc 5
     let defaultCoefficients = {
         5: [1, 0, -5, 0, 4, 0], // x^5 + 0x^4 - 5x^3 + 0x^2 + 4x + 0
     };
 
     // Chỉ dùng hệ số mặc định khi:
     // - Lần đầu tải trang (`isFirstLoad === true`)
     // - Nhấn reset (`hasReset === true`)
     // Không tự động áp dụng nếu người dùng chọn bậc khác
     let coefficients = (isFirstLoad || hasReset) && defaultCoefficients[degree]
         ? defaultCoefficients[degree]
         : new Array(degree + 1).fill(null);
 
     // Tạo các input cho các hệ số
     for (let i = degree; i >= 0; i--) {
         let input = document.createElement("input");
         input.type = "number";
         input.id = `coef${i}`;
         input.placeholder = `Hệ số x^${i}`;
         input.value = coefficients[degree - i] !== null ? coefficients[degree - i] : "";
         coefficientContainer.appendChild(input);
     }
 
     // Chỉ đặt lại isFirstLoad sau lần đầu tiên hoặc khi reset
     if (isFirstLoad || hasReset) {
         isFirstLoad = false;
         hasReset = false;
     }
 
     drawGraph(); // Vẽ lại đồ thị khi cập nhật hệ số
 }

 function resetGraph() {
    hasReset = true; // Đánh dấu là vừa reset
    document.getElementById("degree").value = 5;
    updateCoefficientInputs(true); // Gọi với useDefault = true để hiển thị hệ số mặc định
}

// Lấy các hệ số từ input
function getCoefficients() {
    let degree = parseInt(document.getElementById("degree").value);
    let coefficients = [];
    for (let i = degree; i >= 0; i--) {
        let value = parseFloat(document.getElementById(`coef${i}`).value) || 0;
        coefficients.push(value);
    }
    return coefficients;
}

function drawGraph() {
    let coefficients = getCoefficients();

    let allZero = coefficients.every(coef => coef === 0);

    let canvas = document.getElementById("graphCanvas");
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let range = [-5, 5];
    let step = 0.1;
    let points = generatePointsFromPolynomial(coefficients, range, step);

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(50, -50);

    // Vẽ trục tọa độ
    ctx.beginPath();
    ctx.moveTo(-canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, 0);
    ctx.moveTo(0, -canvas.height / 2);
    ctx.lineTo(0, canvas.height / 2);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 0.02;
    ctx.stroke();

    // Vẽ đồ thị hàm số
    if (!allZero){
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 0.05;
        ctx.stroke();
    }
    

    ctx.restore();
}

// Khi trang tải xong, hiển thị bậc mặc định là 5
window.onload = () => {
    isFirstLoad = true;
    updateCoefficientInputs(true);
};

// Gán sự kiện cho dropdown chọn bậc
document.getElementById("degree").addEventListener("input", () => {
    updateCoefficientInputs(); // Không dùng hệ số mặc định khi người dùng tự thay đổi bậc
});

// Gán sự kiện cho nút "Vẽ đồ thị"
document.getElementById("drawButton").addEventListener("click", resetGraph);
