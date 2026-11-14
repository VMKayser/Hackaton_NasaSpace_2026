import { createContext, useContext } from 'react'
import { en } from './en'
import { es } from './es'

export type Lang = 'en' | 'es'
export type Key = keyof typeof en
export type Vars = Record<string, string | number>
export type TFn = (key: Key, vars?: Vars) => string

export const LANGS: Lang[] = ['en', 'es']

const dictionaries: Record<Lang, Record<Key, string>> = { en, es }

export function isLang(value: string | null): value is Lang {
  return value === 'en' || value === 'es'
}

export function translate(lang: Lang, key: Key, vars?: Vars): string {
  let text = dictionaries[lang][key]
  if (vars) {
    for (const [name, value] of Object.entries(vars)) text = text.replaceAll(`{${name}}`, String(value))
  }
  return text
}

export interface I18n {
  lang: Lang
  t: TFn
}

export const I18nContext = createContext<I18n>({
  lang: 'en',
  t: (key, vars) => translate('en', key, vars),
})

export function useI18n(): I18n {
  return useContext(I18nContext)
}
