import { useEffect, useRef, useState } from 'react';
import TLink from '@/components/common/TLink';

// 404: a full-viewport ASCII koi pond (WebGL2, two passes).
//   1. SCENE: fragment shader paints water, ripples, koi and lily pads into a
//      small texture, 2px per text cell. Lily pads are placed to spell "404".
//   2. ASCII: per cell, read brightness, pick a glyph from an ink-sorted ramp,
//      draw it from a pre-rendered atlas. Mono: white/gray on black.
// Adapted from the koi pond reference (Lowlight).

const RAIN = 1.0;
const RAMP = " .'`,:;-~=+*icoxe%#&8@";
const FONT = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';
const MAX_PADS = 40;

const VERT = `#version 300 es
in vec2 a; void main(){ gl_Position = vec4(a, 0., 1.); }`;

const SCENE = `#version 300 es
precision highp float;
uniform vec2 uBuf; uniform vec2 uRes; uniform float uTime; uniform float uRain;
uniform vec2 uPads[${MAX_PADS}]; uniform int uPadN; uniform float uPadR; uniform float uFish;
out vec4 o;
float asp;
float S(float a, float b, float t){ t = clamp((t - a) / (b - a), 0., 1.); return t * t * (3. - 2. * t); }
float h11(float p){ p = fract(p * .1031); p *= p + 33.33; p *= p + p; return fract(p); }
float h21(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
vec2 h22(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973)); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.xx + p3.yz) * p3.zy); }
vec3 N13(float p){ vec3 p3 = fract(vec3(p) * vec3(.1031, .11369, .13787)); p3 += dot(p3, p3.yzx + 19.19); return fract(vec3((p3.x + p3.y) * p3.z, (p3.x + p3.z) * p3.y, (p3.y + p3.z) * p3.x)); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f);
  return mix(mix(h21(i), h21(i + vec2(1, 0)), u.x), mix(h21(i + vec2(0, 1)), h21(i + 1.), u.x), u.y); }
float fbm(vec2 p){ float v = 0., a = .5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6); for (int i = 0; i < 5; i++){ v += a * vn(p); p = m * p; a *= .5; } return v; }
vec3 tone(vec3 c){ c = c * (2.51 * c + .03) / (c * (2.43 * c + .59) + .14); return pow(clamp(c, 0., 1.), vec3(.88)); }
float sdTri(vec2 p, vec2 p0, vec2 p1, vec2 p2){
  vec2 e0 = p1 - p0, e1 = p2 - p1, e2 = p0 - p2;
  vec2 v0 = p - p0, v1 = p - p1, v2 = p - p2;
  vec2 pq0 = v0 - e0 * clamp(dot(v0, e0) / dot(e0, e0), 0., 1.);
  vec2 pq1 = v1 - e1 * clamp(dot(v1, e1) / dot(e1, e1), 0., 1.);
  vec2 pq2 = v2 - e2 * clamp(dot(v2, e2) / dot(e2, e2), 0., 1.);
  float s = sign(e0.x * e2.y - e0.y * e2.x);
  vec2 d = min(min(vec2(dot(pq0, pq0), s * (v0.x * e0.y - v0.y * e0.x)), vec2(dot(pq1, pq1), s * (v1.x * e1.y - v1.y * e1.x))), vec2(dot(pq2, pq2), s * (v2.x * e2.y - v2.y * e2.x)));
  return -sqrt(d.x) * sign(d.y);
}
vec3 ripples(vec2 q, float t, float sc, float seed){
  vec2 g = q * sc; vec2 id = floor(g);
  vec3 acc = vec3(0.);
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++){
    vec2 c = id + vec2(float(i), float(j));
    vec2 h = h22(c + seed);
    if (h21(c + seed * 3.) > uRain * .85) continue;
    float ph = fract(t * (.35 + h.x * .3) + h.y);
    vec2 d = g - c - h;
    float dl = length(d);
    float ring = S(.08, 0., abs(dl - ph * 1.2)) * (1. - ph) * (1. - ph);
    acc.xy += d / (dl + 1e-3) * ring * .5;
    acc.z += ring;
  }
  return acc;
}
vec4 koi(vec2 q, float t, float i){
  vec3 h = N13(i * 17.3 + 4.);
  float ph = t * (.1 + h.x * .07) + h.y * 6.28;
  vec2 c = vec2(sin(ph) * asp * .32 + (h.z - .5) * .2, .5 + sin(ph * 1.7 + h.x * 4.) * .28);
  vec2 v = vec2(cos(ph) * asp * .32, cos(ph * 1.7 + h.x * 4.) * .28 * 1.7);
  vec2 dir = normalize(v + 1e-4);
  vec2 l = vec2(dot(q - c, dir), dot(q - c, vec2(-dir.y, dir.x)));
  l /= (.9 + h.z * .5) * uFish;
  l.y += sin(l.x * 40. - t * 7.) * .006 * S(.02, -.06, l.x);
  float body = (length(l / vec2(.065, .019)) - 1.) * .019;
  float sw = .006 * sin(t * 7. + i);
  float tail = sdTri(l, vec2(-.055, 0.), vec2(-.1, .022 + sw), vec2(-.1, -.022 + sw));
  float d = min(body, tail);
  float pat = fbm(l * 40. + i * 10.);
  // one bright fish, the rest mid-gray with faint pattern
  vec3 fc = i < 1. ? vec3(1.) : mix(vec3(.42), vec3(.6), S(.45, .6, pat));
  return vec4(fc, d);
}
void main(){
  vec2 uv0 = gl_FragCoord.xy / uBuf; asp = uRes.x / uRes.y;
  vec2 qc = vec2((uv0.x - .5) * asp, uv0.y);
  float t = uTime;
  vec3 rp = ripples(qc, t, 9., 0.) + ripples(qc, t * 1.1, 15., 7.) * .6;
  vec2 dq = qc + rp.xy * .012;
  float n = fbm(dq * 4. + vec2(t * .03, 0.));
  vec3 col = mix(vec3(.003), vec3(.022), n);
  float caust = pow(1. - abs(fbm(dq * 9. + t * .1) * 2. - 1.), 6.);
  col += vec3(.08) * caust * .4;
  for (int i = 0; i < 4; i++){
    vec4 k = koi(dq, t, float(i));
    col = mix(col, vec3(0.), S(.02, -.01, k.w + .004) * .35);
    col = mix(col, k.rgb * .8, S(.002, -.004, k.w) * .9);
  }
  for (int i = 0; i < ${MAX_PADS}; i++){
    if (i >= uPadN) break;
    float fi = float(i);
    vec2 pc = uPads[i] + vec2(sin(t * .8 + fi * 1.7), cos(t * .6 + fi * 2.3)) * .0025;
    vec2 d = qc - pc;
    float a = atan(d.y, d.x) - h11(fi + 3.) * 6.28;
    float pad = length(d) - uPadR;
    float notch = step(abs(mod(a, 6.2832) - .28), .28);
    if (pad < 0. && notch < .5){
      col = vec3(.26) * (.85 + .3 * fbm(d * 60.)) + vec3(.5) * S(-.014, 0., pad);
    }
  }
  col += vec3(.5) * rp.z * .18;
  vec2 vv = uv0 - .5; col *= 1. - dot(vv, vv) * .9;
  o = vec4(tone(col * 1.6), 1.);
}`;

