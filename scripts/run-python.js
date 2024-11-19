// Import exec at the very beginning of the file
const { exec } = require("child_process");
const { spawn } = require("child_process");
const path = require("path");

const pythonPath = path.join(
  __dirname,
  "../scripts-python",
  "venv",
  "bin",
  "python"
);

// Run a Python script and return the output as a promise
function runPythonScript(methodName, user) {
  const scriptPath = path.join(__dirname, "../scripts-python/scrape_table.py");

  return new Promise((resolve, reject) => {
    const pythonProcess = spawn(pythonPath, [scriptPath, methodName]);

    let output = "";
    let errorOutput = "";
    pythonProcess.stdout.on("data", (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on("data", (error) => {
      errorOutput += error.toString();
    });

    // Handle process close
    pythonProcess.on("close", (code) => {
      if (code === 0) {
        try {
          // Ensure JSON parsing does not fail
          const parsedOutput = JSON.parse(output);
          resolve(parsedOutput);
        } catch (parseError) {
          reject(`Invalid JSON output: ${output}`);
        }
      } else {
        reject(
          errorOutput ||
            `Python process exited with code ${code}, but no error message was provided.`
        );
      }
    });
  });
}

module.exports = { runPythonScript };
