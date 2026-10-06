'use client'

import { Suspense, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import { Classroom } from './Classroom'
import { ChibiCharacter } from './ChibiCharacter'
import type { BuddyLook } from '@/components/character/Buddy'

type Props = {
  teacherLook: BuddyLook
  studentLook: BuddyLook | null
  teacherTalking?: boolean
  teacherText?: string
  recording?: boolean
  className?: string
}

function CameraRig() {
  const { camera } = useThree()
  const reduced = useReducedMotion()
  const base = useRef(new THREE.Vector3(0, 3.0, 8.6))
  const target = useRef(new THREE.Vector3(0, 2.0, -0.6))
  const current = useRef(new THREE.Vector3(0, 2.0, -0.6))

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const px = reduced ? 0 : state.pointer.x
    const py = reduced ? 0 : state.pointer.y
    const drift = reduced ? 0 : 1

    // gentle drift + pointer parallax
    camera.position.x += (base.current.x + px * 0.55 + Math.sin(t * 0.25) * 0.15 * drift - camera.position.x) * 0.05
    camera.position.y += (base.current.y - py * 0.35 + Math.sin(t * 0.4) * 0.08 * drift - camera.position.y) * 0.05
    camera.position.z += (base.current.z - camera.position.z) * 0.05

    current.current.lerp(target.current, 0.08)
    camera.lookAt(current.current)
  })

  return null
}

export function ClassroomScene({
  teacherLook,
  studentLook,
  teacherTalking = false,
  teacherText = '',
  recording = false,
  className,
}: Props) {
  return (
    <Canvas
      className={className}
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 3.0, 8.6], fov: 42, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: false }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.02
        gl.outputColorSpace = THREE.SRGBColorSpace
      }}
    >
      <color attach="background" args={['#f2ebe0']} />
      <fog attach="fog" args={['#f2ebe0', 15, 30]} />

      <CameraRig />

      {/* Lighting — soft key through the window + warm fill */}
      <ambientLight intensity={0.5} color="#fff4e6" />
      <hemisphereLight args={['#dfe9ff', '#f0dcc0', 0.5]} />
      <directionalLight
        position={[-8, 8, 5]}
        intensity={2.4}
        color="#fff2d8"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
        shadow-bias={-0.0005}
      />

      <Suspense fallback={null}>
        <Environment resolution={256} frames={1}>
          <Lightformer intensity={2.2} position={[0, 6, -6]} scale={[12, 6, 1]} color="#ffffff" />
          <Lightformer intensity={1.4} position={[-6, 3, 2]} scale={[6, 8, 1]} rotation={[0, Math.PI / 2, 0]} color="#ffe9c8" />
          <Lightformer intensity={1.0} position={[6, 3, 2]} scale={[6, 8, 1]} rotation={[0, -Math.PI / 2, 0]} color="#dbe6ff" />
          <Lightformer intensity={0.8} position={[0, -4, 0]} scale={[10, 10, 1]} rotation={[Math.PI / 2, 0, 0]} color="#f6e9d8" />
        </Environment>
      </Suspense>

      <Classroom />

      {/* Teacher */}
      <ChibiCharacter
        look={teacherLook}
        position={[-1.5, 0, -0.75]}
        rotation={[0, 0.28, 0]}
        scale={1.05}
        talking={teacherTalking}
        text={teacherText}
        mode={teacherTalking ? 'tts' : 'idle'}
        expression="happy"
      />

      {/* Student */}
      {studentLook && (
        <ChibiCharacter
          look={studentLook}
          position={[1.65, 0, 0.55]}
          rotation={[0, -0.22, 0]}
          scale={0.98}
          talking={recording}
          mode={recording ? 'mic' : 'idle'}
          expression={recording ? 'wow' : 'happy'}
        />
      )}

      <ContactShadows position={[0, 0.03, 0]} opacity={0.35} scale={16} blur={2.4} far={6} resolution={512} color="#4a3b2a" />
    </Canvas>
  )
}
