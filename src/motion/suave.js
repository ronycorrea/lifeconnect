// Lenis e um relógio só para a página: a cada quadro o Lenis move a rolagem e, logo depois, quem se inscreveu
// em aCadaQuadro (3D, paralaxe) lê o layout já rolado. Assim o canvas e o DOM andam no mesmo quadro, sem atraso.
// Com movimento reduzido não há Lenis: a rolagem é a nativa e o relógio segue para os mesmos inscritos.
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
const ouvintes = new Set();

export const lenis = reduz ? null : new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true, syncTouch: false, allowNestedScroll: true });
if (import.meta.env.DEV) window.__lenis = lenis; // só para testes no modo dev

function tique(agora) {
  lenis?.raf(agora);
  for (const fn of ouvintes) fn(agora);
  requestAnimationFrame(tique);
}
requestAnimationFrame(tique);

export const aCadaQuadro = fn => { ouvintes.add(fn); return () => ouvintes.delete(fn); };

// Rola até um elemento (block "start" ou "center") ou até um y; instantâneo com movimento reduzido.
export function rolaAte(alvo, { block = 'start', imediato = false } = {}) {
  let y = alvo;
  if (alvo instanceof Element) {
    // respeita o scroll-margin-top, como o scrollIntoView
    const r = alvo.getBoundingClientRect();
    const m = parseFloat(getComputedStyle(alvo).scrollMarginTop) || 0;
    y = r.top - m + scrollY - (block === 'center' ? (innerHeight - r.height - m) / 2 : 0);
  }
  if (lenis) lenis.scrollTo(Math.max(0, y), { immediate: imediato, duration: 1.2 });
  else scrollTo(0, Math.max(0, y));
}
