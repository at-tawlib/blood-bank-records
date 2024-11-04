const { ipcRenderer, contextBridge } = require('electron');

// TODO: separate the contextBridge i.e. create for api, darkMode, navigation etc.
contextBridge.exposeInMainWorld('api', {
    saveRecord: (record) => ipcRenderer.sendSync('save-record', record),
    getRecords: (date) => ipcRenderer.sendSync('get-records', date),
    getWeekRecords: (startDate, endDate) => ipcRenderer.sendSync('get-week-records', startDate, endDate),
    updateRecord: (record) => ipcRenderer.invoke('update-record', record),
    checkDate: (date) => ipcRenderer.sendSync('check-date', date),
    onOpenNewWorksheet: (callback) => ipcRenderer.on('open-new-worksheet', callback),
    onOpenGeneralSearch: (callback) => ipcRenderer.on('open-general-search', callback),
    navigateToAdvance:() => ipcRenderer.sendSync('navigate-to-advance'),
    loadConfig: () => ipcRenderer.invoke("load-config"),
    saveConfig: (config) => ipcRenderer.invoke("save-config", config),
});