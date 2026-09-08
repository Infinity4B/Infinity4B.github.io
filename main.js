import * as THREE from 'three';

/* ================================================================
   INFINITY4B — "4B" particle hologram over a digital water grid.
   Matrix rain (2D canvas) behind a transparent WebGL scene.
   ================================================================ */

const IS_MOBILE = matchMedia('(max-width: 800px), (pointer: coarse)').matches;
const DPR = Math.min(window.devicePixelRatio || 1, 2);

const TEXT_CENTER_Y = 3.6;   // where the "4B" hologram floats
const RIPPLE_COUNT = 12;     // max simultaneous water ripples

/* ---------------- matrix rain (background canvas) ---------------- */

const GLYPHS = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉ01234567894B<>/\\=+*#$';

function startRain() {
  const canvas = document.getElementById('rain');
  const ctx = canvas.getContext('2d');
  const fontSize = IS_MOBILE ? 13 : 16;
  let columns = 0;
  let drops = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    columns = Math.ceil(canvas.width / fontSize);
    drops = Array.from({ length: columns }, () => Math.random() * -50);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  resize();
  window.addEventListener('resize', resize);

  let last = 0;
  function tick(t) {
    requestAnimationFrame(tick);
    if (t - last < 50) return; // ~20 fps is plenty for rain
    last = t;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.09)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${fontSize}px monospace`;

    for (let i = 0; i < columns; i++) {
      const glyph = GLYPHS[(Math.random() * GLYPHS.length) | 0];
      const x = i * fontSize;
      const y = drops[i] * fontSize;
      ctx.fillStyle = Math.random() < 0.03 ? '#c8ffdd' : '#00b34a';
      ctx.fillText(glyph, x, y);
      if (y > canvas.height && Math.random() > 0.976) drops[i] = 0;
      drops[i]++;
    }
  }
  requestAnimationFrame(tick);
}

/* ---------------- sample "4B" into particle positions ---------------- */

function buildTextGeometry() {
  const W = 640, H = 320;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#fff';
  ctx.font = `900 250px 'Arial Black', Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('4B', W / 2, H / 2 + 14);

  const px = ctx.getImageData(0, 0, W, H).data;
  const step = IS_MOBILE ? 3 : 2;
  const layers = IS_MOBILE ? 2 : 3;
  const scale = 10 / W;          // world width of the glyph block
  const depth = 0.9;             // z thickness of the hologram

  const positions = [];
  const seeds = [];

  for (let y = 0; y < H; y += step) {
    for (let x = 0; x < W; x += step) {
      if (px[(y * W + x) * 4] < 128) continue;
      for (let l = 0; l < layers; l++) {
        const wx = (x - W / 2) * scale + (Math.random() - 0.5) * 0.02;
        const wy = (H / 2 - y) * scale + TEXT_CENTER_Y + (Math.random() - 0.5) * 0.02;
        const wz = (layers === 1 ? 0 : l / (layers - 1) - 0.5) * depth
          + (Math.random() - 0.5) * 0.12;
        positions.push(wx, wy, wz);
        seeds.push(Math.random(), Math.random(), Math.random());
      }
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('aSeed', new THREE.Float32BufferAttribute(seeds, 3));
  return geo;
}

/* ---------------- shaders ---------------- */

const textVertex = /* glsl */ `
  uniform float uTime;
  uniform vec3  uMouse;
  uniform float uHover;
  uniform float uBurstTime;
  uniform vec3  uBurstPos;
  uniform float uPixelRatio;
  attribute vec3 aSeed;
  varying float vForce;
  varying float vSeed;

  void main() {
    vec3 pos = position;

    // idle shimmer — the hologram is never perfectly stable
    pos.x += sin(uTime * 1.6 + aSeed.x * 43.0) * 0.025;
    pos.y += cos(uTime * 1.3 + aSeed.y * 39.0) * 0.025;
    pos.z += sin(uTime * 1.1 + aSeed.z * 31.0) * 0.05;

    // pointer repulsion — particles scatter away from the cursor
    vec3 d = pos - uMouse;
    float dist = length(d);
    float force = smoothstep(2.2, 0.0, dist) * uHover;
    pos += normalize(d + 0.0001) * force * (0.8 + aSeed.x * 1.1);

    // click shockwave — expanding pulse through the glyphs
    float bAge = uTime - uBurstTime;
    if (bAge > 0.0 && bAge < 2.5) {
      float bd = length(pos - uBurstPos);
      float pulse = exp(-pow(bd - bAge * 7.0, 2.0) * 1.2) * exp(-bAge * 1.8);
      pos += normalize(pos - uBurstPos + 0.0001) * pulse * 2.2;
      force = max(force, pulse);
    }

    vForce = force;
    vSeed = aSeed.y;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (0.7 + aSeed.z * 0.9 + force * 1.2) * uPixelRatio * (26.0 / -mv.z);
  }
`;

const textFragment = /* glsl */ `
  uniform float uTime;
  varying float vForce;
  varying float vSeed;

  void main() {
    float m = smoothstep(0.5, 0.08, length(gl_PointCoord - 0.5));
    float flicker = 0.6 + 0.4 * sin(uTime * (2.0 + vSeed * 9.0) + vSeed * 120.0);
    vec3 col = mix(vec3(0.1, 1.0, 0.42), vec3(0.75, 1.0, 0.85), min(vForce, 1.0));
    gl_FragColor = vec4(col, m * (0.25 + 0.45 * flicker) * (0.35 + 0.65 * vForce));
  }
`;

const waterVertex = /* glsl */ `
  uniform float uTime;
  uniform vec3  uRipples[${RIPPLE_COUNT}]; // (x, z, startTime)
  uniform float uPixelRatio;
  varying float vElev;
  varying float vFade;

  void main() {
    vec3 pos = position;

    // ambient swell
    float e = sin(pos.x * 0.45 + uTime * 0.9) * sin(pos.z * 0.35 + uTime * 0.7) * 0.32;
    e += sin(pos.x * 1.1 - uTime * 1.4) * 0.07;
    e += cos(pos.z * 1.4 + uTime * 1.1) * 0.07;

    // expanding ripple rings from the pointer
    for (int i = 0; i < ${RIPPLE_COUNT}; i++) {
      float age = uTime - uRipples[i].z;
      if (age > 0.0 && age < 5.0) {
        float r = distance(pos.xz, uRipples[i].xy);
        float ring = exp(-pow(r - age * 3.2, 2.0) * 1.4);
        e += ring * exp(-age * 1.1) * 0.9;
      }
    }

    pos.y += e;
    vElev = e;
    vFade = 1.0 - smoothstep(15.0, 29.0, length(pos.xz));

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (1.3 + max(e, 0.0) * 2.2) * uPixelRatio * (48.0 / -mv.z);
  }
`;

const waterFragment = /* glsl */ `
  varying float vElev;
  varying float vFade;

  void main() {
    float m = smoothstep(0.5, 0.05, length(gl_PointCoord - 0.5));
    float glow = clamp(vElev * 1.3 + 0.35, 0.0, 1.5);
    vec3 col = mix(vec3(0.0, 0.22, 0.09), vec3(0.25, 1.0, 0.5), glow);
    gl_FragColor = vec4(col, m * vFade * (0.22 + glow * 0.5));
  }
`;

/* ---------------- scene ---------------- */

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('scene'),
  antialias: false,
  alpha: true,
});
renderer.setPixelRatio(DPR);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  55, window.innerWidth / window.innerHeight, 0.1, 100,
);
camera.position.set(0, 3.6, 15);

