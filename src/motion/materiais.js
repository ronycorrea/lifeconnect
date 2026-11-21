// Materiais da cena 3D da Life Connect (a CTO de fibra): laranja da marca, grafite, prata, verde dos conectores
// e a luz da fibra (emissiva). Troque LARANJA para mudar a cor da caixa.
import * as THREE from 'three';

const LARANJA = '#ff5a1f';

// Etiqueta da tampa desenhada em canvas: "Life Connect · fibra óptica"
function texturaEtiqueta() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = 'rgba(0,0,0,0)';
  g.fillRect(0, 0, 512, 256);
  g.fillStyle = '#ffffff';
  g.textAlign = 'center';
  g.font = '700 64px Geist Variable, Arial, sans-serif';
  g.fillText('Life Connect', 256, 118);
  g.font = '600 30px Geist Variable, Arial, sans-serif';
  g.globalAlpha = .82;
  g.fillText('FIBRA ÓPTICA · CTO', 256, 172);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Etiqueta do topo do no-break
function texturaNobreak() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 256;
  const g = c.getContext('2d');
  g.textAlign = 'center';
  g.fillStyle = '#121317';
  g.font = '700 70px Geist Variable, Arial, sans-serif';
  g.fillText('NO-BREAK', 256, 120);
  g.fillStyle = LARANJA;
  g.font = '600 30px Geist Variable, Arial, sans-serif';
  g.fillText('Life Connect · 12V', 256, 178);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export function criaMateriais() {
  const laranja = new THREE.MeshPhysicalMaterial({
    name: 'laranja', color: LARANJA, roughness: .42, metalness: 0, clearcoat: .45, clearcoatRoughness: .35,
  });
  const laranjaDentro = new THREE.MeshStandardMaterial({ name: 'laranjaDentro', color: '#d9480f', roughness: .6, side: THREE.DoubleSide });
  const grafite = new THREE.MeshStandardMaterial({ name: 'grafite', color: '#24262b', roughness: .55, metalness: .25 });
  const bandeja = new THREE.MeshStandardMaterial({ name: 'bandeja', color: '#f1f1ee', roughness: .5 });
  const prata = new THREE.MeshPhysicalMaterial({ name: 'prata', color: '#cfd3d9', roughness: .28, metalness: 1 });
  const concreto = new THREE.MeshStandardMaterial({ name: 'concreto', color: '#c9c7c2', roughness: .9 });
  const verde = new THREE.MeshStandardMaterial({ name: 'verde', color: '#2f9e5b', roughness: .4 });
  const cabo = new THREE.MeshStandardMaterial({ name: 'cabo', color: '#151619', roughness: .5 });
  const luz = new THREE.MeshBasicMaterial({ name: 'luz', color: '#ffb36b' });
  const etiqueta = new THREE.MeshBasicMaterial({ name: 'etiqueta', map: texturaEtiqueta(), transparent: true, depthWrite: false });
  const brancoProduto = new THREE.MeshPhysicalMaterial({
    name: 'brancoProduto', color: '#f5f5f3', roughness: .38, metalness: 0, clearcoat: .5, clearcoatRoughness: .3,
  });
  const cinzaProduto = new THREE.MeshStandardMaterial({ name: 'cinzaProduto', color: '#c9cacd', roughness: .5 });
  const ledVerde = new THREE.MeshBasicMaterial({ name: 'ledVerde', color: '#3ddc84' });
  const ledApagado = new THREE.MeshBasicMaterial({ name: 'ledApagado', color: '#cfd1cd' });
  const etiquetaNobreak = new THREE.MeshBasicMaterial({ name: 'etiquetaNobreak', map: texturaNobreak(), transparent: true, depthWrite: false });
  return { brancoProduto, cinzaProduto, ledVerde, ledApagado, etiquetaNobreak, laranja, laranjaDentro, grafite, bandeja, prata, concreto, verde, cabo, luz, etiqueta };
}
