'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Check, ChevronLeft, ChevronRight, Expand, Mic, Play, Sparkles, Volume2, X } from 'lucide-react'
import { Buddy, type BuddyLook } from '@/components/character/Buddy'
import { MouthDiagram } from '@/components/phonics/MouthDiagram'
import { LevelMeter } from '@/components/room/LevelMeter'
import { Whiteboard } from '@/components/room/Whiteboard'
import { CHARACTERS, LEVELS } from '@/lib/store/appStore'
import { CURRICULUM } from '@/lib/curriculum'

const TEACHER_LOOK: BuddyLook = { skin: '#F1C9A5', hair: '#9FB0F0', hairStyle: 'bun', outfit: '#E8856A', cheeks: '#F4A8C0' }
const LEVEL_TAGS = Object.keys(LEVELS) as (keyof typeof LEVELS)[]

type Screen = {
  id: string
  label: string
  kicker: string
  title: string
  body: string
  accent: string
  soft: string
}

const SCREENS: Screen[] = [
  { id: 'splash', label: 'Home', kicker: '01 · First impression', title: 'A warm start, not a login wall.', body: 'The wordmark, the promise, one clear action: start speaking.', accent: 'var(--color-grape)', soft: 'var(--color-grape-soft)' },
  { id: 'onboarding', label: 'Onboarding', kicker: '02 · Native language', title: 'Tuned to how you actually speak.', body: 'The learner picks their L1 so the teacher can target their real, predictable errors.', accent: 'var(--color-mint)', soft: 'var(--color-mint-soft)' },
  { id: 'level', label: 'Level', kicker: '03 · CEFR level', title: 'Everyone starts somewhere real.', body: 'A six-level self-select with a placement test for the unsure. Changeable any time.', accent: 'var(--color-sky)', soft: 'var(--color-sky-soft)' },
  { id: 'buddy', label: 'Buddy', kicker: '04 · Companion', title: 'A buddy who shows up with you.', body: 'Six original characters, drawn in-house. Pick the one who feels like a study partner.', accent: 'var(--color-peach)', soft: 'var(--color-peach-soft)' },
  { id: 'placement', label: 'Placement', kicker: '05 · Placement test', title: 'Twelve questions, one honest level.', body: 'An adaptive CEFR ladder that stops at your edge and hands back a shareable result.', accent: 'var(--color-lemon)', soft: 'var(--color-lemon-soft)' },
  { id: 'phonics', label: 'Phonics lab', kicker: '06 · Pronunciation', title: 'See the sound in your mouth.', body: 'Animated articulation diagrams show the jaw, tongue, and airflow for every sound.', accent: 'var(--color-bubblegum)', soft: 'var(--color-bubblegum-soft)' },
  { id: 'classroom', label: 'Classroom', kicker: '07 · The core loop', title: 'Speak. Get corrected. Go again.', body: 'The live classroom: voice in, a patient teacher out, and a running read on your delivery.', accent: 'var(--color-grape)', soft: 'var(--color-grape-soft)' },
  { id: 'whiteboard', label: 'Lesson', kicker: '08 · Curriculum', title: 'A path, not a chat box.', body: 'Each level ships a unit with clear grammar focus and vocabulary to reinforce.', accent: 'var(--color-mint)', soft: 'var(--color-mint-soft)' },
  { id: 'dialect', label: 'Dialect Lens', kicker: '09 · Superpower', title: 'Hear your own accent, then fix it.', body: 'A word is shown native, through your L1 ears, and with the exact motor fix.', accent: 'var(--color-sky)', soft: 'var(--color-sky-soft)' },
  { id: 'progress', label: 'Progress', kicker: '10 · Retention', title: 'Mistakes become your syllabus.', body: 'XP, streaks, and a Mistake Bank that remembers what deserves another try.', accent: 'var(--color-bubblegum)', soft: 'var(--color-bubblegum-soft)' },
]

function TopBar() {
  return <div className="gallery-screen-top"><span>9:41</span><span>•••</span></div>
}

