import type { BrowserAPI } from '../../shared/types'

declare global {
  interface Window {
    liquea: BrowserAPI
  }
}

export {}
