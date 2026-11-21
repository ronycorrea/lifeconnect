// Menu em tela cheia: abre como cortina, Esc e links fecham, o Tab fica preso, e rolar a página fecha.
// Nada trava a rolagem.
export function iniciaMenu() {
  const html = document.documentElement;
  const botao = document.querySelector('.menu-botao');
  const menu = document.getElementById('menu');
  if (!botao || !menu) return;
  let aberto = false, y0 = 0, tempo = 0;

  const focaveis = () => [botao, ...menu.querySelectorAll('a[href], button')];

  function abre() {
    aberto = true;
    clearTimeout(tempo);
    menu.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('is-aberto')));
    html.classList.add('menu-aberto');
    botao.setAttribute('aria-expanded', 'true');
    botao.setAttribute('aria-label', 'Fechar menu');
    y0 = scrollY;
    setTimeout(() => menu.querySelector('a')?.focus({ preventScroll: true }), 350);
  }
  function fecha(devolveFoco = true) {
    if (!aberto) return;
    aberto = false;
    menu.classList.remove('is-aberto');
    html.classList.remove('menu-aberto');
    botao.setAttribute('aria-expanded', 'false');
    botao.setAttribute('aria-label', 'Abrir menu');
    tempo = setTimeout(() => { if (!aberto) menu.hidden = true; }, 720);
    if (devolveFoco) botao.focus({ preventScroll: true });
  }

  botao.addEventListener('click', () => (aberto ? fecha() : abre()));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => fecha(false)));
  addEventListener('keydown', e => {
    if (!aberto) return;
    if (e.key === 'Escape') { e.preventDefault(); fecha(); }
    if (e.key === 'Tab') {
      const f = focaveis();
      const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  });
  addEventListener('scroll', () => { if (aberto && Math.abs(scrollY - y0) > 40) fecha(false); }, { passive: true });
}
