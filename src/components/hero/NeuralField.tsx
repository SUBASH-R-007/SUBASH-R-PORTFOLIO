"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { buildLinks, buildShape, mulberry32, SHAPES } from "./shapes";

const PALETTE = {
  dark: { a: "#22d3ee", b: "#8b5cf6", od: "#a3e635", blending: THREE.AdditiveBlending, lineOpacity: 0.22, size: 1 },
  light: { a: "#0e7490", b: "#6d28d9", od: "#4d7c0f", blending: THREE.NormalBlending, lineOpacity: 0.28, size: 1.25 },
};

const vertex = /* glsl */ `
  attribute float aRand;
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  varying float vRand;
  varying float vDepth;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float twinkle = 0.75 + 0.25 * sin(uTime * (1.2 + aRand * 2.0) + aRand * 40.0);
    gl_PointSize = uSize * (0.55 + aRand * 0.9) * twinkle * uPixelRatio * (7.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
    vRand = aRand;
    vDepth = clamp((-mv.z - 3.0) / 6.0, 0.0, 1.0);
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uAlpha;
  varying float vRand;
  varying float vDepth;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    a *= a;
    vec3 col = mix(uColorA, uColorB, smoothstep(0.25, 0.95, vRand));
    gl_FragColor = vec4(col, a * uAlpha * (1.0 - vDepth * 0.55));
  }
`;

/** Owns all mutable GPU data so React never tracks it. */
class Field {
  readonly n: number;
  readonly targets: Float32Array[];
  readonly links: Uint16Array[];
  readonly speeds: Float32Array;
  readonly points: THREE.Points;
  readonly lines: THREE.LineSegments;
  readonly pointMat: THREE.ShaderMaterial;
  readonly lineMat: THREE.LineBasicMaterial;
  private cur: Float32Array;
  private linePos: Float32Array;
  private shape = 0;
  private lineFade = 1;
  private readonly nodes: number;
  private readonly maxLinks: number;

  constructor(n: number, theme: "dark" | "light") {
    this.n = n;
    this.nodes = Math.min(520, Math.floor(n * 0.14));
    const rand = mulberry32(42);
    this.targets = SHAPES.map((s) => buildShape(s, n));
    this.links = this.targets.map((t) => buildLinks(t, this.nodes, 0.62, 2));
    this.maxLinks = Math.max(...this.links.map((l) => l.length / 2));
    this.cur = this.targets[0].slice();
    this.speeds = new Float32Array(n);
    const aRand = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      this.speeds[i] = 1.4 + rand() * 2.2;
      aRand[i] = rand();
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(this.cur, 3).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute("aRand", new THREE.BufferAttribute(aRand, 1));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 4);
    const p = PALETTE[theme];
    this.pointMat = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthWrite: false,
      blending: p.blending,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: 2.2 * p.size },
        uPixelRatio: { value: 1 },
        uAlpha: { value: 1 },
        uColorA: { value: new THREE.Color(p.a) },
        uColorB: { value: new THREE.Color(p.b) },
      },
    });
    this.points = new THREE.Points(geo, this.pointMat);

    this.linePos = new Float32Array(this.maxLinks * 6);
    const lgeo = new THREE.BufferGeometry();
    lgeo.setAttribute("position", new THREE.BufferAttribute(this.linePos, 3).setUsage(THREE.DynamicDrawUsage));
    lgeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 4);
    this.lineMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(p.a),
      transparent: true,
      opacity: p.lineOpacity,
      blending: p.blending,
      depthWrite: false,
    });
    this.lines = new THREE.LineSegments(lgeo, this.lineMat);
    this.setTheme(theme, false);
  }

  setShape(i: number) {
    const next = ((i % SHAPES.length) + SHAPES.length) % SHAPES.length;
    if (next === this.shape) return;
    this.shape = next;
    this.lineFade = 0;
  }

  setTheme(theme: "dark" | "light", overdrive: boolean) {
    const p = PALETTE[theme];
    (this.pointMat.uniforms.uColorA.value as THREE.Color).set(overdrive ? p.od : p.a);
    (this.pointMat.uniforms.uColorB.value as THREE.Color).set(overdrive ? p.od : p.b);
    this.pointMat.blending = p.blending;
    this.pointMat.uniforms.uSize.value = 2.2 * p.size;
    this.lineMat.color.set(overdrive ? p.od : p.a);
    this.lineMat.blending = p.blending;
    this.lineMat.userData.base = p.lineOpacity;
  }

  update(dt: number, time: number, speed: number, pixelRatio: number) {
    const target = this.targets[this.shape];
    const cur = this.cur;
    const k = Math.min(1, dt * speed);
    for (let i = 0; i < this.n; i++) {
      const f = 1 - Math.exp(-k * this.speeds[i]);
      const j = i * 3;
      cur[j] += (target[j] - cur[j]) * f;
      cur[j + 1] += (target[j + 1] - cur[j + 1]) * f;
      cur[j + 2] += (target[j + 2] - cur[j + 2]) * f;
    }
    this.points.geometry.attributes.position.needsUpdate = true;

    const links = this.links[this.shape];
    const lp = this.linePos;
    for (let l = 0; l < links.length; l += 2) {
      const a = links[l] * 3;
      const b = links[l + 1] * 3;
      const o = l * 3;
      lp[o] = cur[a];
      lp[o + 1] = cur[a + 1];
      lp[o + 2] = cur[a + 2];
      lp[o + 3] = cur[b];
      lp[o + 4] = cur[b + 1];
      lp[o + 5] = cur[b + 2];
    }
    this.lines.geometry.setDrawRange(0, links.length);
    this.lines.geometry.attributes.position.needsUpdate = true;

    this.lineFade = Math.min(1, this.lineFade + dt * 0.6);
    const base = (this.lineMat.userData.base as number) ?? 0.2;
    this.lineMat.opacity = base * this.lineFade * this.lineFade;
    this.pointMat.uniforms.uTime.value = time;
    this.pointMat.uniforms.uPixelRatio.value = pixelRatio;
  }

  dispose() {
    this.points.geometry.dispose();
    this.lines.geometry.dispose();
    this.pointMat.dispose();
    this.lineMat.dispose();
  }
}

