document.addEventListener('DOMContentLoaded', () => {
  const emailInput = document.getElementById('correo-usuario');
  const loginForm = document.getElementById('formulario-inicio-sesion');
  const emailBox = document.getElementById('caja-informacion-correo');
  const logoutButton = document.getElementById('btn-cerrar-sesion');
  const storageKey = 'visitasITR.correoPadre';

  const validateParentEmail = () => {
    if (!emailInput) return;
    const email = emailInput.value.trim().toLowerCase();
    emailInput.setCustomValidity(email && !email.endsWith('@ricaldone.edu.sv')
      ? 'Ingrese un correo institucional terminado en @ricaldone.edu.sv.' : '');
  };

  if (loginForm && emailInput) {
    emailInput.addEventListener('input', validateParentEmail);
    loginForm.addEventListener('submit', (event) => {
      validateParentEmail();
      if (!loginForm.checkValidity()) {
        event.preventDefault();
        loginForm.reportValidity();
        return;
      }
      localStorage.setItem(storageKey, emailInput.value.trim());
    });
  }
  if (emailBox) {
    const email = localStorage.getItem(storageKey);
    if (email) {
      emailBox.innerHTML = '<strong id="etiqueta-correo">Correo:</strong> ';
      emailBox.append(document.createTextNode(email));
    }
  }
  logoutButton?.addEventListener('click', () => localStorage.removeItem(storageKey));
});
