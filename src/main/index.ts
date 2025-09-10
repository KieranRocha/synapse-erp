import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join, resolve } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { initializeDatabase, closeDatabase } from './database'
import { registerClientHandlers } from './handlers/clientHandlers'
import { registerBudgetHandlers } from './handlers/budgetHandlers'
import { registerAuthHandlers } from './handlers/authHandlers'
import { startServer, stopServer } from './server'

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
      nodeIntegration: false,
      webSecurity: true
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
      nodeIntegration: false,
      webSecurity: true
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

// Make this app a single instance app
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.whenReady().then(async () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Register protocol for both development and production
  console.log('🔗 Registering custom protocol synapseapp://')
  
  try {
    // In development, we need to specify the path to the dev electron executable
    if (is.dev) {
      // For development, we need to specify electron as the executable
      const registrationResult = app.setAsDefaultProtocolClient('synapseapp', process.execPath, [
        resolve(process.argv[1])
      ])
      console.log('📝 Protocol registration result (dev):', registrationResult)
    } else {
      // For production, use the normal registration
      const registrationResult = app.setAsDefaultProtocolClient('synapseapp')
      console.log('📝 Protocol registration result (prod):', registrationResult)
    }
    
    const isDefault = app.isDefaultProtocolClient('synapseapp')
    console.log('✅ Is synapseapp:// protocol default?', isDefault)
  } catch (error) {
    console.error('❌ Error registering protocol:', error)
  }
  
  // Handle protocol URLs from command line
  const argv = process.argv
  const protocolUrl = argv.find(arg => arg.startsWith('synapseapp://'))
  if (protocolUrl) {
    console.log('🎯 Found protocol URL in argv:', protocolUrl)
    setTimeout(() => handleResetPasswordUrl(protocolUrl), 2000)
  }

  // Initialize database
  try {
    await initializeDatabase()
    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Failed to initialize database:', error)
    // You might want to show an error dialog here
  }

  // Start API server
  try {
    await startServer()
  } catch (error) {
    console.error('Failed to start API server:', error)
  }

  // Register IPC handlers
  registerClientHandlers()
  registerBudgetHandlers()
  registerAuthHandlers()

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
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', async () => {
  // Stop API server
  await stopServer()
  
  // Close database connection before quitting
  await closeDatabase()

  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Handle custom protocol URLs (password reset links)
app.on('open-url', (event, url) => {
  event.preventDefault()
  handleResetPasswordUrl(url)
})

// Handle command line arguments for Windows (protocol handler)
app.on('second-instance', (event, commandLine) => {
  // Someone tried to run a second instance, we should focus our window instead
  const protocolUrl = commandLine.find(arg => arg.startsWith('synapseapp://'))
  if (protocolUrl) {
    handleResetPasswordUrl(protocolUrl)
  }
  
  // Focus existing window
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
  } else if (loginWindow) {
    if (loginWindow.isMinimized()) loginWindow.restore()
    loginWindow.focus()
  }
})

function handleResetPasswordUrl(url: string) {
  console.log('🔗 Handling reset password URL:', url)
  
  try {
    // Extract token from URL
    const urlObj = new URL(url)
    const token = urlObj.searchParams.get('token')
    
    console.log('📝 Extracted token:', token)
    
    if (!token) {
      console.error('❌ No token found in reset URL')
      return
    }
  
    // Close main window if open and switch to login window
    if (mainWindow && !mainWindow.isDestroyed()) {
      console.log('📱 Closing main window to show login')
      mainWindow.hide()
    }
    
    // Ensure login window exists
    if (!loginWindow || loginWindow.isDestroyed()) {
      console.log('🪟 Creating new login window')
      createLoginWindow()
    }
    
    // Navigate to reset password page with token
    const navigateToReset = () => {
      const resetUrl = `#/auth/reset-password?token=${token}`
      
      console.log('🎯 Navigating to reset URL:', resetUrl)
      
      if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        loginWindow?.loadURL(process.env['ELECTRON_RENDERER_URL'] + resetUrl)
      } else {
        loginWindow?.loadFile(join(__dirname, '../renderer/index.html'), { hash: `/auth/reset-password?token=${token}` })
      }
    }
    
    if (loginWindow?.webContents.isLoading()) {
      loginWindow.once('ready-to-show', navigateToReset)
    } else {
      navigateToReset()
    }
    
    // Show and focus the window
    console.log('🎯 Focusing login window with reset URL')
    loginWindow?.show()
    loginWindow?.focus()
    
  } catch (error) {
    console.error('❌ Error handling reset password URL:', error)
  }
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
