// Function to show the form and hide the table
function showForm() {
  document.getElementById("showRecords").style.display = "none"; // Hide table
  document.getElementById("addForm").style.display = "block"; // Show form
  initializeForm(); // Initialize the form with 5 rows
}

// Function to initialize the form with 5 rows
function initializeForm() {
  const formBody = document.getElementById("formBody");
  formBody.innerHTML = ""; // Clear any existing rows

  // Create 5 initial rows
  for (let i = 1; i <= 5; i++) {
    addRow(i);
  }
}

// Function to add a new row to the form
function addRow(number = null) {
  const formBody = document.getElementById("formBody");
  const rowNumber = number || formBody.rows.length + 1; // Increment row number

  const row = document.createElement("tr");
  row.innerHTML = `
        <td>${rowNumber}</td>
        <td><input type="text" name="name" placeholder="Name" required></td>
        <td>
            <select name="bloodGroup" required>
                <option value="" disabled selected>Blood Group</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="O">O</option>
                <option value="AB">AB</option>
            </select>
        </td>
        <td>
            <select name="rhesus" required>
                <option value="" disabled selected>Rhesus</option>
                <option value="Positive">Positive</option>
                <option value="Negative">Negative</option>
            </select>
        </td>
        <td><button type="button" onclick="removeRow(this)">X</button></td>
    `;
  formBody.appendChild(row);
}

//  Function to remove a row from the form
function removeRow(button) {
  // Find the row that contains the clicked button
  const row = button.closest("tr");
  row.remove();

  // Reset the row numbers for all rows
  resetRowNumbers();
}

// Function to reset the row numbers after a row is removed
function resetRowNumbers() {
  // Select all rows in the form body
  const rows = document.querySelectorAll("#formBody tr");
  rows.forEach((row, index) => {
    // Set the first cell (row number) to the current index + 1
    row.cells[0].textContent = index + 1;
  });
}

// TODO: Not used yet, remove if not needed
// Function to add a new record to the table
function addNewRecord(event) {
  event.preventDefault(); // Prevent page reload on form submit

  const name = document.getElementById("name").value;
  const bloodGroup = document.getElementById("bloodGroup").value;
  const rhesus = document.getElementById("rhesus").value;

  // Add new record to the Monday dataset (or adjust for other days as needed)
  bloodData.Monday.push({ name, bloodGroup, rhesus });

  // Reset form and show the table with updated data
  document.getElementById("newRecordForm").reset();
  document.getElementById("addForm").style.display = "none"; // Hide form
  document.getElementById("showRecords").style.display = "block"; // Show table

  displayRecords("Monday"); // Refresh Monday's records
}

// TODO: Not used yet, remove if not needed
// Function to save records from the form
function saveRecords() {
  const formBody = document.getElementById("formBody");
  const rows = formBody.getElementsByTagName("tr");
  const newRecords = [];

  // Loop through each row and extract data
  for (let i = 0; i < rows.length; i++) {
    const inputs = rows[i].getElementsByTagName("input");
    const selects = rows[i].getElementsByTagName("select");
    const name = inputs[0].value;
    const bloodGroup = selects[0].value;
    const rhesus = selects[1].value;

    // Add each row's data to the new records
    newRecords.push({ name, bloodGroup, rhesus });
  }

  // Add the new records to Monday's data (for now)
  bloodData.Monday.push(...newRecords);

  // Reset form and switch back to showing Monday's table
  document.getElementById("addForm").style.display = "none";
  document.getElementById("showRecords").style.display = "block";
  displayRecords("Monday"); // Refresh Monday's data
}
