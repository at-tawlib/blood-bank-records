const { ipcRenderer, contextBridge } = require("electron");
const utils = require("./src/js/utils");
const statsUtils = require("./src/js/stats/stats-utils");
const sessionData = require("./src/js/sessionData");

// TODO: separate the contextBridge i.e. create for api, darkMode, navigation etc.
contextBridge.exposeInMainWorld("api", {
  saveRecord: (record) => ipcRenderer.sendSync("save-record", record),
  getRecords: (date) => ipcRenderer.sendSync("get-records", date),
  getWeekRecords: (startDate, endDate) =>
    ipcRenderer.sendSync("get-week-records", startDate, endDate),
  updateRecord: (record) => ipcRenderer.invoke("update-record", record),
  updateLHIMSNumber: (record) =>
    ipcRenderer.invoke("update-lhims-number", record),
  checkDate: (date) => ipcRenderer.sendSync("check-date", date),
  onOpenNewWorksheet: (callback) =>
    ipcRenderer.on("open-new-worksheet", callback),
  onOpenGeneralSearch: (callback) =>
    ipcRenderer.on("open-general-search", callback),
  navigateToStats: () => ipcRenderer.sendSync("navigate-to-stats"),
  loadConfig: () => ipcRenderer.invoke("load-config"),
  saveConfig: (config) => ipcRenderer.invoke("save-config", config),
});

contextBridge.exposeInMainWorld("utils", {
  getMostRecentDateForDay: utils.getMostRecentDateForDay,
  formatDate: utils.formatDate,
  getDaySuffix: utils.getDaySuffix,
  getWeekDateRange: utils.getWeekDateRange,
  getMonthDateRange: utils.getMonthDateRange,
  getDayFromDate: utils.getDayFromDate,
  setActiveNavItem: utils.setActiveNavItem,
});

contextBridge.exposeInMainWorld("statsUtils", {
  showContainer: statsUtils.showContainer,
  checkMonthYear: statsUtils.checkMonthYear,
})

contextBridge.exposeInMainWorld("theme", {
  onApplyTheme: (callback) =>
    ipcRenderer.on("apply-theme", (event, theme) => callback(theme)),
});

contextBridge.exposeInMainWorld("statsPage", {
  saveTeamStats: (data) => ipcRenderer.invoke("save-team-stats", data),
  getTeamStats: (data) => ipcRenderer.invoke("get-team-stats", data),
  updateTeamStats: (data) => ipcRenderer.invoke("update-team-stats", data),
  checkTeamStatsExist: (data) => ipcRenderer.invoke("check-team-stats-exist", data),
  aggregateTeamStats: (data)=> ipcRenderer.invoke("aggregate-team-stats", data),
  
  insertDailyRecord: (data) => ipcRenderer.invoke("insert-daily-record", data),
  updateDailyRecord: (data) => ipcRenderer.invoke("update-daily-record", data),
  getDailyRecords: (data) =>ipcRenderer.invoke("get-daily-records", data),
  getDailyRecordsByYear: (data) =>ipcRenderer.invoke("get-daily-yearly-records", data),
  checkDailyRecordPresent: (data) =>ipcRenderer.invoke("check-daily-record-present", data)
});

contextBridge.exposeInMainWorld("db", {
  exportToExcel: (data, sheetName) =>
    ipcRenderer.invoke("export-to-excel", data, sheetName),
});

contextBridge.exposeInMainWorld("scripts", {
  runLHIMSAutomator: (methodName, username, password) =>
    ipcRenderer.invoke("run-lhims-automator", methodName, username, password),
});

contextBridge.exposeInMainWorld("sessionData", {
  setSessionData: sessionData.setSessionData,
  getSessionData: sessionData.getSessionData,
  clearSessionData: sessionData.clearSessionData,
  clearAllSessionData: sessionData.clearAllSessionData,
  checkSessionData: sessionData.checkSessionData,
});

contextBridge.exposeInMainWorld("lhims", {
  lhimsLogin: (username, password) => ipcRenderer.invoke("lhims-login", username, password),
  fetchDailyLHIMSData: (username, password, date) => ipcRenderer.invoke("fetch-daily-lhims-data", username, password, date),
  openPatientLHIMS: (username, password, lhimsNumber) => ipcRenderer.invoke("open-patient-lhims", username, password, lhimsNumber),
});