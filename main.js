const fs = require("fs");
const { app, BrowserWindow, ipcMain, Menu, dialog } = require("electron");
const path = require("path");
require("dotenv").config();

const db = require("./scripts/db.js");
const dbManagement = require("./scripts/db-management.js");
const runPythonScript = require("./scripts/run-python.js").runPythonScript;
const exportDir = require("./scripts/file-paths.js").getExportDir();
const config = require("./scripts/config.js");
const isDev = process.env.NODE_ENV !== "production";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

let mainWindow;
let advanceWindow;
// Create the browser window.
const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    title: "Blood Bank App",
    width: 1200,
    height: 800,
    resizable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.loadFile(path.join(__dirname, "src/html/index.html"));

  // Create custom menu
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  applyTheme(config.loadConfig().theme);
  // When the window is closed, close the advance window if it's open
  mainWindow.on("closed", () => {
    if (advanceWindow) {
      advanceWindow.close();
    }
    mainWindow = null;
  });
};

// Create the advance window
const createAdvanceWindow = () => {
  // Check if advance window is already open
  if (advanceWindow) {
    advanceWindow.focus();
    return;
  }

  advanceWindow = new BrowserWindow({
    title: "Advance Search",
    width: 800,
    height: 600,
    // frame: false,
    // resizable: false,
    // parent: mainWindow,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  advanceWindow.loadFile(path.join(__dirname, "src/html/advance.html"));

  // Dereference the window object when the window is closed
  advanceWindow.on("closed", () => {
    advanceWindow = null;
  });
};

// Menu template
const menuTemplate = [
  {
    label: "File",
    submenu: [
      {
        label: "New Worksheet",
        accelerator: "CmdOrCtrl+N",
        click() {
          BrowserWindow.getFocusedWindow().webContents.send(
            "open-new-worksheet"
          );
        },
      },
      {
        label: "General Search",
        accelerator: "CmdOrCtrl+F",
        click() {
          BrowserWindow.getFocusedWindow().webContents.send(
            "open-general-search"
          );
        },
      },
      {
        label: "Open Database with SQLite Browser",
        click: () => dbManagement.openSQLITEBrowser(mainWindow),
      },
      { type: "separator" },
      {
        label: "Exit",
        accelerator: "CmdOrCtrl+Q",
        role: "quit",
      },
    ],
  },
  {
    label: "Advance",
    submenu: [
      {
        label: "Advance",
        click: createAdvanceWindow,
      },
    ],
  },
  {
    label: "Database",
    submenu: [
      {
        label: "Backup Database",
        click: () => dbManagement.createBackup(mainWindow),
      },
      {
        label: "Restore Backup",
        click: () => dbManagement.restoreBackup(mainWindow),
      },
      {
        label: "Open Backup Folder",
        click: () => dbManagement.openBackupFolder(mainWindow),
      },
      {
        label: "Open Export Folder",
        click: () => dbManagement.openExportFolder(mainWindow),
      },
    ],
  },
  {
    label: "Settings",
    submenu: [
      {
        label: "Toggle Theme",
        click() {
          const appConfigs = config.loadConfig();
          const newTheme = appConfigs.theme === "light" ? "dark" : "light";
          appConfigs.theme = newTheme;
          config.saveConfig(appConfigs);
          applyTheme(newTheme);
        },
      },
    ],
  },
  {
    label: "Help",
    submenu: [
      {
        label: "Learn More",
        click() {
          require("electron").shell.openExternal("https://electronjs.org");
        },
      },
    ],
  },
  ...(isDev
    ? [
        {
          label: "Developer",
          submenu: [
            { role: "reload" },
            { role: "forcereload" },
            { role: "toggledevtools" },
          ],
        },
      ]
    : []),
];

// Apply theme
function applyTheme(theme) {
  mainWindow.webContents.send("apply-theme", theme);
}

// IPC to load and save config
ipcMain.handle("load-config", () => config.loadConfig());
ipcMain.handle("save-config", (event, newConfig) => {
  const appConfigs = { ...config.loadConfig(), ...newConfig };
  config.saveConfig(appConfigs);
});

// IPC to handle data saving
ipcMain.on("save-record", (event, record) => {
  db.insertRecord(record);
  event.returnValue = "Record saved successfully!";
});

// IPC to fetch data for a specific day
ipcMain.on("get-records", (event, date) => {
  const records = db.getRecords(date);
  event.returnValue = records;
});

// IPC to fetch data for a week
// TODO: add error handlers for invalid dates
ipcMain.on("get-week-records", (event, startDate, endDate) => {
  const records = db.getWeekRecords(startDate, endDate);
  event.returnValue = records;
});

// IPC to update a record
ipcMain.handle("update-record", async (_, updatedRecord) => {
  db.updateRecord(updatedRecord);
  return true;
});

// IPC to update LHIMS number
ipcMain.handle("update-lhims-number", async (_, updatedRecord) => {
  const result = db.updateLHIMSNumber(updatedRecord);
  return result;
});

// IPC to check if a record exists for a specific date
ipcMain.on("check-date", (event, date) => {
  const record = db.checkDate(date);
  // return true if a record exists for the date else false
  event.returnValue = !!record;
});

// IPC to export data to Excel
// TODO: use this error handling for other IPC handlers
ipcMain.handle("export-to-excel", async (_, data, sheetName = "Sheet 1") => {
  if (data.length === 0) {
    dialog.showMessageBox(mainWindow, {
      type: "info",
      title: "Export Data",
      message: "No data to export",
    });
    return "No data to export!";
  }

  const filePath = dialog.showSaveDialogSync({
    title: "Export Data to Excel",
    defaultPath: `${exportDir}/exported-data.xlsx`,
    filters: [{ name: "Excel", extensions: ["xlsx", "xls"] }],
  });

  if (filePath) {
    try {
      const result = await dbManagement.exportToExcel(
        data,
        filePath,
        sheetName
      );
      dialog.showMessageBox(mainWindow, {
        type: "info",
        title: "Export Data",
        message: "Data exported successfully",
      });
      return "Data exported successfully!";
    } catch (error) {
      // TODO: log error
      // Handle error
      dialog.showMessageBox(mainWindow, {
        type: "error",
        title: "Export Data Error",
        message: error.message,
      });

      return "Failed to export data!";
    }
  } else {
    dialog.showMessageBox(mainWindow, {
      type: "info",
      title: "Export Data",
      message: "Export cancelled",
    });
    return "Export cancelled!";
  }
});

// Handle the Python script execution via IPC
ipcMain.handle("run-lhims-automator", async (_, methodName, username, password) => {
  if (!username || !password) {
    return { error: "Login to continue" };
  }
  const result = await runPythonScript(methodName, username, password);
  return result;
});

app.whenReady().then(() => {
  createMainWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
