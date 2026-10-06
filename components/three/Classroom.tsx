'use client'

import { RoundedBox, Outlines } from '@react-three/drei'
import { P } from './palette'

const INK = P.ink

function ChalkMark({ x, y, w, h = 0.05, r = 0 }: { x: number; y: number; w: number; h?: number; r?: number }) {
  return (
    <mesh position={[x, y, -3.9]} rotation={[0, 0, r]}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial color={P.chalk} transparent opacity={0.75} />
    </mesh>
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
  const books = [
    [P.bubblegum, P.sky, P.lemon, P.mint, P.grape],
    [P.peach, P.grape, P.mint, P.bubblegum, P.sky],
    [P.mint, P.lemon, P.sky, P.peach, P.grape],
  ]
  return (
    <group position={[-4.3, 0, -3.4]}>
      {/* frame */}
      <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.9, 2.0, 0.5]} />
        <meshStandardMaterial color={P.wood} roughness={0.85} />
        <Outlines thickness={0.02} color={INK} />
      </mesh>
      {/* shelves */}
      {shelfY.map((y, i) => (
        <mesh key={i} position={[0, y, 0.06]}>
          <boxGeometry args={[1.8, 0.07, 0.42]} />
          <meshStandardMaterial color={P.woodDark} roughness={0.9} />
        </mesh>
      ))}
      {/* books */}
      {books.map((row, ri) =>
        row.map((c, bi) => (
          <group key={`${ri}-${bi}`} position={[-0.72 + bi * 0.34, shelfY[ri], 0.02]}>
            <Book x={0} y={0} h={0.42 + ((ri + bi) % 3) * 0.09} color={c} tilt={bi === 4 ? 0.12 : 0} />
          </group>
        ))
      )}
    </group>
  )
}

function PottedPlant() {
  return (
    <group position={[-5.0, 0, 2.6]}>
      <mesh position={[0, 0.28, 0]} castShadow>
        <cylinderGeometry args={[0.34, 0.26, 0.56, 20]} />
        <meshStandardMaterial color={P.peach} roughness={0.85} />
        <Outlines thickness={0.02} color={INK} />
      </mesh>
      {[
        [0, 0.95, 0, 0.34],
        [-0.3, 0.8, 0.1, 0.26],
        [0.3, 0.82, -0.08, 0.28],
        [0.05, 1.25, -0.05, 0.26],
        [-0.18, 1.1, -0.22, 0.22],
        [0.22, 1.15, 0.2, 0.22],
      ].map((s, i) => (
        <mesh key={i} position={[s[0], s[1], s[2]]} castShadow>
          <sphereGeometry args={[s[3], 20, 20]} />
          <meshStandardMaterial color={i % 2 ? P.mint : P.mintSoft} roughness={0.9} />
          <Outlines thickness={0.02} color={INK} />
        </mesh>
      ))}
    </group>
  )
}

function Desk({ x = 0, z = 0, rot = 0 }: { x?: number; z?: number; rot?: number }) {
  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]}>
      <RoundedBox args={[2.4, 0.14, 1.1]} radius={0.06} smoothness={4} position={[0, 0.9, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={P.wood} roughness={0.7} />
        <Outlines thickness={0.02} color={INK} />
      </RoundedBox>
      {[
        [-1.05, -0.42],
        [1.05, -0.42],
        [-1.05, 0.42],
        [1.05, 0.42],
      ].map((l, i) => (
        <mesh key={i} position={[l[0], 0.45, l[1]]} castShadow>
          <boxGeometry args={[0.12, 0.9, 0.12]} />
          <meshStandardMaterial color={P.woodDark} roughness={0.85} />
          <Outlines thickness={0.016} color={INK} />
        </mesh>
      ))}
    </group>
  )
}

function Stool({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.34, 0.34, 0.12, 24]} />
        <meshStandardMaterial color={P.lemon} roughness={0.8} />
        <Outlines thickness={0.02} color={INK} />
      </mesh>
      <mesh position={[0, 0.24, 0]}>
        <cylinderGeometry args={[0.07, 0.09, 0.5, 12]} />
        <meshStandardMaterial color={P.woodDark} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.26, 0.3, 0.05, 20]} />
        <meshStandardMaterial color={P.woodDark} roughness={0.9} />
      </mesh>
    </group>
  )
}

function Window() {
  return (
    <group position={[-5.95, 3.5, 1.3]} rotation={[0, Math.PI / 2, 0]}>
      {/* sky */}
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[3.0, 2.2]} />
        <meshBasicMaterial color={P.skySoft} />
      </mesh>
      {/* sun */}
      <mesh position={[0.9, 0.6, 0.1]}>
        <circleGeometry args={[0.4, 32]} />
        <meshBasicMaterial color={P.lemon} />
      </mesh>
      {/* clouds */}
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
      {/* frame */}
      <mesh position={[0, 0, 0.04]}>
        <boxGeometry args={[3.2, 2.4, 0.1]} />
        <meshStandardMaterial color={P.white} roughness={0.6} />
        <Outlines thickness={0.03} color={INK} />
      </mesh>
      {/* mullions */}
      <mesh position={[0, 0, 0.1]}>
        <boxGeometry args={[0.07, 2.2, 0.06]} />
        <meshStandardMaterial color={P.white} />
      </mesh>
      <mesh position={[0, 0, 0.1]}>
        <boxGeometry args={[3.0, 0.07, 0.06]} />
        <meshStandardMaterial color={P.white} />
      </mesh>
      {/* sill */}
      <mesh position={[0, -1.28, 0.16]} castShadow>
        <boxGeometry args={[3.4, 0.16, 0.36]} />
        <meshStandardMaterial color={P.white} roughness={0.7} />
        <Outlines thickness={0.02} color={INK} />
      </mesh>
    </group>
  )
}

