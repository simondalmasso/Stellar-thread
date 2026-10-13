import { Canvas, useFrame } from '@react-three/fiber';
import { Line, OrbitControls, Stars, Text } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { Target } from '../lib/targets';

function Wavefront({ radius }: { radius: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.y += delta * 0.08; });
  return (
    <mesh ref={ref} scale={Math.max(0.15, radius)}>
      <sphereGeometry args={[1, 36, 24]} />
      <meshBasicMaterial color="#6ee7ff" wireframe transparent opacity={0.13} />
    </mesh>
  );
}

function Scene({ target, waveRadius }: { target: Target; waveRadius: number }) {
  const targetPosition = useMemo<[number, number, number]>(() => {
    const ra = target.raDeg * Math.PI / 180;
    const dec = target.decDeg * Math.PI / 180;
    const r = 4.5;
    return [r * Math.cos(dec) * Math.cos(ra), r * Math.sin(dec), r * Math.cos(dec) * Math.sin(ra)];
  }, [target]);
  return <>
    <ambientLight intensity={0.8} />
    <Stars radius={80} depth={50} count={2800} factor={3} saturation={0.2} fade speed={0.25} />
    <mesh><sphereGeometry args={[0.17, 24, 24]} /><meshBasicMaterial color="#64f5c2" /></mesh>
    <Wavefront radius={waveRadius} />
    <Line points={[[0, 0, 0], targetPosition]} color="#6ee7ff" transparent opacity={0.55} lineWidth={1} />
    <mesh position={targetPosition}>
      <sphereGeometry args={[0.11, 20, 20]} />
      <meshBasicMaterial color="#ffd166" />
    </mesh>
    <Text position={[targetPosition[0], targetPosition[1] + .35, targetPosition[2]]} fontSize={0.18} color="#f4f7fb" anchorX="center">{target.displayName}</Text>
    <OrbitControls enablePan={false} minDistance={4} maxDistance={11} autoRotate autoRotateSpeed={0.22} />
  </>;
}

export function Starfield({ target, waveRadius, reducedMotion }: { target: Target; waveRadius: number; reducedMotion: boolean }) {
  const hasWebGl = useMemo(() => {
    try { const canvas = document.createElement('canvas'); return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl')); } catch { return false; }
  }, []);
  if (!hasWebGl) return <div className="starfield no-webgl" role="img" aria-label={`Mapa estelar alternativo para ${target.displayName}`}><div><b>WEBGL UNAVAILABLE</b><span>EARTH → {target.displayName}</span><span>RA {target.raDeg.toFixed(4)}° · DEC {target.decDeg.toFixed(4)}°</span><span>{target.distanceLightYears.toFixed(2)} light-years</span></div></div>;
  return <div className="starfield" aria-label={`Mapa estelar 3D apuntando a ${target.displayName}`}>
    <Canvas camera={{ position: [0, 1.2, 7], fov: 45 }} dpr={[1, 1.5]} frameloop={reducedMotion ? 'demand' : 'always'}>
      <Scene target={target} waveRadius={waveRadius} />
    </Canvas>
    <div className="scene-legend"><span>EARTH</span><span>WAVEFRONT — DERIVED</span><span>{target.distanceLightYears.toFixed(2)} ly</span></div>
  </div>;
}
