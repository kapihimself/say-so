import { cn } from '@/lib/utils'

export type BuddyLook = {
  skin: string
  hair: string
  hairStyle: 'puff' | 'swoop' | 'bun' | 'buzz' | 'curly'
  outfit: string
  cheeks?: string
}

const INK = '#2b2238'

export function Buddy({
  look,
  expression = 'happy',
  talking = false,
  className,
}: {
  look: BuddyLook
  expression?: 'happy' | 'think' | 'wow'
  talking?: boolean
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 200 230"
      className={cn('h-full w-full', className)}
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible' }}
    >
      <g stroke={INK} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round">
        {/* Body / hoodie */}
        <path
          d="M52 228 C50 180 60 150 100 150 C140 150 150 180 148 228 Z"
          fill={look.outfit}
        />
        {/* hoodie collar */}
        <path d="M78 154 Q100 174 122 154" fill="none" />
        {/* neck */}
        <rect x="88" y="132" width="24" height="26" rx="10" fill={look.skin} />

        {/* Head */}
        <rect x="46" y="46" width="108" height="98" rx="44" fill={look.skin} />

        {/* Hair */}
        {look.hairStyle === 'puff' && (
          <path
            d="M50 70 C44 36 80 24 100 24 C120 24 156 36 150 70 C150 56 128 50 100 50 C72 50 50 56 50 70 Z"
            fill={look.hair}
          />
        )}
        {look.hairStyle === 'swoop' && (
          <path
            d="M48 72 C44 38 86 26 110 30 C148 36 152 58 150 70 C150 52 96 40 78 58 C66 70 56 70 48 72 Z"
            fill={look.hair}
          />
        )}
        {look.hairStyle === 'bun' && (
          <>
            <circle cx="100" cy="26" r="16" fill={look.hair} />
            <path d="M52 68 C50 44 78 44 100 44 C122 44 150 44 148 68 C148 54 124 50 100 50 C76 50 52 54 52 68 Z" fill={look.hair} />
          </>
        )}
        {look.hairStyle === 'buzz' && (
          <path d="M52 64 C52 42 76 40 100 40 C124 40 148 42 148 64 C140 52 120 50 100 50 C80 50 60 52 52 64 Z" fill={look.hair} />
        )}
        {look.hairStyle === 'curly' && (
          <path
            d="M46 66 C34 50 48 30 66 34 C70 22 96 20 104 30 C124 22 150 34 146 56 C160 60 154 80 140 74 C148 60 130 54 130 54 C120 46 70 46 60 56 C54 60 46 66 46 66 Z"
            fill={look.hair}
          />
        )}

        {/* Eyes */}
        {expression === 'wow' ? (
          <>
            <circle cx="80" cy="98" r="9" fill="#fff" />
            <circle cx="120" cy="98" r="9" fill="#fff" />
            <circle cx="80" cy="98" r="4" fill={INK} stroke="none" />
            <circle cx="120" cy="98" r="4" fill={INK} stroke="none" />
          </>
        ) : (
          <>
            <circle cx="80" cy="98" r="5.5" fill={INK} stroke="none" />
            <circle cx="120" cy="98" r="5.5" fill={INK} stroke="none" />
          </>
        )}

        {/* Cheeks */}
        {look.cheeks && (
          <>
            <ellipse cx="68" cy="114" rx="9" ry="6" fill={look.cheeks} stroke="none" opacity={0.8} />
            <ellipse cx="132" cy="114" rx="9" ry="6" fill={look.cheeks} stroke="none" opacity={0.8} />
          </>
        )}

        {/* Mouth */}
        {talking ? (
          <ellipse cx="100" cy="122" rx="11" ry="9" fill={INK} stroke="none">
            <animate attributeName="ry" values="3;9;4;8;3" dur="0.5s" repeatCount="indefinite" />
          </ellipse>
        ) : expression === 'think' ? (
          <path d="M88 124 Q100 120 112 124" fill="none" />
        ) : expression === 'wow' ? (
          <ellipse cx="100" cy="124" rx="9" ry="8" fill={INK} stroke="none" />
        ) : (
          <path d="M84 120 Q100 138 116 120" fill="none" />
        )}
      </g>
    </svg>
  )
}
