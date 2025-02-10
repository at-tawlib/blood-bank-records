const path = require("path");
require("dotenv").config();
const fs = require("fs");
const { app } = require("electron");
const { DB_FILE_NAME, BACKUP_DIR_NAME, EXPORT_DIR_NAME, CONFIG_FILE_NAME } = require("../src/utils/consts");

let cachedDbPath = null;
let cachedBackupDirPath = null;
let cachedExportDirPath = null;
let cachedConfigFilePath = null;
let cachedChromeDriverPath = null;

// Get the default path for SQLite Browser (based on platform)
function getDefaultSQLiteBrowserPath() {
  if (process.platform === "win32")
    return "C:\\Program Files\\DB Browser for SQLite\\DB Browser for SQLite.exe";
  if (process.platform === "darwin")
    return "/Applications/DB Browser for SQLite.app/Contents/MacOS/DB Browser for SQLite";
  return "/usr/bin/sqlitebrowser";
}

function getDbPath() {
  if (cachedDbPath) {
    return cachedDbPath; // Return cached path if already determined
  }

  if (app.isPackaged) {
    // Paths for production
    const sourceDbPath = path.join(process.resourcesPath, DB_FILE_NAME);
    cachedDbPath = path.join(app.getPath("userData"), DB_FILE_NAME);

    // Copy the database file only if it doesn't already exist in the target directory
    if (!fs.existsSync(cachedDbPath)) {
      try {
        fs.copyFileSync(sourceDbPath, cachedDbPath);
        console.log("Database copied to:", cachedDbPath);
      } catch (err) {
        console.error("Failed to copy database:", err);
        throw err; // Rethrow the error to handle it in the calling code
      }
    }
  } else {
    // Path for development
    cachedDbPath = path.join(__dirname, "../database", DB_FILE_NAME);
  }
  return cachedDbPath;
}

function getBackupDir() {
  if (cachedBackupDirPath) {
    return cachedBackupDirPath; // Return cached path if already determined
  }

  if (app.isPackaged) cachedBackupDirPath = path.join(app.getPath("userData"), BACKUP_DIR_NAME);
  else cachedBackupDirPath = path.join(__dirname, "../", BACKUP_DIR_NAME);

  // Ensure the backup directory exists
  if (!fs.existsSync(cachedBackupDirPath)) {
    try {
      fs.mkdirSync(cachedBackupDirPath, { recursive: true }); // Create directory if it doesn't exist
      console.log("Backup directory created:", cachedBackupDirPath);
    } catch (err) {
      console.error("Failed to create backup directory:", err);
      throw err; // Rethrow the error to handle it in the calling code
    }
  }

  return cachedBackupDirPath;
}

function getExportDir() {
  if (cachedExportDirPath) {
    return cachedExportDirPath; // Return cached path if already determined
  }

  if (app.isPackaged) cachedExportDirPath = path.join(app.getPath("userData"), EXPORT_DIR_NAME);
  else cachedExportDirPath = path.join(__dirname, "../", EXPORT_DIR_NAME);

  // Ensure the export directory exists
  if (!fs.existsSync(cachedExportDirPath)) {
    try {
      fs.mkdirSync(cachedExportDirPath, { recursive: true }); // Create directory if it doesn't exist
      console.log("Export directory created:", cachedExportDirPath);
    } catch (err) {
      console.error("Failed to create export directory:", err);
      throw err; // Rethrow the error to handle it in the calling code
    }
  }
  return cachedExportDirPath;
}

function getConfigDir() {
  if (cachedConfigFilePath) {
    return cachedConfigFilePath; // Return cached path if already determined
  }


  if (app.isPackaged) {
    // Path for production
    const sourceConfigPath = path.join(process.resourcesPath, CONFIG_FILE_NAME);
    cachedConfigFilePath = path.join(app.getPath('userData'), CONFIG_FILE_NAME);

    // Copy the config file only if it doesn't already exist in the target directory
    if (!fs.existsSync(cachedConfigFilePath)) {
      try {
        fs.copyFileSync(sourceConfigPath, cachedConfigFilePath);
        console.log('Config file copied to:', cachedConfigFilePath);
      } catch (err) {
        console.error('Failed to copy config file:', err);
        throw err; // Rethrow the error to handle it in the calling code
      }
    }
  } else {
    // Path for development
    cachedConfigFilePath = path.join(__dirname, '../', CONFIG_FILE_NAME);
  }

  return cachedConfigFilePath;
}

function getChromeDriverPath() {
  if (cachedChromeDriverPath) {
    return cachedChromeDriverPath; // Return cached path if already determined
  }

  if (app.isPackaged) {
    // Path for production
    const sourceDriverPath = path.join(process.resourcesPath, CHROME_DRIVER_NAME);
    cachedChromeDriverPath = path.join(app.getPath('userData'), CHROME_DRIVER_NAME);

    // Copy the ChromeDriver file only if it doesn't already exist in the target directory
    if (!fs.existsSync(cachedChromeDriverPath)) {
      try {
        fs.copyFileSync(sourceDriverPath, cachedChromeDriverPath);
        fs.chmodSync(cachedChromeDriverPath, 0o755); // Ensure the file is executable (Linux/macOS)
        console.log('ChromeDriver copied to:', cachedChromeDriverPath);
      } catch (err) {
        console.error('Failed to copy ChromeDriver:', err);
        throw err; // Rethrow the error to handle it in the calling code
      }
    }
  } else {
    // Path for development
    cachedChromeDriverPath = path.join(__dirname, '../drivers', CHROME_DRIVER_NAME);
  }

  return cachedChromeDriverPath;
}

module.exports = {
  getDbPath,
  getDefaultSQLiteBrowserPath,
  getBackupDir,
  getConfigDir,
  getExportDir,
  getChromeDriverPath,
};
