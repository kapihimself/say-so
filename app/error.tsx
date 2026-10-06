'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('App error:', error)
  }, [error])

  return (
    <main className="grid min-h-screen place-items-center px-6">
      <div className="max-w-md rounded-[2rem] bg-white p-8 text-center doodle-outline doodle-shadow">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[var(--color-bubblegum-soft)] doodle-outline">
          <span className="text-2xl">🛠️</span>
        </div>
        <h2 className="mt-4 text-2xl font-black">Ups, ada yang error</h2>
        <p className="mt-2 text-sm font-semibold text-[var(--color-muted-warm)]">
          Something went wrong · Algo salió mal · Algo deu errado
        </p>
        <button
          onClick={reset}
          className="doodle-btn mt-6 inline-flex items-center justify-center bg-[var(--color-grape)] px-6 py-3 font-extrabold text-white"
        >
          Coba lagi · Retry
        </button>
      </div>
    </main>
  )
}
