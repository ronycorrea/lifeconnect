// Entrada por marco: cada [data-marco] ganha .is-in uma vez; o CSS faz o resto com duração fixa,
// então o texto sempre termina no estado final, mesmo com rolagem rápida.
// data-marco="carga" entra quando a fonte chega e o preloader sai (o hero), sem esperar a rolagem.
export function iniciaMarcos({ espera = Promise.resolve() } = {}) {
  const todos = [...document.querySelectorAll('[data-marco]')];
  const carga = todos.filter(el => el.dataset.marco === 'carga');
  const resto = todos.filter(el => el.dataset.marco !== 'carga');

  const fontes = Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise(r => setTimeout(r, 1400))]);
  Promise.all([fontes, espera]).then(() => requestAnimationFrame(() => {
    document.documentElement.classList.add('fontes-ok');
    for (const el of carga) el.classList.add('is-in');
  }));

  if (!('IntersectionObserver' in window)) {
    for (const el of resto) el.classList.add('is-in');
    return;
  }
  const io = new IntersectionObserver(entradas => {
    for (const e of entradas) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    }
  }, { rootMargin: '0px 0px -2% 0px', threshold: 0 });
  for (const el of resto) io.observe(el);
}
