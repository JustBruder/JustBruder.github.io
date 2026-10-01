export function initTheme() {
  const root = document.documentElement;
  const toggleBtn = document.getElementById('theme-toggle');

  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    const isLight = root.dataset.theme === 'light';
    root.dataset.theme = isLight ? 'dark' : 'light';
    toggleBtn.textContent = isLight ? 'Modo corporativo' : 'Modo hacker';
  });
}