document.addEventListener("DOMContentLoaded", () => {
  const inputBusqueda = document.getElementById("busquedaCliente");
  const filtroSegmento = document.getElementById("filtroSegmento");
  const filtroFecha = document.getElementById("filtroFecha");
  const ordenarClientes = document.getElementById("ordenarClientes");
  const tablaBody = document.getElementById("tablaClientesBody");

  function convertirFechaTextoAISO(fechaTexto) {
    const [dia, mes, anio] = fechaTexto.split("/");
    return `${anio}-${mes}-${dia}`;
  }

  function filtrarYOrdenarClientes() {
    const textoBusqueda = inputBusqueda.value.trim().toLowerCase();
    const segmentoSeleccionado = filtroSegmento.value.trim().toLowerCase();
    const rangoFecha = filtroFecha.value.trim();
    const criterioOrden = ordenarClientes.value.trim();

    const filas = Array.from(tablaBody.querySelectorAll("tr"));

    filas.forEach((fila) => {
      const idCliente = fila.children[0].textContent.trim().toLowerCase();
      const nombre = fila.children[1].textContent.trim().toLowerCase();
      const apellido = fila.children[2].textContent.trim().toLowerCase();
      const contacto = fila.querySelector(".texto-contacto")?.textContent.toLowerCase() || "";
      const segmento = (fila.dataset.segmento || "").toLowerCase();
      const fechaData = fila.dataset.fecha || "";
      const hoy = new Date("2023-12-01");

      const coincideBusqueda =
        idCliente.includes(textoBusqueda) ||
        nombre.includes(textoBusqueda) ||
        apellido.includes(textoBusqueda) ||
        contacto.includes(textoBusqueda);

      const coincideSegmento =
        !segmentoSeleccionado || segmento === segmentoSeleccionado;

      let coincideFecha = true;
      if (rangoFecha) {
        const fechaCliente = new Date(fechaData);
        const diferenciaDias = Math.floor(
          (hoy - fechaCliente) / (1000 * 60 * 60 * 24)
        );
        coincideFecha = diferenciaDias <= Number(rangoFecha);
      }

      fila.style.display =
        coincideBusqueda && coincideSegmento && coincideFecha ? "" : "none";
    });

    const filasVisibles = filas.filter((fila) => fila.style.display !== "none");

    filasVisibles.sort((a, b) => {
      const gastoA = Number(a.dataset.gasto || 0);
      const gastoB = Number(b.dataset.gasto || 0);
      const pedidosA = Number(a.dataset.pedidos || 0);
      const pedidosB = Number(b.dataset.pedidos || 0);
      const fechaA = new Date(a.dataset.fecha || convertirFechaTextoAISO(a.querySelector(".celda-fecha").textContent.trim()));
      const fechaB = new Date(b.dataset.fecha || convertirFechaTextoAISO(b.querySelector(".celda-fecha").textContent.trim()));

      switch (criterioOrden) {
        case "gasto-desc":
          return gastoB - gastoA;
        case "gasto-asc":
          return gastoA - gastoB;
        case "pedidos-desc":
          return pedidosB - pedidosA;
        case "fecha-desc":
          return fechaB - fechaA;
        case "fecha-asc":
          return fechaA - fechaB;
        default:
          return 0;
      }
    });

    filasVisibles.forEach((fila) => tablaBody.appendChild(fila));
  }

  inputBusqueda.addEventListener("input", filtrarYOrdenarClientes);
  filtroSegmento.addEventListener("change", filtrarYOrdenarClientes);
  filtroFecha.addEventListener("change", filtrarYOrdenarClientes);
  ordenarClientes.addEventListener("change", filtrarYOrdenarClientes);
}); 