interface SceneProps {
  shape: number;
  count: number;
  theme: "dark" | "light";
  overdrive: boolean;
}

function Scene({ shape, count, theme, overdrive }: SceneProps) {
  const [field] = useState(() => new Field(count, theme));
  const spin = useRef<THREE.Group>(null);
  const tilt = useRef<THREE.Group>(null);

  useEffect(() => field.setShape(shape), [field, shape]);
  useEffect(() => field.setTheme(theme, overdrive), [field, theme, overdrive]);
  useEffect(() => () => field.dispose(), [field]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    field.update(dt, t, overdrive ? 4 : 1.15, state.viewport.dpr);
    if (spin.current) {
      spin.current.rotation.y += dt * (overdrive ? 1.6 : 0.09);
      const s = 1 + Math.sin(t * 0.8) * 0.035;
      spin.current.scale.setScalar(s);
    }
    if (tilt.current) {
      // Ease toward the cursor.
      const tx = state.pointer.y * -0.28;
      const ty = state.pointer.x * 0.45;
      tilt.current.rotation.x += (tx - tilt.current.rotation.x) * Math.min(1, dt * 2.5);
      tilt.current.rotation.y += (ty - tilt.current.rotation.y) * Math.min(1, dt * 2.5);
    }
  });

  return (
    <group ref={tilt}>
      <group ref={spin}>
        <primitive object={field.points} />
        <primitive object={field.lines} />
      </group>
    </group>
  );
}

export interface NeuralFieldProps {
  shape: number;
  theme: "dark" | "light";
  overdrive: boolean;
  /** Fewer points and no bloom. */
  lite: boolean;
  onReady?: () => void;
}

/** R3F particle network. Loaded client-side only, after first paint. */
export default function NeuralField({ shape, theme, overdrive, lite, onReady }: NeuralFieldProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    const onVis = () => setTabVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0">
      <Canvas
        frameloop={visible && tabVisible ? "always" : "never"}
        dpr={[1, lite ? 1.5 : 1.75]}
        camera={{ position: [0, 0, 5.1], fov: 45 }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        onCreated={() => onReady?.()}
        aria-hidden
      >
        <Scene shape={shape} count={lite ? 1800 : 4800} theme={theme} overdrive={overdrive} />
        {!lite && theme === "dark" ? (
          <EffectComposer multisampling={0}>
            <Bloom mipmapBlur luminanceThreshold={0.15} luminanceSmoothing={0.3} intensity={overdrive ? 1.1 : 0.55} radius={0.6} />
          </EffectComposer>
        ) : (
          <></>
        )}
      </Canvas>
    </div>
  );
}
