import type { Artic } from './articulation'

export type LetterSound = {
  letter: string
  /** how the letter NAME is pronounced in English, e.g. /eɪ/ */
  ipa: string
  /** the main sound the letter makes, e.g. /æ/ */
  phoneme: string
  /** example word */
  example: string
  /** articulation diagram to show */
  artic: Artic
  /** whether the sound uses the vocal cords */
  voiced: boolean
}

export const ALPHABET: LetterSound[] = [
  { letter: 'A', ipa: '/eɪ/', phoneme: '/æ/', example: 'apple', artic: 'jaw-open', voiced: true },
  { letter: 'B', ipa: '/biː/', phoneme: '/b/', example: 'ball', artic: 'lips-closed', voiced: true },
  { letter: 'C', ipa: '/siː/', phoneme: '/k/', example: 'cat', artic: 'tongue-back', voiced: false },
  { letter: 'D', ipa: '/diː/', phoneme: '/d/', example: 'dog', artic: 'tongue-ridge', voiced: true },
  { letter: 'E', ipa: '/iː/', phoneme: '/e/', example: 'egg', artic: 'lips-spread', voiced: true },
  { letter: 'F', ipa: '/ɛf/', phoneme: '/f/', example: 'fish', artic: 'lip-teeth', voiced: false },
  { letter: 'G', ipa: '/dʒiː/', phoneme: '/ɡ/', example: 'goat', artic: 'tongue-back', voiced: true },
  { letter: 'H', ipa: '/eɪtʃ/', phoneme: '/h/', example: 'hat', artic: 'glottal', voiced: false },
  { letter: 'I', ipa: '/aɪ/', phoneme: '/ɪ/', example: 'ink', artic: 'lips-spread', voiced: true },
  { letter: 'J', ipa: '/dʒeɪ/', phoneme: '/dʒ/', example: 'jam', artic: 'tongue-back-round', voiced: true },
  { letter: 'K', ipa: '/keɪ/', phoneme: '/k/', example: 'kite', artic: 'tongue-back', voiced: false },
  { letter: 'L', ipa: '/ɛl/', phoneme: '/l/', example: 'leg', artic: 'tongue-ridge', voiced: true },
  { letter: 'M', ipa: '/ɛm/', phoneme: '/m/', example: 'man', artic: 'lips-closed', voiced: true },
  { letter: 'N', ipa: '/ɛn/', phoneme: '/n/', example: 'nose', artic: 'tongue-ridge', voiced: true },
  { letter: 'O', ipa: '/oʊ/', phoneme: '/ɒ/', example: 'orange', artic: 'lips-round', voiced: true },
  { letter: 'P', ipa: '/piː/', phoneme: '/p/', example: 'pen', artic: 'lips-closed', voiced: false },
  { letter: 'Q', ipa: '/kjuː/', phoneme: '/kw/', example: 'queen', artic: 'tongue-back-round', voiced: false },
  { letter: 'R', ipa: '/ɑːr/', phoneme: '/r/', example: 'red', artic: 'tongue-back-round', voiced: true },
  { letter: 'S', ipa: '/ɛs/', phoneme: '/s/', example: 'sun', artic: 'tongue-ridge', voiced: false },
  { letter: 'T', ipa: '/tiː/', phoneme: '/t/', example: 'tea', artic: 'tongue-ridge', voiced: false },
  { letter: 'U', ipa: '/juː/', phoneme: '/ʌ/', example: 'up', artic: 'jaw-open', voiced: true },
  { letter: 'V', ipa: '/viː/', phoneme: '/v/', example: 'van', artic: 'lip-teeth', voiced: true },
  { letter: 'W', ipa: '/ˈdʌbəljuː/', phoneme: '/w/', example: 'wet', artic: 'lips-round', voiced: true },
  { letter: 'X', ipa: '/ɛks/', phoneme: '/ks/', example: 'box', artic: 'tongue-back', voiced: false },
  { letter: 'Y', ipa: '/waɪ/', phoneme: '/j/', example: 'yes', artic: 'lips-spread', voiced: true },
  { letter: 'Z', ipa: '/ziː/', phoneme: '/z/', example: 'zoo', artic: 'tongue-ridge', voiced: true },
]
