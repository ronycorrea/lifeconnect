// Paralaxe leve das fotos de gente: cada [data-paralaxe="0.1"] anda num ritmo próprio, preso à rolagem.
// Quem suaviza é o Lenis; o deslocamento é calculado no mesmo quadro dele (suave.js), sem atraso próprio.
// Com movimento reduzido, nada se desloca.
import { aCadaQuadro } from './suave.js';

export function iniciaParalaxe() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const itens = [...document.querySelectorAll('[data-paralaxe]')].map(el => ({ el, f: parseFloat(el.dataset.paralaxe) || 0, y: null }));
  if (!itens.length) return;

  const visiveis = new Set();
  const io = new IntersectionObserver(es => {
    for (const e of es) (e.isIntersecting ? visiveis.add(e.target) : visiveis.delete(e.target));
  }, { rootMargin: '25% 0px' });
  for (const i of itens) io.observe(i.el);

  aCadaQuadro(() => {
    const meio = innerHeight / 2;
    if (innerWidth <= 760) return; // no celular as fotos ficam paradas (a faixa de fotos se arrasta para o lado)
    const fator = 1;
    for (const i of itens) {
      if (!visiveis.has(i.el)) continue;
      const r = i.el.getBoundingClientRect();
      const centro = r.top - (i.y || 0) + r.height / 2;
      const y = Math.round(-(centro - meio) * i.f * fator * 100) / 100;
      if (y === i.y) continue;
      i.y = y;
      i.el.style.transform = `translate3d(0, ${y}px, 0)`;
    }
  });
}
