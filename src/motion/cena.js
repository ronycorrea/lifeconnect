// Cena 3D da Life Connect: a CTO de fibra (feita por script) num canvas fixo por cima da página.
// (Na base Alto havia um satélite flutuando pela tela e uma antena parabólica; os dois foram trocados pela CTO.)
// Nada segura a rolagem: cada objeto segue "vagas" do layout ([data-vaga]) e a pose sai da posição delas na tela.
// - Uma vaga tem data-pose="ry:-10 rx:4 rz:-6 asa:30 escala:1" (graus; escala = fração da largura da vaga)
//   e, opcionalmente, data-pose-m para o celular.
// - Um "trecho" liga vagas: entre duas vagas o objeto interpola; fora do trecho ele fica preso à vaga da ponta
//   e sai da tela junto com ela. No modo "faixa" (as passagens), as duas vagas ficam fora da tela, uma de cada
//   lado, e o objeto cruza de uma à outra enquanto a faixa sobe do pé ao topo da tela.
// - Um trecho pode ter uma "troca": quando o gatilho passa de uma linha da tela, o objeto viaja por tempo
//   (não por rolagem) até outra vaga, e volta se o gatilho voltar para baixo da linha.
// - A pose sai direto da rolagem, sem amortecimento próprio: quem suaviza é o Lenis (suave.js), e o quadro é
//   desenhado no mesmo relógio dele, então o objeto anda colado ao layout. Flutuação e mouse entram por cima.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { criaMateriais } from './materiais.js';
import { criaCTO } from './cto.js';
import { criaNobreak } from './nobreak.js';
import { aCadaQuadro, lenis } from './suave.js';

const reduz = matchMedia('(prefers-reduced-motion: reduce)');
const celular = matchMedia('(max-width: 760px)');
const GRAU = Math.PI / 180;

const suave = t => t * t * (3 - 2 * t);
const limita = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const mistura = (a, b, t) => a + (b - a) * t;
const expoOut = t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
const emEOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function lePose(el) {
  let txt = (celular.matches && el.dataset.poseM) || el.dataset.pose || '';
  if (import.meta.env.DEV) txt = new URLSearchParams(location.search).get(`pose-${el.dataset.vaga}`) ?? txt;
  const pose = { ry: 0, rx: 0, rz: 0, asa: 0, az: 0, el: 0, escala: 1, dx: 0, dy: 0 };
  for (const [, k, v] of txt.matchAll(/([a-z]+)\s*:\s*(-?[\d.]+)/g)) pose[k] = parseFloat(v);
  return pose;
}

