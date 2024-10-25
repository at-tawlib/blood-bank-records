const { ipcRenderer, contextBridge } = require('electron');

contextBridge.exposeInMainWorld('api', {
    saveRecord: (record) => ipcRenderer.sendSync('save-record', record),
    getRecords: (date) => ipcRenderer.sendSync('get-records', date),
    updateRecord: (record) => ipcRenderer.sendSync('update-record', record),
});
