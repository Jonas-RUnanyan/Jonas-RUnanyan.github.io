const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');

// Ajustar tamaño al footer
function resize() {
  canvas.width = canvas.clientWidth * window.devicePixelRatio;
  canvas.height = canvas.clientHeight * window.devicePixelRatio;
  ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  drawGrid();
}

function drawGrid() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const horizonY = -50; // Línea del horizonte (en px)
  const pointFugaX = width / 2;
  const pointFugaY = horizonY;

  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = '#3FF1F7';
  ctx.globalAlpha = 0.7;

  // Líneas horizontales (paralelas) con grosor variable
  const numHoriz = 8;
  const minLineWidth = 0.5;
  const maxLineWidth = 3;

  for (let i = 0; i < numHoriz; i++) {
    const t = i / (numHoriz - 1);
    const y = height * (t * t);
    const lineWidth = minLineWidth + (maxLineWidth - minLineWidth) * (t * t);

    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Líneas verticales convergentes con grosor fijo
  const numVert = 40; // más líneas para cubrir fuera del ancho visible
  const extra = 2 * width; // espacio extra a cada lado

  ctx.lineWidth = 1; // grosor fijo para verticales
  for (let i = 0; i <= numVert; i++) {
    const x = -1.5 * extra + ((width + 3 * extra) * i / numVert);
    ctx.beginPath();
    ctx.moveTo(x, height);
    ctx.lineTo(pointFugaX, pointFugaY);
    ctx.stroke();
  }
}

window.addEventListener('resize', resize);
window.addEventListener('load', resize);
