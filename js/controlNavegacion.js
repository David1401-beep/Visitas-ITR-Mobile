// Control de Navegación Inferior (Footer Nav)
document.addEventListener('DOMContentLoaded', () => {
  const navItems = document.querySelectorAll('.bottom-nav .nav-item');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      // Remueve la clase active de todos los items
      navItems.forEach(i => i.classList.remove('active'));
      // Agrega la clase active únicamente al item clickeado
      item.classList.add('active');
    });
  });
});
