/**
 * CEFR data used to align the app to the Common European Framework of
 * Reference for Languages. These are the official global-scale descriptors
 * (Council of Europe) plus study-hour estimates from Cambridge Assessment.
 *
 * We use this for honest "CEFR-aligned" claims, never certification.
 */

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
export type CEFRBand = 'basic' | 'independent' | 'proficient'
export type CEFRSkill = 'listening' | 'reading' | 'speaking' | 'writing' | 'interaction' | 'mediation'

export type CEFRLevelData = {
  id: CEFRLevel
  band: CEFRBand
  name: string
  tagline: string
  /** Official CEFR global-scale descriptor */
  descriptor: string
  /** Per-skill can-do statements */
  canDo: { skill: CEFRSkill; text: string }[]
  /** Estimated cumulative study hours (Cambridge Assessment English) */
  hours: [number, number]
}

const A1: CEFRLevelData = {
  id: 'A1',
  band: 'basic',
  name: 'A1: Beginner',
  tagline: 'Ungkapan sehari-hari dan perkenalan dasar.',
  descriptor:
    'Can understand and use familiar everyday expressions and very basic phrases aimed at the satisfaction of needs of a concrete type. Can introduce him/herself and others and can ask and answer questions about personal details such as where he/she lives, people he/she knows and things he/she has. Can interact in a simple way provided the other person talks slowly and clearly and is prepared to help.',
  canDo: [
    { skill: 'listening', text: 'Can recognise familiar words and very basic phrases about myself, my family and immediate concrete surroundings when people speak slowly and clearly.' },
    { skill: 'reading', text: 'Can understand familiar names, words and very simple sentences, for example on notices and posters or in catalogues.' },
    { skill: 'interaction', text: 'Can interact in a simple way provided the other person is prepared to repeat or rephrase things at a slower rate of speech and help me formulate what I am trying to say.' },
    { skill: 'speaking', text: 'Can use simple phrases and sentences to describe where I live and people I know.' },
    { skill: 'writing', text: 'Can write a short, simple postcard, for example sending holiday greetings. Can fill in forms with personal details.' },
  ],
  hours: [90, 100],
}

const A2: CEFRLevelData = {
  id: 'A2',
  band: 'basic',
  name: 'A2: Elementary',
  tagline: 'Kalimat sederhana & tugas rutin sehari-hari.',
  descriptor:
    'Can understand sentences and frequently used expressions related to areas of most immediate relevance (e.g. very basic personal and family information, shopping, local geography, employment). Can communicate in simple and routine tasks requiring a simple and direct exchange of information on familiar and routine matters. Can describe in simple terms aspects of his/her background, immediate environment and matters in areas of immediate need.',
  canDo: [
    { skill: 'listening', text: 'Can understand phrases and the highest frequency vocabulary related to areas of most immediate personal relevance.' },
    { skill: 'reading', text: 'Can read very short, simple texts. Can find specific, predictable information in simple everyday material.' },
    { skill: 'interaction', text: 'Can communicate in simple and routine tasks requiring a simple and direct exchange of information on familiar activities and matters.' },
    { skill: 'speaking', text: 'Can use a series of phrases and sentences to describe in simple terms my family and other people, living conditions, my educational background and my present or most recent job.' },
    { skill: 'writing', text: 'Can write short, simple notes and messages. Can write a very simple personal letter, for example thanking someone for something.' },
  ],
  hours: [180, 200],
}

const B1: CEFRLevelData = {
  id: 'B1',
  band: 'independent',
  name: 'B1: Intermediate',
  tagline: 'Ngobrol sehari-hari & travel.',
  descriptor:
    'Can understand the main points of clear standard input on familiar matters regularly encountered in work, school, leisure, etc. Can deal with most situations likely to arise whilst travelling in an area where the language is spoken. Can produce simple connected text on topics which are familiar or of personal interest. Can describe experiences and events, dreams, hopes & ambitions and briefly give reasons and explanations for opinions and plans.',
  canDo: [
    { skill: 'listening', text: 'Can understand the main points of clear standard speech on familiar matters regularly encountered in work, school, leisure, etc.' },
    { skill: 'reading', text: 'Can understand texts that consist mainly of high frequency everyday or job-related language.' },
    { skill: 'interaction', text: 'Can deal with most situations likely to arise whilst travelling in an area where the language is spoken.' },
    { skill: 'speaking', text: 'Can connect phrases in a simple way in order to describe experiences and events, my dreams, hopes and ambitions.' },
    { skill: 'writing', text: 'Can write straightforward connected text on topics which are familiar or of personal interest.' },
  ],
  hours: [350, 400],
}

