// Import exec at the very beginning of the file
const { exec } = require("child_process");

function runPythonScript() {
  exec("python path/to/script.py", (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    const result = stdout.trim(); // Capture and process output
    console.log(`Result from Python script: ${result}`);
  });
}

module.exports = { runPythonScript };