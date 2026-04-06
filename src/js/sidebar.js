document.addEventListener("DOMContentLoaded", () => {
  const rutaActual = window.location.pathname;
  const enlaces = document.querySelectorAll(".menu-item");

  enlaces.forEach(enlace => {
    const href = enlace.getAttribute("href");

    if (href === rutaActual) {
      enlace.classList.add("activo");
    }
  });
});