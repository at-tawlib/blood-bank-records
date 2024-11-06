// Initialize form with a specified number of rows
function initializeForm(rowCount) {
  utils.setActiveNavItem("New Worksheet"); // set current item to active
  const formBody = document.getElementById("formBody");
  formBody.innerHTML = "";
  addRows(rowCount);
}

// Function to show the form and hide the table
function showForm() {
  document.getElementById("recordDate").value = "";
  document.getElementById("formattedDateDisplay").textContent = "";

  document.getElementById("generalSearch").style.display = "none";
  document.getElementById("showRecords").style.display = "none";
  document.getElementById("addForm").style.display = "block";

  initializeForm(5);
}

// Add new rows to the form
function addRows(rowCount) {
  const formBody = document.getElementById("formBody");

  // Loop to add rows with correct numbering
  for (let i = 1; i <= rowCount; i++) {
    // addRow(formBody.rows.length + 1);
    const row = document.createElement("tr");
    row.innerHTML = `
          <td>${formBody.rows.length + 1}</td>
          <td><input type="text" name="name" placeholder="Name" required></td>
          <td>
              <select name="bloodGroup" required>
                  <option value="" disabled selected>Blood Group</option>
                  <option value="O">O</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
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
          <td><button class="btn-delete" type="button" tabindex="-1"
          title="Remove row" onclick="removeRow(this)">
            <i class="fa-solid fa-trash"></i>
          </button></td>
      `;
    formBody.appendChild(row);
  }
}

// Date validation and formatting on change
document.getElementById("recordDate").addEventListener("change", function () {
  const date = this.value;
  const currentDate = new Date().toISOString().split("T")[0];

  // Check if date already exists in the database
  if (window.api.checkDate(date)) {
    showToast(
      "Records already exist for this date. Please select another date.",
      "error"
    );
    resetDateInput();
    return;
  }

  // Ensure the selected date is not in the future
  if (date > currentDate) {
    showToast("Cannot select a future date.", "error");
    resetDateInput();
  } else {
    formatSelectedDate();
  }
});

// Function to reset date input and display
function resetDateInput() {
  document.getElementById("recordDate").value = "";
  document.getElementById("formattedDateDisplay").textContent = "";
}

// Function to clear all data from the form
function clearAllRows() {
  const formBody = document.getElementById("formBody");
  formBody.innerHTML = "";
  initializeForm(5);
}

// Find the row that contains the clicked button and remove it from the form
function removeRow(button) {
  button.closest("tr").remove();
  resetRowNumbers();
}

// Reset row numbers after removing a row
// Select all rows in the form body, and set the first cell (row number) to the current index + 1
function resetRowNumbers() {
  document.querySelectorAll("#formBody tr").forEach((row, index) => {
    row.cells[0].textContent = index + 1;
  });
}

// Close the form and display records table
function closeSheet() {
  document.getElementById("addForm").style.display = "none";
  document.getElementById("showRecords").style.display = "block";
}

// Function to save records from the form
function saveRecords() {
  const recordDate = document.getElementById("recordDate").value;
  if (!recordDate || recordDate === "") {
    showToast("Please select a date for the records.", "error");
    return;
  }

  const records = [];
  const rows = document.getElementById("formBody").getElementsByTagName("tr");

  // Loop through each row and extract data and make sure none of the fields are empty
  for (let row of rows) {
    row.style.backgroundColor = "transparent";
    const number = row.cells[0].textContent;
    const name = row.querySelector("input[name='name']").value;
    const bloodGroup = row.querySelector("select[name='bloodGroup']").value;
    const rhesus = row.querySelector("select[name='rhesus']").value;

    if (!validateRowData(row, number, name, bloodGroup, rhesus)) return;
    records.push({ date: recordDate, number, name, bloodGroup, rhesus });
  }

  if (records.length === 0) {
    showToast("No records to save.", "error");
    return;
  }

  // Add each row's data to the new records
  // Use IPC or direct SQL query to save each record
  records.forEach((record) => window.api.saveRecord(record));
  showToast("Records saved successfully!", "success");
  closeSheet();
}

// Validate form row data
function validateRowData(row, number, name, bloodGroup, rhesus) {
  if (!name) {
    row.style.backgroundColor = "red";
    showToast(`Row ${number} has no name.`, "error");
    return false;
  }
  if (!bloodGroup) {
    row.style.backgroundColor = "red";
    showToast(`Select blood group for Row ${number}`, "error");
    return false;
  }
  if (!rhesus) {
    row.style.backgroundColor = "red";
    showToast(`Select rhesus for Row ${number}`, "error");
    return false;
  }
  return true;
}

// Format selected date and display with suffix
function formatSelectedDate() {
  // Convert the date to a JavaScript Date object
  const date = new Date(document.getElementById("recordDate").value);
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const formattedDate = date.toLocaleDateString("en-US", options);
  const daySuffix = utils.getDaySuffix(date.getDate());

  document.getElementById("formattedDateDisplay").textContent =
    formattedDate.replace(date.getDate(), `${date.getDate()}${daySuffix}`);
}

// listen for the "open-new-worksheet" event from the main process
window.api.onOpenNewWorksheet(showForm);
