'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, Outlines, Line } from '@react-three/drei'
import * as THREE from 'three'
import { P } from './palette'

const INK = P.ink

/* ----------------------------- small parts ----------------------------- */

function RBox({
  args,
  radius = 0.06,
  position,
  color,
  outline = 0.02,
  rotation,
  children,
}: {
  args: [number, number, number]
  radius?: number
  position?: [number, number, number]
  color: string
  outline?: number
  rotation?: [number, number, number]
  children?: React.ReactNode
}) {
  return (
    <RoundedBox args={args} radius={radius} smoothness={4} position={position} rotation={rotation} castShadow receiveShadow>
      <meshStandardMaterial color={color} roughness={0.85} />
      {outline > 0 && <Outlines thickness={outline} color={INK} />}
      {children}
    </RoundedBox>
  )
}

function ChalkMark({ x, y, w, h = 0.05, r = 0 }: { x: number; y: number; w: number; h?: number; r?: number }) {
  return (
    <mesh position={[x, y, -3.9]} rotation={[0, 0, r]}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial color={P.chalk} transparent opacity={0.75} />
    </mesh>
  )
}

/* ----------------------------- furniture ------------------------------- */

function Chair({ x, z, rot = 0, color = P.lemon }: { x: number; z: number; rot?: number; color?: string }) {
  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]}>
      <RBox args={[0.5, 0.09, 0.5]} radius={0.04} position={[0, 0.52, 0]} color={color} />
      <RBox args={[0.5, 0.55, 0.09]} radius={0.04} position={[0, 0.82, -0.2]} color={color} />
      {[
        [-0.2, -0.2],
        [0.2, -0.2],
        [-0.2, 0.2],
        [0.2, 0.2],
      ].map((l, i) => (
        <mesh key={i} position={[l[0], 0.26, l[1]]} castShadow>
          <boxGeometry args={[0.07, 0.52, 0.07]} />
          <meshStandardMaterial color={P.woodDark} roughness={0.85} />
          <Outlines thickness={0.012} color={INK} />
        </mesh>
      ))}
    </group>
  )
}

function Desk({ x = 0, z = 0, rot = 0 }: { x?: number; z?: number; rot?: number }) {
  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]}>
      <RBox args={[2.2, 0.13, 1.0]} radius={0.05} position={[0, 0.92, 0]} color={P.wood} />
      {/* under shelf */}
      <RBox args={[1.9, 0.07, 0.8]} radius={0.03} position={[0, 0.62, 0]} color={P.woodDark} />
      {/* modesty panel */}
      <RBox args={[2.0, 0.5, 0.07]} radius={0.03} position={[0, 0.68, -0.42]} color={P.woodDark} />
      {[
        [-0.95, -0.4],
        [0.95, -0.4],
        [-0.95, 0.4],
        [0.95, 0.4],
      ].map((l, i) => (
        <RBox key={i} args={[0.11, 0.9, 0.11]} radius={0.03} position={[l[0], 0.45, l[1]]} color={P.woodDark} outline={0.014} />
      ))}
    </group>
  )
}

function Globe() {
  return (
    <group position={[0, 1.05, 0]}>
      <mesh position={[0, 0.26, 0]}>
        <sphereGeometry args={[0.24, 24, 24]} />
        <meshStandardMaterial color={P.sky} roughness={0.5} />
        <Outlines thickness={0.015} color={INK} />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[0.4, 0, 0.2]}>
        <torusGeometry args={[0.3, 0.02, 10, 32]} />
        <meshStandardMaterial color={P.woodDark} roughness={0.7} />
      </mesh>
      <mesh position={[0, -0.06, 0]}>
        <cylinderGeometry args={[0.06, 0.1, 0.12, 14]} />
        <meshStandardMaterial color={P.woodDark} roughness={0.8} />
      </mesh>
    </group>
  )
}

function Book({ x, y, h, color, tilt = 0 }: { x: number; y: number; h: number; color: string; tilt?: number }) {
  return (
    <mesh position={[x, y + h / 2, 0]} rotation={[0, 0, tilt]} castShadow>
      <boxGeometry args={[0.09, h, 0.28]} />
      <meshStandardMaterial color={color} roughness={0.8} />
      <Outlines thickness={0.01} color={INK} />
    </mesh>
  )
}

