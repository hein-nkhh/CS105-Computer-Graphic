function hideWelcomeMessage() {
    var welcomeMessage = document.getElementById("welcome-message");
    if (welcomeMessage) {
        welcomeMessage.style.display = "none";
    }
}

function loadAlgorithm(type) {
    const scriptId = "algorithm-script";
    let script = document.getElementById(scriptId);

    if (script) {
        script.remove();
    }

    let newCanvas = canvas.cloneNode(true);
    canvas.parentNode.replaceChild(newCanvas, canvas);
    canvas = newCanvas; 

    if (typeof painter !== "undefined") {
        painter.clear();
    }

    canvas.replaceWith(canvas.cloneNode(true));

    const algorithms = {
        "dda": "src/dda.js",
        "bresenham": "src/bresenham.js",
        "circle": "src/circle.js",
        "ellipse": "src/elips.js"
    };

    if (!(type in algorithms)) {
        console.error("Thuật toán không tồn tại:", type);
        return;
    }

    // Load script mới
    script = document.createElement("script");
    script.id = scriptId;
    script.src = algorithms[type];
    script.type = "text/javascript";

    document.body.appendChild(script);

    if (type === "dda" || type === "bresenham") {
        document.getElementById("esc-hint").style.display = "block";
    } else {
        document.getElementById("esc-hint").style.display = "none";
    }
    
    // Ẩn thông báo khi chọn thuật toán
    hideWelcomeMessage();
}

// Hàm xử lý nút Reset
function doReset() {
    // Hiển thị hộp thoại xác nhận khi người dùng nhấn nút Reset
    var confirmation = window.confirm("Bạn có chắc chắn muốn xóa bản vẽ không?");
    
    // Nếu người dùng chọn "OK", thì thực hiện xóa bản vẽ
    if (confirmation) {
        state = 0;
        painter.clear();
    }
}

// Đảm bảo rằng sự kiện click cho nút Reset được gán đúng
var resetButton = document.getElementById("reset");
resetButton.addEventListener("click", doReset, false);

