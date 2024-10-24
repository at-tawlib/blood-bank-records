// Function to show the form and hide the table
function showForm() {
  document.getElementById("showRecords").style.display = "none";
  document.getElementById("addForm").style.display = "block";
  initializeForm();
}

// Function to initialize the form with 5 rows
function initializeForm() {
  const formBody = document.getElementById("formBody");
  formBody.innerHTML = "";

  // Create 5 initial rows
  for (let i = 1; i <= 5; i++) {
    addRow(i);
  }
}

// Function to add a new row to the form
function addRow(number = null) {
  const formBody = document.getElementById("formBody");
  const rowNumber = number || formBody.rows.length + 1;

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

// Function to save records from the form
function saveRecords() {
  const recordDate = document.getElementById("recordDate").value;
  const formBody = document.getElementById("formBody");
  const rows = formBody.getElementsByTagName("tr");

  const records = [];

  if (!recordDate || recordDate === "") {
    // alert("Please select a date.");
    console.log("Please select a date.");
    return;
  }

  // Loop through each row and extract data and make sure none of the fields are empty
  for (let i = 0; i < rows.length; i++) {
    const number = rows[i].getElementsByTagName("td")[0].textContent;
    const inputs = rows[i].getElementsByTagName("input");
    const selects = rows[i].getElementsByTagName("select");
    const name = inputs[0].value;
    const bloodGroup = selects[0].value;
    const rhesus = selects[1].value;

    if (!name || name === "" || !bloodGroup || !rhesus) {
      console.log(`Row ${number} has missing data.`);
      return;
    }

    // TODO: Validate data before saving and do error handling
    records.push({ date: recordDate, number, name, bloodGroup, rhesus });
  }

  // Add each row's data to the new records
  // Use IPC or direct SQL query to save each record
  records.forEach((record) => {
    window.api.saveRecord(record);
  });

  // TODO: Use toastify here
  alert("Records saved successfully!");

  // Reset form and switch back to showing Monday's table
  // document.getElementById("addForm").style.display = "none";
  // document.getElementById("showRecords").style.display = "block";
  // displayRecords("Monday"); // Refresh Monday's data
}
