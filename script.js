let originalImage = null;
let cropCanvas, ctx;
let scale = 1;
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let lastX = 0;
let lastY = 0;

const PIECE_WIDTH = 300;
const PIECE_HEIGHT = 400;
const CANVAS_WIDTH = PIECE_WIDTH * 3;
const CANVAS_HEIGHT = PIECE_HEIGHT;

document.getElementById('imageInput').addEventListener('change', handleImageUpload);
document.getElementById('processBtn').addEventListener('click', processImage);
document.getElementById('resetBtn').addEventListener('click', reset);
document.getElementById('downloadAllBtn').addEventListener('click', downloadAll);

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            originalImage = img;
            initEditor();
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function initEditor() {
    document.getElementById('uploadSection').style.display = 'none';
    document.getElementById('editorSection').style.display = 'block';
    document.getElementById('resultSection').style.display = 'none';

    cropCanvas = document.getElementById('cropCanvas');
    ctx = cropCanvas.getContext('2d');
    
    cropCanvas.width = CANVAS_WIDTH;
    cropCanvas.height = CANVAS_HEIGHT;

    const imgAspect = originalImage.width / originalImage.height;
    const canvasAspect = CANVAS_WIDTH / CANVAS_HEIGHT;
    
    scale = imgAspect > canvasAspect ? 1 : canvasAspect / imgAspect;
    offsetX = 0;
    offsetY = 0;

    cropCanvas.addEventListener('mousedown', startDrag);
    cropCanvas.addEventListener('mousemove', drag);
    cropCanvas.addEventListener('mouseup', endDrag);
    cropCanvas.addEventListener('mouseleave', endDrag);
    cropCanvas.addEventListener('touchstart', startDragTouch, {passive: false});
    cropCanvas.addEventListener('touchmove', dragTouch, {passive: false});
    cropCanvas.addEventListener('touchend', endDrag);
    cropCanvas.addEventListener('wheel', handleWheel, {passive: false});
    cropCanvas.style.cursor = 'grab';
    cropCanvas.style.touchAction = 'none';

    updatePreview();
}

function startDrag(e) {
    isDragging = true;
    lastX = e.offsetX;
    lastY = e.offsetY;
    cropCanvas.style.cursor = 'grabbing';
}

