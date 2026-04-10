document.addEventListener("DOMContentLoaded", () => {
  const botonesEditar = document.querySelectorAll(".boton-editar-config");
  const inputs = document.querySelectorAll(".campo-contenido input");
  const botonGuardar = document.getElementById("guardarConfiguracion");
  const botonCancelar = document.getElementById("cancelarConfiguracion");
  const inputFotoPerfil = document.getElementById("inputFotoPerfil");
  const previewFotoPerfil = document.getElementById("previewFotoPerfil");

  const valoresIniciales = {};

  inputs.forEach((input) => {
    valoresIniciales[input.id] = input.value;
  });

  function activarGuardar() {
    botonGuardar.disabled = false;
    botonGuardar.classList.add("activo");
  }

  function desactivarGuardar() {
    botonGuardar.disabled = true;
    botonGuardar.classList.remove("activo");
  }

  botonesEditar.forEach((boton) => {
    boton.addEventListener("click", () => {
      const targetId = boton.dataset.target;
      if (!targetId) return;

      const input = document.getElementById(targetId);
      if (!input) return;

      if (boton.textContent.includes("🔒")) return;

      input.disabled = false;
      input.classList.add("editando");
      input.focus();
      input.selectionStart = input.value.length;
      input.selectionEnd = input.value.length;

      activarGuardar();
    });
  });

  botonCancelar.addEventListener("click", () => {
    inputs.forEach((input) => {
      input.value = valoresIniciales[input.id];
      input.disabled = true;
      input.classList.remove("editando");
    });

    desactivarGuardar();
  });

  botonGuardar.addEventListener("click", () => {
    inputs.forEach((input) => {
      valoresIniciales[input.id] = input.value;
      input.disabled = true;
      input.classList.remove("editando");
    });

    desactivarGuardar();
  });

  inputFotoPerfil.addEventListener("change", (event) => {
    const archivo = event.target.files[0];
    if (!archivo) return;

    const lector = new FileReader();
    lector.onload = (e) => {
      previewFotoPerfil.src = e.target.result;
      activarGuardar();
    };
    lector.readAsDataURL(archivo);
  });
});