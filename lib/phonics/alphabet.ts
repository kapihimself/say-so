export type LetterSound = {
  letter: string
  /** how the letter NAME is pronounced in English, e.g. /eɪ/ */
  ipa: string
  /** example word */
  example: string
}

export const ALPHABET: LetterSound[] = [
  { letter: 'A', ipa: '/eɪ/', example: 'apple' },
  { letter: 'B', ipa: '/biː/', example: 'ball' },
  { letter: 'C', ipa: '/siː/', example: 'cat' },
  { letter: 'D', ipa: '/diː/', example: 'dog' },
  { letter: 'E', ipa: '/iː/', example: 'egg' },
  { letter: 'F', ipa: '/ɛf/', example: 'fish' },
  { letter: 'G', ipa: '/dʒiː/', example: 'goat' },
  { letter: 'H', ipa: '/eɪtʃ/', example: 'hat' },
  { letter: 'I', ipa: '/aɪ/', example: 'ink' },
  { letter: 'J', ipa: '/dʒeɪ/', example: 'jam' },
  { letter: 'K', ipa: '/keɪ/', example: 'kite' },
  { letter: 'L', ipa: '/ɛl/', example: 'leg' },
  { letter: 'M', ipa: '/ɛm/', example: 'man' },
  { letter: 'N', ipa: '/ɛn/', example: 'nose' },
  { letter: 'O', ipa: '/oʊ/', example: 'orange' },
  { letter: 'P', ipa: '/piː/', example: 'pen' },
  { letter: 'Q', ipa: '/kjuː/', example: 'queen' },
  { letter: 'R', ipa: '/ɑːr/', example: 'red' },
  { letter: 'S', ipa: '/ɛs/', example: 'sun' },
  { letter: 'T', ipa: '/tiː/', example: 'tea' },
  { letter: 'U', ipa: '/juː/', example: 'up' },
  { letter: 'V', ipa: '/viː/', example: 'van' },
  { letter: 'W', ipa: '/ˈdʌbəljuː/', example: 'wet' },
  { letter: 'X', ipa: '/ɛks/', example: 'box' },
  { letter: 'Y', ipa: '/waɪ/', example: 'yes' },
  { letter: 'Z', ipa: '/ziː/', example: 'zoo' },
]
