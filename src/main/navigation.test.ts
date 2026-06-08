import { describe, expect, it } from 'vitest'
import { resolveNavigationInput } from './navigation'

describe('resolveNavigationInput', () => {
  it('keeps complete URLs intact', () => {
    expect(resolveNavigationInput('https://example.com/path', 'google')).toBe(
      'https://example.com/path'
    )
  })

  it('adds HTTPS to hostnames', () => {
    expect(resolveNavigationInput('example.com', 'google')).toBe('https://example.com/')
  })

  it('uses Google by default for searches', () => {
    expect(resolveNavigationInput('liquid glass browser', 'google')).toBe(
      'https://www.google.com/search?q=liquid%20glass%20browser'
    )
  })

  it('supports alternate search engines', () => {
    expect(resolveNavigationInput('privacy browser', 'duckduckgo')).toBe(
      'https://duckduckgo.com/?q=privacy%20browser'
    )
  })

  it('recognizes Liquea internal pages', () => {
    expect(resolveNavigationInput('liquea://settings', 'google')).toBe('liquea://settings')
  })
})
