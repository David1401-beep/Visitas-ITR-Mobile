import { iniciarSesionPadre } from '../Service/SesionPadreService.js';

document.addEventListener('DOMContentLoaded', () => {
  const emailInput = document.getElementById('correo-usuario');
  const passwordInput = document.getElementById('contrasena-usuario');
  const loginForm = document.getElementById('formulario-inicio-sesion');
  const loginButton = document.getElementById('btn-iniciar-sesion');
  const messageBox = document.getElementById('mensaje-inicio-sesion');
  const emailBox = document.getElementById('caja-informacion-correo');
  const logoutButton = document.getElementById('btn-cerrar-sesion');
  const storageKey = 'visitasITR.correoPadre';
  const sessionStorageKey = 'visitasITR.sesionPadre';

  const validateParentEmail = () => {
    if (!emailInput) return;
    const email = emailInput.value.trim().toLowerCase();
    emailInput.setCustomValidity(email && !email.endsWith('@ricaldone.edu.sv')
      ? 'Ingrese un correo institucional terminado en @ricaldone.edu.sv.' : '');
  };

  if (loginForm && emailInput && passwordInput) {
    emailInput.addEventListener('input', validateParentEmail);
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      validateParentEmail();
      if (!loginForm.checkValidity()) {
        loginForm.reportValidity();
        return;
      }

      const correoEstudiante = emailInput.value.trim().toLowerCase();
      const password = passwordInput.value;

      if (messageBox) {
        messageBox.textContent = '';
      }
      if (loginButton) {
        loginButton.disabled = true;
        loginButton.textContent = 'Verificando...';
      }

      try {
        const sesion = await iniciarSesionPadre(correoEstudiante, password);

        localStorage.setItem(storageKey, sesion.correoEstudiante);
        localStorage.setItem(sessionStorageKey, JSON.stringify(sesion));
        window.location.href = loginForm.getAttribute('action') || 'index.html';
      } catch (error) {
        if (messageBox) {
          messageBox.textContent = error.message;
        }
      } finally {
        if (loginButton) {
          loginButton.disabled = false;
          loginButton.textContent = 'Iniciar';
        }
      }
    });
  }
  if (emailBox) {
    const email = localStorage.getItem(storageKey);
    if (email) {
      emailBox.innerHTML = '<strong id="etiqueta-correo">Correo:</strong> ';
      emailBox.append(document.createTextNode(email));
    }
  }
  logoutButton?.addEventListener('click', () => {
    localStorage.removeItem(storageKey);
    localStorage.removeItem(sessionStorageKey);
  });
});
