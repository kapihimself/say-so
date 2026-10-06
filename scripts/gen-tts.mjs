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
        'Selamat datang di Bising! Pilih bahasa ibumu dulu, biar gurunya ngerti kesalahan khas yang kamu alami. Tekan salah satu pilihan, lalu lanjut.',
      ob_name: 'Sekarang tulis namamu. Nanti gurunya manggil kamu pakai nama ini.',
      ob_level:
        'Pilih levelmu. Kalau bingung, tekan tombol tes penempatan — cuma dua belas soal singkat, levelmu nanti terisi otomatis.',
      ob_teacher: 'Terakhir, pilih cara gurunya ngomong. Mode campur paling enak buat memulai.',
      room_how:
        'Selamat datang di kelas! Tekan tombol mic buat ngomong, atau ketik pesanmu. Guru bakal jawab sambil membetulkan pelan-pelan.',
      welcome_a1:
        'Selamat datang di Bising! Ini kelas English level A satu. Kita belajar phonics dulu ya, gimana cara menyebutkan bunyi huruf dalam bahasa Inggris.',
      phonics_hint: 'Ketuk huruf untuk dengar bunyinya dalam bahasa Inggris.',
      test_hint: 'Tekan mic, lalu ucapkan kata ini dengan lantang.',
      correct: 'Mantap, benar!',
      almost: 'Hampir! Coba lagi ya.',
      encourage: 'Aku tahu ini berat, tapi AI percaya kamu bisa!',
    },
  },
  es: {
    voice: 'nova',
    clips: {
      ob_lang:
        '¡Bienvenido a Bising! Elige tu lengua materna para que el profe entienda tus errores típicos. Toca una opción y sigue.',
      ob_name: 'Ahora escribe tu nombre. El profe te llamará así.',
      ob_level:
        'Elige tu nivel. Si no estás seguro, toca la prueba de nivel: son solo doce preguntas cortas y tu nivel se rellena solo.',
      ob_teacher: 'Por último, elige cómo quieres que hable el profe. El modo mixto es el más fácil para empezar.',
      room_how:
        '¡Bienvenido a clase! Pulsa el micro para hablar, o escribe tu mensaje. El profe responderá y te corregirá con calma.',
      welcome_a1:
        '¡Bienvenido a Bising! Esta es la clase de inglés nivel A uno. Empezamos con fonética: cómo se pronuncian las letras en inglés.',
      phonics_hint: 'Toca una letra para oír su sonido en inglés.',
      test_hint: 'Pulsa el micro y di esta palabra en voz alta.',
      correct: '¡Genial, correcto!',
      almost: '¡Casi! Inténtalo otra vez.',
      encourage: 'Sé que es difícil, ¡pero la IA cree en ti!',
    },
  },
  pt: {
    voice: 'shimmer',
    clips: {
      ob_lang:
        'Bem-vindo ao Bising! Escolha sua língua materna para o professor entender seus erros típicos. Toque numa opção e avance.',
      ob_name: 'Agora escreva seu nome. O professor vai te chamar assim.',
      ob_level:
        'Escolha seu nível. Na dúvida, toque no teste de nivelamento: são só doze perguntas curtas e seu nível é preenchido sozinho.',
      ob_teacher: 'Por último, escolha como o professor deve falar. O modo misto é o mais fácil para começar.',
      room_how:
        'Bem-vindo à aula! Toque no microfone para falar, ou digite sua mensagem. O professor responde e corrige com calma.',
      welcome_a1:
        'Bem-vindo ao Bising! Esta é a aula de inglês nível A um. Vamos começar pela fonética: como se pronunciam as letras em inglês.',
      phonics_hint: 'Toque numa letra para ouvir o som dela em inglês.',
      test_hint: 'Toque no microfone e diga esta palavra em voz alta.',
      correct: 'Boa, acertou!',
      almost: 'Quase! Tente de novo.',
      encourage: 'Eu sei que é difícil, mas a IA acredita em você!',
    },
  },
}

// English letter names, spelled so TTS says them naturally.
const LETTERS = {
  a: 'ay', b: 'bee', c: 'see', d: 'dee', e: 'ee', f: 'eff', g: 'jee', h: 'aitch',
  i: 'eye', j: 'jay', k: 'kay', l: 'el', m: 'em', n: 'en', o: 'oh', p: 'pee',
  q: 'cue', r: 'are', s: 'ess', t: 'tee', u: 'you', v: 'vee', w: 'double you',
  x: 'ex', y: 'why', z: 'zee',
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

console.log('done')
