// ============================
// 🔍 BÚSQUEDA GLOBAL
// ============================

const toggleBtn = document.getElementById("toggleBusqueda");
const inputBusqueda = document.getElementById("inputBusquedaGlobal");

toggleBtn?.addEventListener("click", () => {
  inputBusqueda.classList.toggle("hidden");
  inputBusqueda.focus();
});

inputBusqueda?.addEventListener("input", () => {
  const texto = inputBusqueda.value.toLowerCase();

  const elementos = document.querySelectorAll(
    ".tarjeta-resumen, .mini-tarjeta, .bloque-grafico"
  );

  elementos.forEach(el => {
    const contenido = el.textContent.toLowerCase();
    el.style.display = contenido.includes(texto) ? "" : "none";
  });
});


// ============================
// NOTIFICACIONES
// ============================

const btnNotif = document.getElementById("btnNotificaciones");
const dropdownNotif = document.getElementById("dropdownNotificaciones");
const listaNotif = document.getElementById("listaNotificaciones");

btnNotif?.addEventListener("click", async () => {
  dropdownNotif.classList.toggle("hidden");

  if (!listaNotif.dataset.loaded) {
    await cargarNotificaciones();
    listaNotif.dataset.loaded = "true";
  }
});

async function cargarNotificaciones() {
  try {
    const resPedidos = await fetch("/pedidos/lista");
    const pedidos = await resPedidos.json();

    const resClientes = await fetch("/clientes/lista");
    const clientes = await resClientes.json();

    const notificaciones = [];

    pedidos.slice(0, 3).forEach(p => {
      notificaciones.push(`🛒 Pedido #${p.orderID} - ${p.orderStatus}`);
    });

    clientes.slice(0, 2).forEach(c => {
      notificaciones.push(`👤 Nuevo cliente: ${c.firstName}`);
    });

    listaNotif.innerHTML = notificaciones
      .map(n => `<li>${n}</li>`)
      .join("");

  } catch (error) {
    console.error(error);
    listaNotif.innerHTML = "<li>Error cargando notificaciones</li>";
  }
}