import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const audioFile = formData.get('audio') as File

  if (!audioFile) {
    return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
  }

  // Preserve the real container: OpenAI detects format by file extension.
  const type = audioFile.type || ''
  const ext = type.includes('mp3') || type.includes('mpeg')
    ? 'mp3'
    : type.includes('wav')
      ? 'wav'
      : type.includes('ogg')
        ? 'ogg'
        : type.includes('mp4') || type.includes('m4a')
          ? 'm4a'
          : 'webm'

  const upstreamForm = new FormData()
  upstreamForm.append('file', audioFile, `audio.${ext}`)
  upstreamForm.append('model', process.env.STT_MODEL ?? process.env.AI_WHISPER_MODEL ?? 'whisper-1')
  upstreamForm.append('response_format', 'json')
  // Bias the recognizer toward English — this is an English-learning app
  upstreamForm.append('language', 'en')

  const baseUrl = (process.env.STT_BASE_URL ?? process.env.AI_BASE_URL ?? 'https://api.openai.com/v1').replace(/\/$/, '')
  const apiKey = process.env.STT_API_KEY ?? process.env.AI_API_KEY ?? process.env.OPENAI_API_KEY ?? ''

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