export function Classroom() {
  return (
    <group>
      {/* Floor */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[12.4, 0.2, 8.4]} />
        <meshStandardMaterial color={P.floor} roughness={0.95} />
      </mesh>
      {/* Floor planks */}
      {[-4, -2, 0, 2, 4].map((x) => (
        <mesh key={x} position={[x, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.03, 8.4]} />
          <meshBasicMaterial color={P.floorAlt} transparent opacity={0.7} />
        </mesh>
      ))}

      {/* Back wall */}
      <mesh position={[0, 3, -4.2]} receiveShadow>
        <boxGeometry args={[12.4, 6.2, 0.2]} />
        <meshStandardMaterial color={P.wall} roughness={1} />
      </mesh>
      {/* Left wall */}
      <mesh position={[-6.2, 3, 0]} receiveShadow>
        <boxGeometry args={[0.2, 6.2, 8.4]} />
        <meshStandardMaterial color={P.wallShade} roughness={1} />
      </mesh>
      {/* Ceiling */}
      <mesh position={[0, 6.1, 0]}>
        <boxGeometry args={[12.4, 0.2, 8.4]} />
        <meshStandardMaterial color={P.wall} roughness={1} />
      </mesh>

      {/* Baseboard */}
      <mesh position={[0, 0.14, -4.08]}>
        <boxGeometry args={[12.4, 0.28, 0.1]} />
        <meshStandardMaterial color={P.wood} roughness={0.85} />
      </mesh>

      {/* Blackboard */}
      <group position={[1.2, 3.3, -4.05]}>
        <mesh castShadow>
          <boxGeometry args={[6.3, 3.5, 0.16]} />
          <meshStandardMaterial color={P.wood} roughness={0.8} />
          <Outlines thickness={0.025} color={INK} />
        </mesh>
        <mesh position={[0, 0, 0.1]}>
          <boxGeometry args={[5.9, 3.1, 0.06]} />
          <meshStandardMaterial color={P.board} roughness={0.95} />
        </mesh>
        {/* chalk tray */}
        <mesh position={[0, -1.85, 0.22]} castShadow>
          <boxGeometry args={[6.3, 0.12, 0.28]} />
          <meshStandardMaterial color={P.woodDark} roughness={0.85} />
        </mesh>
        {/* chalk sticks */}
        <mesh position={[-1.4, -1.76, 0.24]} rotation={[0, 0, 0.3]}>
          <boxGeometry args={[0.22, 0.05, 0.05]} />
          <meshStandardMaterial color={P.chalk} />
        </mesh>
        <mesh position={[1.6, -1.76, 0.24]} rotation={[0, 0, -0.2]}>
          <boxGeometry args={[0.18, 0.05, 0.05]} />
          <meshStandardMaterial color={P.bubblegum} />
        </mesh>
        {/* chalk marks */}
        <ChalkMark x={-1.6} y={0.9} w={1.8} h={0.08} />
        <ChalkMark x={-1.2} y={0.5} w={2.6} h={0.05} />
        <ChalkMark x={-1.4} y={0.1} w={2.2} h={0.05} />
        <ChalkMark x={1.4} y={0.7} w={1.4} h={0.05} r={0.04} />
        <ChalkMark x={1.6} y={0.3} w={1.0} h={0.05} />
      </group>

      {/* Poster */}
      <group position={[-4.4, 4.3, -4.05]}>
        <mesh castShadow>
          <boxGeometry args={[1.5, 1.1, 0.08]} />
          <meshStandardMaterial color={P.white} roughness={0.7} />
          <Outlines thickness={0.02} color={INK} />
        </mesh>
        <mesh position={[0, 0.05, 0.06]}>
          <planeGeometry args={[1.2, 0.8]} />
          <meshBasicMaterial color={P.grapeSoft} />
        </mesh>
      </group>

      <Window />
      <Bookshelf />
      <PottedPlant />

      {/* Rug */}
      <mesh position={[0.4, 0.02, 1.1]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[2.3, 48]} />
        <meshStandardMaterial color={P.bubblegumSoft} roughness={1} />
      </mesh>
      <mesh position={[0.4, 0.03, 1.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.7, 1.85, 48]} />
        <meshBasicMaterial color={P.bubblegum} transparent opacity={0.5} />
      </mesh>

      {/* Teacher desk near the board */}
      <Desk x={1.2} z={-2.9} />

      {/* Stools for the two characters */}
      <Stool x={-1.5} z={-0.6} />
      <Stool x={1.6} z={0.5} />

      {/* Pendant lamp */}
      <group position={[0.6, 0, 1.4]}>
        <mesh position={[0, 5.0, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 2.2, 8]} />
          <meshStandardMaterial color={INK} />
        </mesh>
        <mesh position={[0, 3.85, 0]} castShadow>
          <coneGeometry args={[0.55, 0.6, 28, 1, true]} />
          <meshStandardMaterial color={P.lemon} roughness={0.6} side={2} />
          <Outlines thickness={0.02} color={INK} />
        </mesh>
        <mesh position={[0, 3.62, 0]}>
          <sphereGeometry args={[0.13, 20, 20]} />
          <meshStandardMaterial color="#fff6d8" emissive="#ffe9a8" emissiveIntensity={1.4} />
        </mesh>
        <pointLight position={[0, 3.6, 0]} intensity={18} distance={9} color="#ffe6b0" castShadow />
      </group>
    </group>
  )
}