const ASCII = `#version 300 es
precision highp float;
uniform sampler2D uScene, uAtlas;
uniform vec2 uCell, uGrid;
uniform float uN;
out vec4 o;
void main(){
  vec2 cell = floor(gl_FragCoord.xy / uCell), lp = fract(gl_FragCoord.xy / uCell);
  vec3 c = texture(uScene, (cell + .5) / uGrid).rgb;
  float l = dot(c, vec3(.299, .587, .114));
  vec3 p3 = fract(vec3(cell.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33);
  float g = clamp(pow(l, .7) * 1.1 + (fract((p3.x + p3.y) * p3.z) - .5) * .08, 0., .999);
  float idx = floor(g * uN);
  float m = texture(uAtlas, vec2((idx + lp.x) / uN, 1. - lp.y)).r;
  o = vec4(vec3(.3 + 1.1 * g) * m, 1.);
}`;

// Lily pads along the strokes of "404", in scene space: x ∈ [-asp/2, asp/2], y ∈ [0,1] (up).
const DIGIT_4: [number, number][][] = [
  [[0, 0], [0, 0.85]],
  [[0, 0.85], [1, 0.85]],
  [[0.7, 0], [0.7, 1.5]],
];
function padLayout(asp: number) {
  const narrow = asp < 0.9;
  const d = Math.min(((narrow ? 0.88 : 0.72) * asp) / 3.7, 0.64 / 1.5);
  const r = d * 0.17;
  const totalW = 3.7 * d;
  const left = -totalW / 2;
  const top = 0.52 + (1.5 * d) / 2;
  const pads: number[] = [];
  const push = (x: number, y: number) => {
    for (let i = 0; i < pads.length; i += 2) if (Math.hypot(pads[i] - x, pads[i + 1] - y) < r * 1.4) return;
    if (pads.length < MAX_PADS * 2) pads.push(x, y);
  };
  const four = (ox: number) => {
    for (const [[x0, y0], [x1, y1]] of DIGIT_4) {
      const n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / 0.32));
      for (let k = 0; k <= n; k++) {
        const t = k / n;
        push(ox + (x0 + (x1 - x0) * t) * d, top - (y0 + (y1 - y0) * t) * d);
      }
    }
  };
  const zero = (ox: number) => {
    for (let k = 0; k < 11; k++) {
      const a = (k / 11) * Math.PI * 2;
      push(ox + (0.5 + 0.5 * Math.cos(a)) * d, top - (0.75 + 0.75 * Math.sin(a)) * d);
    }
  };
  four(left);
  zero(left + 1.35 * d);
  four(left + 2.7 * d);
  return { pads: new Float32Array(pads), n: pads.length / 2, r };
}

