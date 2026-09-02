// Lightbox simple inyectado dinámicamente

// 1. Crear elementos e inyectar al DOM inmediatamente
const overlay = document.createElement('div');
overlay.className = 'lightbox-overlay';
const overlayImg = document.createElement('img');
overlay.appendChild(overlayImg);
document.body.appendChild(overlay);

function abrirLightbox(src, alt) {
  overlayImg.src = src;
  overlayImg.alt = alt || '';
  overlay.classList.add('activo');
}

function cerrarLightbox() {
  overlay.classList.remove('activo');
}

// 2. Registrar eventos directamente
document.addEventListener('click', (e) => {
  const img = e.target.closest('.parrafo-imagen img');
  if (img) {
    abrirLightbox(img.src, img.alt);
  }
});

overlay.addEventListener('click', cerrarLightbox);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') cerrarLightbox();
});