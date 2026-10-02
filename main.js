const { app, BrowserWindow, ipcMain, screen, Menu } = require('electron');
const path = require('path');

let mainWindow = null;
const CHARACTER_SIZE = 128;

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  mainWindow = new BrowserWindow({
    width: CHARACTER_SIZE,
    height: CHARACTER_SIZE,
    x: width / 2 - CHARACTER_SIZE / 2,
    y: height / 2 - CHARACTER_SIZE / 2,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    movable: false,
    fullscreenable: false,
    hasShadow: false,
    focusable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  mainWindow.setIgnoreMouseEvents(false);
  mainWindow.loadFile('renderer.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  ipcMain.on('app-quit', () => {
    app.quit();
  });

  ipcMain.on('window-move', (event, x, y) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setPosition(Math.round(x), Math.round(y));
    }
  });

  ipcMain.handle('window-get-bounds', () => {
    if (mainWindow) {
      return mainWindow.getBounds();
    }
    return { x: 0, y: 0, width: CHARACTER_SIZE, height: CHARACTER_SIZE };
  });

  ipcMain.on('show-context-menu', () => {
    const menu = Menu.buildFromTemplate([
      {
        label: '앱 종료',
        click: () => {
          app.quit();
        }
      }
    ]);
    menu.popup({ window: mainWindow });
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (mainWindow) {
    mainWindow.destroy();
  }
});