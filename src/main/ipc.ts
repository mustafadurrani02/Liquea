import { ipcMain, shell } from 'electron'
import type { BrowserSettings, ClearDataOptions, InternalPage } from '../shared/types'
import type { BrowserController } from './browser'

export function registerIpc(controller: BrowserController): void {
  ipcMain.handle('browser:get-snapshot', () => controller.snapshot())
  ipcMain.handle('browser:create-tab', (_event, url?: string) => controller.createTab(url))
  ipcMain.handle('browser:close-tab', (_event, id: string) => controller.closeTab(id))
  ipcMain.handle('browser:activate-tab', (_event, id: string) => controller.activateTab(id))
  ipcMain.handle('browser:duplicate-tab', (_event, id: string) => controller.duplicateTab(id))
  ipcMain.handle('browser:reopen-closed-tab', () => controller.reopenClosedTab())
  ipcMain.handle('browser:navigate', (_event, id: string, input: string) =>
    controller.navigate(id, input)
  )
  ipcMain.handle('browser:back', (_event, id: string) => controller.goBack(id))
  ipcMain.handle('browser:forward', (_event, id: string) => controller.goForward(id))
  ipcMain.handle('browser:reload', (_event, id: string) => controller.reload(id))
  ipcMain.handle('browser:stop', (_event, id: string) => controller.stop(id))
  ipcMain.handle('browser:home', (_event, id: string) => controller.goHome(id))
  ipcMain.handle('browser:open-internal', (_event, page: InternalPage) =>
    controller.openInternalPage(page)
  )
  ipcMain.handle('browser:toggle-bookmark', (_event, id: string) =>
    controller.toggleBookmark(id)
  )
  ipcMain.handle('browser:remove-bookmark', (_event, id: string) =>
    controller.removeBookmark(id)
  )
  ipcMain.handle('browser:update-settings', (_event, patch: Partial<BrowserSettings>) =>
    controller.updateSettings(patch)
  )
  ipcMain.handle('browser:clear-data', (_event, options: ClearDataOptions) =>
    controller.clearBrowsingData(options)
  )
  ipcMain.handle('browser:show-download', (_event, id: string) => controller.showDownload(id))
  ipcMain.handle('browser:set-chrome-overlay', (_event, visible: boolean) =>
    controller.setChromeOverlay(visible)
  )
  ipcMain.handle('browser:set-focus-mode', (_event, enabled: boolean) =>
    controller.setFocusMode(enabled)
  )
  ipcMain.handle('browser:open-external', (_event, url: string) => shell.openExternal(url))
}
