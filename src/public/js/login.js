function selectRole(role) {
  const panels = document.querySelectorAll('.panel');
  const form = document.getElementById('loginForm');

  panels.forEach(p => {
    p.classList.remove('active');
    p.classList.add('inactive');
  });

  const selected = document.querySelector(`.${role}`);
  selected.classList.add('active');
  selected.classList.remove('inactive');

  form.classList.remove('hidden');

  document.getElementById('role').value = role;

  const btn = document.getElementById('btnLogin');
  const link = document.getElementById('forgotLink');

  if (role === 'admin') {
    btn.innerText = 'Ingresar como Administrador';
    link.innerText = 'Administrador: ¿Olvidaste tu contraseña?';
  } else {
    btn.innerText = 'Ingresar como Vendedor';
    link.innerText = 'Vendedor: ¿Olvidaste tu contraseña?';
  }
}