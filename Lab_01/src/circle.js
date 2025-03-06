var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

var width = 800;
var height = 600;

var bgRgba = [240, 240, 200, 255];
var pointRgba = [0, 0, 255, 255];
var circleTempRgba = [255, 0, 0, 255];  // Đường tròn hoàn thành màu đen
var circleFinalRgba = [0, 0, 0, 255]; // Đường tròn đang vẽ màu đỏ

canvas.setAttribute("width", width);
canvas.setAttribute("height", height);

function Painter(context, width, height) {
    this.context = context;
    this.imageData = context.createImageData(width, height);
    this.circles = [];
    this.tempCircle = null;
    this.width = width;
    this.height = height;

    this.drawBkg = function(rgba) {
        for (var i = 0; i < width; i++)
            for (var j = 0; j < height; j++)
                this.setPixel(i, j, rgba);
    };

    this.getPixelIndex = function(x, y) {
        if (x < 0 || y < 0 || x >= width || y >= height)
            return -1;
        return (x + y * width) * 4;
    };

    this.setPixel = function(x, y, rgba) {
        var pixelIndex = this.getPixelIndex(x, y);
        if (pixelIndex === -1) return;
        for (var i = 0; i < 4; i++) {
            this.imageData.data[pixelIndex + i] = rgba[i];
        }
    };

    this.drawPoint = function(p, rgba){
        var x = p[0];
        var y = p[1];
        for (var i = -1; i <= 1; i++)
            for (var j = -1; j <= 1; j++)
                this.setPixel(x + i, y + j, rgba);
    }

    this.drawCircle = function(center, radius, rgba) {
        var x0 = center[0], y0 = center[1];
        var x = 0, y = radius;
        var fi = 1 - radius;

        var plotCirclePoints = (xc, yc, x, y, rgba) => {
            this.setPixel(xc + x, yc + y, rgba);
            this.setPixel(xc - x, yc + y, rgba);
            this.setPixel(xc + x, yc - y, rgba);
            this.setPixel(xc - x, yc - y, rgba);
            this.setPixel(xc + y, yc + x, rgba);
            this.setPixel(xc - y, yc + x, rgba);
            this.setPixel(xc + y, yc - x, rgba);
            this.setPixel(xc - y, yc - x, rgba);
        };

        plotCirclePoints(x0, y0, x, y, rgba);

        while (x < y) {
            x++;
            if (fi < 0) {
                fi += 2 * x + 3;
            } else {
                y--;
                fi += 2 * (x-y) + 5;
            }
            plotCirclePoints(x0, y0, x, y, rgba);
        }
        this.drawPoint(center, pointRgba);
    };

    this.clear = function() {
        this.circles.length = 0;
        this.tempCircle = null;
        this.drawBkg(bgRgba);
        this.context.putImageData(this.imageData, 0, 0);
    };

    this.addCircle = function(center, radius) {
        this.circles.push({ center, radius });
    };

    this.draw = function() {
        this.drawBkg(bgRgba);
        for (var i = 0; i < this.circles.length; i++)
            this.drawCircle(this.circles[i].center, this.circles[i].radius, circleFinalRgba);
        if (this.tempCircle)
            this.drawCircle(this.tempCircle.center, this.tempCircle.radius, circleTempRgba);
        this.context.putImageData(this.imageData, 0, 0);
    };

    // Vẽ nền ngay khi khởi tạo
    this.clear();
}

var painter = new Painter(context, width, height);
var center = null;
var state = 0; // 0: waiting, 1: Drawing, 2: Finished

function getPosOnCanvas(x, y) {
    var bbox = canvas.getBoundingClientRect();
    return [Math.floor(x - bbox.left * (canvas.width / bbox.width) + 0.5),
            Math.floor(y - bbox.top * (canvas.height / bbox.height) + 0.5)];
}

function doMouseDown(e) {
    if (e.button !== 0) return;

    var p = getPosOnCanvas(e.clientX, e.clientY);

    if (state === 0) {
        center = p; 
        state = 1; 
    } else if (state === 2) {
        painter.addCircle(painter.tempCircle.center, painter.tempCircle.radius);
        painter.tempCircle = null; 
        state = 0; 
        painter.draw(); 
    }
}

function doMouseMove(e) {
    if (state !== 2) return;

    var p = getPosOnCanvas(e.clientX, e.clientY);
    
    var dx = p[0] - center[0];
    var dy = p[1] - center[1];
    var radius = Math.round(Math.sqrt(dx * dx + dy * dy));

    painter.tempCircle = { center, radius };
    painter.draw(); 
}

function doMouseUp(e) {
    if (state === 1) {
        state = 2
    }
}

function doReset() {
    state = 0;
    painter.clear();
}

canvas.addEventListener("mousedown", doMouseDown, false);
canvas.addEventListener("mousemove", doMouseMove, false);
canvas.addEventListener("mouseup", doMouseUp, false);

var resetButton = document.getElementById("reset");
resetButton.addEventListener("click", doReset, false);