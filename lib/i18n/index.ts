import type { NativeLang } from '@/lib/store/appStore'
import type { LocaleBundle } from './types'
import { id } from './locales/id'
import { es } from './locales/es'
import { pt } from './locales/pt'

export const LOCALES: Record<NativeLang, LocaleBundle> = { id, es, pt }

export const LOCALE_LIST: LocaleBundle[] = [id, es, pt]

export function getLocale(lang: NativeLang | null | undefined): LocaleBundle {
  return LOCALES[lang ?? 'id'] ?? id
}

/** Replace {token} placeholders in a locale string. */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? `{${key}}`))
}

export type { LocaleBundle, PhoneticItem, PhoneticPack, UIStrings, AnatomyState } from './types'