function startDragTouch(e) {
    e.preventDefault();
    isDragging = true;
    const rect = cropCanvas.getBoundingClientRect();
    const touch = e.touches[0];
    lastX = (touch.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    lastY = (touch.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);
}

function drag(e) {
    if (!isDragging) return;
    
    const deltaX = e.offsetX - lastX;
    const deltaY = e.offsetY - lastY;
    
    applyDrag(deltaX, deltaY);
    
    lastX = e.offsetX;
    lastY = e.offsetY;
}

function dragTouch(e) {
    if (!isDragging) return;
    e.preventDefault();
    
    const rect = cropCanvas.getBoundingClientRect();
    const touch = e.touches[0];
    const currentX = (touch.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    const currentY = (touch.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);
    
    const deltaX = currentX - lastX;
    const deltaY = currentY - lastY;
    
    applyDrag(deltaX, deltaY);
    
    lastX = currentX;
    lastY = currentY;
}

function applyDrag(deltaX, deltaY) {
    const imgAspect = originalImage.width / originalImage.height;
    const canvasAspect = CANVAS_WIDTH / CANVAS_HEIGHT;
    
    let drawWidth, drawHeight;
    if (imgAspect > canvasAspect) {
        drawWidth = CANVAS_WIDTH * scale;
        drawHeight = drawWidth / imgAspect;
    } else {
        drawHeight = CANVAS_HEIGHT * scale;
        drawWidth = drawHeight * imgAspect;
    }
    
    const margin = 0.95;
    const maxOffsetX = Math.max(0, (drawWidth - CANVAS_WIDTH) / 2) * margin;
    const maxOffsetY = Math.max(0, (drawHeight - CANVAS_HEIGHT) / 2) * margin;
    
    offsetX += deltaX;
    offsetY += deltaY;
    
    offsetX = Math.max(-maxOffsetX, Math.min(maxOffsetX, offsetX));
    offsetY = Math.max(-maxOffsetY, Math.min(maxOffsetY, offsetY));
    
    updatePreview();
}

function endDrag() {
    isDragging = false;
    cropCanvas.style.cursor = 'grab';
}

function handleWheel(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    const imgAspect = originalImage.width / originalImage.height;
    const canvasAspect = CANVAS_WIDTH / CANVAS_HEIGHT;
    const minScale = imgAspect > canvasAspect ? 1 : canvasAspect / imgAspect;
    
    scale = Math.max(minScale, Math.min(3, scale + delta));
    updatePreview();
}

function updatePreview() {
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const imgAspect = originalImage.width / originalImage.height;
    const canvasAspect = CANVAS_WIDTH / CANVAS_HEIGHT;

    let drawWidth, drawHeight;
    if (imgAspect > canvasAspect) {
        drawWidth = CANVAS_WIDTH * scale;
        drawHeight = drawWidth / imgAspect;
    } else {
        drawHeight = CANVAS_HEIGHT * scale;
        drawWidth = drawHeight * imgAspect;
    }

    const x = (CANVAS_WIDTH - drawWidth) / 2 + offsetX;
    const y = (CANVAS_HEIGHT - drawHeight) / 2 + offsetY;

    ctx.drawImage(originalImage, x, y, drawWidth, drawHeight);
}

function processImage() {
    const resultCanvases = [
        document.getElementById('result1'),
        document.getElementById('result2'),
        document.getElementById('result3')
    ];

    for (let i = 0; i < 3; i++) {
        const pieceCanvas = document.createElement('canvas');
        const pieceCtx = pieceCanvas.getContext('2d');
        pieceCanvas.width = PIECE_WIDTH;
        pieceCanvas.height = PIECE_HEIGHT;

        pieceCtx.drawImage(cropCanvas, PIECE_WIDTH * i, 0, PIECE_WIDTH, PIECE_HEIGHT, 0, 0, PIECE_WIDTH, PIECE_HEIGHT);

        const finalCanvas = resultCanvases[i];
        const finalWidth = 1080;
        const finalHeight = 1350;
        finalCanvas.width = finalWidth;
        finalCanvas.height = finalHeight;
        const finalCtx = finalCanvas.getContext('2d');

        const bgCanvas = document.createElement('canvas');
        bgCanvas.width = finalWidth;
        bgCanvas.height = finalHeight;
        const bgCtx = bgCanvas.getContext('2d');

        bgCtx.filter = 'blur(40px)';
        bgCtx.drawImage(pieceCanvas, 0, 0, finalWidth, finalHeight);
        bgCtx.filter = 'none';

        finalCtx.drawImage(bgCanvas, 0, 0);

        const scaledWidth = finalWidth;
        const scaledHeight = (PIECE_HEIGHT / PIECE_WIDTH) * finalWidth;
        const yPos = (finalHeight - scaledHeight) / 2;

        finalCtx.drawImage(pieceCanvas, 0, yPos, scaledWidth, scaledHeight);
    }

    document.getElementById('editorSection').style.display = 'none';
    document.getElementById('resultSection').style.display = 'block';
}

function downloadImage(index) {
    const canvas = document.getElementById(`result${index + 1}`);
    const link = document.createElement('a');
    link.download = `insta-grid-${index + 1}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.95);
    link.click();
}

function downloadAll() {
    for (let i = 0; i < 3; i++) {
        setTimeout(() => downloadImage(i), i * 300);
    }
}

function reset() {
    document.getElementById('uploadSection').style.display = 'block';
    document.getElementById('editorSection').style.display = 'none';
    document.getElementById('resultSection').style.display = 'none';
    document.getElementById('imageInput').value = '';
    originalImage = null;
}