function startPond(cv: HTMLCanvasElement, still: boolean): (() => void) | null {
  const gl = cv.getContext('webgl2', { antialias: false, alpha: false });
  if (!gl) return null;

  const program = (fs: string) => {
    const p = gl.createProgram()!;
    for (const [type, src] of [[gl.VERTEX_SHADER, VERT], [gl.FRAGMENT_SHADER, fs]] as const) {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader');
      gl.attachShader(p, s);
    }
    gl.bindAttribLocation(p, 0, 'a'); gl.linkProgram(p);
    const u = (name: string) => gl.getUniformLocation(p, name);
    return { p, u };
  };
  const sceneP = program(SCENE), asciiP = program(ASCII);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const texture = (filter: number) => {
    const t = gl.createTexture()!; gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  };
  const sceneTex = texture(gl.LINEAR), atlasTex = texture(gl.NEAREST);
  const fbo = gl.createFramebuffer();
  let cellW = 1, cellH = 1, cols = 1, rows = 1, N = 1, fontPx = 10;
  let pads = padLayout(1);
  let fishScale = 1;

  const buildAtlas = () => {
    const font = `500 ${fontPx}px ${FONT}`;
    const c = document.createElement('canvas'), x = c.getContext('2d', { willReadFrequently: true })!;
    c.width = cellW; c.height = cellH;
    const cov: [string, number][] = [];
    for (const ch of RAMP) {
      x.clearRect(0, 0, cellW, cellH); x.font = font; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#fff';
      x.fillText(ch, cellW / 2, cellH / 2);
      const d = x.getImageData(0, 0, cellW, cellH).data; let s = 0;
      for (let i = 3; i < d.length; i += 4) s += d[i];
      cov.push([ch, ch === ' ' ? -1 : s]);
    }
    cov.sort((p, q) => p[1] - q[1]);
    const want = 16, max = cov[cov.length - 1][1], picked = [' '];
    for (let k = 1; k < want; k++) {
      const target = (k / (want - 1)) * max; let best: string | null = null, bd = Infinity;
      for (const [ch, s] of cov) if (!picked.includes(ch) && Math.abs(s - target) < bd) { bd = Math.abs(s - target); best = ch; }
      if (best !== null) picked.push(best);
    }
    const covOf = Object.fromEntries(cov);
    picked.sort((p, q) => covOf[p] - covOf[q]);
    N = picked.length;
    const a = document.createElement('canvas'); a.width = cellW * N; a.height = cellH;
    const ax = a.getContext('2d')!;
    ax.fillStyle = '#000'; ax.fillRect(0, 0, a.width, a.height);
    ax.font = font; ax.textAlign = 'center'; ax.textBaseline = 'middle'; ax.fillStyle = '#fff';
    picked.forEach((ch, i) => ax.fillText(ch, i * cellW + cellW / 2, cellH / 2));
    gl.bindTexture(gl.TEXTURE_2D, atlasTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, a);
  };

  const layout = () => {
    const W = window.innerWidth, H = window.innerHeight;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    fontPx = Math.round(Math.max(5, Math.min(13, Math.min(W / 130, H / 55))) * dpr);
    const m = document.createElement('canvas').getContext('2d')!; m.font = `500 ${fontPx}px ${FONT}`;
    cellW = Math.round(m.measureText('M').width); cellH = Math.round(fontPx * 1.18);
    cv.width = Math.floor(W * dpr); cv.height = Math.floor(H * dpr);
    cols = Math.ceil(cv.width / cellW); rows = Math.ceil(cv.height / cellH);
    gl.bindTexture(gl.TEXTURE_2D, sceneTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, cols * 2, rows * 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, sceneTex, 0);
    buildAtlas();
    const asp = (cols * cellW) / (rows * cellH);
    pads = padLayout(asp);
    fishScale = asp < 0.9 ? 0.45 : 1;
  };

  const render = (t: number) => {
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.viewport(0, 0, cols * 2, rows * 2);
    gl.useProgram(sceneP.p);
    gl.uniform2f(sceneP.u('uBuf'), cols * 2, rows * 2);
    gl.uniform2f(sceneP.u('uRes'), cols * cellW, rows * cellH);
    gl.uniform1f(sceneP.u('uTime'), t);
    gl.uniform1f(sceneP.u('uRain'), RAIN);
    gl.uniform2fv(sceneP.u('uPads[0]'), pads.pads);
    gl.uniform1i(sceneP.u('uPadN'), pads.n);
    gl.uniform1f(sceneP.u('uPadR'), pads.r);
    gl.uniform1f(sceneP.u('uFish'), fishScale);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, cv.width, cv.height);
    gl.useProgram(asciiP.p);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, sceneTex); gl.uniform1i(asciiP.u('uScene'), 0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, atlasTex); gl.uniform1i(asciiP.u('uAtlas'), 1);
    gl.uniform2f(asciiP.u('uCell'), cellW, cellH);
    gl.uniform2f(asciiP.u('uGrid'), cols, rows);
    gl.uniform1f(asciiP.u('uN'), N);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  let raf = 0, last = 0;
  const frame = (now: number) => {
    if (!still) raf = requestAnimationFrame(frame);
    if (now - last < 33) return;
    last = now;
    render(20 + now / 1000);
  };
  let rt = 0;
  const onResize = () => { clearTimeout(rt); rt = window.setTimeout(() => { layout(); if (still) render(20); }, 150); };
  window.addEventListener('resize', onResize);
  layout();
  raf = requestAnimationFrame(frame);
  return () => {
    cancelAnimationFrame(raf); clearTimeout(rt);
    window.removeEventListener('resize', onResize);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  };
}

const NotFound = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [gl, setGl] = useState(true);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let stop: (() => void) | null = null;
    try { stop = startPond(cv, still); } catch { stop = null; }
    if (!stop) setGl(false);
    return () => stop?.();
  }, []);

  return (
    <div className="fixed inset-0 z-40 bg-black text-white">
      <canvas ref={ref} className="absolute inset-0 w-full h-full block" role="img"
        aria-label="404. An ASCII koi pond: lily pads spell 404 while koi swim beneath." />
      {!gl && (
        <p className="absolute inset-x-0 top-[40%] text-center font-mono text-5xl tracking-widest text-white/80 select-none">404</p>
      )}
      <div className="absolute inset-x-0 bottom-10 text-center font-mono text-sm text-white/70 row-in" style={{ '--row': 2 } as React.CSSProperties}>
        <p>this page swam away</p>
        <p className="mt-1">
          <TLink to="/" className="pressable text-white underline decoration-dashed underline-offset-4 hover:text-white/60 transition-colors duration-150 ease-out">
            back to shore
          </TLink>
        </p>
      </div>
    </div>
  );
};

export default NotFound;
