import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const audioFile = formData.get('audio') as File

  if (!audioFile) {
    return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
  }

  const upstreamForm = new FormData()
  upstreamForm.append('file', audioFile, 'audio.webm')
  upstreamForm.append('model', process.env.AI_WHISPER_MODEL ?? process.env.OPENAI_WHISPER_MODEL ?? 'whisper-1')
  upstreamForm.append('response_format', 'json')
  // Bias the recognizer toward English — this is an English-learning app
  upstreamForm.append('language', 'en')

  const baseUrl = (process.env.AI_BASE_URL ?? process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1').replace(/\/$/, '')
  const apiKey = process.env.AI_API_KEY ?? process.env.OPENAI_API_KEY ?? ''

  const response = await fetch(`${baseUrl}/audio/transcriptions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: upstreamForm,
  }).catch((e) => {
    console.error('API_TRANSCRIBE: Fetch failed', e)
    throw e
  })

  if (!response.ok) {
    const err = await response.text()
    console.error('API_TRANSCRIBE: Upstream error', { status: response.status, details: err })
    return NextResponse.json({ error: 'Transcription failed', details: err }, { status: response.status })
  }

  const result = await response.json()
  return NextResponse.json({ text: result.text ?? '' })
}
