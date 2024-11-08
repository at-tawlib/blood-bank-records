const Database = require("better-sqlite3");
const path = require("path");

const isDev = true;

// For production builds, you should store the database in the app's userData directory
let dbPath = "";
if (isDev) dbPath = path.join(__dirname, "bloodBank.db");
else dbPath = path.join(app.getPath("userData"), "bloodBank.db");

// Initialize the database
const db = new Database(dbPath);
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

function insertRecord(record) {
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
  // return stmt.run(number, date, name, bloodGroup, rhesus);
}


// Function to get records for a particular date
function getRecords(date) {
  const query = "SELECT * FROM worksheet where date = ?";

  const stmt = db.prepare(query);
  const records = stmt.all(date);
  return records;
}

function getWeekRecords(startDate, endDate) {
  const query =
    "SELECT * FROM worksheet WHERE date BETWEEN ? AND ? ORDER BY date DESC";
  const stmt = db.prepare(query);
  const records = stmt.all(startDate, endDate);
  return records;
}

function updateRecord(record) {
  const query = ` UPDATE worksheet SET name = ?, bloodGroup = ?, rhesus = ?
    WHERE id = ?`;
  const stmt = db.prepare(query);
  stmt.run(record.name, record.bloodGroup, record.rhesus, record.id);
}

function checkDate(date) {
  const query = "SELECT * FROM worksheet WHERE date = ?";
  const stmt = db.prepare(query);
  const record = stmt.get(date);
  // return true if record exists for the date else false
  return !!record;
}

module.exports = {
//   dbPath,
  insertRecord,
  getRecords,
  getWeekRecords,
  updateRecord,
  checkDate,
};
