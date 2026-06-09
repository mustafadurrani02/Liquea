import { contextBridge, ipcRenderer } from 'electron'
import type {
  BrowserAPI,
  BrowserSettings,
  BrowserSnapshot,
  ClearDataOptions,
  InternalPage
} from '../shared/types'

const api: BrowserAPI = {
  getSnapshot: () => ipcRenderer.invoke('browser:get-snapshot'),
  createTab: (url?: string) => ipcRenderer.invoke('browser:create-tab', url),
  closeTab: (id: string) => ipcRenderer.invoke('browser:close-tab', id),
  activateTab: (id: string) => ipcRenderer.invoke('browser:activate-tab', id),
  duplicateTab: (id: string) => ipcRenderer.invoke('browser:duplicate-tab', id),
  reopenClosedTab: () => ipcRenderer.invoke('browser:reopen-closed-tab'),
  navigate: (id: string, input: string) => ipcRenderer.invoke('browser:navigate', id, input),
  goBack: (id: string) => ipcRenderer.invoke('browser:back', id),
  goForward: (id: string) => ipcRenderer.invoke('browser:forward', id),
  reload: (id: string) => ipcRenderer.invoke('browser:reload', id),
  stop: (id: string) => ipcRenderer.invoke('browser:stop', id),
  goHome: (id: string) => ipcRenderer.invoke('browser:home', id),
  openInternalPage: (page: InternalPage) => ipcRenderer.invoke('browser:open-internal', page),
  toggleBookmark: (id: string) => ipcRenderer.invoke('browser:toggle-bookmark', id),
  removeBookmark: (id: string) => ipcRenderer.invoke('browser:remove-bookmark', id),
  updateSettings: (settings: Partial<BrowserSettings>) =>
    ipcRenderer.invoke('browser:update-settings', settings),
  clearBrowsingData: (options: ClearDataOptions) =>
    ipcRenderer.invoke('browser:clear-data', options),
  showDownload: (id: string) => ipcRenderer.invoke('browser:show-download', id),
  setChromeOverlay: (visible: boolean) => ipcRenderer.invoke('browser:set-chrome-overlay', visible),
  setFocusMode: (enabled: boolean) => ipcRenderer.invoke('browser:set-focus-mode', enabled),
  openExternal: (url: string) => ipcRenderer.invoke('browser:open-external', url),
  onSnapshot: (callback: (snapshot: BrowserSnapshot) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, snapshot: BrowserSnapshot): void =>
      callback(snapshot)
    ipcRenderer.on('browser:snapshot', listener)
    return () => ipcRenderer.removeListener('browser:snapshot', listener)
  },
  onFind: (callback: () => void) => {
    const listener = (): void => callback()
    ipcRenderer.on('browser:find', listener)
    return () => ipcRenderer.removeListener('browser:find', listener)
  }
}

contextBridge.exposeInMainWorld('liqueia', api)