function ScreenContent({ id, accent, soft }: { id: string; accent: string; soft: string }) {
  const vars = { '--screen-accent': accent, '--screen-soft': soft } as React.CSSProperties

  if (id === 'splash') {
    return (
      <div className="gallery-screen gallery-splash" style={vars}>
        <TopBar />
        <div className="gallery-blob blob-a" />
        <div className="gallery-blob blob-b" />
        <div className="gallery-splash-inner">
          <span className="gallery-splash-badge"><Sparkles size={13} /> Guru AI yang sabar banget</span>
          <h3 className="gallery-splash-word">Say So</h3>
          <p className="gallery-splash-sub">(Speak out loud)</p>
          <p className="gallery-splash-body">Ngobrol langsung sama guru AI, dikoreksi tanpa bikin malu. Dari B1 sampai C2. Lu bisa, kok.</p>
          <span className="gallery-primary-control">Mulai, Gas! <ArrowRight size={15} /></span>
        </div>
      </div>
    )
  }

  if (id === 'onboarding') {
    return (
      <div className="gallery-screen gallery-onboarding" style={vars}>
        <TopBar />
        <small className="gallery-eyebrow">STEP 1 · BAHASA IBU</small>
        <h3 className="gallery-screen-title">Bahasa ibumu apa?</h3>
        <p className="gallery-screen-lead">Biar gurunya ngerti kesalahan khas yang kamu alami.</p>
        <div className="gallery-opt-list">
          <div className="gallery-opt active"><span className="gallery-flag">🇮🇩</span><div><strong>Bahasa Indonesia</strong><small>vokal, th, akhiran kata</small></div><Check size={16} /></div>
          <div className="gallery-opt"><span className="gallery-flag">🇪🇸</span><div><strong>Español</strong><small>/b/ vs /v/, s-awalan</small></div></div>
          <div className="gallery-opt"><span className="gallery-flag">🇧🇷</span><div><strong>Português</strong><small>akhiran, nasal, /θ/</small></div></div>
        </div>
        <div className="gallery-stepdots"><i className="on" /><i /><i /><i /></div>
      </div>
    )
  }

  if (id === 'level') {
    return (
      <div className="gallery-screen gallery-level" style={vars}>
        <TopBar />
        <small className="gallery-eyebrow">STEP 3 · LEVEL</small>
        <h3 className="gallery-screen-title">Levelmu di mana?</h3>
        <p className="gallery-screen-lead">Pilih yang paling dekat, nanti bisa diubah.</p>
        <div className="gallery-level-chips">
          {LEVEL_TAGS.map((code) => (
            <span key={code} className={`gallery-level-chip ${code === 'B1' ? 'active' : ''}`}>
              <strong>{code}</strong>
            </span>
          ))}
        </div>
        <div className="gallery-level-note">
          <strong>{LEVELS.B1.name}</strong>
          <small>{LEVELS.B1.tagline}</small>
        </div>
        <span className="gallery-primary-control">Lanjut <ArrowRight size={15} /></span>
      </div>
    )
  }

  if (id === 'buddy') {
    return (
      <div className="gallery-screen gallery-buddy" style={vars}>
        <TopBar />
        <small className="gallery-eyebrow">STEP 4 · BUDDY</small>
        <h3 className="gallery-screen-title">Pilih buddy kamu</h3>
        <div className="gallery-buddy-grid">
          {CHARACTERS.slice(0, 4).map((c, i) => (
            <div key={c.id} className={`gallery-buddy-card ${i === 1 ? 'active' : ''}`}>
              <div className="gallery-buddy-svg"><Buddy look={c.look} /></div>
              <span>{c.name}</span>
            </div>
          ))}
        </div>
        <span className="gallery-primary-control">Masuk Kelas <ArrowRight size={15} /></span>
      </div>
    )
  }

  if (id === 'placement') {
    return (
      <div className="gallery-screen gallery-placement" style={vars}>
        <TopBar />
        <small className="gallery-eyebrow">CEFR PLACEMENT</small>
        <div className="gallery-placement-card">
          <span className="gallery-placement-meta">B1 · Soal 1 dari 2</span>
          <p className="gallery-placement-q">Choose the correct sentence:</p>
          <div className="gallery-answer active"><Check size={15} /> I have lived here for three years.</div>
          <div className="gallery-answer">I am living here since three years.</div>
        </div>
        <div className="gallery-progress-line"><span /><span /><span /><span /><span /></div>
        <div className="gallery-placement-result"><span>B1</span><div><strong>Perkiraan level</strong><small>Keyakinan: Tinggi · 7/8 benar</small></div></div>
      </div>
    )
  }

  if (id === 'phonics') {
    return (
      <div className="gallery-screen gallery-phonics" style={vars}>
        <TopBar />
        <small className="gallery-eyebrow">PHONICS LAB · SOUND 07</small>
        <h3 className="gallery-screen-title">/ʃ/ as in <em>she</em></h3>
        <div className="gallery-mouth-wrap"><MouthDiagram artic="lips-round" voiced={false} lang="id" className="w-full" /></div>
        <p className="gallery-phonics-tip"><Sparkles size={13} /> Bulatkan bibir, tarik lidah ke belakang.</p>
        <span className="gallery-primary-control"><Play size={13} fill="currentColor" /> Dengar bunyi target</span>
      </div>
    )
  }

  if (id === 'classroom') {
    return (
      <div className="gallery-screen gallery-classroom" style={vars}>
        <TopBar />
        <div className="gallery-room-bg" />
        <div className="gallery-room-hud">
          <span>B1 · Everyday Communication</span>
          <span>ID + EN</span>
        </div>
        <div className="gallery-teacher-box"><Buddy look={TEACHER_LOOK} expression="happy" talking /></div>
        <div className="gallery-chat gallery-chat-left">Coba ulangi: <b>I’ve been learning English for a year.</b></div>
        <div className="gallery-chat gallery-chat-right">I have been learning English for a year.</div>
        <div className="gallery-classroom-footer">
          <LevelMeter label="Suaramu" />
          <button className="gallery-mic-btn" aria-hidden tabIndex={-1}><Mic size={20} /></button>
        </div>
      </div>
    )
  }

  if (id === 'whiteboard') {
    return (
      <div className="gallery-screen gallery-whiteboard" style={vars}>
        <TopBar />
        <small className="gallery-eyebrow">TODAY&apos;S LESSON</small>
        <div className="gallery-wb-wrap"><Whiteboard level="B1" unit={CURRICULUM.B1} /></div>
        <p className="gallery-wb-hint"><Volume2 size={13} /> Guru membahas tiap poin, lalu kamu praktik ngomong.</p>
      </div>
    )
  }

  if (id === 'dialect') {
    return (
      <div className="gallery-screen gallery-dialect" style={vars}>
        <TopBar />
        <small className="gallery-eyebrow">DIALECT LENS</small>
        <h3 className="gallery-screen-title">Dengar lewat telinga L1-mu.</h3>
        <div className="gallery-track gallery-track-active"><span>A</span><div><strong>Asli (native)</strong><small>/ʃiː/ · she</small></div></div>
        <div className="gallery-track"><span>B</span><div><strong>Perkiraan telingamu</strong><small>terdengar &ldquo;see&rdquo; /siː/</small></div></div>
        <div className="gallery-track"><span>C</span><div><strong>Cara memperbaiki</strong><small>bulatkan bibir, tarik lidah</small></div></div>
        <div className="gallery-evidence">Bukti aturan: /ʃ/ → /s/ untuk penutur Indonesia</div>
      </div>
    )
  }

  return (
    <div className="gallery-screen gallery-progress-home" style={vars}>
      <TopBar />
      <small className="gallery-eyebrow">PROGRESS · B1</small>
      <h3 className="gallery-screen-title">Brankas Kesalahan</h3>
      <div className="gallery-stat-row">
        <div><strong>12</strong><small>day streak</small></div>
        <div><strong>320</strong><small>XP</small></div>
        <div><strong>07</strong><small>mistakes</small></div>
      </div>
      <div className="gallery-mistake-row"><span className="gallery-ipa">/θ/</span><div><strong>think · three</strong><small>tongue between teeth</small></div><Volume2 size={15} /></div>
      <div className="gallery-mistake-row"><span className="gallery-ipa">/ɪ/</span><div><strong>ship · live</strong><small>short relaxed vowel</small></div><Volume2 size={15} /></div>
      <div className="gallery-streak"><Sparkles size={15} /> Tiga kemenangan kecil jadi kebiasaan.</div>
    </div>
  )
}

