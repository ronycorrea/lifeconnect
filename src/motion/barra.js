// Barra de rolagem própria: fina, sobreposta, aparece ao rolar e pode ser arrastada.
import { rolaAte } from './suave.js';

export function iniciaBarra() {
  const barra = document.querySelector('.barra');
  if (!barra) return;
  const polegar = barra.querySelector('.barra__polegar');
  let timer = 0, arrasto = null;

  const medidas = () => {
    const h = innerHeight;
    const total = document.documentElement.scrollHeight;
    const alt = Math.max(44, (h * h) / total);
    return { h, total, alt, max: total - h };
  };

  const atualiza = () => {
    const { h, alt, max } = medidas();
    const y = max > 0 ? (scrollY / max) * (h - alt) : 0;
    polegar.style.setProperty('--altura', `${alt}px`);
    polegar.style.setProperty('--y', `${y}px`);
    barra.hidden = max <= 0;
  };

  const mostra = () => {
    barra.classList.add('is-ativa');
    clearTimeout(timer);
    timer = setTimeout(() => barra.classList.remove('is-ativa'), 1100);
  };

  addEventListener('scroll', () => { atualiza(); mostra(); }, { passive: true });
  addEventListener('resize', atualiza);
  new ResizeObserver(atualiza).observe(document.body);

  polegar.addEventListener('pointerdown', e => {
    arrasto = { y: e.clientY, s: scrollY };
    polegar.setPointerCapture(e.pointerId);
    barra.classList.add('is-arrastando');
    e.preventDefault();
  });
  polegar.addEventListener('pointermove', e => {
    if (!arrasto) return;
    const { h, alt, max } = medidas();
    rolaAte(arrasto.s + (e.clientY - arrasto.y) * (max / (h - alt)), { imediato: true });
  });
  const solta = () => { arrasto = null; barra.classList.remove('is-arrastando'); };
  polegar.addEventListener('pointerup', solta);
  polegar.addEventListener('pointercancel', solta);

  atualiza();
}
