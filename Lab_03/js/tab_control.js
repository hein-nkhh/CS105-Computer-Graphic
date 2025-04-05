document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    const canvas = document.getElementById('graphCanvas');

    function changeTab(tabName) {
        tabContents.forEach(tab => tab.classList.remove('active'));
        tabs.forEach(tab => tab.classList.remove('active'));
        document.getElementById(tabName + '-tab').classList.add('active');
        document.querySelector(`.tab[data-tab="${tabName}"]`).classList.add('active');

        if (tabName === 'bezier') {
            window.bezierFunctions.initBezierMode();
        } else {
            window.bezierFunctions.exitBezierMode();
            drawGraph();
        }
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => changeTab(tab.dataset.tab));
    });

    canvas.addEventListener('click', window.bezierFunctions.handleBezierClick);
    canvas.addEventListener('mousedown', window.bezierFunctions.handleBezierMouseDown);
    canvas.addEventListener('mousemove', window.bezierFunctions.handleBezierMouseMove);
    canvas.addEventListener('mouseup', window.bezierFunctions.handleBezierMouseUp);
    document.addEventListener('mouseup', window.bezierFunctions.handleBezierMouseUp);

    changeTab('polynomial'); // Mặc định hiển thị tab đa thức khi tải trang
});