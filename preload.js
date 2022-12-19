const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
    setTitle: (title) => ipcRenderer.send('set-title', title),
    getDirectory: (path) => ipcRenderer.invoke('get-directory', path),
    getDirectoryDialog: () => ipcRenderer.invoke('get-directory-dialog'),
    getConfig: () => ipcRenderer.invoke('get-config'),
    setConfig: (config) => ipcRenderer.invoke('set-config', config),
    foo: () => ipcRenderer.invoke('foo'),
    getStorageIndex: () => ipcRenderer.invoke('index-storage'),
})