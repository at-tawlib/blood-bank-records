const path = require("path");
require("dotenv").config();
const { app } = require("electron");

// Get the default path for SQLite Browser (based on platform)
function getDefaultSQLiteBrowserPath() {
  if (process.platform === "win32")
    return "C:\\Program Files\\DB Browser for SQLite\\DB Browser for SQLite.exe";
  if (process.platform === "darwin")
    return "/Applications/DB Browser for SQLite.app/Contents/MacOS/DB Browser for SQLite";
  return "/usr/bin/sqlitebrowser";
}

function getDbPath() {
  const isDev = process.env.NODE_ENV !== "production";

  // For production builds, you should store the database in the app's userData directory
  if (isDev) return path.join(__dirname, "../database/bloodBank.db");
  return path.join(app.getPath("userData"), "bloodBank.db");
}

function getBackupDir() {
  const isDev = process.env.NODE_ENV !== "production";
  if (isDev) {
    return path.join(__dirname, "../backup");
  }
  return path.join(app.getPath("userData"), "backup");
}

function getExportDir() {
  const isDev = process.env.NODE_ENV !== "production";
  if (isDev) {
    return path.join(__dirname, "../export");
  }
  return path.join(app.getPath("userData"), "export");
}

function getConfigDir() {
  const isDev = process.env.NODE_ENV !== "production";
  if (isDev) {
    return path.join(__dirname, "../config.json");
  }
  return path.join(app.getPath("userData"), "config.json");
}

function getChromeDriverPath() {
  const isDev = process.env.NODE_ENV !== "production";
  if (isDev) {
    return path.join(__dirname, "../drivers/chromedriver");
  }
  return path.join(app.getPath("userData"), "chromedriver");
}

module.exports = {
  getDbPath,
  getDefaultSQLiteBrowserPath,
  getBackupDir,
  getConfigDir,
  getExportDir,
  getChromeDriverPath,
};
