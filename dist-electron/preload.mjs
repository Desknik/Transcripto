"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(channel, (event, ...args2) => listener(event, ...args2));
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  }
});
electron.contextBridge.exposeInMainWorld("electronAPI", {
  convertAudio: (filePath) => electron.ipcRenderer.invoke("convert-audio", filePath),
  saveFileDialog: () => electron.ipcRenderer.invoke("save-file-dialog"),
  saveFileToDisk: (fileBuffer, fileName) => electron.ipcRenderer.invoke("save-file-to-disk", Buffer.from(fileBuffer), fileName),
  copyFile: (sourcePath, targetPath) => electron.ipcRenderer.invoke("copy-file", sourcePath, targetPath)
});
