'use client'

import { Suspense } from 'react'
import { ContactShadows, Environment, Lightformer } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useReducedMotion } from 'framer-motion'
import * as THREE from 'three'
import { ChibiCharacter } from './ChibiCharacter'
import type { BuddyLook } from '@/components/character/Buddy'

type CastMember = {
  look: BuddyLook
  position: [number, number, number]
  rotation: number
  scale: number
  expression: 'happy' | 'think' | 'wow'
}

const CAST: CastMember[] = [
  { look: { skin: '#F1C9A5', hair: '#9FB0F0', hairStyle: 'bun', outfit: '#E8856A', cheeks: '#F4A8C0' }, position: [-1.05, 0, 0.15], rotation: 0.3, scale: 1.08, expression: 'happy' },
  { look: { skin: '#F1C9A5', hair: '#F4A8C0', hairStyle: 'bun', outfit: '#C8B0E8', cheeks: '#F4A8C0' }, position: [0.25, 0, 0.55], rotation: -0.08, scale: 1.22, expression: 'wow' },
  { look: { skin: '#E8B88A', hair: '#F4C06A', hairStyle: 'buzz', outfit: '#7BC8A4' }, position: [1.35, 0, 0.05], rotation: -0.34, scale: 0.98, expression: 'happy' },
]

export function HeroCluster({ className }: { className?: string }) {
  const reduced = useReducedMotion()

  return (
    <Canvas
      className={className}
      dpr={[1, 2]}
      camera={{ position: [0, 1.35, 5.6], fov: 40, near: 0.1, far: 40 }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.05
        gl.outputColorSpace = THREE.SRGBColorSpace
      }}
    >
      <ambientLight intensity={0.55} color="#fff6ea" />
      <hemisphereLight args={['#e6eeff', '#f4e6cf', 0.55]} />
      <directionalLight position={[-6, 7, 5]} intensity={2.2} color="#fff2d8" />
      <directionalLight position={[6, 4, 3]} intensity={0.8} color="#dbe6ff" />

      <Suspense fallback={null}>
        <Environment resolution={256} frames={1}>
          <Lightformer intensity={2.2} position={[0, 6, -6]} scale={[12, 6, 1]} color="#ffffff" />
          <Lightformer intensity={1.3} position={[-6, 3, 2]} scale={[6, 8, 1]} rotation={[0, Math.PI / 2, 0]} color="#ffe9c8" />
          <Lightformer intensity={1.0} position={[6, 3, 2]} scale={[6, 8, 1]} rotation={[0, -Math.PI / 2, 0]} color="#e2eaff" />
        </Environment>
      </Suspense>

      {/* podium */}
      <mesh position={[0, -0.19, 0]}>
        <cylinderGeometry args={[2.35, 2.35, 0.38, 56]} />
        <meshStandardMaterial color="#fffdf7" roughness={0.92} />
      </mesh>

      {CAST.map((member, i) => (
        <ChibiCharacter
          key={i}
          look={member.look}
          position={member.position}
          rotation={[0, member.rotation, 0]}
          scale={member.scale}
          expression={member.expression}
          lookAtPointer={!reduced}
        />
      ))}

      <ContactShadows position={[0, 0.02, 0]} opacity={0.32} scale={9} blur={2.6} far={5} resolution={512} color="#4a3b2a" />
    </Canvas>
  )
}