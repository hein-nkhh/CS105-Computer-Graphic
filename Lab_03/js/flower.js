// Hàm để vẽ cánh hoa
function drawFlower() {
    const canvas = document.getElementById("graphCanvas");
    const ctx = canvas.getContext("2d");

    // Xóa canvas trước khi vẽ lại
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Di chuyển gốc tọa độ về trung tâm canvas
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);

    ctx.beginPath();

    // Vẽ đồ thị theo công thức cánh hoa
    const numSteps = 1000; // Số bước vẽ
    const stepSize = Math.PI * 2 / numSteps; // Bước nhảy của t

    for (let i = 0; i <= numSteps; i++) {
        const t = i * stepSize;
        const x = Math.cos(5 * t) * Math.cos(t);
        const y = Math.cos(5 * t) * Math.sin(t);

        // Chuyển sang đơn vị pixels (điều chỉnh tỉ lệ)
        const scale = 100; // Tỉ lệ phóng đại
        const pixelX = x * scale;
        const pixelY = y * scale;

        if (i === 0) {
            ctx.moveTo(pixelX, pixelY); // Di chuyển đến điểm bắt đầu
        } else {
            ctx.lineTo(pixelX, pixelY); // Vẽ đường thẳng nối các điểm
        }
    }

    // Hoàn tất việc vẽ cánh hoa
    ctx.closePath();
    ctx.strokeStyle = "blue"; // Màu cánh hoa
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
}

// Hàm để reset canvas cho cánh hoa (nếu cần)
function resetFlower() {
    const canvas = document.getElementById("graphCanvas");
    const ctx = canvas.getContext("2d");

    // Xóa canvas khi reset
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Cập nhật hàm changeTab để hỗ trợ tab Cánh Hoa
document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    const canvas = document.getElementById('graphCanvas');

    function changeTab(tabName) {
        // Ẩn tất cả tab content
        tabContents.forEach(tab => {
            tab.classList.remove('active');
        });

        // Đặt lại trạng thái active của các tab
        tabs.forEach(tab => {
            tab.classList.remove('active');
        });

        // Hiển thị tab được chọn
        document.getElementById(tabName + '-tab').classList.add('active');

        // Đánh dấu tab được chọn là active
        document.querySelector(`.tab[data-tab="${tabName}"]`).classList.add('active');

        // Khởi tạo nội dung cho tab đó
        if (tabName === 'bezier') {
            window.bezierFunctions.initBezierMode();
            window.hermiteFunctions.exitHermiteMode();
        } else if (tabName === 'hermite') {
            window.hermiteFunctions.initHermiteMode();
            window.bezierFunctions.exitBezierMode();
        } else if (tabName === 'flower') {
            resetFlower();  // Reset canvas khi chọn tab Flower
            drawFlower();   // Vẽ cánh hoa khi vào tab Flower
            window.bezierFunctions.exitBezierMode();
            window.hermiteFunctions.exitHermiteMode();
        } else {
            window.bezierFunctions.exitBezierMode();
            window.hermiteFunctions.exitHermiteMode();
            drawGraph(); // Sử dụng hàm từ script.js
        }
    }

    // Gán sự kiện cho các tab
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            changeTab(this.getAttribute('data-tab'));
        });
    });

    // Mặc định hiển thị tab đa thức khi tải trang
    changeTab('polynomial');
});
