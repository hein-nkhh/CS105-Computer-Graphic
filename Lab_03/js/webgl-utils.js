// Thư viện webgl-utils.js - Các hàm tiện ích cho WebGL

// Khởi tạo WebGL context
function initWebGL(canvas) {
  let gl = null;
  try {
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  } catch(e) {
    console.error("Không thể khởi tạo WebGL:", e);
  }
  
  if (!gl) {
    console.error("WebGL không được hỗ trợ hoặc bị tắt trên trình duyệt này.");
    return null;
  }
  
  return gl;
}

// Tạo shader từ mã nguồn
function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Lỗi biên dịch shader:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  
  return shader;
}

// Tạo program từ vertex shader và fragment shader
function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Lỗi liên kết program:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  
  return program;
}

// Khởi tạo program từ các shader
function initShaderProgram(gl) {
  // Lấy mã shader từ thẻ script trong HTML
  const vertexShaderSource = document.getElementById('vertex-shader').text;
  const fragmentShaderSource = document.getElementById('fragment-shader').text;
  
  // Tạo các shader
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  
  // Tạo program
  const program = createProgram(gl, vertexShader, fragmentShader);
  
  return program;
}

// Tạo và cấu hình buffer
function createBuffer(gl) {
  const buffer = gl.createBuffer();
  if (!buffer) {
    console.error('Không thể tạo buffer');
    return null;
  }
  return buffer;
}

// Đặt màu nền và xóa canvas
function clearCanvas(gl, r = 0, g = 0, b = 0, a = 0) {
  gl.clearColor(r, g, b, a);
  gl.clear(gl.COLOR_BUFFER_BIT);
}

// Hàm vẽ các điểm
function drawPoints(gl, positions, color = [1, 0, 0, 1]) {
  const positionBuffer = gl.getParameter(gl.ARRAY_BUFFER_BINDING);
  
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  gl.uniform4fv(gl.getUniformLocation(gl.getParameter(gl.CURRENT_PROGRAM), 'u_color'), color);
  gl.drawArrays(gl.POINTS, 0, positions.length / 2);
}

// Hàm vẽ đường thẳng
function drawLines(gl, positions, color = [1, 1, 1, 1]) {
  const positionBuffer = gl.getParameter(gl.ARRAY_BUFFER_BINDING);
  
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  gl.uniform4fv(gl.getUniformLocation(gl.getParameter(gl.CURRENT_PROGRAM), 'u_color'), color);
  gl.drawArrays(gl.LINE_STRIP, 0, positions.length / 2);
}

// Thiết lập thuộc tính vị trí
function setupPositionAttribute(gl, program, buffer) {
  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(
    positionAttributeLocation,
    2,          // 2 thành phần mỗi lần lặp
    gl.FLOAT,   // dữ liệu là float 32-bit
    false,      // không chuẩn hóa dữ liệu
    0,          // 0 = tiến về phía trước size * sizeof(type) mỗi lần lặp
    0           // bắt đầu từ đầu buffer
  );
}

// Thiết lập độ phân giải
function setResolution(gl, program, width, height) {
  const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
  gl.uniform2f(resolutionUniformLocation, width, height);
}

// Thiết lập màu
function setColor(gl, program, r, g, b, a) {
  const colorUniformLocation = gl.getUniformLocation(program, 'u_color');
  gl.uniform4f(colorUniformLocation, r, g, b, a);
}