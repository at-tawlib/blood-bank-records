const { app, BrowserWindow, ipcMain, Menu } = require("electron");
const path = require("node:path");
const Database = require("better-sqlite3");

// Initialize the database
// TODO:  For production builds, you should store the database in the app's userData directory
// const db = new Database(path.join(app.getPath("userData"), "bloodBank.db"));

// TODO: for development, Use the above for production
// const db = new Database(path.join(__dirname, "./database/bloodBank.db"));
// Create the table if it doesn't exist

var db = "";
const isDev = process.env.NODE_ENV !== "production";
if (isDev) {
  db = new Database(path.join(__dirname, "./database/bloodBank.db"));
} else {
  db = new Database(path.join(app.getPath("userData"), "bloodBank.db"));
}

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

  mainWindow.loadFile(path.join(__dirname, "index.html"));

  // Create custom menu
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
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
      { type: "separator" }, // Adds a line separator
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