function Bookshelf() {
  const shelfY = [0.12, 0.9, 1.68]
  const rows = [
    [P.bubblegum, P.sky, P.lemon, P.mint, P.grape],
    [P.peach, P.grape, P.mint, P.bubblegum, P.sky],
    [P.mint, P.lemon, P.sky, P.peach, P.grape],
  ]
  return (
    <group position={[-4.3, 0, -3.45]}>
      <RBox args={[1.9, 2.0, 0.5]} radius={0.04} position={[0, 1.0, 0]} color={P.wood} />
      {shelfY.map((y, i) => (
        <mesh key={i} position={[0, y, 0.06]}>
          <boxGeometry args={[1.8, 0.07, 0.42]} />
          <meshStandardMaterial color={P.woodDark} roughness={0.9} />
        </mesh>
      ))}
      {rows.map((row, ri) =>
        row.map((c, bi) => (
          <group key={`${ri}-${bi}`} position={[-0.72 + bi * 0.34, shelfY[ri], 0.02]}>
            <Book x={0} y={0} h={0.42 + ((ri + bi) % 3) * 0.09} color={c} tilt={bi === 4 ? 0.12 : 0} />
          </group>
        ))
      )}
      <Globe />
    </group>
  )
}

function PottedPlant({ x, z, scale = 1 }: { x: number; z: number; scale?: number }) {
  return (
    <group position={[x, 0, z]} scale={scale}>
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.34, 0.26, 0.6, 20]} />
        <meshStandardMaterial color={P.peach} roughness={0.85} />
        <Outlines thickness={0.02} color={INK} />
      </mesh>
      {[
        [0, 1.02, 0, 0.36],
        [-0.32, 0.86, 0.1, 0.27],
        [0.32, 0.88, -0.08, 0.29],
        [0.05, 1.34, -0.05, 0.27],
        [-0.2, 1.16, -0.24, 0.23],
        [0.24, 1.2, 0.2, 0.23],
        [0, 1.55, 0.02, 0.2],
      ].map((s, i) => (
        <mesh key={i} position={[s[0], s[1], s[2]]} castShadow>
          <sphereGeometry args={[s[3], 20, 20]} />
          <meshStandardMaterial color={i % 2 ? P.mint : P.mintSoft} roughness={0.9} />
          <Outlines thickness={0.018} color={INK} />
        </mesh>
      ))}
    </group>
  )
}

function Window() {
  return (
    <group position={[-5.95, 3.5, 1.3]} rotation={[0, Math.PI / 2, 0]}>
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[3.0, 2.2]} />
        <meshBasicMaterial color={P.skySoft} />
      </mesh>
      <mesh position={[0.9, 0.6, 0.1]}>
        <circleGeometry args={[0.4, 32]} />
        <meshBasicMaterial color={P.lemon} />
      </mesh>
      {[
        [-0.6, 0.45, 0.18],
        [-0.35, 0.35, 0.22],
        [0.2, -0.4, 0.2],
      ].map((c, i) => (
        <mesh key={i} position={[c[0], c[1], 0.1]} scale={c[2]}>
          <circleGeometry args={[1, 20]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
        </mesh>
      ))}
      <RBox args={[3.2, 2.4, 0.1]} radius={0.05} position={[0, 0, 0.02]} color={P.white} />
      <mesh position={[0, 0, 0.1]}>
        <boxGeometry args={[0.07, 2.2, 0.06]} />
        <meshStandardMaterial color={P.white} />
      </mesh>
      <mesh position={[0, 0, 0.1]}>
        <boxGeometry args={[3.0, 0.07, 0.06]} />
        <meshStandardMaterial color={P.white} />
      </mesh>
      <RBox args={[3.4, 0.16, 0.36]} radius={0.04} position={[0, -1.28, 0.16]} color={P.white} />
      {/* curtains */}
      {[-1.75, 1.75].map((cx, i) => (
        <mesh key={i} position={[cx, 0.1, 0.24]} castShadow>
          <boxGeometry args={[0.5, 2.7, 0.1]} />
          <meshStandardMaterial color={P.bubblegumSoft} roughness={0.95} />
          <Outlines thickness={0.02} color={INK} />
        </mesh>
      ))}
    </group>
  )
}

