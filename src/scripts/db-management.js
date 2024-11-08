const { dialog } = require("electron");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const config = require("./config.js");
const dbPath = require("./file-paths.js").getDbPath();
const backupPath = require("./file-paths.js").getBackupDir();

// Create a backup folder if it doesn't exist
if (!fs.existsSync(backupPath)) {
  fs.mkdirSync(backupPath);
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
async function openSQLITEBrowser(window) {
  const appConfigs = config.loadConfig();
  let sqliteBrowserPath =
    appConfigs.sqliteBrowserPath || getDefaultSQLiteBrowserPath();

  // Check if path exists, set it if it doesn't
  if (!fs.existsSync(sqliteBrowserPath)) {
    const { filePaths } = await dialog.showOpenDialog(window, {
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
      appConfigs.sqliteBrowserPath = sqliteBrowserPath;
      config.saveConfig(appConfigs);
    }
  });
}

// Backup the database
async function createBackup(window) {
  // Display the confirmation dialog
  const result = await dialog.showMessageBox(window, {
    type: "question",
    buttons: ["Yes", "No"],
    defaultId: 1,
    title: "Backup Database",
    message: "Are you sure you want to create a backup?",
  });

  // Check if the user clicked "Yes" or "No"
  if (result.response === 0) {
    const timestamp = new Date().toISOString().replace(/:/g, "-"); // For a valid file name
    const backupDir = path.join(backupPath, `bloodBank-${timestamp}.db`);

    // Copy the database file to the backup directory
    // TODO: handle error for fs
    fs.copyFile(dbPath, backupDir, async (err) => {
      if (err) {
        await dialog.showMessageBox(window, {
          type: "error",
          title: "Backup Database",
          message: "Failed to create backup",
        });
      } else {
        await dialog.showMessageBox(window, {
          type: "info",
          title: "Backup Database",
          message: "Backup created successfully",
        });
      }
    });
  }
}

// Restore the database
async function restoreBackup(window) {
  // Display the file dialog
  const result = await dialog.showOpenDialog(window, {
    title: "Select Backup to restore",
    defaultPath: backupPath,
    properties: ["openFile"],
    filters: [{ name: "Database Backups", extensions: ["db"] }],
  });

  // Check if the user selected a file
  if (!result.canceled) {
    const backupDir = result.filePaths[0];

    // Copy the backup file to the database directory
    fs.copyFile(backupDir, dbPath, async (err) => {
      if (err) {
        await dialog.showMessageBox(window, {
          type: "error",
          title: "Restore Database",
          message: "Failed to restore backup",
        });
      } else {
        await dialog.showMessageBox(window, {
          type: "info",
          title: "Restore Database",
          message: "Database restored successfully",
        });
      }
    });
  }
}

// Open backup folder
async function openBackupFolder(window) {
  require("electron").shell.openPath(backupPath);
}

module.exports = {
  getDefaultSQLiteBrowserPath,
  openSQLITEBrowser,
  createBackup,
  restoreBackup,
  openBackupFolder,
};
