"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function GlassPlane() {
  const mat = useRef<any>(null);
  const mesh = useRef<THREE.Mesh>(null!);
  const { viewport } = useThree();

  useFrame(({ clock, mouse }) => {
    const t = clock.getElapsedTime();

    if (mat.current) {
      mat.current.uniforms.uTime.value = t;

      // mouse smoothing
      mat.current.uniforms.uMouse.value.lerp(
        new THREE.Vector2(mouse.x, mouse.y),
        0.08
      );
    }

    // subtle breathing motion
    if (mesh.current) {
      mesh.current.rotation.y = Math.sin(t * 0.2) * 0.05;
      mesh.current.rotation.x = Math.cos(t * 0.15) * 0.03;
    }
  });

  return (
    <mesh ref={mesh} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1, 64, 64]} />

      <shaderMaterial
        ref={mat}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2(0, 0) },
        }}
        vertexShader={`
          varying vec2 vUv;
          varying vec3 vPos;

          void main() {
            vUv = uv;
            vPos = position;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          precision highp float;

          uniform float uTime;
          uniform vec2 uMouse;

          varying vec2 vUv;
          varying vec3 vPos;

          float noise(vec2 p){
            return sin(p.x*10.0) * sin(p.y*10.0);
          }

          void main() {
            vec2 uv = vUv;

            // 🌊 distortion field
            float n = noise(uv * 8.0 + uTime * 0.6);

            vec2 distortion = vec2(
              sin(uv.y * 6.0 + uTime) * 0.02,
              cos(uv.x * 6.0 + uTime) * 0.02
            );

            uv += distortion * uMouse * 1.2;
            uv += n * 0.03;

            // 🌈 iridescent glass
            float fresnel = pow(1.0 - abs(vUv.y - 0.5), 3.0);

            vec3 base = vec3(1.0);

            vec3 blueShift = vec3(0.6, 0.85, 1.0);
            vec3 pinkShift = vec3(1.0, 0.75, 0.9);
            vec3 greenShift = vec3(0.7, 1.0, 0.85);

            vec3 color = mix(base, blueShift, fresnel);
            color = mix(color, pinkShift, sin(uTime * 0.8) * 0.3);
            color = mix(color, greenShift, cos(uTime * 0.6) * 0.2);

            // 💡 light scattering
            float glow = smoothstep(0.2, 1.0, fresnel);

            color += glow * 0.25;

            gl_FragColor = vec4(color, 0.10);
          }
        `}
      />
    </mesh>
  );
}

export default function GlassEffect() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 50,
        mixBlendMode: "screen",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5] }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
      >
        <GlassPlane />
      </Canvas>
    </div>
  );
}