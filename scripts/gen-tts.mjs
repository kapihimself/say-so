/**
 * Pre-record narration with OpenAI TTS so the UI can play natural audio files
 * (no live latency, works offline). Falls back to browser TTS at runtime if a
 * clip is missing.
 *
 * Usage:  OPENAI_TTS_KEY=sk-... node scripts/gen-tts.mjs
 * Force:  OPENAI_TTS_FORCE=1 ...
 */
import { mkdir, writeFile, access } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const KEY = process.env.OPENAI_TTS_KEY
const FORCE = process.env.OPENAI_TTS_FORCE === '1'
const MODEL = 'gpt-4o-mini-tts'

if (!KEY) {
  console.error('Missing OPENAI_TTS_KEY')
  process.exit(1)
}

const instruct =
  'Speak warmly, slowly and clearly, like a kind language teacher welcoming a nervous beginner. Friendly and encouraging, never robotic.'

const NARRATION = {
  id: {
    voice: 'coral',
    clips: {
      ob_lang:
        'Halo! Sebelum mulai, pilih bahasa ibumu dulu ya. Biar aku ngerti kesalahan khas yang kamu alami, dan bisa njelasin pakai bahasamu.',
      ob_name: 'Oke, siapa nama kamu? Aku mau manggil kamu pakai nama itu.',
      ob_level:
        'Kamu udah tau belum level English kamu? Kalau belum, ada tes penempatan di tombol bawah. Pilih aja yang paling dekat.',
      ob_teacher: 'Terakhir, pilih cara aku ngomong. Mode campur paling enak buat pemula.',
      room_how:
        'Selamat datang di kelas! Tekan tombol mic buat ngomong, atau ketik pesanmu. Aku bakal jawab sambil betulin pelan-pelan.',
      phonics_hint: 'Ketuk huruf untuk dengar bunyinya, dan lihat posisi lidah dan mulutmu.',
      test_hint: 'Sekarang gantian aku dengar kamu. Tekan mic, lalu ucapkan kata ini.',
      correct: 'Mantap, benar sekali!',
      almost: 'Hampir! Coba sekali lagi ya.',
      encourage: 'Aku tau ini berat, tapi AI percaya kamu bisa. Pelan-pelan aja.',
    },
  },
  es: {
    voice: 'nova',
    clips: {
      ob_lang:
        '¡Hola! Antes de empezar, elige tu lengua materna. Así entiendo tus errores típicos y te explico en tu idioma.',
      ob_name: 'Bien, ¿cómo te llamas? Quiero llamarte por tu nombre.',
      ob_level:
        '¿Ya sabes tu nivel de inglés? Si no, hay una prueba de nivel en el botón de abajo. Elige el más cercano.',
      ob_teacher: 'Por último, elige cómo hablo. El modo mixto es el más fácil para empezar.',
      room_how:
        '¡Bienvenido a clase! Pulsa el micro para hablar, o escribe tu mensaje. Te responderé y corregiré con calma.',
      phonics_hint: 'Toca una letra para oír su sonido y ver dónde van la lengua y los labios.',
      test_hint: 'Ahora te escucho yo. Pulsa el micro y di esta palabra.',
      correct: '¡Bravo, correcto!',
      almost: '¡Casi! Inténtalo una vez más.',
      encourage: 'Sé que es difícil, pero la IA cree en ti. Sin prisa.',
    },
  },
  pt: {
    voice: 'shimmer',
    clips: {
      ob_lang:
        'Olá! Antes de começar, escolha sua língua materna. Assim eu entendo seus erros típicos e explico no seu idioma.',
      ob_name: 'Boa, como você se chama? Quero te chamar pelo seu nome.',
      ob_level:
        'Você já sabe seu nível de inglês? Se não, tem um teste de nivelamento no botão de baixo. Escolha o mais próximo.',
      ob_teacher: 'Por último, escolha como eu falo. O modo misto é o mais fácil para começar.',
      room_how:
        'Bem-vindo à aula! Toque no microfone para falar, ou digite sua mensagem. Eu respondo e corrijo com calma.',
      phonics_hint: 'Toque numa letra para ouvir o som dela e ver onde ficam a língua e os lábios.',
      test_hint: 'Agora eu te escuto. Toque no microfone e diga esta palavra.',
      correct: 'Boa, acertou!',
      almost: 'Quase! Tente mais uma vez.',
      encourage: 'Eu sei que é difícil, mas a IA acredita em você. Sem pressa.',
    },
  },
}

const LETTERS = {
  a: 'ay', b: 'bee', c: 'see', d: 'dee', e: 'ee', f: 'eff', g: 'jee', h: 'aitch',
  i: 'eye', j: 'jay', k: 'kay', l: 'el', m: 'em', n: 'en', o: 'oh', p: 'pee',
  q: 'cue', r: 'are', s: 'ess', t: 'tee', u: 'you', v: 'vee', w: 'double you',
  x: 'ex', y: 'why', z: 'zee',
}

// The phonics SOUND each letter makes, then its example word.
const SOUNDS = {
  a: 'ah, apple', b: 'buh, ball', c: 'kuh, cat', d: 'duh, dog', e: 'eh, egg',
  f: 'fff, fish', g: 'guh, goat', h: 'huh, hat', i: 'ih, ink', j: 'juh, jam',
  k: 'kuh, kite', l: 'lll, leg', m: 'mmm, man', n: 'nnn, nose', o: 'aw, orange',
  p: 'puh, pen', q: 'kwuh, queen', r: 'rrr, red', s: 'sss, sun', t: 'tuh, tea',
  u: 'uh, up', v: 'vvv, van', w: 'wuh, wet', x: 'ks, box', y: 'yuh, yes', z: 'zzz, zoo',
}

async function exists(p) {
  try {
    await access(p)
    return true
  } catch {
    return false
  }
}

async function tts(text, voice, outPath, instructions) {
  if (!FORCE && (await exists(outPath))) {
    console.log('skip', outPath)
    return
  }
  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, voice, input: text, response_format: 'mp3', instructions }),
  })
  if (!res.ok) {
    console.error('FAIL', outPath, res.status, await res.text())
    return
  }
  const buf = Buffer.from(await res.arrayBuffer())
  await mkdir(dirname(outPath), { recursive: true })
  await writeFile(outPath, buf)
  console.log('ok', outPath, `${(buf.length / 1024).toFixed(1)}kb`)
}

for (const [lang, cfg] of Object.entries(NARRATION)) {
  for (const [key, text] of Object.entries(cfg.clips)) {
    await tts(text, cfg.voice, join(root, 'public', 'audio', 'narration', lang, `${key}.mp3`), instruct)
  }
}

for (const [key, text] of Object.entries(LETTERS)) {
  await tts(text, 'nova', join(root, 'public', 'audio', 'letters', `${key}.mp3`), 'Say the English letter name clearly and cheerfully, once.')
}

for (const [key, text] of Object.entries(SOUNDS)) {
  await tts(text, 'nova', join(root, 'public', 'audio', 'sounds', `${key}.mp3`), 'Say the letter sound clearly and briefly, then the word. Like a phonics teacher: "buh, ball".')
}

console.log('done')
