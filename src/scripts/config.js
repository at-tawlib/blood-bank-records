const fs = require("fs");
const path = require("path");

const configPath = require("./file-paths.js").getConfigDir();

// load config from file system as JSON
function loadConfig() {
  if (!fs.existsSync(configPath)) {
    return {
      theme: "light",
    };
  }

  // Load default configuration
  return JSON.parse(fs.readFileSync(configPath, "utf8"));
}

// Save config to file system as JSON string format with 2 spaces indentation
function saveConfig(config) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");
}

module.exports = { loadConfig, saveConfig };
