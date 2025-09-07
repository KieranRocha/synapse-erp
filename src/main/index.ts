import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { initializeDatabase, closeDatabase } from './database'
import { registerClientHandlers } from './handlers/clientHandlers'
import { registerBudgetHandlers } from './handlers/budgetHandlers'

let loginWindow: BrowserWindow | null = null
let mainWindow: BrowserWindow | null = null

function createLoginWindow(): void {
  // Create the login window (smaller)
  loginWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    autoHideMenuBar: true,
    resizable: false,
    center: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.cjs'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  loginWindow.on('ready-to-show', () => {
    loginWindow?.show()
  })

  loginWindow.on('closed', () => {
    loginWindow = null
  })

  loginWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Load login page
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    loginWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '#/auth/login')
  } else {
    loginWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: '/auth/login' })
  }
}

function createMainWindow(): void {
  // Create the main app window (larger)
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.cjs'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Load main app
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function createWindow(): void {
  // Start with login window by default
  // In a real app, you might check for stored auth tokens here
  createLoginWindow()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Initialize database
  try {
    await initializeDatabase()
    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Failed to initialize database:', error)
    // You might want to show an error dialog here
  }

  // Register IPC handlers
  registerClientHandlers()
  registerBudgetHandlers()

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // Auth IPC handlers
  ipcMain.handle('auth:notify-state', (_event, isAuthenticated: boolean) => {
    if (isAuthenticated) {
      // User logged in - switch to main window
      if (loginWindow) {
        loginWindow.close()
      }

      if (!mainWindow) {
        createMainWindow()
      } else {
        mainWindow.show()
        mainWindow.focus()
      }
    } else {
      // User logged out - switch to login window
      if (mainWindow) {
        mainWindow.close()
      }

      if (!loginWindow) {
        createLoginWindow()
      } else {
        loginWindow.show()
        loginWindow.focus()
      }
    }
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', async () => {
  // Close database connection before quitting
  await closeDatabase()

  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
