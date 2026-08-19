"use client";

import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { useMemo, useRef, useState } from "react";
import { cssVar, introState } from "@/lib/state";

const PARTICLE_COUNT_DESKTOP = 42000;
const PARTICLE_COUNT_MOBILE = 18000;

/* The flame column — GPU particles shaped, moved and colored entirely
   in the vertex/fragment shaders. Colors come from the CSS theme vars. */

const flameVertex = /* glsl */ `
  uniform float uTime;
  uniform float uScroll;
  uniform float uDim;
  uniform float uPixelRatio;

  varying float vHeat;
  varying float vAlpha;

  #define TAU 6.28318530718

  float hash(float n) { return fract(sin(n) * 43758.5453123); }

  void main() {
    vec3 seed = position; // each component in [0, 1)

    float speed = mix(0.035, 0.13, seed.z);
    float life = fract(seed.y + uTime * speed);

    float y = mix(-3.4, 5.4, life);

    // flame silhouette: wide base ring, pinch, soft bulge, taper to a point
    float r = 1.5 * smoothstep(0.0, 0.16, life)
            * (1.0 - 0.75 * smoothstep(0.12, 0.5, life));
    r += 0.5 * smoothstep(0.32, 0.58, life) * (1.0 - smoothstep(0.58, 0.95, life));
    r += 0.06;
    r *= (1.0 - 0.6 * life);

    float ang = seed.x * TAU + uTime * mix(0.06, 0.3, hash(seed.x * 7.0)) + life * 2.2;
    float rad = r * (0.3 + 0.7 * hash(seed.x * 91.7));
    vec3 p = vec3(cos(ang) * rad, y, sin(ang) * rad);

    // turbulent drift, stronger as embers rise
    float sway = 0.3 + life;
    p.x += sin(y * 1.6 + uTime * 1.2 + seed.z * TAU) * 0.17 * sway;
    p.z += cos(y * 1.3 + uTime * 0.9 + seed.x * TAU) * 0.17 * sway;

    // scroll: the formation disperses into drifting embers
    p.xz *= 1.0 + uScroll * 2.6;
    p.y += uScroll * 1.6 * (seed.z - 0.5);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    float fadeIn = smoothstep(0.0, 0.16, life);
    float fadeOut = 1.0 - smoothstep(0.7, 1.0, life);
    vHeat = 1.0 - life;
    vAlpha = fadeIn * fadeOut * (1.0 - uScroll * 0.82) * uDim;

    float size = mix(10.0, 26.0, hash(seed.y * 57.0));
    gl_PointSize = size * uPixelRatio * (6.0 / max(1.0, -mv.z));
  }
`;

const flameFragment = /* glsl */ `
  uniform vec3 uColorHot;
  uniform vec3 uColorEmber;
  uniform vec3 uColorDeep;

  varying float vHeat;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float core = pow(smoothstep(0.5, 0.0, d), 2.2);
    float a = core * vAlpha;
    if (a < 0.004) discard;

    vec3 col = mix(uColorDeep, uColorEmber, smoothstep(0.0, 0.55, vHeat));
    col = mix(col, uColorHot, smoothstep(0.55, 1.0, vHeat) * 0.9);

    gl_FragColor = vec4(col * (0.35 + 0.95 * vHeat), a);
  }
`;

function Flame({ count }: { count: number }) {
  const palette = useMemo(
    () => ({
      hot: new THREE.Color(cssVar("--flame")),
      ember: new THREE.Color(cssVar("--ember")),
      deep: new THREE.Color(cssVar("--crimson")),
    }),
    []
  );

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const seeds = new Float32Array(count * 3);
    for (let i = 0; i < seeds.length; i++) seeds[i] = Math.random();
    g.setAttribute("position", new THREE.BufferAttribute(seeds, 3));
    return g;
  }, [count]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uScroll: { value: 0 },
          uDim: { value: 1 },
          uPixelRatio: { value: 1 },
          uColorHot: { value: palette.hot },
          uColorEmber: { value: palette.ember },
          uColorDeep: { value: palette.deep },
        },
        vertexShader: flameVertex,
        fragmentShader: flameFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [palette]
  );

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uPixelRatio.value = state.gl.getPixelRatio();
    const target = Math.min(1, window.scrollY / (window.innerHeight * 1.35));
    material.uniforms.uScroll.value +=
      (target - material.uniforms.uScroll.value) * 0.06;

    // quietly recede as the visitor moves into the content-heavy sections
    const vh = window.innerHeight;
    const page =
      window.scrollY / Math.max(1, document.documentElement.scrollHeight - vh);
    const t = Math.min(1, Math.max(0, (page - 0.3) / 0.35));
    const dim = 1 - 0.68 * (t * t * (3 - 2 * t));
    material.uniforms.uDim.value +=
      (dim - material.uniforms.uDim.value) * 0.05;
  });

  return <points geometry={geometry} material={material} frustumCulled={false} />;
}

