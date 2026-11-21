// CTO (caixa de terminação óptica) da Life Connect, modelada por script: um trecho de poste, as abraçadeiras,
// a caixa laranja com tampa articulada, a bandeja com o splitter e os conectores verdes (SC/APC), e os cabos drop
// saindo por baixo. Quando a tampa abre, as pontas dos conectores acendem: é a luz da fibra.
// Hierarquia: grupo → poste (fixo) → azimute (gira a caixa em volta do poste, em Y) → caixa → tampa (abre em Y).
// A pose vem das vagas (cena.js): az = giro em volta do poste, el = abertura da tampa em graus.
// Medidas em unidades da cena: a caixa tem cerca de 1,5 de largura e 2 de altura.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export function criaCTO(m) {
  const grupo = new THREE.Group();
  grupo.name = 'cto';

  const L = 1.5, A = 2, P = .56; // largura, altura e profundidade da caixa

  // trecho de poste de concreto atrás da caixa
  const poste = new THREE.Mesh(new THREE.CylinderGeometry(.2, .22, 3.6, 48), m.concreto);
  poste.position.set(0, -.1, -.62);
  grupo.add(poste);
  for (const y of [.55, -.55]) {
    const abraco = new THREE.Mesh(new THREE.TorusGeometry(.225, .028, 12, 64), m.prata);
    abraco.rotation.x = Math.PI / 2;
    abraco.position.set(0, y, -.62);
    grupo.add(abraco);
  }

  const azimute = new THREE.Group();
  azimute.position.set(0, 0, -.62);
  grupo.add(azimute);

  const caixa = new THREE.Group();
  caixa.position.set(0, 0, .62);
  azimute.add(caixa);

  // suporte entre o poste e a caixa
  for (const y of [.55, -.55]) {
    const braco = new THREE.Mesh(new THREE.BoxGeometry(.5, .1, .4), m.prata);
    braco.position.set(0, y, -.42);
    caixa.add(braco);
  }

  // corpo: caixa aberta na frente (fundo + quatro paredes com cantos arredondados)
  const fundo = new THREE.Mesh(new RoundedBoxGeometry(L, A, .1, 4, .05), m.laranja);
  fundo.position.z = -P / 2 + .05;
  const lateral = (w, h, x, y) => {
    const p = new THREE.Mesh(new RoundedBoxGeometry(w, h, P, 4, .04), m.laranja);
    p.position.set(x, y, 0);
    return p;
  };
  const esp = .07;
  caixa.add(
    fundo,
    lateral(esp, A, -L / 2 + esp / 2, 0),
    lateral(esp, A, L / 2 - esp / 2, 0),
    lateral(L, esp, 0, A / 2 - esp / 2),
    lateral(L, esp, 0, -A / 2 + esp / 2),
  );
  const dentro = new THREE.Mesh(new THREE.PlaneGeometry(L - esp * 2, A - esp * 2), m.laranjaDentro);
  dentro.position.z = -P / 2 + .101;
  caixa.add(dentro);

  // bandeja de emenda (onde fica a fusão) e o splitter
  const tray = new THREE.Mesh(new RoundedBoxGeometry(L * .74, A * .36, .08, 3, .03), m.bandeja);
  tray.position.set(0, .45, -P / 2 + .16);
  const splitter = new THREE.Mesh(new RoundedBoxGeometry(.5, .16, .08, 3, .02), m.grafite);
  splitter.position.set(0, .45, -P / 2 + .24);
  caixa.add(tray, splitter);
  // fibras coloridas enroladas na bandeja
  const cores = ['#2b7bd8', '#f29f05', '#36a852', '#8a5a2b', '#9aa0a6', '#ffffff'];
  cores.forEach((c, i) => {
    const anel = new THREE.Mesh(new THREE.TorusGeometry(.3 - i * .025, .006, 6, 80), new THREE.MeshStandardMaterial({ color: c, roughness: .4 }));
    anel.scale.set(1.45, .7, 1);
    anel.position.set(0, .45, -P / 2 + .205);
    caixa.add(anel);
  });

  // conectores SC/APC (verdes) em duas fileiras, com a ponta que acende
  const pontas = [];
  for (let fila = 0; fila < 2; fila++) {
    for (let i = 0; i < 4; i++) {
      const x = -.42 + i * .28, y = -.25 - fila * .34;
      const adaptador = new THREE.Mesh(new RoundedBoxGeometry(.16, .22, .2, 2, .02), m.verde);
      adaptador.position.set(x, y, -P / 2 + .2);
      const ponta = new THREE.Mesh(new THREE.CircleGeometry(.05, 24), m.luz.clone());
      ponta.position.set(x, y, -P / 2 + .302);
      ponta.material.transparent = true;
      ponta.material.opacity = 0;
      caixa.add(adaptador, ponta);
      pontas.push(ponta);
    }
  }

  // cabos drop saindo por baixo, curvando para baixo e para os lados
  const saidas = [-.45, -.15, .15, .45];
  saidas.forEach((x, i) => {
    const lado = x < 0 ? -1 : 1;
    const curva = new THREE.CatmullRomCurve3([
      new THREE.Vector3(x, -A / 2 + .02, 0),
      new THREE.Vector3(x * 1.1, -A / 2 - .35, .05),
      new THREE.Vector3(x * 1.6 + lado * .2, -A / 2 - .8 - i * .05, .12),
      new THREE.Vector3(x * 2.4 + lado * .55, -A / 2 - 1.1, .1),
    ]);
    caixa.add(new THREE.Mesh(new THREE.TubeGeometry(curva, 40, .025, 10), m.cabo));
    const prensa = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, .1, 20), m.grafite);
    prensa.position.set(x, -A / 2 - .02, 0);
    caixa.add(prensa);
  });

  // tampa com dobradiça na lateral esquerda; a etiqueta da marca vai na frente
  const dobra = new THREE.Group();
  dobra.position.set(-L / 2, 0, P / 2);
  caixa.add(dobra);
  const tampa = new THREE.Mesh(new RoundedBoxGeometry(L, A, .1, 4, .05), m.laranja);
  tampa.position.set(L / 2, 0, .05);
  const etiqueta = new THREE.Mesh(new THREE.PlaneGeometry(L * .8, L * .4), m.etiqueta);
  etiqueta.position.set(L / 2, .25, .102);
  const trava = new THREE.Mesh(new RoundedBoxGeometry(.1, .3, .06, 2, .02), m.grafite);
  trava.position.set(L - .06, 0, .11);
  dobra.add(tampa, etiqueta, trava);

  grupo.userData.azimute = azimute;
  grupo.userData.tampa = dobra;
  grupo.userData.pontas = pontas;
  return grupo;
}
