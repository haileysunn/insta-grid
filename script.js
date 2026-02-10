let originalImage = null;
let cropCanvas, ctx;
let scale = 1;
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let lastX = 0;
let lastY = 0;
let lastDistance = 0;
let rows = 1;

const PIECE_WIDTH = 300;
const PIECE_HEIGHT = 400;
const CANVAS_WIDTH = PIECE_WIDTH * 3;
let CANVAS_HEIGHT = PIECE_HEIGHT;

document.getElementById('imageInput').addEventListener('change', handleImageUpload);
document.getElementById('processBtn').addEventListener('click', processImage);
document.getElementById('resetBtn').addEventListener('click', reset);
document.getElementById('downloadAllBtn').addEventListener('click', downloadAll);

document.querySelector('.add-row-btn').addEventListener('click', () => {
    if (rows < 3) changeRows(rows + 1);
});

document.querySelector('.remove-row-btn').addEventListener('click', () => {
    if (rows > 1) changeRows(rows - 1);
});

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

function changeRows(newRows) {
    rows = Math.max(1, Math.min(3, newRows));
    
    const addBtn = document.querySelector('.add-row-btn');
    const removeBtn = document.querySelector('.remove-row-btn');
    
    addBtn.style.display = rows < 3 ? 'flex' : 'none';
    removeBtn.style.display = rows > 1 ? 'flex' : 'none';
    
    CANVAS_HEIGHT = PIECE_HEIGHT * rows;
    if (originalImage) {
        cropCanvas.height = CANVAS_HEIGHT;
        updateGridOverlay();
        updatePreview();
    }
}

function updateGridOverlay() {
    const overlay = document.querySelector('.grid-overlay');
    overlay.innerHTML = '';
    
    // 세로선 2개 (항상 표시)
    for (let i = 0; i < 2; i++) {
        const line = document.createElement('div');
        line.className = 'grid-line-vertical';
        line.style.left = `${((i + 1) * 100 / 3)}%`;
        overlay.appendChild(line);
    }
    
    // 가로선 (줄 수 - 1개)
    for (let i = 0; i < rows - 1; i++) {
        const line = document.createElement('div');
        line.className = 'grid-line-horizontal';
        line.style.top = `${((i + 1) * 100 / rows)}%`;
        overlay.appendChild(line);
    }
}

function initEditor() {
    document.getElementById('uploadSection').style.display = 'none';
    document.getElementById('editorSection').style.display = 'block';
    document.getElementById('resultSection').style.display = 'none';

    cropCanvas = document.getElementById('cropCanvas');
    ctx = cropCanvas.getContext('2d');
    
    cropCanvas.width = CANVAS_WIDTH;
    cropCanvas.height = CANVAS_HEIGHT;
    
    updateGridOverlay();
    changeRows(rows);

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
    
    if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
        );
        
        if (lastDistance > 0) {
            const delta = distance - lastDistance;
            const imgAspect = originalImage.width / originalImage.height;
            const canvasAspect = CANVAS_WIDTH / CANVAS_HEIGHT;
            const minScale = imgAspect > canvasAspect ? 1 : canvasAspect / imgAspect;
            
            scale = Math.max(minScale, Math.min(3, scale + delta * 0.01));
            updatePreview();
        }
        
        lastDistance = distance;
        return;
    }
    
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
    lastDistance = 0;
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

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(originalImage, x, y, drawWidth, drawHeight);
}

function processImage() {
    const totalPieces = 3 * rows;
    const resultSection = document.getElementById('resultSection');
    const resultGrid = resultSection.querySelector('.result-grid');
    
    resultGrid.innerHTML = '';
    resultGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < 3; col++) {
            const index = row * 3 + col;
            const pieceCanvas = document.createElement('canvas');
            const pieceCtx = pieceCanvas.getContext('2d', { alpha: false, willReadFrequently: false });
            pieceCanvas.width = PIECE_WIDTH;
            pieceCanvas.height = PIECE_HEIGHT;

            pieceCtx.imageSmoothingEnabled = true;
            pieceCtx.imageSmoothingQuality = 'high';
            pieceCtx.drawImage(cropCanvas, PIECE_WIDTH * col, PIECE_HEIGHT * row, PIECE_WIDTH, PIECE_HEIGHT, 0, 0, PIECE_WIDTH, PIECE_HEIGHT);

            const finalCanvas = document.createElement('canvas');
            const finalWidth = 1080;
            const finalHeight = 1350;
            finalCanvas.width = finalWidth;
            finalCanvas.height = finalHeight;
            finalCanvas.id = `result${index + 1}`;
            const finalCtx = finalCanvas.getContext('2d', { alpha: false, willReadFrequently: false });

            const bgCanvas = document.createElement('canvas');
            bgCanvas.width = finalWidth;
            bgCanvas.height = finalHeight;
            const bgCtx = bgCanvas.getContext('2d', { alpha: false });

            bgCtx.filter = 'blur(40px)';
            bgCtx.imageSmoothingEnabled = true;
            bgCtx.imageSmoothingQuality = 'high';
            bgCtx.drawImage(pieceCanvas, 0, 0, finalWidth, finalHeight);
            bgCtx.filter = 'none';

            finalCtx.drawImage(bgCanvas, 0, 0);

            const scaledWidth = finalWidth;
            const scaledHeight = (PIECE_HEIGHT / PIECE_WIDTH) * finalWidth;
            const yPos = (finalHeight - scaledHeight) / 2;

            finalCtx.imageSmoothingEnabled = true;
            finalCtx.imageSmoothingQuality = 'high';
            finalCtx.drawImage(pieceCanvas, 0, yPos, scaledWidth, scaledHeight);
            
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            resultItem.innerHTML = `
                <canvas id="result${index + 1}"></canvas>
                <button onclick="downloadImage(${index})">💾 다운로드 ${index + 1}</button>
                <small class="mobile-only" style="color: rgba(255,255,255,0.5); font-size: 0.85em;">📱 이미지 길게 누르기 → 저장</small>
            `;
            resultItem.querySelector('canvas').replaceWith(finalCanvas);
            resultGrid.appendChild(resultItem);
        }
    }
    
    const uploadNote = resultSection.querySelector('p');
    if (rows === 1) {
        uploadNote.innerHTML = '⚠️ 인스타에 <strong>역순(3→2→1)</strong>으로 업로드하세요!';
    } else {
        uploadNote.innerHTML = `⚠️ 인스타에 <strong>역순(${totalPieces}→...→2→1)</strong>으로 업로드하세요!<br><small>오른쪽 아래부터 왼쪽 위로</small>`;
    }

    document.getElementById('editorSection').style.display = 'none';
    resultSection.style.display = 'block';
}

function downloadImage(index) {
    const canvas = document.getElementById(`result${index + 1}`);
    const link = document.createElement('a');
    link.download = `insta-grid-${index + 1}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 1.0);
    link.click();
}

function downloadAll() {
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        alert('모바일에서는 개별 다운로드를 이용해주세요.\n각 이미지를 길게 눌러 저장할 수 있습니다.');
        return;
    }
    const totalPieces = 3 * rows;
    for (let i = 0; i < totalPieces; i++) {
        setTimeout(() => downloadImage(i), i * 500);
    }
}

function reset() {
    document.getElementById('uploadSection').style.display = 'block';
    document.getElementById('editorSection').style.display = 'none';
    document.getElementById('resultSection').style.display = 'none';
    document.getElementById('imageInput').value = '';
    originalImage = null;
    rows = 1;
    CANVAS_HEIGHT = PIECE_HEIGHT;
    changeRows(1);
}
