document.addEventListener("DOMContentLoaded", () => {
  const botonesEditar = document.querySelectorAll(".boton-editar-campo");
  const botonGuardar = document.getElementById("guardarCambios");
  const botonCancelar = document.getElementById("cancelarCambios");
  const formPerfil = document.getElementById("formPerfilComercial");
  const inputs = document.querySelectorAll(".fila-campo input");
  const logoInput = document.getElementById("logoURL");
  const logoPreview = document.getElementById("logoPreview");

  const btnAbrirModalHorarios = document.getElementById("btnAbrirModalHorarios");
  const modalHorarios = document.getElementById("modalHorariosOverlay");
  const formHorarios = document.getElementById("formHorarios");

  const valoresIniciales = {};

  inputs.forEach((input) => {
    valoresIniciales[input.id] = input.value;
  });

  function activarBotonGuardar() {
    botonGuardar.disabled = false;
    botonGuardar.classList.add("activo");
  }

  function desactivarBotonGuardar() {
    botonGuardar.disabled = true;
    botonGuardar.classList.remove("activo");
  }

  function abrirModal(modal) {
    if (!modal) return;
    modal.classList.remove("hidden");
  }

  function cerrarModal(modal) {
    if (!modal) return;
    modal.classList.add("hidden");
  }

  function actualizarPreviewLogo() {
    if (!logoInput || !logoPreview) return;

    const url = logoInput.value.trim();

    if (!url) {
      logoPreview.src = "";
      logoPreview.style.display = "none";
      return;
    }

    logoPreview.src = url;
    logoPreview.style.display = "block";
  }

  async function actualizarPerfil(data) {
    const response = await fetch("/perfil-comercial/info", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    return response.json();
  }

  async function actualizarHorarios(hours) {
    const response = await fetch("/perfil-comercial/horarios", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ hours })
    });

    return response.json();
  }

  botonesEditar.forEach((boton) => {
    boton.addEventListener("click", () => {
      const inputId = boton.dataset.target;
      const input = document.getElementById(inputId);

      if (!input) return;

      input.disabled = false;
      input.classList.add("editando");
      input.focus();
      input.selectionStart = input.value.length;
      input.selectionEnd = input.value.length;

      activarBotonGuardar();
    });
  });

  if (botonCancelar) {
    botonCancelar.addEventListener("click", () => {
      inputs.forEach((input) => {
        input.value = valoresIniciales[input.id];
        input.disabled = true;
        input.classList.remove("editando");
      });

      actualizarPreviewLogo();
      desactivarBotonGuardar();
    });
  }

  if (logoInput) {
    logoInput.addEventListener("input", actualizarPreviewLogo);
  }

  if (formPerfil) {
    formPerfil.addEventListener("submit", async (e) => {
      e.preventDefault();

      const data = {};
      inputs.forEach((input) => {
        data[input.name] = input.value.trim();
      });

      try {
        const resultado = await actualizarPerfil(data);

        if (resultado.error) {
          alert(resultado.error);
          return;
        }

        inputs.forEach((input) => {
          valoresIniciales[input.id] = input.value;
          input.disabled = true;
          input.classList.remove("editando");
        });

        actualizarPreviewLogo();
        desactivarBotonGuardar();
      } catch (error) {
        console.error("Error al actualizar perfil comercial:", error);
        alert("No se pudo actualizar el perfil comercial.");
      }
    });
  }

  if (btnAbrirModalHorarios) {
    btnAbrirModalHorarios.addEventListener("click", () => {
      abrirModal(modalHorarios);
    });
  }

  document.querySelectorAll("[data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const modalID = btn.getAttribute("data-close-modal");
      const modal = document.getElementById(modalID);
      cerrarModal(modal);
    });
  });

  if (modalHorarios) {
    modalHorarios.addEventListener("click", (e) => {
      if (e.target === modalHorarios) {
        cerrarModal(modalHorarios);
      }
    });
  }

  document.querySelectorAll(".fila-horario").forEach((fila) => {
    const checkCerrado = fila.querySelector(".input-cerrado");
    const inputApertura = fila.querySelector(".input-hora-apertura");
    const inputCierre = fila.querySelector(".input-hora-cierre");

    if (!checkCerrado || !inputApertura || !inputCierre) return;

    checkCerrado.addEventListener("change", () => {
      const cerrado = checkCerrado.checked;

      inputApertura.disabled = cerrado;
      inputCierre.disabled = cerrado;

      if (cerrado) {
        inputApertura.value = "";
        inputCierre.value = "";
      }
    });
  });

  if (formHorarios) {
    formHorarios.addEventListener("submit", async (e) => {
      e.preventDefault();

      const hours = Array.from(document.querySelectorAll(".fila-horario")).map((fila) => {
        const dayOfWeek = fila.dataset.day;
        const isClosed = fila.querySelector(".input-cerrado")?.checked || false;
        const openTime = fila.querySelector(".input-hora-apertura")?.value || null;
        const closeTime = fila.querySelector(".input-hora-cierre")?.value || null;

        return {
          dayOfWeek,
          isClosed,
          openTime,
          closeTime
        };
      });

      const horariosInvalidos = hours.some((item) => {
        if (item.isClosed) return false;
        return !item.openTime || !item.closeTime;
      });

      if (horariosInvalidos) {
        alert("Completa las horas de apertura y cierre en todos los días abiertos.");
        return;
      }

      try {
        const resultado = await actualizarHorarios(hours);

        if (resultado.error) {
          alert(resultado.error);
          return;
        }

        cerrarModal(modalHorarios);
        window.location.reload();
      } catch (error) {
        console.error("Error al actualizar horarios:", error);
        alert("No se pudieron actualizar los horarios.");
      }
    });
  }

  actualizarPreviewLogo();
});