const B2: CEFRLevelData = {
  id: 'B2',
  band: 'independent',
  name: 'B2: Upper-Intermediate',
  tagline: 'Ngobrol lancar & spontan sama native.',
  descriptor:
    'Can understand the main ideas of complex text on both concrete and abstract topics, including technical discussions in his/her field of specialisation. Can interact with a degree of fluency and spontaneity that makes regular interaction with native speakers quite possible without strain for either party. Can produce clear, detailed text on a wide range of subjects and explain a viewpoint on a topical issue giving the advantages and disadvantages of various options.',
  canDo: [
    { skill: 'listening', text: 'Can understand extended speech and lectures and follow even complex lines of argument provided the topic is reasonably familiar.' },
    { skill: 'reading', text: 'Can read articles and reports concerned with contemporary problems in which the writers adopt particular attitudes or viewpoints.' },
    { skill: 'interaction', text: 'Can interact with a degree of fluency and spontaneity that makes regular interaction with native speakers quite possible without strain for either party.' },
    { skill: 'speaking', text: 'Can present clear, detailed descriptions on a wide range of subjects related to my field of interest.' },
    { skill: 'writing', text: 'Can write clear, detailed text on a wide range of subjects related to my interests.' },
  ],
  hours: [500, 600],
}

const C1: CEFRLevelData = {
  id: 'C1',
  band: 'proficient',
  name: 'C1: Advanced',
  tagline: 'Ekspresi ide kompleks hampir native.',
  descriptor:
    'Can understand a wide range of demanding, longer clauses, and recognise implicit meaning. Can express ideas fluently and spontaneously without much obvious searching for expressions. Can use language flexibly and effectively for social, academic and professional purposes. Can produce clear, well-structured, detailed text on complex subjects, showing controlled use of organisational patterns, connectors and cohesive devices.',
  canDo: [
    { skill: 'listening', text: 'Can understand extended speech even when it is not clearly structured and when relationships are only implied and not signalled explicitly.' },
    { skill: 'reading', text: 'Can understand long and complex factual and literary texts, appreciating distinctions of style.' },
    { skill: 'interaction', text: 'Can express myself fluently and spontaneously without much obvious searching for expressions.' },
    { skill: 'speaking', text: 'Can present clear, detailed descriptions of complex subjects integrating sub-themes, developing particular points and rounding off with an appropriate conclusion.' },
    { skill: 'writing', text: 'Can express myself in clear, well-structured text, expressing points of view at some length.' },
  ],
  hours: [700, 800],
}

const C2: CEFRLevelData = {
  id: 'C2',
  band: 'proficient',
  name: 'C2: Mastery',
  tagline: 'Presisi tanpa mikir.',
  descriptor:
    'Can understand with ease virtually everything heard or read. Can summarise information from different spoken and written sources, reconstructing arguments and accounts in a coherent presentation. Can express him/herself spontaneously, very fluently and precisely, differentiating finer shades of meaning even in more complex situations.',
  canDo: [
    { skill: 'listening', text: 'Have no difficulty in understanding any kind of spoken language, whether live or broadcast, even when delivered at fast native speed.' },
    { skill: 'reading', text: 'Can read with ease virtually all forms of the written language, including abstract, structurally or linguistically complex texts.' },
    { skill: 'interaction', text: 'Can take part effortlessly in any conversation or discussion and have a good familiarity with idiomatic expressions and colloquialisms.' },
    { skill: 'speaking', text: 'Can present a complex topic confidently and articulately, and can handle questions and comments competently.' },
    { skill: 'writing', text: 'Can write clear, smoothly flowing text in an appropriate style.' },
  ],
  hours: [1000, 1200],
}

export const CEFR_LEVELS: Record<CEFRLevel, CEFRLevelData> = { A1, A2, B1, B2, C1, C2 }
export const CEFR_ORDER: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
