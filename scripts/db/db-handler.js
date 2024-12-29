const fs = require("fs");
const Database = require("better-sqlite3");

// Database file path
const dbPath = require("../file-paths").getDbPath();

// Required tables for validation
const requiredTables = [
  "worksheet",
  "team",
  "department",
  "issuedBlood",
  "teamStat",
  "dailyRecord",
];

class DatabaseHandler {
  constructor() {
    if (!fs.existsSync(dbPath)) {
      throw new Error("Database file not found. Please check the database.");
    }

    // Initialize database connection
    this.db = new Database(dbPath);
    this.validateDatabase();
  }

  // Method to validate the database
  validateDatabase() {
    // **Step 1: Check Database Integrity**
    const integrityCheck = this.db.pragma("integrity_check");
    if (integrityCheck[0].integrity_check !== "ok") {
      throw new Error(
        "Database integrity check failed. The database is corrupted."
      );
    }

    console.log("Database integrity check passed.");

    // **Step 2: Validate Required Tables**
    const existingTables = this.getExistingTables();
    const missingTables = requiredTables.filter(
      (table) => !existingTables.includes(table)
    );

    if (missingTables.length > 0) {
      throw new Error(
        `The following required tables are missing: ${missingTables.join(
          ", "
        )}.`
      );
    }

    console.log("All required tables are present.");
  }

  // Utility method to get existing tables in the database
  getExistingTables() {
    const query = `
      SELECT name 
      FROM sqlite_master 
      WHERE type='table'
    `;
    const rows = this.db.prepare(query).all();
    return rows.map((row) => row.name);
  }

  // ******************* Team Stat Methods *******************
  insertTeamRecord(record) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO teamStat (team, month, year, obstetrics, gynaecology)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(
        record.data.team,
        record.month,
        record.year,
        record.data.obstetrics,
        record.data.gynaecology
      );
      return {
        success: true,
        message: `Record inserted/updated for ${record.team}`,
      };
    } catch (error) {
      console.error("Database Error: ", error);
      return { success: false, error: error.message };
    }
  }

  getTeamStats(filter) {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM teamStat WHERE month = ? and year = ?
        `);
      const records = stmt.all(filter.month, filter.year);
      return { success: true, data: records };
    } catch (error) {
      console.error("Database Error: ", error);
      return { success: false, error: error.message };
    }
  }

  // Check if team records exist for a given month and year
  checkTeamStatsExist(filter) {
    try {
      const stmt = this.db.prepare(`
        SELECT EXISTS (
          SELECT 1 
          FROM teamStat 
          WHERE month = ? AND year = ?
        ) AS data_exists;
      `);
      const result = stmt.get(filter.month, filter.year);
      return { success: true, exists: !!result.data_exists }
    } catch (error) {
      console.error("Database Error: ", error);
      return { success: false, error: error.message };
    }
  }

  // ******************* Daily Record Methods *******************
  insertDailyRecord(record) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO dailyRecord (bloodGroup, crossmatch, issued, returned, month, year, day)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        record.bloodGroup,
        record.crossmatch,
        record.issued,
        record.returned,
        record.month,
        record.year,
        record.day
      );
      return {
        success: true,
        message: `Record inserted/updated`,
      };
    } catch (error) {
      console.error("Database Error: ", error);
      return { success: false, error: error.message };
    }
  }

  updateDailyRecord(record) {
    try {
      const stmt = this.db.prepare(`
        UPDATE dailyRecord SET bloodGroup = ? , crossmatch = ?, issued = ?, returned = ?
        WHERE month = ? AND  year = ? AND day = ?;
      `);
      stmt.run(
        record.bloodGroup,
        record.crossmatch,
        record.issued,
        record.returned,
        record.month,
        record.year,
        record.day
      );
      return {
        success: true,
        message: `Record updated`,
      };
    } catch (error) {
      console.error("Database Error: ", error);
      return { success: false, error: error.message };
    }
  }

  getDailyRecords(filter) {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM dailyRecord WHERE month = ? and year = ?
        `);
      const records = stmt.all(filter.month, filter.year);
      return { success: true, data: records };
    } catch (error) {
      console.error("Database Error: ", error);
      return { success: false, error: error.message };
    }
  }

  getDailyRecordsByYear(year) {
    try {
      const stmt = this.db.prepare(`
        SELECT month,
            COUNT(DISTINCT day) AS days_count,
            SUM(bloodGroup) AS total_bloodGroup,
            SUM(crossmatch) AS total_crossmatch,
            SUM(issued) AS total_issued,
            SUM(returned) AS total_returned
        FROM dailyRecord WHERE year = ? GROUP BY month
        `);
      const records = stmt.all(year);
      return { success: true, data: records };
    } catch (error) {
      console.error("Database Error: ", error);
      return { success: false, error: error.message };
    }
  }

  checkDailyRecordPresent(filter) {
    try {
      const stmt = this.db.prepare(`
        SELECT EXISTS (
          SELECT 1 
          FROM dailyRecord 
          WHERE month = ? AND year = ?
        ) AS data_exists;
      `);
      const result = stmt.get(filter.month, filter.year);
      return { success: true, exists: !!result.data_exists }
    } catch (error) {
      console.error("Database Error: ", error);
      return { success: false, error: error.message };
    }
  }

  // Close the database connection
  close() {
    this.db.close();
  }
}

module.exports = DatabaseHandler;
