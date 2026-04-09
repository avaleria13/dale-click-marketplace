document.addEventListener("DOMContentLoaded", () => {
  const inputBusqueda = document.getElementById("busquedaPedido");
  const filtroProducto = document.getElementById("filtroProductoPedido");
  const filtroEstado = document.getElementById("filtroEstadoPedido");
  const filas = document.querySelectorAll("#tablaPedidosBody tr");
  const selectsEstado = document.querySelectorAll(".select-estado-pedido");
  const botonesEditarEstado = document.querySelectorAll(".boton-editar-estado");

  function aplicarColorEstado(select) {
    const valor = select.value.trim().toLowerCase();

    select.classList.remove("estado-reservado", "estado-entregado");

    if (valor === "reservado") {
      select.classList.add("estado-reservado");
    } else if (valor === "entregado") {
      select.classList.add("estado-entregado");
    }
  }

  function filtrarTabla() {
    const textoBusqueda = inputBusqueda.value.trim().toLowerCase();
    const productoSeleccionado = filtroProducto.value.trim().toLowerCase();
    const estadoSeleccionado = filtroEstado.value.trim().toLowerCase();

    filas.forEach((fila) => {
      const idPedido = fila.querySelector(".id-pedido")?.textContent.trim().toLowerCase() || "";
      const nombreProducto = fila.querySelector(".nombre-producto-pedido")?.textContent.trim().toLowerCase() || "";
      const estadoActual = fila.querySelector(".select-estado-pedido")?.value.trim().toLowerCase() || "";

      const coincideBusqueda = idPedido.includes(textoBusqueda);
      const coincideProducto = !productoSeleccionado || nombreProducto === productoSeleccionado;
      const coincideEstado = !estadoSeleccionado || estadoActual === estadoSeleccionado;

      if (coincideBusqueda && coincideProducto && coincideEstado) {
        fila.style.display = "";
      } else {
        fila.style.display = "none";
      }
    });
  }

  selectsEstado.forEach((select) => {
    aplicarColorEstado(select);

    select.addEventListener("change", () => {
      aplicarColorEstado(select);
      filtrarTabla();
    });
  });

  botonesEditarEstado.forEach((boton) => {
    boton.addEventListener("click", () => {
      const select = boton.previousElementSibling;
      if (select) {
        select.focus();
        select.click();
      }
    });
  });

  inputBusqueda.addEventListener("input", filtrarTabla);
  filtroProducto.addEventListener("change", filtrarTabla);
  filtroEstado.addEventListener("change", filtrarTabla);
});