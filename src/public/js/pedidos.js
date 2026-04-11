document.addEventListener("DOMContentLoaded", () => {
  const inputBusqueda = document.getElementById("busquedaPedido");
  const filtroProducto = document.getElementById("filtroProductoPedido");
  const filtroEstado = document.getElementById("filtroEstadoPedido");
  const tablaBody = document.getElementById("tablaPedidosBody");

  function aplicarColorEstado(select) {
    const valor = (select.value || "").trim().toLowerCase();

    select.classList.remove("estado-reservado", "estado-entregado");

    if (valor === "reservado") {
      select.classList.add("estado-reservado");
    } else if (valor === "entregado") {
      select.classList.add("estado-entregado");
    }
  }

  function filtrarTabla() {
    const textoBusqueda = (inputBusqueda?.value || "").trim().toLowerCase();
    const productoSeleccionado = (filtroProducto?.value || "").trim().toLowerCase();
    const estadoSeleccionado = (filtroEstado?.value || "").trim().toLowerCase();

    const filas = document.querySelectorAll("#tablaPedidosBody tr");

    filas.forEach((fila) => {
      if (fila.querySelector(".sin-resultados")) return;

      const idPedido = fila.querySelector(".id-pedido")?.textContent.trim().toLowerCase() || "";
      const nombre = fila.querySelector(".nombre-cliente-pedido")?.textContent.trim().toLowerCase() || "";
      const apellido = fila.querySelector(".apellido-cliente-pedido")?.textContent.trim().toLowerCase() || "";
      const nombreProducto = fila.querySelector(".nombre-producto-pedido")?.textContent.trim().toLowerCase() || "";
      const estadoActual = fila.querySelector(".select-estado-pedido")?.value.trim().toLowerCase() || "";

      const coincideBusqueda =
        idPedido.includes(textoBusqueda) ||
        nombre.includes(textoBusqueda) ||
        apellido.includes(textoBusqueda);

      const coincideProducto =
        !productoSeleccionado || nombreProducto === productoSeleccionado;

      const coincideEstado =
        !estadoSeleccionado || estadoActual === estadoSeleccionado;

      fila.style.display =
        coincideBusqueda && coincideProducto && coincideEstado ? "" : "none";
    });
  }

  async function actualizarEstadoPedido(orderID, orderStatus) {
    const response = await fetch(`/pedidos/${orderID}/estado`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ orderStatus })
    });

    return response.json();
  }

  const selectsEstado = document.querySelectorAll(".select-estado-pedido");
  selectsEstado.forEach((select) => {
    aplicarColorEstado(select);

    select.addEventListener("change", () => {
      aplicarColorEstado(select);

      const fila = select.closest("tr");
      const botonGuardar = fila?.querySelector(".boton-guardar-estado");
      if (botonGuardar) {
        botonGuardar.classList.remove("hidden");
      }

      filtrarTabla();
    });
  });

  if (tablaBody) {
    tablaBody.addEventListener("click", async (e) => {
      const botonEditar = e.target.closest(".boton-editar-estado");
      const botonGuardar = e.target.closest(".boton-guardar-estado");

      if (botonEditar) {
        const fila = botonEditar.closest("tr");
        const select = fila?.querySelector(".select-estado-pedido");

        if (select) {
          select.disabled = false;
          select.focus();
        }
      }

      if (botonGuardar) {
        const fila = botonGuardar.closest("tr");
        const select = fila?.querySelector(".select-estado-pedido");

        if (!fila || !select) return;

        const orderID = fila.dataset.orderId;
        const orderStatus = select.value;

        try {
          const resultado = await actualizarEstadoPedido(orderID, orderStatus);

          if (resultado.error) {
            alert(resultado.error);
            return;
          }

          select.disabled = true;
          botonGuardar.classList.add("hidden");
          fila.dataset.orderStatus = orderStatus;
        } catch (error) {
          console.error("Error al actualizar estado del pedido:", error);
          alert("No se pudo actualizar el estado del pedido.");
        }
      }
    });
  }

  if (inputBusqueda) inputBusqueda.addEventListener("input", filtrarTabla);
  if (filtroProducto) filtroProducto.addEventListener("change", filtrarTabla);
  if (filtroEstado) filtroEstado.addEventListener("change", filtrarTabla);
});