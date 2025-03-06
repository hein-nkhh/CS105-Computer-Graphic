var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

var width = 800;
var height = 600;
canvas.style.width = width + "px";
canvas.style.height = height + "px";

var bgRgba = [240, 240, 200, 255];
var pointRgba = [0, 0, 255, 255];
var ellipseTempRgba = [255, 0, 0, 255];  // Ellipse đang vẽ màu đỏ
var ellipseFinalRgba = [0, 0, 0, 255]; // Ellipse hoàn thành màu đen

canvas.setAttribute("width", width);
canvas.setAttribute("height", height);

function Painter(context, width, height) {
    this.context = context;
    this.imageData = context.createImageData(width, height);
    this.ellipses = [];
    this.tempEllipse = null;
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

    this.drawEllipse = function(center, a, b, rgba) {
        var xc = center[0], yc = center[1];
        var x = 0, y = b;
        var a2 = a * a, b2 = b * b;
        
        // var dx = 2 * ry2 * x, dy = 2 * rx2 * y;
        
        var x0 = a2/(Math.sqrt(a2 + b2));
        var pi = b2 - (a2 * b) + (0.25 * a2);

        var plotEllipsePoints = (xc, yc, x, y, rgba) => {
            this.setPixel(xc + x, yc + y, rgba);
            this.setPixel(xc - x, yc + y, rgba);
            this.setPixel(xc + x, yc - y, rgba);
            this.setPixel(xc - x, yc - y, rgba);
        };
        plotEllipsePoints(xc, yc, x, y, rgba);

        while (x <= x0) {
            if (pi < 0) {
                pi += b*b * (2*x+3);
            } else {
                pi += (b*b)*(2*x+3) - 2*a*a*(y-1);
                y--;
            }
            x++;
            plotEllipsePoints(xc, yc, x, y, rgba);
        }

        x = a; y = 0;
        plotEllipsePoints(xc, yc, x, y, rgba);
        pi = a2 - (b2 * a) + (0.25 * b2);
        while (x > x0) {
            if (pi < 0) {
                pi += a*a * (2*y+3);
            } else {
                pi += (a*a)*(2*y+3) - 2*b*b*(x-1);
                x--;
            }
            y++;
            plotEllipsePoints(xc, yc, x, y, rgba);
        }
        this.drawPoint(center, pointRgba);
    };

    this.clear = function() {
        this.ellipses.length = 0;
        this.tempEllipse = null;
        this.drawBkg(bgRgba);
        this.context.putImageData(this.imageData, 0, 0);
    };

    this.addEllipse = function(center, rx, ry) {
        this.ellipses.push({ center, rx, ry });
    };

    this.draw = function() {
        this.drawBkg(bgRgba);
        for (var i = 0; i < this.ellipses.length; i++)
            this.drawEllipse(this.ellipses[i].center, this.ellipses[i].rx, this.ellipses[i].ry, ellipseFinalRgba);
        if (this.tempEllipse)
            this.drawEllipse(this.tempEllipse.center, this.tempEllipse.rx, this.tempEllipse.ry, ellipseTempRgba);
        this.context.putImageData(this.imageData, 0, 0);
    };

    this.clear();
}

var painter = new Painter(context, width, height);
var center = null;
var state = 0;

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
        var rx = Math.abs(p[0] - center[0]);
        var ry = Math.abs(p[1] - center[1]);
        painter.addEllipse(painter.tempEllipse.center, painter.tempEllipse.rx, painter.tempEllipse.ry);
        painter.tempEllipse = null;
        state = 0;
        painter.draw();
    }
}

function doMouseMove(e) {
    if (state !== 2) return;

    var p = getPosOnCanvas(e.clientX, e.clientY);

    var rx = Math.abs(p[0] - center[0]);
    var ry = Math.abs(p[1] - center[1]);

    painter.tempEllipse = { center, rx, ry };
    painter.draw();
    
}

function doMouseUp(e){
    if (state === 1) {
        state = 2;
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