function WallClock() {
  const minRef = useRef<THREE.Mesh>(null)
  const hrRef = useRef<THREE.Mesh>(null)
  useFrame(() => {
    const now = new Date()
    const mins = now.getMinutes() + now.getSeconds() / 60
    const hrs = (now.getHours() % 12) + mins / 60
    if (minRef.current) minRef.current.rotation.z = -(mins / 60) * Math.PI * 2
    if (hrRef.current) hrRef.current.rotation.z = -(hrs / 12) * Math.PI * 2
  })
  return (
    <group position={[-3.9, 4.5, -4.02]}>
      <mesh>
        <cylinderGeometry args={[0.42, 0.42, 0.08, 32]} />
        <meshStandardMaterial color={P.white} roughness={0.6} />
        <Outlines thickness={0.02} color={INK} />
      </mesh>
      <mesh position={[0, 0, 0.06]}>
        <circleGeometry args={[0.36, 32]} />
        <meshBasicMaterial color={P.chalk} />
      </mesh>
      <mesh ref={hrRef} position={[0, 0.07, 0.08]}>
        <boxGeometry args={[0.04, 0.2, 0.02]} />
        <meshBasicMaterial color={INK} />
      </mesh>
      <mesh ref={minRef} position={[0, 0.1, 0.09]}>
        <boxGeometry args={[0.03, 0.28, 0.02]} />
        <meshBasicMaterial color={P.bubblegum} />
      </mesh>
      <mesh position={[0, 0, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.02, 12]} />
        <meshStandardMaterial color={INK} />
      </mesh>
    </group>
  )
}

function StringLights() {
  const points: [number, number, number][] = []
  for (let i = 0; i <= 16; i++) {
    const x = -5.8 + (i / 16) * 11.6
    const sag = 0.55 * Math.sin((i / 16) * Math.PI)
    points.push([x, 5.45 - sag, 1.6])
  }
  return (
    <group>
      <Line points={points} color={INK} lineWidth={1.5} />
      {points.filter((_, i) => i % 2 === 0).map((p, i) => (
        <mesh key={i} position={[p[0], p[1] - 0.08, p[2]]}>
          <sphereGeometry args={[0.055, 12, 12]} />
          <meshStandardMaterial color="#fff2c8" emissive="#ffd980" emissiveIntensity={1.1} />
        </mesh>
      ))}
    </group>
  )
}

