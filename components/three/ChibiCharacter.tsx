'use client'

import { useMemo, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, Outlines } from '@react-three/drei'
import * as THREE from 'three'
import { P } from './palette'
import type { BuddyLook } from '@/components/character/Buddy'
import {
  VISEME_PARAMS,
  blendMouth,
  textToVisemeSequence,
  type MouthParams,
  type Viseme,
} from '@/lib/phonetics/visemes'
import { talkLevel } from '@/lib/audio/talkLevel'

const INK = P.ink

type Props = {
  look: BuddyLook
  talking?: boolean
  text?: string
  /** 'tts' follows a text viseme timeline, 'mic' follows live amplitude, 'idle' rests */
  mode?: 'tts' | 'mic' | 'idle'
  expression?: 'happy' | 'think' | 'wow'
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
  /** follow the mouse with the head */
  lookAtPointer?: boolean
}

/* ------------------------------------------------------------------ */
/* Hair                                                                */
/* ------------------------------------------------------------------ */

function Hair({ style, color }: { style: BuddyLook['hairStyle']; color: string }) {
  const mat = <meshStandardMaterial color={color} roughness={0.78} />
  switch (style) {
    case 'bun':
      return (
        <group>
          <mesh position={[0, 0.52, -0.06]} castShadow>
            <sphereGeometry args={[0.21, 24, 24]} />
            {mat}
            <Outlines thickness={0.02} color={INK} />
          </mesh>
          <mesh position={[0, 0.24, -0.02]} castShadow>
            <sphereGeometry args={[0.5, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
            {mat}
            <Outlines thickness={0.02} color={INK} />
          </mesh>
        </group>
      )
    case 'buzz':
      return (
        <mesh position={[0, 0.18, -0.02]} castShadow>
          <sphereGeometry args={[0.48, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          {mat}
          <Outlines thickness={0.02} color={INK} />
        </mesh>
      )
    case 'swoop':
      return (
        <>
          <mesh position={[0.05, 0.24, -0.02]} rotation={[0, 0, -0.22]} castShadow>
            <sphereGeometry args={[0.49, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
            {mat}
            <Outlines thickness={0.02} color={INK} />
          </mesh>
          <mesh position={[-0.34, 0.06, 0.18]} rotation={[0, 0, 0.5]} castShadow>
            <sphereGeometry args={[0.2, 18, 18, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
            {mat}
          </mesh>
        </>
      )
    case 'curly':
      return (
        <group>
          {[
            [-0.34, 0.22, 0.06, 0.2],
            [0.34, 0.22, 0.06, 0.2],
            [0, 0.36, 0.2, 0.21],
            [-0.26, 0.34, -0.24, 0.2],
            [0.26, 0.34, -0.24, 0.2],
            [0, 0.34, -0.32, 0.2],
            [-0.16, 0.46, -0.02, 0.18],
            [0.16, 0.46, -0.02, 0.18],
          ].map((s, i) => (
            <mesh key={i} position={[s[0], s[1], s[2]]} castShadow>
              <sphereGeometry args={[s[3], 20, 20]} />
              {mat}
              <Outlines thickness={0.018} color={INK} />
            </mesh>
          ))}
        </group>
      )
    case 'puff':
    default:
      return (
        <mesh position={[0, 0.2, -0.02]} castShadow>
          <sphereGeometry args={[0.52, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
          {mat}
          <Outlines thickness={0.02} color={INK} />
        </mesh>
      )
  }
}

/* ------------------------------------------------------------------ */
/* Character                                                           */
/* ------------------------------------------------------------------ */

export function ChibiCharacter({
  look,
  talking = false,
  text = '',
  mode = 'idle',
  expression = 'happy',
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  lookAtPointer = true,
}: Props) {
  const group = useRef<THREE.Group>(null)
  const torso = useRef<THREE.Group>(null)
  const head = useRef<THREE.Group>(null)
  const mouth = useRef<THREE.Mesh>(null)
  const tongue = useRef<THREE.Mesh>(null)
  const eyeL = useRef<THREE.Group>(null)
  const eyeR = useRef<THREE.Group>(null)
  const browL = useRef<THREE.Mesh>(null)
  const browR = useRef<THREE.Mesh>(null)
  const armL = useRef<THREE.Group>(null)
  const armR = useRef<THREE.Group>(null)

  const visemes = useMemo<Viseme[]>(() => textToVisemeSequence(text || 'hello'), [text])
  const current = useRef<MouthParams>({ ...VISEME_PARAMS.X })
  const blink = useRef({ t: 1.2 + Math.random() * 2.5 })
  const reduced = useReducedMotion()

  const eyeScale = expression === 'wow' ? 0.078 : expression === 'think' ? 0.05 : 0.062

  useFrame((state, delta) => {
    const d = Math.min(delta, 0.05)
    const t = state.clock.elapsedTime

    // ---- idle bob + sway ----
    if (group.current && !reduced) {
      group.current.position.y = position[1] + Math.sin(t * 1.6) * 0.022
      group.current.rotation.z = Math.sin(t * 1.1) * 0.012
    }
    // ---- breathing ----
    if (torso.current) {
      const b = reduced ? 1 : 1 + Math.sin(t * 1.5) * 0.012
      torso.current.scale.y = b
    }
    // ---- arms sway (+ gesturing while talking) ----
    if (armL.current) {
      const base = -0.16
      const talk = talking && !reduced ? Math.sin(t * 7) * 0.12 : 0
      armL.current.rotation.z = base - (reduced ? 0 : Math.sin(t * 1.3) * 0.03) - talk
    }
    if (armR.current) {
      const base = 0.16
      const talk = talking && !reduced ? Math.sin(t * 7 + 1.5) * 0.12 : 0
      armR.current.rotation.z = base + (reduced ? 0 : Math.sin(t * 1.3) * 0.03) + talk
    }

    // ---- head follows pointer ----
    if (head.current) {
      const target = lookAtPointer && !reduced
        ? { x: state.pointer.x * 0.26, y: state.pointer.y * 0.16 }
        : { x: 0, y: 0 }
      head.current.rotation.y += (target.x - head.current.rotation.y) * 0.06
      head.current.rotation.x += (-target.y - head.current.rotation.x) * 0.06
      head.current.rotation.z += (Math.sin(t * 0.8) * 0.025 - head.current.rotation.z) * 0.05
    }

    // ---- mouth (visemes) ----
    let targetViseme: Viseme = 'X'
    let amp = 0
    if (mode === 'tts' && talking) {
      const idx = Math.floor(t * 9) % visemes.length
      targetViseme = visemes[idx]
      amp = 0.45 + 0.55 * Math.abs(Math.sin(t * 11))
    } else if (mode === 'mic') {
      targetViseme = 'C'
      amp = talkLevel.value
    } else if (mode === 'idle' && talking) {
      targetViseme = 'C'
      amp = 0.4 + 0.4 * Math.abs(Math.sin(t * 8))
    }
    const base = VISEME_PARAMS[targetViseme]
    const target: MouthParams = { ...base, open: Math.min(1, base.open * (0.45 + amp * 0.85)) }
    current.current = blendMouth(current.current, target, 0.35)

    if (mouth.current) {
      const m = current.current
      mouth.current.scale.x = 0.5 + m.wide * 0.7 + m.round * 0.05
      mouth.current.scale.y = 0.08 + m.open * 1.4
      mouth.current.scale.z = 1
      mouth.current.position.y = -0.2 - m.open * 0.03
      const mat = mouth.current.material as THREE.MeshStandardMaterial
      mat.color.set(m.teethOnLip > 0.5 ? '#5a2a2a' : INK)
    }
    if (tongue.current) {
      tongue.current.visible = current.current.tongue > 0.3
      tongue.current.scale.y = 0.4 + current.current.tongue
    }

    // ---- brows (think / wow expressions) ----
    const browY = expression === 'think' ? 0.2 : 0.18
    if (browL.current) browL.current.position.y = browY + (talking ? Math.sin(t * 8) * 0.006 : 0)
    if (browR.current) browR.current.position.y = browY + (talking ? Math.sin(t * 8 + 0.4) * 0.006 : 0)

    // ---- blink ----
    blink.current.t -= d
    if (blink.current.t <= 0) {
      const s = Math.abs(Math.sin((1 - blink.current.t / 0.14) * Math.PI))
      const open = Math.max(0.06, 1 - s)
      if (eyeL.current) eyeL.current.scale.set(eyeScale, eyeScale * open, eyeScale)
      if (eyeR.current) eyeR.current.scale.set(eyeScale, eyeScale * open, eyeScale)
      if (blink.current.t < -0.14) {
        if (eyeL.current) eyeL.current.scale.setScalar(eyeScale)
        if (eyeR.current) eyeR.current.scale.setScalar(eyeScale)
        blink.current = { t: 1.5 + Math.random() * 3.5 }
      }
    }
  })

  const skin = look.skin
  const outfit = look.outfit

  return (
    <group ref={group} position={position} rotation={rotation} scale={scale}>
      {/* ---- Legs ---- */}
      {([-0.17, 0.17] as const).map((x, i) => (
        <group key={i} position={[x, 0.66, 0]}>
          <RoundedBox args={[0.19, 0.58, 0.21]} radius={0.095} smoothness={4} position={[0, -0.29, 0]} castShadow>
            <meshStandardMaterial color={i === 0 ? P.grapeSoft : P.skySoft} roughness={0.85} />
            <Outlines thickness={0.02} color={INK} />
          </RoundedBox>
          {/* shoe */}
          <RoundedBox args={[0.23, 0.13, 0.36]} radius={0.06} smoothness={4} position={[0, -0.6, 0.06]} castShadow>
            <meshStandardMaterial color={INK} roughness={0.5} />
            <Outlines thickness={0.018} color={INK} />
          </RoundedBox>
        </group>
      ))}

      {/* ---- Pelvis ---- */}
      <RoundedBox args={[0.5, 0.24, 0.32]} radius={0.11} smoothness={4} position={[0, 0.7, 0]} castShadow>
        <meshStandardMaterial color={outfit} roughness={0.85} />
        <Outlines thickness={0.02} color={INK} />
      </RoundedBox>

      {/* ---- Torso (+ arms) ---- */}
      <group ref={torso} position={[0, 1.0, 0]}>
        <RoundedBox args={[0.58, 0.54, 0.34]} radius={0.16} smoothness={5} castShadow>
          <meshStandardMaterial color={outfit} roughness={0.85} />
          <Outlines thickness={0.022} color={INK} />
        </RoundedBox>
        {/* collar */}
        <mesh position={[0, 0.24, 0.14]} rotation={[0.45, 0, 0]}>
          <torusGeometry args={[0.17, 0.035, 12, 24, Math.PI]} />
          <meshStandardMaterial color={INK} roughness={0.9} />
        </mesh>

        {([-1, 1] as const).map((side) => (
          <group
            key={side}
            ref={side === -1 ? armL : armR}
            position={[side * 0.35, 0.16, 0]}
          >
            <RoundedBox args={[0.14, 0.46, 0.16]} radius={0.07} smoothness={4} position={[0, -0.23, 0]} castShadow>
              <meshStandardMaterial color={outfit} roughness={0.85} />
              <Outlines thickness={0.018} color={INK} />
            </RoundedBox>
            {/* hand */}
            <mesh position={[0, -0.5, 0]} castShadow>
              <sphereGeometry args={[0.09, 18, 18]} />
              <meshStandardMaterial color={skin} roughness={0.85} />
              <Outlines thickness={0.016} color={INK} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ---- Neck ---- */}
      <mesh position={[0, 1.31, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.11, 0.16, 16]} />
        <meshStandardMaterial color={skin} roughness={0.85} />
      </mesh>

      {/* ---- Head ---- */}
      <group ref={head} position={[0, 1.74, 0]}>
        <RoundedBox args={[0.9, 0.86, 0.86]} radius={0.36} smoothness={6} position={[0, 0.06, 0]} castShadow>
          <meshStandardMaterial color={skin} roughness={0.85} />
          <Outlines thickness={0.024} color={INK} />
        </RoundedBox>

        {/* ears */}
        {([-1, 1] as const).map((side) => (
          <mesh key={side} position={[side * 0.46, 0.04, 0]} scale={[0.5, 1, 0.6]} castShadow>
            <sphereGeometry args={[0.11, 16, 16]} />
            <meshStandardMaterial color={skin} roughness={0.85} />
          </mesh>
        ))}

        <Hair style={look.hairStyle} color={look.hair} />

        {/* eyes (group: ball + glint, blink together) */}
        {([-1, 1] as const).map((side) => (
          <group
            key={side}
            ref={side === -1 ? eyeL : eyeR}
            position={[side * 0.19, 0.08, 0.45]}
            scale={eyeScale}
          >
            <mesh>
              <sphereGeometry args={[1, 24, 24]} />
              <meshStandardMaterial color={INK} roughness={0.28} />
            </mesh>
            <mesh position={[side * 0.33, 0.34, 0.84]} scale={0.26}>
              <sphereGeometry args={[1, 12, 12]} />
              <meshBasicMaterial color="#ffffff" toneMapped={false} />
            </mesh>
          </group>
        ))}

        {/* brows */}
        {([-1, 1] as const).map((side) => (
          <mesh
            key={side}
            ref={side === -1 ? browL : browR}
            position={[side * 0.2, 0.18, 0.45]}
            rotation={[0, 0, side * (expression === 'wow' ? -0.15 : 0.12)]}
          >
            <boxGeometry args={[0.17, 0.035, 0.05]} />
            <meshStandardMaterial color={look.hair} roughness={0.8} />
          </mesh>
        ))}

        {/* nose */}
        <mesh position={[0, -0.05, 0.48]} scale={[0.6, 0.7, 0.8]}>
          <sphereGeometry args={[0.06, 14, 14]} />
          <meshStandardMaterial color={skin} roughness={0.85} />
        </mesh>

        {/* cheeks */}
        {look.cheeks && ([-1, 1] as const).map((side) => (
          <mesh key={side} position={[side * 0.31, -0.1, 0.4]} scale={[0.08, 0.05, 0.02]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial color={look.cheeks} roughness={0.9} transparent opacity={0.8} />
          </mesh>
        ))}

        {/* mouth (viseme-driven) */}
        <mesh ref={mouth} position={[0, -0.2, 0.45]} scale={[0.8, 0.3, 1]}>
          <circleGeometry args={[0.12, 24]} />
          <meshStandardMaterial color={INK} roughness={0.5} side={THREE.DoubleSide} />
        </mesh>
        <mesh ref={tongue} position={[0, -0.24, 0.46]} scale={[0.06, 0.5, 0.04]} visible={false}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshStandardMaterial color={P.bubblegum} roughness={0.7} />
        </mesh>
      </group>
    </group>
  )
}
