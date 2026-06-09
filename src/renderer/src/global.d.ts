import type { BrowserAPI } from '../../shared/types'

declare global {
  interface Window {
    liqueia: BrowserAPI
  }
}

export {}
