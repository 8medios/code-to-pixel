const canvas = document.getElementById('pixelCanvas');
const ctx = canvas.getContext('2d');
const pixelSize = 10;
const gridColor = '#ccc';
let currentColor = '#ccc';
let isDrawing = false;
let pixelMatrix = [];

// Cambiar entre modo claro y oscuro
const themeCheckbox = document.getElementById('themeCheckbox');
const themeLabel = document.getElementById('themeLabel');
const body = document.body;

themeCheckbox.addEventListener('change', () => {
  body.classList.toggle('dark-mode');
  themeLabel.textContent = body.classList.contains('dark-mode') ? 'Modo Claro' : 'Modo Oscuro';
});

// Resto del código (pintar, exportar, importar, etc.) sigue igual...

// Crear un canvas separado para la cuadrícula
const gridCanvas = document.createElement('canvas');
gridCanvas.width = canvas.width;
gridCanvas.height = canvas.height;
gridCanvas.style.position = 'absolute';
gridCanvas.style.pointerEvents = 'none'; // Permite que los clicks pasen al canvas principal
canvas.parentElement.insertBefore(gridCanvas, canvas);
canvas.style.position = 'relative';
const gridCtx = gridCanvas.getContext('2d');

// Inicializar la matriz de píxeles
function initPixelMatrix() {
  pixelMatrix = Array(canvas.height / pixelSize).fill().map(() => 
    Array(canvas.width / pixelSize).fill(null)
  );
}

// Inicializar el lienzo
function initCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  initPixelMatrix();
  drawGrid();
}

// Dibujar la cuadrícula en el canvas separado
function drawGrid() {
  gridCtx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
  gridCtx.strokeStyle = gridColor;
  for (let x = 0; x < gridCanvas.width; x += pixelSize) {
    for (let y = 0; y < gridCanvas.height; y += pixelSize) {
      gridCtx.strokeRect(x, y, pixelSize, pixelSize);
    }
  }
}

// Obtener las coordenadas del píxel
function getPixelCoords(x, y) {
  const rect = canvas.getBoundingClientRect();
  const pixelX = Math.floor((x - rect.left) / pixelSize);
  const pixelY = Math.floor((y - rect.top) / pixelSize);
  return { pixelX, pixelY };
}

// Pintar un píxel
function paintPixel(x, y) {
  const { pixelX, pixelY } = getPixelCoords(x, y);
  if (pixelX >= 0 && pixelX < canvas.width / pixelSize && 
      pixelY >= 0 && pixelY < canvas.height / pixelSize) {
    const drawX = pixelX * pixelSize;
    const drawY = pixelY * pixelSize;
    ctx.fillStyle = currentColor;
    ctx.fillRect(drawX, drawY, pixelSize, pixelSize);
    pixelMatrix[pixelY][pixelX] = currentColor;
  }
}

// Encontrar el área pintada
function findPaintedArea() {
  let minX = canvas.width;
  let minY = canvas.height;
  let maxX = 0;
  let maxY = 0;
  let hasPaintedPixels = false;

  for (let y = 0; y < pixelMatrix.length; y++) {
    for (let x = 0; x < pixelMatrix[y].length; x++) {
      if (pixelMatrix[y][x]) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
        hasPaintedPixels = true;
      }
    }
  }

  if (!hasPaintedPixels) return null;

  return {
    x: minX * pixelSize,
    y: minY * pixelSize,
    width: (maxX - minX + 1) * pixelSize,
    height: (maxY - minY + 1) * pixelSize
  };
}

// Eventos de dibujo
canvas.addEventListener('mousedown', (event) => {
  isDrawing = true;
  paintPixel(event.clientX, event.clientY);
});

canvas.addEventListener('mousemove', (event) => {
  if (isDrawing) {
    paintPixel(event.clientX, event.clientY);
  }
});

canvas.addEventListener('mouseup', () => {
  isDrawing = false;
});

canvas.addEventListener('mouseleave', () => {
  isDrawing = false;
});

// Limpiar el lienzo
document.getElementById('clearButton').addEventListener('click', initCanvas);

// Seleccionar color
document.getElementById('colorPicker').addEventListener('input', (event) => {
  currentColor = event.target.value;
});

// Exportar a código
document.getElementById('exportCodeButton').addEventListener('click', () => {
  const code = pixelMatrix.map(row => 
    row.map(color => color || '#00000000')
  );
  document.getElementById('codeOutput').textContent = JSON.stringify(code, null, 2);
});

// Importar desde código
document.getElementById('importCodeButton').addEventListener('click', () => {
  try {
    const code = JSON.parse(document.getElementById('codeInput').value);
    initCanvas();
    pixelMatrix = code;
    code.forEach((row, y) => {
      row.forEach((color, x) => {
        if (color && color !== '#00000000') {
          ctx.fillStyle = color;
          ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        }
      });
    });
  } catch (error) {
    alert('Error al importar el código. Asegúrate de que el formato sea correcto.');
  }
});

// Exportar a imagen
document.getElementById('exportImageButton').addEventListener('click', () => {
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  const paintedArea = findPaintedArea();

  if (!paintedArea) {
    alert('No hay píxeles pintados para exportar.');
    return;
  }

  // Configurar el canvas temporal con el tamaño del área pintada
  tempCanvas.width = paintedArea.width;
  tempCanvas.height = paintedArea.height;

  // Habilitar transparencia
  tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);

  // Copiar solo el área pintada
  tempCtx.drawImage(
    canvas,
    paintedArea.x, paintedArea.y,
    paintedArea.width, paintedArea.height,
    0, 0,
    paintedArea.width, paintedArea.height
  );

  // Exportar solo los píxeles pintados
  const link = document.createElement('a');
  link.download = 'pixel-art.png';
  link.href = tempCanvas.toDataURL('image/png');
  link.click();
});

// Inicializar
initCanvas();