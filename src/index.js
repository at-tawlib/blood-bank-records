const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");
const Database = require("better-sqlite3");

// Initialize the database
// TODO:  For production builds, you should store the database in the app's userData directory
// const db = new Database(path.join(app.getPath("userData"), "bloodBank.db"));

// TODO: for development, Use the above for production
const db = new Database(path.join(__dirname, "./database/bloodBank.db"));
// Create the table if it doesn't exist

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

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));
};

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

// IPC to update a record
ipcMain.handle('update-record', async (event, updatedRecord) => {
  const stmt = db.prepare(`
    UPDATE worksheet SET name = ?, bloodGroup = ?, rhesus = ?
    WHERE id = ?
  `);
  stmt.run(updatedRecord.name, updatedRecord.bloodGroup, updatedRecord.rhesus, updatedRecord.id);
  // event.returnValue = "Record updated successfully!";
  return true;
});


app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
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