function Poster({ x, y, z, color }: { x: number; y: number; z: number; color: string }) {
  return (
    <group position={[x, y, z]}>
      <RBox args={[1.5, 1.1, 0.07]} radius={0.03} color={P.white} />
      <mesh position={[0, 0.05, 0.05]}>
        <planeGeometry args={[1.2, 0.8]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {/* faux "Aa Bb Cc" blocks */}
      {[-0.36, 0, 0.36].map((bx, i) => (
        <mesh key={i} position={[bx, 0.02, 0.06]}>
          <planeGeometry args={[0.26, 0.5]} />
          <meshBasicMaterial color={i === 1 ? P.lemon : P.skySoft} />
        </mesh>
      ))}
    </group>
  )
}

/* ------------------------------- room ---------------------------------- */

export function Classroom() {
  return (
    <group>
      {/* Floor */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[12.4, 0.2, 8.4]} />
        <meshStandardMaterial color={P.floor} roughness={0.95} />
      </mesh>
      {[-4, -2, 0, 2, 4].map((x) => (
        <mesh key={x} position={[x, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.03, 8.4]} />
          <meshBasicMaterial color={P.floorAlt} transparent opacity={0.7} />
        </mesh>
      ))}

      {/* Walls + ceiling */}
      <mesh position={[0, 3, -4.2]} receiveShadow>
        <boxGeometry args={[12.4, 6.2, 0.2]} />
        <meshStandardMaterial color={P.wall} roughness={1} />
      </mesh>
      <mesh position={[-6.2, 3, 0]} receiveShadow>
        <boxGeometry args={[0.2, 6.2, 8.4]} />
        <meshStandardMaterial color={P.wallShade} roughness={1} />
      </mesh>
      <mesh position={[6.2, 3, 0]} receiveShadow>
        <boxGeometry args={[0.2, 6.2, 8.4]} />
        <meshStandardMaterial color={P.wallShade} roughness={1} />
      </mesh>
      <mesh position={[0, 6.1, 0]}>
        <boxGeometry args={[12.4, 0.2, 8.4]} />
        <meshStandardMaterial color={P.wall} roughness={1} />
      </mesh>
      {/* baseboards */}
      <mesh position={[0, 0.14, -4.08]}>
        <boxGeometry args={[12.4, 0.28, 0.1]} />
        <meshStandardMaterial color={P.wood} roughness={0.85} />
      </mesh>
      <mesh position={[-6.08, 0.14, 0]}>
        <boxGeometry args={[0.1, 0.28, 8.4]} />
        <meshStandardMaterial color={P.wood} roughness={0.85} />
      </mesh>
      <mesh position={[6.08, 0.14, 0]}>
        <boxGeometry args={[0.1, 0.28, 8.4]} />
        <meshStandardMaterial color={P.wood} roughness={0.85} />
      </mesh>

      {/* Blackboard */}
      <group position={[1.2, 3.3, -4.05]}>
        <RBox args={[6.3, 3.5, 0.16]} radius={0.04} color={P.wood} outline={0.025} />
        <mesh position={[0, 0, 0.1]}>
          <boxGeometry args={[5.9, 3.1, 0.06]} />
          <meshStandardMaterial color={P.board} roughness={0.95} />
        </mesh>
        <RBox args={[6.3, 0.12, 0.28]} radius={0.03} position={[0, -1.85, 0.22]} color={P.woodDark} outline={0.015} />
        <mesh position={[-1.4, -1.76, 0.24]} rotation={[0, 0, 0.3]}>
          <boxGeometry args={[0.22, 0.05, 0.05]} />
          <meshStandardMaterial color={P.chalk} />
        </mesh>
        <mesh position={[1.6, -1.76, 0.24]} rotation={[0, 0, -0.2]}>
          <boxGeometry args={[0.18, 0.05, 0.05]} />
          <meshStandardMaterial color={P.bubblegum} />
        </mesh>
        {/* eraser */}
        <RBox args={[0.4, 0.12, 0.16]} radius={0.03} position={[0.4, -1.76, 0.24]} color={P.ink} outline={0.012} />
        <ChalkMark x={-1.6} y={0.9} w={1.8} h={0.08} />
        <ChalkMark x={-1.2} y={0.5} w={2.6} h={0.05} />
        <ChalkMark x={-1.4} y={0.1} w={2.2} h={0.05} />
        <ChalkMark x={1.4} y={0.7} w={1.4} h={0.05} r={0.04} />
        <ChalkMark x={1.6} y={0.3} w={1.0} h={0.05} />
      </group>

      <Poster x={-3.7} y={3.5} z={-4.05} color={P.grapeSoft} />
      <Window />
      <WallClock />
      <StringLights />

      <Bookshelf />
      <PottedPlant x={-5.3} z={0.4} />
      <PottedPlant x={5.2} z={-1.6} scale={0.9} />

      {/* Rug */}
      <mesh position={[0.4, 0.02, 1.1]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[2.4, 48]} />
        <meshStandardMaterial color={P.bubblegumSoft} roughness={1} />
      </mesh>
      <mesh position={[0.4, 0.03, 1.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.8, 1.95, 48]} />
        <meshBasicMaterial color={P.bubblegum} transparent opacity={0.5} />
      </mesh>

      {/* Teacher desk + chair */}
      <Desk x={1.2} z={-2.95} />
      <Chair x={2.7} z={-3.0} rot={-0.5} color={P.grapeSoft} />

      {/* Student desk + chair */}
      <Desk x={1.65} z={-0.15} />
      <Chair x={1.65} z={1.35} rot={Math.PI} color={P.skySoft} />

      {/* Extra classroom seating (front-left) */}
      <Desk x={-3.7} z={1.7} />
      <Chair x={-3.7} z={2.8} rot={Math.PI} />
      <Desk x={-2.0} z={1.7} />
      <Chair x={-2.0} z={2.8} rot={Math.PI} />

      {/* Pendant lamp */}
      <group position={[0.6, 0, 1.4]}>
        <mesh position={[0, 5.0, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 2.2, 8]} />
          <meshStandardMaterial color={INK} />
        </mesh>
        <mesh position={[0, 3.85, 0]} castShadow>
          <coneGeometry args={[0.55, 0.6, 28, 1, true]} />
          <meshStandardMaterial color={P.lemon} roughness={0.6} side={THREE.DoubleSide} />
          <Outlines thickness={0.02} color={INK} />
        </mesh>
        <mesh position={[0, 3.62, 0]}>
          <sphereGeometry args={[0.13, 20, 20]} />
          <meshStandardMaterial color="#fff6d8" emissive="#ffe9a8" emissiveIntensity={1.4} />
        </mesh>
        <pointLight position={[0, 3.6, 0]} intensity={16} distance={9} color="#ffe6b0" castShadow />
      </group>
    </group>
  )
}