/* Soft additive glows — the candlelit floor and a faint crimson backdrop. */

const glowVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const glowFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec2 vUv;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float a = pow(max(0.0, 1.0 - d), 2.5) * uIntensity;
    gl_FragColor = vec4(uColor, a);
  }
`;

function Glow({
  position,
  scale,
  colorVar,
  intensity,
}: {
  position: [number, number, number];
  scale: [number, number];
  colorVar: string;
  intensity: number;
}) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color(cssVar(colorVar)) },
          uIntensity: { value: intensity },
        },
        vertexShader: glowVertex,
        fragmentShader: glowFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [colorVar, intensity]
  );

  return (
    <mesh position={position} scale={[scale[0], scale[1], 1]} material={material}>
      <planeGeometry args={[1, 1]} />
    </mesh>
  );
}

/* A faint vertical shaft of light behind the flame — cheap god ray. */

const shaftFragment = /* glsl */ `
  uniform vec3 uColor;
  varying vec2 vUv;
  #define PI 3.14159265359
  void main() {
    float vertical = smoothstep(0.0, 0.35, vUv.y) * (1.0 - smoothstep(0.65, 1.0, vUv.y));
    float horizontal = pow(sin(vUv.x * PI), 3.0);
    gl_FragColor = vec4(uColor, vertical * horizontal * 0.1);
  }
`;

function Shaft() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color(cssVar("--ember")) } },
        vertexShader: glowVertex,
        fragmentShader: shaftFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  return (
    <mesh position={[0, 1.6, -1.4]} scale={[3.6, 12, 1]} material={material}>
      <planeGeometry args={[1, 1]} />
    </mesh>
  );
}

/* Camera rig — intro dolly, mouse parallax, slow drift as the page scrolls. */

function Rig() {
  const { camera, pointer } = useThree();
  const look = useRef(new THREE.Vector3(0, 0.6, 0));

  useFrame((_, delta) => {
    const vh = window.innerHeight;
    const total = Math.max(1, document.documentElement.scrollHeight - vh);
    const page = window.scrollY / total;

    const d = Math.min(1, delta * 3);
    camera.position.x += (pointer.x * 0.8 - camera.position.x) * d;
    camera.position.y +=
      (0.4 + pointer.y * 0.35 - page * 1.6 - camera.position.y) * d;
    camera.position.z +=
      (introState.z - camera.position.z) * Math.min(1, delta * 2);
    camera.lookAt(look.current);
  });

  return null;
}

export default function EmberScene() {
  // lighter scene on phones: fewer particles, lower pixel ratio
  const [lite] = useState(
    () => typeof window !== "undefined" &&
      window.matchMedia("(max-width: 767px)").matches
  );
  const [dpr, setDpr] = useState(lite ? 1 : 1.5);

  return (
    <Canvas
      dpr={dpr}
      camera={{ fov: 50, near: 0.1, far: 60, position: [0, 0.4, 15] }}
      gl={{ antialias: false, powerPreference: "high-performance" }}
    >
      <PerformanceMonitor
        onIncline={() => setDpr(lite ? 1.25 : 1.75)}
        onDecline={() => setDpr(lite ? 0.85 : 1)}
      >
        <Rig />
        <Flame
          count={lite ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT_DESKTOP}
        />
        <Glow
          position={[0, -2.5, 0]}
          scale={[9, 4]}
          colorVar="--ember"
          intensity={0.4}
        />
        <Glow
          position={[0, 1.2, -3]}
          scale={[16, 11]}
          colorVar="--crimson"
          intensity={0.35}
        />
        <Shaft />
        <EffectComposer multisampling={0}>
          <Bloom
            mipmapBlur
            intensity={0.85}
            luminanceThreshold={0.22}
            luminanceSmoothing={0.3}
          />
          <Vignette eskil={false} offset={0.22} darkness={0.82} />
        </EffectComposer>
      </PerformanceMonitor>
    </Canvas>
  );
}