const clock = new THREE.Clock();

// "4B" hologram
const textUniforms = {
  uTime: { value: 0 },
  uMouse: { value: new THREE.Vector3(0, TEXT_CENTER_Y, 99) }, // parked far away
  uHover: { value: 0 },
  uBurstTime: { value: -10 },
  uBurstPos: { value: new THREE.Vector3() },
  uPixelRatio: { value: DPR },
};
const textPoints = new THREE.Points(
  buildTextGeometry(),
  new THREE.ShaderMaterial({
    vertexShader: textVertex,
    fragmentShader: textFragment,
    uniforms: textUniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }),
);
scene.add(textPoints);

// digital water
const waterUniforms = {
  uTime: { value: 0 },
  uRipples: { value: Array.from({ length: RIPPLE_COUNT }, () => new THREE.Vector3(0, 0, -100)) },
  uPixelRatio: { value: DPR },
};
const waterGeo = new THREE.PlaneGeometry(60, 60, IS_MOBILE ? 110 : 170, IS_MOBILE ? 110 : 170);
waterGeo.rotateX(-Math.PI / 2);
const waterPoints = new THREE.Points(
  waterGeo,
  new THREE.ShaderMaterial({
    vertexShader: waterVertex,
    fragmentShader: waterFragment,
    uniforms: waterUniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }),
);
scene.add(waterPoints);