export function iniciaCena(canvas) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch {
    canvas.remove();
    document.documentElement.classList.add('sem-3d');
    return null;
  }
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.02;

  const cena = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  cena.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  cena.environmentIntensity = 0.45;

  const camera = new THREE.PerspectiveCamera(16, 1, 1, 500);
  camera.position.set(0, 0, 90);

  const ceu = new THREE.HemisphereLight('#ffffff', '#c9c9c5', 0.6);
  const chave = new THREE.DirectionalLight('#ffffff', 2.7);
  chave.position.set(-30, 46, 40);
  const recorte = new THREE.DirectionalLight('#f2f5ff', 1.3);
  recorte.position.set(40, 10, -50);
  const baixo = new THREE.DirectionalLight('#ffffff', 0.35);
  baixo.position.set(10, -40, 30);
  cena.add(ceu, chave, recorte, baixo);

  const mats = criaMateriais();

  // ---------- objetos ----------
  const objetos = [];

  function registra(nome, obj, trechos, extra = {}) {
    const o = {
      nome, obj, trechos, envergadura: extra.envergadura ?? 10, raio: extra.raio ?? 0.56,
      atual: null, alvo: null, visivel: false, intro: extra.intro ?? null, aplica: extra.aplica,
    };
    obj.visible = false;
    cena.add(obj);
    objetos.push(o);
    return o;
  }

  // CTO de fibra (por script, pronta na hora). az = giro em volta do poste; el = abertura da tampa (graus)
  const cto = criaCTO(mats);
  registra('cto', cto, [{
    vagas: ['inst-a', 'inst-b'], modo: 'centro',
    troca: { gatilho: '.passo--4', linha: 0.85, vaga: 'inst-c', duracao: 1300, soDesktop: true },
  }], {
    envergadura: 2, raio: 1.6,
    aplica(obj, p) {
      obj.rotation.set(p.rx * GRAU, p.ry * GRAU, p.rz * GRAU, 'YXZ');
      obj.userData.azimute.rotation.y = p.az * GRAU;
      obj.userData.tampa.rotation.y = -p.el * GRAU;
      // a luz da fibra acende conforme a tampa abre
      const luz = limita((p.el - 25) / 60);
      for (const ponta of obj.userData.pontas) ponta.material.opacity = luz;
    },
  });

  // mini no-break da seção de energia: gira com a rolagem; el = luzes de carga acesas (0 a 4)
  const nobreak = criaNobreak(mats);
  registra('nobreak', nobreak, [{ vagas: ['nobreak-a', 'nobreak-b'], modo: 'centro' }], {
    envergadura: 2.2, raio: .9,
    aplica(obj, p) {
      obj.rotation.set(p.rx * GRAU, p.ry * GRAU, p.rz * GRAU, 'YXZ');
      obj.userData.cargas.forEach((led, i) => {
        const k = limita(p.el - i);
        led.material.color.copy(obj.userData.ledDesligado).lerp(obj.userData.ledLigado, k);
      });
    },
  });

  // ---------- vagas ----------
  let vagas = new Map();
  const leVagas = () => {
    vagas = new Map([...document.querySelectorAll('[data-vaga]')].map(el => [el.dataset.vaga, el]));
  };
  leVagas();

  let largura = 1, altura = 1, ppu = 1;
  function redimensiona() {
    largura = canvas.clientWidth || innerWidth;
    altura = canvas.clientHeight || innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, celular.matches ? 2 : 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(largura, altura, false);
    camera.aspect = largura / altura;
    camera.updateProjectionMatrix();
    ppu = altura / (2 * camera.position.z * Math.tan((camera.fov * GRAU) / 2));
    leVagas();
    pede();
  }

  // rolagem fracionária do Lenis: a página anda em pixels inteiros e, no fim da desaceleração, o objeto
  // andaria aos saltos
  const rolagem = () => lenis?.animatedScroll ?? scrollY;

  function medidaDa(nome) {
    const el = vagas.get(nome);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const topoDoc = r.top + scrollY;
    const y = topoDoc - rolagem();
    return { el, x: r.left + r.width / 2, y: y + r.height / 2, w: r.width, h: r.height, topoDoc, pose: lePose(el) };
  }

  // pose-alvo de um objeto num trecho, agora
  function alvoNoTrecho(tr, indice) {
    const vc = altura / 2;
    const ms = tr.vagas.map(medidaDa).filter(Boolean);
    if (!ms.length) return null;
    let t;
    if (tr.modo === 'faixa') {
      // do pé (92% da tela) ao topo (8%): a faixa atravessa a tela e o objeto atravessa de lado
      t = limita((altura * 0.92 - ms[0].y) / (altura * 0.84));
    } else if (tr.modo === 'fim') {
      const max = document.documentElement.scrollHeight - innerHeight;
      const ini = ms[0].topoDoc - innerHeight;
      t = limita((rolagem() - ini) / Math.max(1, max - ini));
    } else {
      // o trecho começa quando a primeira vaga cruza o meio da tela, ou já no topo da página se ela nasce acima dele
      const a = ms[0].y, b = ms[ms.length - 1].y;
      const linha = Math.min(vc, ms[0].topoDoc + ms[0].h / 2);
      // com "desce", o trecho termina quando a última vaga chega a essa fração da tela, abaixo de onde começou:
      // o objeto desce na tela junto com quem rola, em vez de ficar parado ou subir
      const fim = tr.desce ? tr.desce * altura - linha : 0;
      t = limita((linha - a) / Math.max(1, b - a - fim));
    }
    // distância do centro da tela ao trecho, para escolher o trecho da vez
    const topo = Math.min(...ms.map(m => m.y)), fundo = Math.max(...ms.map(m => m.y));
    const dist = vc < topo ? topo - vc : vc > fundo ? vc - fundo : 0;

    const seg = (ms.length - 1) * t;
    const i = Math.min(ms.length - 2, Math.floor(seg));
    const a = ms[Math.max(0, i)], b = ms[Math.max(0, i) + 1] || a;
    const k = tr.modo === 'faixa' ? limita(seg - i) : suave(limita(seg - i)); // passagem em ritmo constante
    // descendo, a altura anda em ritmo constante: com a curva, o objeto subiria com a página antes de descer
    const ky = tr.desce ? limita(seg - i) : k;
    const pa = a.pose, pb = b.pose;
    const p = {};
    for (const key of Object.keys(pa)) p[key] = mistura(pa[key], pb[key], k);
    const al = {
      x: mistura(a.x, b.x, k) + p.dx * largura,
      y: mistura(a.y, b.y, ky) + p.dy * altura,
      larg: mistura(a.w, b.w, k) * p.escala,
      pose: p,
      t,
      dist,
      trecho: indice,
    };
    return tr.troca ? aplicaTroca(tr.troca, al) : al;
  }

  // troca por gatilho: o progresso anda no tempo (ida e volta) e mistura a pose do trecho com a da outra vaga
  function aplicaTroca(tc, al) {
    const agora = performance.now();
    const g = !(tc.soDesktop && celular.matches) && document.querySelector(tc.gatilho);
    const passou = g ? g.getBoundingClientRect().top < altura * tc.linha : false;
    if (tc.k === undefined) tc.k = passou ? 1 : 0; // a página abriu já depois do gatilho: sem viagem
    const dt = tc.ultimo ? agora - tc.ultimo : 0;
    tc.ultimo = agora;
    const passo = reduz.matches ? 1 : dt / tc.duracao;
    tc.k = limita(tc.k + (passou ? passo : -passo));
    if (tc.k === 0) return al;
    const m = medidaDa(tc.vaga);
    if (!m) return al;
    const e = emEOut(tc.k);
    const p = {};
    for (const key of Object.keys(al.pose)) p[key] = mistura(al.pose[key], m.pose[key], e);
    return {
      ...al,
      x: mistura(al.x, m.x + m.pose.dx * largura, e),
      y: mistura(al.y, m.y + m.pose.dy * altura, e),
      larg: mistura(al.larg, m.w * m.pose.escala, e) * (1 - 0.14 * Math.sin(Math.PI * e)), // encolhe um pouco no caminho
      pose: p,
      animando: tc.k > 0 && tc.k < 1,
    };
  }

  const aVista = (o, al) => {
    const r = al.larg * o.raio * 1.25; // folga para a flutuação
    return al.x + r > 0 && al.x - r < largura && al.y + r > 0 && al.y - r < altura;
  };

  // o trecho da vez é o mais perto do meio da tela, mas o atual segue enquanto o objeto dele aparece:
  // a troca acontece sempre com o objeto fora da tela, sem pulo
  function alvoDe(o) {
    let melhor = null, atual = null;
    for (const [indice, tr] of o.trechos.entries()) {
      const al = alvoNoTrecho(tr, indice);
      if (!al) continue;
      if (indice === o.atual?.trecho) atual = al;
      if (!melhor || al.dist < melhor.dist) melhor = al;
    }
    return atual && atual !== melhor && aVista(o, atual) ? atual : melhor;
  }

  // ---------- entrada do mouse ----------
  const mouse = { x: 0, y: 0, ax: 0, ay: 0 };
  addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    mouse.x = (e.clientX / innerWidth) * 2 - 1;
    mouse.y = (e.clientY / innerHeight) * 2 - 1;
    pede();
  }, { passive: true });

  // ---------- laço ----------
  // roda no relógio do suave.js, logo depois do Lenis mover a rolagem
  let rodando = false, ultimo = performance.now(), limpo = true;
  function pede() {
    if (!rodando) { rodando = true; ultimo = performance.now(); }
  }
  // se a placa de vídeo derrubar o WebGL, para de desenhar; quando ele volta, redesenha
  let perdido = false;
  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); perdido = true; });
  canvas.addEventListener('webglcontextrestored', () => { perdido = false; pede(); });
  const tiraQuadro = aCadaQuadro(agora => { if (rodando && !perdido) quadro(agora); });

  function quadro(agora) {
    const dt = Math.min(0.05, (agora - ultimo) / 1000);
    ultimo = agora;
    const tempo = agora / 1000;
    const calmo = reduz.matches;

    mouse.ax += (mouse.x - mouse.ax) * (1 - Math.exp(-dt * 3.5));
    mouse.ay += (mouse.y - mouse.ay) * (1 - Math.exp(-dt * 3.5));

    let algumVisivel = false, mexendo = false;
    for (const o of objetos) {
      const alvo = alvoDe(o);
      if (!alvo) { o.obj.visible = false; continue; }
      // sem perseguir o alvo: a pose é a da rolagem neste quadro
      const at = o.atual = alvo;
      if (alvo.animando) mexendo = true;

      // pose final = suavizada + entrada + flutuação + mouse
      const p = { ...at.pose };
      let x = at.x, y = at.y;
      if (o.intro) {
        const e = expoOut(limita((agora - o.intro.inicio) / 2100));
        x += (1 - e) * largura * 0.62;
        y -= (1 - e) * altura * 0.05;
        p.ry += (1 - e) * -26;
        p.rz += (1 - e) * 7;
        if (e >= 1) o.intro = null; else mexendo = true;
      }
      if (!calmo) {
        y += Math.sin(tempo * 0.62) * Math.min(7, at.larg * 0.006);
        p.rx += Math.sin(tempo * 0.37) * 0.9;
        p.rz += Math.sin(tempo * 0.51 + 1) * 0.6;
        // o mouse gira o objeto para o lado dele, inclina nas asas e o puxa um pouco
        p.ry += Math.sin(tempo * 0.23) * 1.6 + mouse.ax * 22;
        p.rx += mouse.ay * 12;
        p.rz -= mouse.ax * 5;
        x += mouse.ax * Math.min(28, at.larg * 0.025);
        y += mouse.ay * Math.min(16, at.larg * 0.015);
      }

      const escala = at.larg / ppu / o.envergadura;
      o.obj.position.set((x - largura / 2) / ppu, -(y - altura / 2) / ppu, 0);
      o.obj.scale.setScalar(escala);
      o.aplica(o.obj, p);

      const raio = o.envergadura * escala * o.raio * ppu * 1.1;
      o.visivel = x + raio > 0 && x - raio < largura && y + raio > 0 && y - raio < altura;
      o.obj.visible = o.visivel;
      if (o.visivel) algumVisivel = true;
      o.ultimoT = at.t;
      o.ultimaPose = { x, y, larg: at.larg, p };
    }

    if (algumVisivel) { renderer.render(cena, camera); limpo = false; }
    else if (!limpo) { renderer.clear(); limpo = true; }

    // segue rodando enquanto algo aparece (flutua) ou a entrada não terminou; a rolagem acorda de novo
    if (!((algumVisivel && !reduz.matches) || mexendo)) rodando = false;
  }

  addEventListener('scroll', pede, { passive: true });
  lenis?.on('scroll', pede); // dentro do quadro do Lenis: desenha neste mesmo quadro
  addEventListener('resize', redimensiona);
  celular.addEventListener('change', redimensiona);
  reduz.addEventListener('change', pede);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) pede(); });
  redimensiona();

  // desliga esta cena (usado quando o contexto WebGL some e o main.js cria uma nova)
  function destroi() {
    tiraQuadro();
    removeEventListener('resize', redimensiona);
    try { renderer.dispose(); } catch {}
  }
  const api = { pede, redimensiona, objetos, leVagas, destroi };
  if (import.meta.env.DEV) window.__life = { ...api, THREE, cena, camera, renderer, mats };
  return api;
}
