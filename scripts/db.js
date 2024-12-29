const fs = require("fs");
const Database = require("better-sqlite3");

const dbPath = require("./file-paths").getDbPath();
// Create a db folder if it doesn't exist
if (!fs.existsSync(dbPath)) {
  // TODO: send dialog that database file not found, ask to locate it or create a new database dir
}
// Initialize the database
const db = new Database(dbPath);
// Check database integrity
const integrityCheck = db.pragma("integrity_check");
if (integrityCheck[0].integrity_check !== "ok") {
  console.log("Database integrity check failed");
  console.log(integrityCheck);
}else {
  console.log("Database integrity check passed");
  console.log(integrityCheck);
}

function insertRecord(record) {
  const stmt = db.prepare(
    "INSERT INTO worksheet (date, number, name, bloodGroup, rhesus, lhimsNumber, scientist) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  stmt.run(
    record.date,
    record.number,
    record.name,
    record.bloodGroup,
    record.rhesus,
    record.lhimsNumber,
    record.scientist
  );
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
  const query = ` UPDATE worksheet SET name = ?, bloodGroup = ?, rhesus = ?, lhimsNumber = ?
    WHERE id = ?`;
  const stmt = db.prepare(query);
  stmt.run(
    record.name,
    record.bloodGroup,
    record.rhesus,
    record.lhimsNumber,
    record.id
  );
}

function updateLHIMSNumber(record) {
  const query = `UPDATE worksheet SET lhimsNumber = ? WHERE id = ?`;

  try {
    const stmt = db.prepare(query);
    const result = stmt.run(record.lhimsNumber, record.id);

    if (result.changes === 0) return `No record found with id ${record.id}`;

    return "Success";
  } catch (error) {
    return error.message;
  }
}

function checkDate(date) {
  const query = "SELECT * FROM worksheet WHERE date = ?";
  const stmt = db.prepare(query);
  const record = stmt.get(date);
  // return true if record exists for the date else false
  return !!record;
}

module.exports = {
  insertRecord,
  getRecords,
  getWeekRecords,
  updateRecord,
  updateLHIMSNumber,
  checkDate,
};
