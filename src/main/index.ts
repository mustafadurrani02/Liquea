import { BrowserWindow, Menu, app, nativeTheme } from 'electron'
import { join } from 'node:path'
import { BrowserController } from './browser'
import { registerIpc } from './ipc'

let mainWindow: BrowserWindow | null = null
let controller: BrowserController | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 960,
    minHeight: 640,
    title: 'Liquea',
    backgroundColor: '#0b0c11',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 20, y: 18 },
    vibrancy: 'under-window',
    visualEffectState: 'active',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false
    }
  })

  controller = new BrowserController(mainWindow)
  registerIpc(controller)
  installMenu(controller)

  if (process.env.ELECTRON_RENDERER_URL) {
    void mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    void mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.webContents.once('did-finish-load', () => {
    void controller?.initialize()
  })
  mainWindow.on('closed', () => {
    mainWindow = null
    controller = null
  })
}

function installMenu(browser: BrowserController): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'Liquea',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => void browser.openInternalPage('settings')
        },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'File',
      submenu: [
        {
          label: 'New Tab',
          accelerator: 'CmdOrCtrl+T',
          click: () => void browser.createTab()
        },
        {
          label: 'Close Tab',
          accelerator: 'CmdOrCtrl+W',
          click: () => {
            const id = browser.snapshot().activeTabId
            if (id) void browser.closeTab(id)
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Find',
          accelerator: 'CmdOrCtrl+F',
          click: () => browser.showFind()
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'History',
      submenu: [
        {
          label: 'Show History',
          accelerator: 'CmdOrCtrl+Y',
          click: () => void browser.openInternalPage('history')
        },
        {
          label: 'Back',
          accelerator: 'Alt+Left',
          click: () => {
            const id = browser.snapshot().activeTabId
            if (id) void browser.goBack(id)
          }
        },
        {
          label: 'Forward',
          accelerator: 'Alt+Right',
          click: () => {
            const id = browser.snapshot().activeTabId
            if (id) void browser.goForward(id)
          }
        }
      ]
    },
    {
      label: 'Window',
      submenu: [{ role: 'minimize' }, { role: 'zoom' }, { role: 'front' }]
    }
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

app.whenReady().then(() => {
  nativeTheme.themeSource = 'system'
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('web-contents-created', (_event, contents) => {
  contents.on('will-attach-webview', (event) => event.preventDefault())
})
