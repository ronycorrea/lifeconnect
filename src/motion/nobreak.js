// Mini no-break (UPS) para roteador, modelado por script: corpo branco com cantos arredondados, etiqueta
// "NO-BREAK" no topo, quatro luzes de carga na frente, luz de energia, saídas DC atrás e o cabo até o roteador.
// A pose vem das vagas (cena.js): el = quantas luzes de carga estão acesas (0 a 4, aceita fração).
// Medidas em unidades da cena: o corpo tem 2,2 de largura.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export function criaNobreak(m) {
  const grupo = new THREE.Group();
  grupo.name = 'nobreak';

  const L = 2.2, A = .62, P = 1.4;

  const corpo = new THREE.Mesh(new RoundedBoxGeometry(L, A, P, 6, .16), m.brancoProduto);
  grupo.add(corpo);

  // friso cinza em volta, a um terço da altura (a "tampa" do aparelho)
  const friso = new THREE.Mesh(new RoundedBoxGeometry(L + .004, .025, P + .004, 6, .012), m.cinzaProduto);
  friso.position.y = A * .16;
  grupo.add(friso);

  // etiqueta no topo
  const etiqueta = new THREE.Mesh(new THREE.PlaneGeometry(1.5, .75), m.etiquetaNobreak);
  etiqueta.rotation.x = -Math.PI / 2;
  etiqueta.position.set(0, A / 2 + .003, 0);
  grupo.add(etiqueta);

  // frente: quatro luzes de carga e a luz de energia
  const cargas = [];
  for (let i = 0; i < 4; i++) {
    const led = new THREE.Mesh(new RoundedBoxGeometry(.16, .045, .02, 2, .01), m.ledApagado.clone());
    led.position.set(-.55 + i * .2, -.06, P / 2 + .004);
    grupo.add(led);
    cargas.push(led);
  }
  const energia = new THREE.Mesh(new THREE.CircleGeometry(.035, 24), m.ledVerde);
  energia.position.set(.72, -.06, P / 2 + .006);
  grupo.add(energia);
  const botao = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, .03, 32), m.cinzaProduto);
  botao.rotation.x = Math.PI / 2;
  botao.position.set(.9, -.06, P / 2 + .01);
  grupo.add(botao);

  // atrás: saídas DC e USB
  for (const x of [-.6, -.25]) {
    const saida = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, .05, 24), m.grafite);
    saida.rotation.x = Math.PI / 2;
    saida.position.set(x, -.04, -P / 2 - .01);
    grupo.add(saida);
  }
  const usb = new THREE.Mesh(new THREE.BoxGeometry(.2, .07, .04), m.grafite);
  usb.position.set(.15, -.04, -P / 2 - .01);
  grupo.add(usb);

  // cabo saindo por trás e descendo em curva
  const curva = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-.6, -.04, -P / 2 - .02),
    new THREE.Vector3(-.65, -.05, -P / 2 - .45),
    new THREE.Vector3(-1.1, -.25, -P / 2 - .7),
    new THREE.Vector3(-1.9, -.31, -P / 2 - .55),
  ]);
  grupo.add(new THREE.Mesh(new THREE.TubeGeometry(curva, 40, .03, 10), m.cabo));

  // pezinhos de borracha
  for (const [x, z] of [[-.85, -.5], [.85, -.5], [-.85, .5], [.85, .5]]) {
    const pe = new THREE.Mesh(new THREE.CylinderGeometry(.08, .08, .03, 20), m.grafite);
    pe.position.set(x, -A / 2 - .01, z);
    grupo.add(pe);
  }

  grupo.userData.cargas = cargas;
  grupo.userData.ledLigado = m.ledVerde.color.clone();
  grupo.userData.ledDesligado = m.ledApagado.color.clone();
  return grupo;
}
