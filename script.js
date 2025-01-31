const canvas = document.getElementById('pixelCanvas');
const ctx = canvas.getContext('2d');
const pixelSize = 10; // Tamaño de cada píxel
const gridColor = '#ccc'; // Color de la cuadrícula
let currentColor = '#000000'; // Color actual

// Inicializar el lienzo
function initCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
}

// Dibujar la cuadrícula
function drawGrid() {
  ctx.strokeStyle = gridColor;
  for (let x = 0; x < canvas.width; x += pixelSize) {
    for (let y = 0; y < canvas.height; y += pixelSize) {
      ctx.strokeRect(x, y, pixelSize, pixelSize);
    }
  }
}

// Pintar un píxel
function paintPixel(x, y) {
  const pixelX = Math.floor(x / pixelSize) * pixelSize;
  const pixelY = Math.floor(y / pixelSize) * pixelSize;
  ctx.fillStyle = currentColor;
  ctx.fillRect(pixelX, pixelY, pixelSize, pixelSize);
  ctx.strokeStyle = gridColor;
  ctx.strokeRect(pixelX, pixelY, pixelSize, pixelSize);
}

// Evento para pintar al hacer clic
canvas.addEventListener('click', (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  paintPixel(x, y);
});

// Limpiar el lienzo
document.getElementById('clearButton').addEventListener('click', () => {
  initCanvas();
});

// Seleccionar color
document.getElementById('colorPicker').addEventListener('input', (event) => {
  currentColor = event.target.value;
});

// Exportar a código
document.getElementById('exportCodeButton').addEventListener('click', () => {
  const code = [];
  for (let y = 0; y < canvas.height; y += pixelSize) {
    const row = [];
    for (let x = 0; x < canvas.width; x += pixelSize) {
      const pixelData = ctx.getImageData(x, y, 1, 1).data;
      const color = `#${pixelData[0].toString(16).padStart(2, '0')}${pixelData[1].toString(16).padStart(2, '0')}${pixelData[2].toString(16).padStart(2, '0')}`;
      row.push(color);
    }
    code.push(row);
  }
  document.getElementById('codeOutput').textContent = JSON.stringify(code, null, 2);
});

// Importar desde código
document.getElementById('importCodeButton').addEventListener('click', () => {
  const code = JSON.parse(document.getElementById('codeInput').value);
  initCanvas();
  code.forEach((row, y) => {
    row.forEach((color, x) => {
      ctx.fillStyle = color;
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    });
  });
});

// Exportar a imagen
document.getElementById('exportImageButton').addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'pixel-art.png';
  link.href = canvas.toDataURL();
  link.click();
});

// Inicializar el lienzo al cargar la página
initCanvas();