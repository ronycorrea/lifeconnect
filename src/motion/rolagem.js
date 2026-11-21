// Estado da rolagem: nav que some ao descer e volta ao subir; html.is-scrolling desliga os hovers
// enquanto a página rola com o cursor parado (sai no primeiro movimento real do mouse).
export function iniciaRolagem() {
  const html = document.documentElement;
  const nav = document.querySelector('[data-nav]');
  let ultimoY = scrollY;
  let mx = null, my = null;

  const atualizaNav = () => {
    const y = scrollY;
    const delta = y - ultimoY;
    if (Math.abs(delta) > 6) {
      const esconde = delta > 0 && y > innerHeight * 0.25 && !html.classList.contains('menu-aberto');
      nav.classList.toggle('is-oculta', esconde);
      ultimoY = y;
    }
    nav.classList.toggle('is-solida', y > 24);
  };

  addEventListener('scroll', () => {
    html.classList.add('is-scrolling');
    atualizaNav();
  }, { passive: true });

  // o Chrome dispara um mousemove sintético depois da rolagem com as mesmas coordenadas: compara antes de soltar
  addEventListener('mousemove', e => {
    if (mx !== null && (e.clientX !== mx || e.clientY !== my)) html.classList.remove('is-scrolling');
    mx = e.clientX; my = e.clientY;
  }, { passive: true });

  atualizaNav();
}
