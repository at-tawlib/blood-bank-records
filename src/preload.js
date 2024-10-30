const { ipcRenderer, contextBridge } = require('electron');

contextBridge.exposeInMainWorld('api', {
    saveRecord: (record) => ipcRenderer.sendSync('save-record', record),
    getRecords: (date) => ipcRenderer.sendSync('get-records', date),
    getWeekRecords: (startDate, endDate) => ipcRenderer.sendSync('get-week-records', startDate, endDate),
    updateRecord: (record) => ipcRenderer.invoke('update-record', record),
});
