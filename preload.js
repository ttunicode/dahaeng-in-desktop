const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onAppQuit: (callback) => ipcRenderer.on('app-quit', callback),
  sendAppQuit: () => ipcRenderer.send('app-quit'),
  getWindowBounds: () => ipcRenderer.invoke('window-get-bounds'),
  onWindowBounds: (callback) => ipcRenderer.on('window-bounds', callback),
  moveWindow: (x, y) => ipcRenderer.send('window-move', x, y),
  showContextMenu: () => ipcRenderer.send('show-context-menu')
});