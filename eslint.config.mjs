import next from 'eslint-config-next/core-web-vitals'

const config = [
  ...next,
  {
    rules: {
      // Idiomatic patterns in this codebase (r3f useFrame, framer-motion,
      // effect-driven resets) that the React 19 compiler lint rules flag.
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/immutability': 'off',
      'react/no-unescaped-entities': 'off',
    },
  },
]

export default config