/* ---------------- interaction ---------------- */

const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
const textPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);  // z = 0
const waterPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); // y = 0
const hitText = new THREE.Vector3();
const hitWater = new THREE.Vector3();
const lastRipplePos = new THREE.Vector2(1e9, 1e9);

let rippleIndex = 0;
let hoverTarget = 0;
let nextAmbientRipple = 2;
const parallax = new THREE.Vector2();

function addRipple(x, z, delay = 0) {
  waterUniforms.uRipples.value[rippleIndex].set(x, z, clock.getElapsedTime() + delay);
  rippleIndex = (rippleIndex + 1) % RIPPLE_COUNT;
}

const statusEl = document.getElementById('status');

function onPointerMove(e) {
  ndc.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
  hoverTarget = 1;
  parallax.set(ndc.x, ndc.y);

  raycaster.setFromCamera(ndc, camera);

  if (raycaster.ray.intersectPlane(textPlane, hitText)) {
    textUniforms.uMouse.value.copy(hitText);
  }

  if (raycaster.ray.intersectPlane(waterPlane, hitWater)
      && lastRipplePos.distanceTo(new THREE.Vector2(hitWater.x, hitWater.z)) > 1.5) {
    lastRipplePos.set(hitWater.x, hitWater.z);
    addRipple(hitWater.x, hitWater.z);
  }

  statusEl.textContent =
    `X:${hitText.x >= 0 ? '+' : ''}${hitText.x.toFixed(1)} ` +
    `Y:${hitText.y >= 0 ? '+' : ''}${hitText.y.toFixed(1)} // SYS.ONLINE`;
}

function onPointerDown() {
  const t = clock.getElapsedTime();
  textUniforms.uBurstTime.value = t;
  textUniforms.uBurstPos.value.copy(hitText);
  // triple splash on the water
  addRipple(hitWater.x, hitWater.z, 0);
  addRipple(hitWater.x, hitWater.z, 0.12);
  addRipple(hitWater.x, hitWater.z, 0.24);
}

window.addEventListener('pointermove', onPointerMove);
window.addEventListener('pointerdown', onPointerDown);
window.addEventListener('pointerleave', () => { hoverTarget = 0; });
document.addEventListener('mouseleave', () => { hoverTarget = 0; });

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* ---------------- HUD terminal ---------------- */

function startTerminal(particleCount) {
  const el = document.getElementById('terminal');
  const lines = [
    '> boot /dev/4b .......... ok',
    '> mount /matrix/rain ..... ok',
    `> spawn particles [${particleCount}] ok`,
    '> hydro.sim --waves ...... running',
    '> trace pointer .......... _',
  ];
  let li = 0, ci = 0, out = '';
  (function type() {
    if (li >= lines.length) return;
    ci++;
    if (ci > lines[li].length) { out += lines[li] + '\n'; li++; ci = 0; }
    el.textContent = out + (li < lines.length ? lines[li].slice(0, ci) : '');
    setTimeout(type, li >= lines.length ? 0 : 12 + Math.random() * 25);
  })();
}

/* ---------------- main loop ---------------- */

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  textUniforms.uTime.value = t;
  waterUniforms.uTime.value = t;
  textUniforms.uHover.value += (hoverTarget - textUniforms.uHover.value) * 0.08;

  // the water stays alive even with no pointer around
  if (t > nextAmbientRipple) {
    nextAmbientRipple = t + 2.5 + Math.random() * 3;
    addRipple((Math.random() - 0.5) * 24, (Math.random() - 0.5) * 20);
  }

  // camera parallax
  camera.position.x += (parallax.x * 2.2 - camera.position.x) * 0.04;
  camera.position.y += (3.6 + parallax.y * 1.2 - camera.position.y) * 0.04;
  camera.lookAt(0, 2.4, 0);

  renderer.render(scene, camera);
}

startRain();
startTerminal(textPoints.geometry.getAttribute('position').count);
animate();
