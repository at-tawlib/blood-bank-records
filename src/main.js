const fs = require("fs");
const { app, BrowserWindow, ipcMain, Menu, dialog } = require("electron");
const path = require("node:path");
const { exec } = require("child_process");
const Database = require("better-sqlite3");

const isDev = process.env.NODE_ENV !== "production";

// Set up Config
let configPath = "";
if (isDev) {
  configPath = path.join(__dirname, "./config.json");
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({}));
  }
} else {
  configPath = path.join(app.getPath("userData"), "config.json");
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({}));
  }
}

// load config from file system as JSON
function loadConfig() {
  if (!fs.existsSync(configPath)) {
    return {
      theme: "light",
      sqliteBrowserPath: getDefaultSQLiteBrowserPath(),
    };
  }

  // Load default configuration
  return JSON.parse(fs.readFileSync(configPath, "utf8"));
}

// Save config to file system as JSON string format with 2 spaces indentation
function saveConfig(config) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");
}

// Initialize the database
// TODO:  For production builds, you should store the database in the app's userData directory
// TODO: for development, the database is stored in the project's root directory
let dbPath = "";
let db = "";
if (isDev) dbPath = path.join(__dirname, "./database/bloodBank.db");
else dbPath = path.join(app.getPath("userData"), "bloodBank.db");

