document.addEventListener("DOMContentLoaded", () => {
  const inputBusqueda = document.getElementById("busquedaProducto");
  const filtroCategoria = document.getElementById("filtroCategoria");
  const filtroEstado = document.getElementById("filtroEstado");
  const filas = document.querySelectorAll("#tablaProductosBody tr");

  function filtrarTabla() {
    const texto = inputBusqueda.value.toLowerCase().trim();
    const categoriaSeleccionada = filtroCategoria.value.toLowerCase().trim();
    const estadoSeleccionado = filtroEstado.value.toLowerCase().trim();

    filas.forEach((fila) => {
      const nombre = fila.querySelector(".nombre-producto")?.textContent.toLowerCase() || "";
      const descripcion = fila.querySelector(".info-producto p")?.textContent.toLowerCase() || "";
      const categoria = fila.querySelector(".select-categoria-fila")?.value.toLowerCase() || "";
      const estado = fila.querySelector(".estado")?.textContent.toLowerCase().trim() || "";

      const coincideTexto =
        nombre.includes(texto) || descripcion.includes(texto);

      const coincideCategoria =
        !categoriaSeleccionada || categoria === categoriaSeleccionada;

      const coincideEstado =
        !estadoSeleccionado || estado === estadoSeleccionado;

      if (coincideTexto && coincideCategoria && coincideEstado) {
        fila.style.display = "";
      } else {
        fila.style.display = "none";
      }
    });
  }

  inputBusqueda.addEventListener("input", filtrarTabla);
  filtroCategoria.addEventListener("change", filtrarTabla);
  filtroEstado.addEventListener("change", filtrarTabla);

  document.querySelectorAll(".boton-editar-categoria").forEach((boton) => {
    boton.addEventListener("click", () => {
      const select = boton.previousElementSibling;
      if (select) {
        select.focus();
        select.click();
      }
    });
  });
});