function Phone({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`gallery-device ${className ?? ''}`}>
      <div className="gallery-device-speaker" />
      <div className="gallery-device-content">{children}</div>
    </div>
  )
}

export function MediaGallery() {
  const [selected, setSelected] = useState(0)
  const [viewerOpen, setViewerOpen] = useState(false)
  const screen = SCREENS[selected]

  function move(direction: number) {
    setSelected((current) => (current + direction + SCREENS.length) % SCREENS.length)
  }

  return (
    <main className="gallery-shell" style={{ '--gallery-accent': screen.accent } as React.CSSProperties}>
      <div className="gallery-noise" />

      <header className="gallery-header">
        <Link href="/" className="gallery-brand"><Image src="/logo.png" alt="Say So" width={40} height={40} priority unoptimized /><span>Say So</span></Link>
        <div className="gallery-header-note"><span className="gallery-live-dot" /> Product walkthrough · 2026</div>
        <Link href="/onboarding" className="gallery-header-cta">Try the experience <ArrowRight size={15} /></Link>
      </header>

      <section className="gallery-intro">
        <div className="gallery-intro-copy">
          <p className="gallery-kicker"><Sparkles size={14} /> A voice-first English classroom</p>
          <h1>The product,<br /><em>screen by screen.</em></h1>
          <p className="gallery-lede">Every surface of Say So, from the first hello to the Mistake Bank. Built for the moment English leaves your head and has to come out of your mouth.</p>
          <div className="gallery-proof"><div className="gallery-proof-avatars"><span>S</span><span>A</span><span>R</span><span>+</span></div><span>10 screens · 3 languages · live in your browser</span></div>
        </div>
        <div className="gallery-feature-rail">
          <span className="gallery-rail-label">Featured screen</span>
          <div className="gallery-rail-line" />
          <span className="gallery-rail-count">0{selected + 1} / {SCREENS.length < 10 ? '0' : ''}{SCREENS.length}</span>
        </div>
      </section>

      <section className="gallery-stage" aria-label="Featured Say So screen">
        <div className="gallery-stage-copy">
          <AnimatePresence mode="wait">
            <motion.div key={screen.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.24 }}>
              <p className="gallery-slide-eyebrow">{screen.kicker}</p>
              <h2>{screen.title}</h2>
              <p>{screen.body}</p>
              <span className="gallery-slide-tag" style={{ background: screen.soft, color: screen.accent }}>{screen.label}</span>
            </motion.div>
          </AnimatePresence>
          <div className="gallery-controls">
            <button onClick={() => move(-1)} aria-label="Previous screen"><ChevronLeft size={18} /></button>
            <button onClick={() => move(1)} aria-label="Next screen"><ChevronRight size={18} /></button>
            <button className="gallery-expand" onClick={() => setViewerOpen(true)}><Expand size={16} /> View large</button>
          </div>
        </div>
        <div className="gallery-device-wrap">
          <div className="gallery-device-shadow" />
          <AnimatePresence mode="wait">
            <motion.div key={screen.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} transition={{ duration: 0.28 }}>
              <Phone><ScreenContent id={screen.id} accent={screen.accent} soft={screen.soft} /></Phone>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <section className="gallery-catalog" aria-label="All Say So screens">
        <div className="gallery-catalog-head">
          <h2>Every screen worth showing</h2>
          <p>The full surface area of the prototype. Tap any screen to feature it above.</p>
        </div>
        <div className="gallery-catalog-grid">
          {SCREENS.map((item, index) => (
            <button key={item.id} className={`gallery-catalog-item ${selected === index ? 'active' : ''}`} onClick={() => setSelected(index)} aria-pressed={selected === index}>
              <div className="gallery-mini"><div className="gallery-screen-wrap" style={{ '--screen-accent': item.accent, '--screen-soft': item.soft } as React.CSSProperties}><ScreenContent id={item.id} accent={item.accent} soft={item.soft} /></div></div>
              <div className="gallery-catalog-caption"><span className="gallery-catalog-no">{String(index + 1).padStart(2, '0')}</span><div><strong>{item.label}</strong><small>{item.kicker.split('· ')[1]}</small></div></div>
            </button>
          ))}
        </div>
      </section>

      <footer className="gallery-footer">
        <span>Say So is a hackathon prototype by Muhammad Kafi Rizki.</span>
        <div><span>English learning, reimagined</span><Link href="/onboarding">Start learning <ArrowRight size={14} /></Link></div>
      </footer>

      <AnimatePresence>
        {viewerOpen && (
          <motion.div className="gallery-viewer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label="Large screen preview">
            <button className="gallery-viewer-close" onClick={() => setViewerOpen(false)} aria-label="Close preview"><X size={20} /></button>
            <div className="gallery-viewer-copy">
              <p>{screen.kicker}</p>
              <h2>{screen.title}</h2>
              <span>{screen.label}</span>
            </div>
            <div className="gallery-viewer-device"><Phone><ScreenContent id={screen.id} accent={screen.accent} soft={screen.soft} /></Phone></div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
