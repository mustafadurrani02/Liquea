import Store from 'electron-store'
import {
  DEFAULT_SETTINGS,
  type Bookmark,
  type BrowserSettings,
  type DownloadItem,
  type HistoryEntry
} from '../shared/types'

interface StoreSchema {
  settings: BrowserSettings
  bookmarks: Bookmark[]
  history: HistoryEntry[]
  downloads: DownloadItem[]
}

export class BrowserStore {
  private readonly store = new Store<StoreSchema>({
    defaults: {
      settings: DEFAULT_SETTINGS,
      bookmarks: [],
      history: [],
      downloads: []
    }
  })

  get settings(): BrowserSettings {
    return { ...DEFAULT_SETTINGS, ...this.store.get('settings') }
  }

  updateSettings(patch: Partial<BrowserSettings>): BrowserSettings {
    const settings = { ...this.settings, ...patch }
    this.store.set('settings', settings)
    return settings
  }

  get bookmarks(): Bookmark[] {
    return this.store.get('bookmarks')
  }

  set bookmarks(value: Bookmark[]) {
    this.store.set('bookmarks', value)
  }

  get history(): HistoryEntry[] {
    return this.store.get('history')
  }

  addHistory(entry: HistoryEntry): void {
    const recent = this.history.filter((item) => item.url !== entry.url)
    this.store.set('history', [entry, ...recent].slice(0, 2000))
  }

  clearHistory(): void {
    this.store.set('history', [])
  }

  get downloads(): DownloadItem[] {
    return this.store.get('downloads')
  }

  set downloads(value: DownloadItem[]) {
    this.store.set('downloads', value.slice(0, 200))
  }
}
