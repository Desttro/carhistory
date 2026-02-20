import { describe, expect, test } from 'vitest'

import { cldrCardinal } from '~/i18n/plural'

describe('cldrCardinal', () => {
  test('zh: always other', () => {
    expect(cldrCardinal('zh', 0)).toBe('other')
    expect(cldrCardinal('zh', 1)).toBe('other')
    expect(cldrCardinal('zh', 5)).toBe('other')
    expect(cldrCardinal('zh', 100)).toBe('other')
  })

  test('en: one for integer 1, other otherwise', () => {
    expect(cldrCardinal('en', 1)).toBe('one')
    expect(cldrCardinal('en', 0)).toBe('other')
    expect(cldrCardinal('en', 2)).toBe('other')
    expect(cldrCardinal('en', 1.5)).toBe('other')
    expect(cldrCardinal('en', 21)).toBe('other')
  })

  test('de: one for integer 1, other otherwise', () => {
    expect(cldrCardinal('de', 1)).toBe('one')
    expect(cldrCardinal('de', 0)).toBe('other')
    expect(cldrCardinal('de', 2)).toBe('other')
  })

  test('it: one for integer 1, other otherwise', () => {
    expect(cldrCardinal('it', 1)).toBe('one')
    expect(cldrCardinal('it', 0)).toBe('other')
    expect(cldrCardinal('it', 3)).toBe('other')
  })

  test('es: one for integer 1, other otherwise', () => {
    expect(cldrCardinal('es', 1)).toBe('one')
    expect(cldrCardinal('es', 0)).toBe('other')
    expect(cldrCardinal('es', 2)).toBe('other')
  })

  test('fr: one for 0 and 1', () => {
    expect(cldrCardinal('fr', 0)).toBe('one')
    expect(cldrCardinal('fr', 1)).toBe('one')
    expect(cldrCardinal('fr', 0.5)).toBe('one')
    expect(cldrCardinal('fr', 2)).toBe('other')
    expect(cldrCardinal('fr', 100)).toBe('other')
  })

  test('ru: one/few/many/other', () => {
    expect(cldrCardinal('ru', 1)).toBe('one')
    expect(cldrCardinal('ru', 21)).toBe('one')
    expect(cldrCardinal('ru', 101)).toBe('one')
    expect(cldrCardinal('ru', 2)).toBe('few')
    expect(cldrCardinal('ru', 3)).toBe('few')
    expect(cldrCardinal('ru', 4)).toBe('few')
    expect(cldrCardinal('ru', 22)).toBe('few')
    expect(cldrCardinal('ru', 0)).toBe('many')
    expect(cldrCardinal('ru', 5)).toBe('many')
    expect(cldrCardinal('ru', 11)).toBe('many')
    expect(cldrCardinal('ru', 12)).toBe('many')
    expect(cldrCardinal('ru', 14)).toBe('many')
    expect(cldrCardinal('ru', 111)).toBe('many')
    expect(cldrCardinal('ru', 1.5)).toBe('other')
  })

  test('pl: one/few/many/other', () => {
    expect(cldrCardinal('pl', 1)).toBe('one')
    expect(cldrCardinal('pl', 2)).toBe('few')
    expect(cldrCardinal('pl', 3)).toBe('few')
    expect(cldrCardinal('pl', 4)).toBe('few')
    expect(cldrCardinal('pl', 22)).toBe('few')
    expect(cldrCardinal('pl', 0)).toBe('many')
    expect(cldrCardinal('pl', 5)).toBe('many')
    expect(cldrCardinal('pl', 10)).toBe('many')
    expect(cldrCardinal('pl', 11)).toBe('many')
    expect(cldrCardinal('pl', 12)).toBe('many')
    expect(cldrCardinal('pl', 112)).toBe('many')
    expect(cldrCardinal('pl', 1.5)).toBe('other')
  })

  test('cs: one/few/many/other', () => {
    expect(cldrCardinal('cs', 1)).toBe('one')
    expect(cldrCardinal('cs', 2)).toBe('few')
    expect(cldrCardinal('cs', 3)).toBe('few')
    expect(cldrCardinal('cs', 4)).toBe('few')
    expect(cldrCardinal('cs', 0)).toBe('other')
    expect(cldrCardinal('cs', 5)).toBe('other')
    expect(cldrCardinal('cs', 100)).toBe('other')
    expect(cldrCardinal('cs', 1.5)).toBe('many')
    expect(cldrCardinal('cs', 2.3)).toBe('many')
  })

  test('ar: zero/one/two/few/many/other', () => {
    expect(cldrCardinal('ar', 0)).toBe('zero')
    expect(cldrCardinal('ar', 1)).toBe('one')
    expect(cldrCardinal('ar', 2)).toBe('two')
    expect(cldrCardinal('ar', 3)).toBe('few')
    expect(cldrCardinal('ar', 7)).toBe('few')
    expect(cldrCardinal('ar', 10)).toBe('few')
    expect(cldrCardinal('ar', 103)).toBe('few')
    expect(cldrCardinal('ar', 11)).toBe('many')
    expect(cldrCardinal('ar', 99)).toBe('many')
    expect(cldrCardinal('ar', 111)).toBe('many')
    expect(cldrCardinal('ar', 100)).toBe('other')
    expect(cldrCardinal('ar', 200)).toBe('other')
  })

  test('unknown locale falls back to other', () => {
    expect(cldrCardinal('xx', 1)).toBe('other')
    expect(cldrCardinal('xx', 0)).toBe('other')
  })

  test('handles locale with region subtag', () => {
    expect(cldrCardinal('en-US', 1)).toBe('one')
    expect(cldrCardinal('en-US', 2)).toBe('other')
    expect(cldrCardinal('fr-CA', 0)).toBe('one')
    expect(cldrCardinal('fr-CA', 2)).toBe('other')
  })
})
