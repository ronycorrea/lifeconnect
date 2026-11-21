// Brilho do "Life Connect." gigante do rodapé: por onde o mouse passa, as letras ganham um degradê laranja suave.
// O CSS pinta o texto com um radial-gradient em (--mx, --my) e a intensidade em --forca; aqui só movemos esses
// valores com uma leve inércia, no relógio único da página (aCadaQuadro). Sem efeito no toque ou com movimento reduzido.
import { aCadaQuadro } from '../motion/suave.js';

export function iniciaBrilho() {
  const el = document.querySelector('[data-brilho]');
  if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const alvo = { x: 0, y: 0, f: 0 };
  const atual = { x: 0, y: 0, f: 0 };
  let ultimo = performance.now();

  el.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    const r = el.getBoundingClientRect();
    alvo.x = e.clientX - r.left;
    alvo.y = e.clientY - r.top;
    if (atual.f < .01) { atual.x = alvo.x; atual.y = alvo.y; } // entra já no lugar do cursor
    alvo.f = 1;
  });
  el.addEventListener('pointerleave', () => { alvo.f = 0; });

  aCadaQuadro(agora => {
    const dt = Math.min(.05, (agora - ultimo) / 1000);
    ultimo = agora;
    if (Math.abs(alvo.f - atual.f) < .002 && atual.f < .002) return; // parado e apagado: nada a fazer
    const kPos = 1 - Math.exp(-dt * 7);   // segue o cursor em ~0,3 s
    const kForca = 1 - Math.exp(-dt * 3); // acende e apaga devagar
    atual.x += (alvo.x - atual.x) * kPos;
    atual.y += (alvo.y - atual.y) * kPos;
    atual.f += (alvo.f - atual.f) * kForca;
    el.style.setProperty('--mx', `${atual.x.toFixed(1)}px`);
    el.style.setProperty('--my', `${atual.y.toFixed(1)}px`);
    el.style.setProperty('--forca', atual.f.toFixed(3));
  });
}
