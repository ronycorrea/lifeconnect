// Âncoras pela rolagem suave (rolaAte do suave.js; data-ancora="center" centraliza) e o estado de toque:
// .is-toque entra 70 ms depois do toque, só se o dedo não arrastar mais de 8 px.
import { rolaAte } from '../motion/suave.js';

export function iniciaNavegacao() {
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented) return;
    const id = a.getAttribute('href');
    e.preventDefault();
    if (id === '#') return;
    if (id === '#topo') return rolaAte(0);
    const alvo = document.querySelector(id);
    if (!alvo) return;
    const centro = a.dataset.ancora === 'center' || id === '#cobertura';
    rolaAte(alvo, { block: centro ? 'center' : 'start' });
  });

  let atual = null, x = 0, y = 0, timer = 0;
  addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse') return;
    const el = e.target.closest('a, button, .flip-box');
    if (!el) return;
    atual = el; x = e.clientX; y = e.clientY;
    timer = setTimeout(() => atual?.classList.add('is-toque'), 70);
  }, { passive: true });
  addEventListener('pointermove', e => {
    if (atual && Math.hypot(e.clientX - x, e.clientY - y) > 8) { clearTimeout(timer); atual.classList.remove('is-toque'); atual = null; }
  }, { passive: true });
  const solta = () => {
    clearTimeout(timer);
    const el = atual;
    atual = null;
    if (el) setTimeout(() => el.classList.remove('is-toque'), 160);
  };
  addEventListener('pointerup', solta);
  addEventListener('pointercancel', solta);
}
