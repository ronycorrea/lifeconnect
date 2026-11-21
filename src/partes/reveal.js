// EFEITO 4: revelação ao rolar. Cada .reveal começa com visibility:hidden; quando 15% dele entra na tela,
// ganha "animated <data-animation>" depois de data-delay ms. Uma vez só.
// Com prefers-reduced-motion, o CSS já mostra tudo direto e nada anima.
export function iniciaReveal() {
  const els = [...document.querySelectorAll('.reveal')];
  if (!els.length) return;
  const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revela = el => {
    const anima = el.dataset.animation;
    const atraso = parseInt(el.dataset.delay, 10) || 0;
    setTimeout(() => el.classList.add('animated', ...(anima && !reduz ? [anima] : [])), reduz ? 0 : atraso);
  };
  if (reduz || !('IntersectionObserver' in window)) return els.forEach(revela);
  const io = new IntersectionObserver(entradas => {
    for (const e of entradas) {
      if (!e.isIntersecting) continue;
      io.unobserve(e.target);
      revela(e.target);
    }
  }, { threshold: .15 });
  els.forEach(el => io.observe(el));
}