db = new Database(dbPath);
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS worksheet (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    number INTEGER NOT NULL,
    date TEXT NOT NULL,
    name TEXT NOT NULL,
    bloodGroup TEXT NOT NULL,
    rhesus TEXT NOT NULL
)
  `
).run();

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

// setup backup for the database
let backupDir = "";
if (isDev) {
  backupDir = path.join(__dirname, "./backup");
} else {
  backupDir = path.join(app.getPath("userData"), "backup");
}
// Create a backup folder if it doesn't exist
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

let mainWindow;
let advanceWindow;
// Create the browser window.
const createMainWindow = () => {
  const config = loadConfig();
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

  mainWindow.loadFile(path.join(__dirname, "html/index.html"));

  // Create custom menu
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
  // applyTheme(config.theme);
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
    width: 1200,
    height: 800,
    resizable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  advanceWindow.loadFile(path.join(__dirname, "/html/advance.html"));

  advanceWindow.setMenu(null); // Remove the default menu
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
        click: openSQLITEBrowser,
      },
      { type: "separator" },
      {
        label: "Exit",
        accelerator: "CmdOrCtrl+Q",
        role: "quit",
      },
    ],
  },
  // {
  //   label: "Advance",
  //   submenu: [
  //     {
  //       label: "Advance",
  //       click: createAdvanceWindow,
  //     },
  //   ],
  // },
  {
    label: "Backup",
    submenu: [
      {
        label: "Backup Database",
        click: createBackup,
      },
      {
        label: "Restore Backup",
        click: restoreBackup,
      },
      {
        label: "Open Backup Folder",
        click: openBackupFolder,
      },
    ],
  },
  {
    label: "Settings",
    submenu: [
      {
        label: "Toggle Theme",
        click() {
          const config = loadConfig();
          const newTheme = config.theme === "light" ? "dark" : "light";
          config.theme = newTheme;
          saveConfig(config);
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

// Backup the database
async function createBackup() {
  // Display the confirmation dialog
  const result = await dialog.showMessageBox(mainWindow, {
    type: "question",
    buttons: ["Yes", "No"],
    defaultId: 1,
    title: "Backup Database",
    message: "Are you sure you want to create a backup?",
  });

  // Check if the user clicked "Yes" or "No"
  if (result.response === 0) {
    const timestamp = new Date().toISOString().replace(/:/g, "-"); // For a valid file name
    const backupPath = path.join(backupDir, `bloodBank-${timestamp}.db`);

    // Copy the database file to the backup directory
    fs.copyFile(dbPath, backupPath, async (err) => {
      if (err) {
        await dialog.showMessageBox(mainWindow, {
          type: "error",
          title: "Backup Database",
          message: "Failed to create backup",
        });
      } else {
        await dialog.showMessageBox(mainWindow, {
          type: "info",
          title: "Backup Database",
          message: "Backup created successfully",
        });
      }
    });
  }
}

// Restore the database
async function restoreBackup() {
  // Display the file dialog
  const result = await dialog.showOpenDialog(mainWindow, {
    title: "Select Backup to restore",
    defaultPath: backupDir,
    properties: ["openFile"],
    filters: [{ name: "Database Backups", extensions: ["db"] }],
  });

  // Check if the user selected a file
  if (!result.canceled) {
    const backupPath = result.filePaths[0];

    // Copy the backup file to the database directory
    fs.copyFile(backupPath, dbPath, async (err) => {
      if (err) {
        await dialog.showMessageBox(mainWindow, {
          type: "error",
          title: "Restore Database",
          message: "Failed to restore backup",
        });
      } else {
        await dialog.showMessageBox(mainWindow, {
          type: "info",
          title: "Restore Database",
          message: "Database restored successfully",
        });
      }
    });
  }
}

// Open backup folder
async function openBackupFolder() {
  require("electron").shell.openPath(backupDir);
}

// Get the default path for SQLite Browser (based on platform)
function getDefaultSQLiteBrowserPath() {
  if (process.platform === "win32")
    return "C:\\Program Files\\DB Browser for SQLite\\DB Browser for SQLite.exe";
  if (process.platform === "darwin")
    return "/Applications/DB Browser for SQLite.app/Contents/MacOS/DB Browser for SQLite";
  return "/usr/bin/sqlitebrowser";
}

// Open database in SQLite Browser or prompt user to locate the SQLite Browser
async function openSQLITEBrowser() {
  const config = loadConfig();
  let sqliteBrowserPath =
    config.sqliteBrowserPath || getDefaultSQLiteBrowserPath();

  // Check if path exists, set it if it doesn't
  if (!fs.existsSync(sqliteBrowserPath)) {
    const { filePaths } = await dialog.showOpenDialog(mainWindow, {
      title: "Locate SQLite Browser",
      properties: ["openFile"],
    });
    sqliteBrowserPath = filePaths[0];
  }

  exec(`"${sqliteBrowserPath}" "${dbPath}"`, (err) => {
    if (err) {
      dialog.showErrorBox("Error", "Failed to open database");
    } else {
      // Save the path to the config file
      config.sqliteBrowserPath = sqliteBrowserPath;
      saveConfig(config);
    }
  });
}

// IPC to load and save config
ipcMain.handle("load-config", () => loadConfig());
ipcMain.handle("save-config", (event, newConfig) => {
  const config = { ...loadConfig(), ...newConfig };
  saveConfig(config);
});

// IPC to handle data saving
ipcMain.on("save-record", (event, record) => {
  const stmt = db.prepare(
    "INSERT INTO worksheet (date, number, name, bloodGroup, rhesus) VALUES (?, ?, ?, ?, ?)"
  );
  stmt.run(
    record.date,
    record.number,
    record.name,
    record.bloodGroup,
    record.rhesus
  );
  event.returnValue = "Record saved successfully!";
});

// IPC to fetch data for a specific day
ipcMain.on("get-records", (event, date) => {
  const query = "SELECT * FROM worksheet where date = ?";

  const stmt = db.prepare(query);
  const records = stmt.all(date);
  event.returnValue = records;
});

// IPC to fetch data for a week
// TODO: add error handlers for invalid dates
ipcMain.on("get-week-records", (event, startDate, endDate) => {
  const query =
    "SELECT * FROM worksheet WHERE date BETWEEN ? AND ? ORDER BY date DESC";

  const stmt = db.prepare(query);
  const records = stmt.all(startDate, endDate);
  event.returnValue = records;
});

// IPC to update a record
ipcMain.handle("update-record", async (event, updatedRecord) => {
  const stmt = db.prepare(`
    UPDATE worksheet SET name = ?, bloodGroup = ?, rhesus = ?
    WHERE id = ?
  `);
  stmt.run(
    updatedRecord.name,
    updatedRecord.bloodGroup,
    updatedRecord.rhesus,
    updatedRecord.id
  );
  // event.returnValue = "Record updated successfully!";
  return true;
});

// IPC to check if a record exists for a specific date
ipcMain.on("check-date", (event, date) => {
  const query = "SELECT * FROM worksheet WHERE date = ?";
  const stmt = db.prepare(query);

  const record = stmt.get(date);
  // return true if a record exists for the date else false
  event.returnValue = !!record;
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
