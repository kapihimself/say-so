/**
 * Tiny shared signal for "how loud is the voice right now" (0..1).
 *
 * Written by the audio analyser at animation-frame rate and read inside
 * react-three-fiber's useFrame. Kept outside React state on purpose so the
 * mouth can follow the audio at 60fps without re-rendering the tree.
 */
export const talkLevel = {
  /** smoothed amplitude, 0..1 */
  value: 0,
  /** true while a voice (TTS or mic) is producing sound */
  active: false,
  /** raw frequency-band energies, 0..1 each, low -> high */
  bands: [0, 0, 0, 0, 0, 0, 0, 0] as number[],
}

export function resetTalkLevel() {
  talkLevel.value = 0
  talkLevel.active = false
  for (let i = 0; i < talkLevel.bands.length; i++) talkLevel.bands[i] = 0
}
