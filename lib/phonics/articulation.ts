/**
 * Schematic sagittal (side) mouth diagrams for teaching how each sound is
 * made — where the tongue and lips go, and how the air flows.
 */

export type Artic =
  | 'lips-closed'
  | 'lip-teeth'
  | 'tongue-teeth'
  | 'tongue-ridge'
  | 'tongue-back'
  | 'tongue-back-round'
  | 'jaw-open'
  | 'lips-spread'
  | 'lips-round'
  | 'glottal'

export type ArticSpec = {
  tongue: string
  lip: string
  upperLip: string
  air: string
  desc: { id: string; es: string; pt: string }
}

const DEFAULT_TONGUE = 'M 98,160 Q 120,160 145,150 Q 170,145 180,220 L 98,220 Z'
const DEFAULT_LIP = 'M 58,155 Q 82,155 92,147'
const DEFAULT_UPPER = 'M 58,92 Q 82,92 92,100'

export const ARTIC: Record<Artic, ArticSpec> = {
  'lips-closed': {
    tongue: DEFAULT_TONGUE,
    lip: 'M 58,120 Q 82,118 92,112',
    upperLip: DEFAULT_UPPER,
    air: 'M 70,116 Q 55,116 40,116',
    desc: {
      id: 'Rapatkan kedua bibir, tahan sebentar, lalu lepaskan dengan letupan.',
      es: 'Cierra los dos labios, retenlos un momento y suéltalos con un golpe.',
      pt: 'Feche os dois lábios, segure um instante e solte com um estouro.',
    },
  },
  'lip-teeth': {
    tongue: DEFAULT_TONGUE,
    lip: 'M 58,124 Q 80,118 92,108',
    upperLip: DEFAULT_UPPER,
    air: 'M 72,110 Q 55,106 42,102',
    desc: {
      id: 'Sentuhkan gigi atas ke bibir bawah, lalu tiupkan udara.',
      es: 'Apoya los dientes de arriba en el labio de abajo y sopla.',
      pt: 'Encoste os dentes de cima no lábio de baixo e sopre.',
    },
  },
  'tongue-teeth': {
    tongue: 'M 90,150 Q 95,120 100,104 L 112,108 Q 150,130 180,220 L 90,220 Z',
    lip: 'M 58,150 Q 82,150 92,142',
    upperLip: DEFAULT_UPPER,
    air: 'M 70,118 Q 55,116 42,114',
    desc: {
      id: 'Selipkan ujung lidah di antara gigi, lalu tiup.',
      es: 'Pon la punta de la lengua entre los dientes y sopla.',
      pt: 'Coloque a ponta da língua entre os dentes e sopre.',
    },
  },
  'tongue-ridge': {
    tongue: 'M 90,150 Q 102,120 110,106 Q 130,112 150,140 Q 175,180 180,220 L 90,220 Z',
    lip: 'M 58,155 Q 82,155 92,147',
    upperLip: DEFAULT_UPPER,
    air: 'M 175,180 Q 130,140 100,120 L 78,112',
    desc: {
      id: 'Tempelkan ujung lidah di belakang gigi atas (gusi), lalu lepaskan.',
      es: 'Apoya la punta de la lengua tras los dientes de arriba y suelta.',
      pt: 'Encoste a ponta da língua atrás dos dentes de cima e solte.',
    },
  },
  'tongue-back': {
    tongue: 'M 90,175 Q 140,120 172,140 Q 182,158 182,220 L 90,220 Z',
    lip: 'M 58,152 Q 82,150 92,144',
    upperLip: DEFAULT_UPPER,
    air: 'M 175,190 Q 150,175 120,170',
    desc: {
      id: 'Angkat belakang lidah ke langit-langit belakang, lalu lepaskan.',
      es: 'Sube la parte de atrás de la lengua al paladar y suelta.',
      pt: 'Levante o fundo da língua ao céu da boca e solte.',
    },
  },
  'tongue-back-round': {
    tongue: 'M 92,170 Q 140,124 170,142 Q 180,160 180,220 L 92,220 Z',
    lip: 'M 54,150 Q 74,146 86,140',
    upperLip: 'M 56,96 Q 60,90 66,88',
    air: 'M 175,188 Q 150,172 120,166',
    desc: {
      id: 'Tarik lidah ke belakang dan bulatkan bibir ke depan.',
      es: 'Retira la lengua hacia atrás y redondea los labios.',
      pt: 'Recue a língua para trás e arredonde os lábios.',
    },
  },
  'jaw-open': {
    tongue: 'M 92,178 Q 120,182 148,170 Q 172,164 180,220 L 92,220 Z',
    lip: 'M 52,176 Q 78,176 88,164',
    upperLip: 'M 54,98 Q 74,94 86,102',
    air: 'M 175,185 Q 145,175 115,170 Q 90,166 72,164',
    desc: {
      id: 'Turunkan rahang lebar-lebar; lidah berada di dasar mulut.',
      es: 'Baja bien la mandíbula; la lengua queda abajo.',
      pt: 'Abaixe bem a mandíbula; a língua fica embaixo.',
    },
  },
  'lips-spread': {
    tongue: 'M 96,150 Q 108,118 130,110 Q 168,116 180,220 L 96,220 Z',
    lip: 'M 54,150 Q 78,148 90,142',
    upperLip: 'M 52,100 Q 66,92 80,96',
    air: 'M 175,180 Q 140,130 105,120 Q 88,116 72,118',
    desc: {
      id: 'Tarik sudut bibir ke samping seperti tersenyum.',
      es: 'Estira las comisuras de los labios como al sonreír.',
      pt: 'Estique os cantos dos lábios como num sorriso.',
    },
  },
  'lips-round': {
    tongue: 'M 96,160 Q 112,150 138,146 Q 170,146 180,220 L 96,220 Z',
    lip: 'M 54,150 Q 70,146 80,140',
    upperLip: 'M 54,100 Q 60,92 68,90',
    air: 'M 175,182 Q 130,160 96,150 Q 78,146 62,142',
    desc: {
      id: 'Bulatkan bibir ke depan seperti membentuk huruf O.',
      es: 'Redondea los labios hacia adelante, como una O.',
      pt: 'Arredonde os lábios para a frente, como um O.',
    },
  },
  glottal: {
    tongue: DEFAULT_TONGUE,
    lip: 'M 58,152 Q 82,152 92,146',
    upperLip: DEFAULT_UPPER,
    air: 'M 180,205 Q 160,190 130,170 Q 100,150 72,132',
    desc: {
      id: 'Mulut terbuka; udara mengalir dari tenggorokan tanpa hambatan.',
      es: 'Boca abierta; el aire sale libre desde la garganta.',
      pt: 'Boca aberta; o ar sai livre da garganta.',
    },
  },
}

