// EFEITO 3: flip box. O JS só alterna uc-hide / uc-show no container; o giro 3D é todo do CSS.
// Mouse: mouseenter / mouseleave. Teclado: focusin / focusout (e Enter ou Espaço alternam).
// Toque: o click alterna (os eventos de mouse "emulados" depois do toque são ignorados).
export function iniciaFlip() {
  document.querySelectorAll('.flip-box').forEach(box => {
    const c = box.querySelector('.flip-box__container');
    if (!c) return;
    const mostra = v => { c.classList.toggle('uc-show', v); c.classList.toggle('uc-hide', !v); };
    const aberto = () => c.classList.contains('uc-show');
    let toque = 0;
    const veioDoToque = () => performance.now() - toque < 800;

    box.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') toque = performance.now(); });
    box.addEventListener('mouseenter', () => { if (!veioDoToque()) mostra(true); });
    box.addEventListener('mouseleave', () => { if (!veioDoToque()) mostra(false); });
    box.addEventListener('focusin', () => { if (!veioDoToque()) mostra(true); });
    box.addEventListener('focusout', () => mostra(false));
    box.addEventListener('click', () => { if (veioDoToque()) mostra(!aberto()); });
    box.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); mostra(!aberto()); }
    });
  });
}