export type ActivePart = 'lips' | 'teeth' | 'tongue' | 'palate' | 'throat' | 'jaw'

/** Which articulator does the work for each sound (highlighted in the animator). */
export const ARTIC_ACTIVE: Record<Artic, ActivePart> = {
  'lips-closed': 'lips',
  'lip-teeth': 'lips',
  'tongue-teeth': 'tongue',
  'tongue-ridge': 'tongue',
  'tongue-back': 'tongue',
  'tongue-back-round': 'lips',
  'jaw-open': 'jaw',
  'lips-spread': 'lips',
  'lips-round': 'lips',
  glottal: 'throat',
}

/** Screen position and motion of each articulator (in the 320×250 viewBox). */
export const ARTIC_MARK: Record<ActivePart, { x: number; y: number; motion: 'up' | 'out' | 'throat' | 'open' }> = {
  lips: { x: 74, y: 132, motion: 'out' },
  teeth: { x: 92, y: 122, motion: 'out' },
  tongue: { x: 138, y: 162, motion: 'up' },
  palate: { x: 152, y: 92, motion: 'out' },
  throat: { x: 196, y: 188, motion: 'throat' },
  jaw: { x: 70, y: 176, motion: 'open' },
}

export const MOUTH_LABELS: Record<ActivePart | 'air' | 'voiced' | 'parts', { id: string; es: string; pt: string }> = {
  lips: { id: 'Bibir', es: 'Labios', pt: 'Lábios' },
  teeth: { id: 'Gigi', es: 'Dientes', pt: 'Dentes' },
  tongue: { id: 'Lidah', es: 'Lengua', pt: 'Língua' },
  palate: { id: 'Langit-langit', es: 'Paladar', pt: 'Palato' },
  throat: { id: 'Tenggorokan', es: 'Garganta', pt: 'Garganta' },
  jaw: { id: 'Rahang', es: 'Mandíbula', pt: 'Mandíbula' },
  air: { id: 'Udara', es: 'Aire', pt: 'Ar' },
  voiced: { id: 'Getaran pita suara', es: 'Vibración de cuerdas vocales', pt: 'Vibração das cordas vocais' },
  parts: { id: 'Bagian yang bergerak', es: 'Parte que se mueve', pt: 'Parte que se move' },
}
