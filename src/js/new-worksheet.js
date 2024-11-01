// Function to show the form and hide the table
function showForm() {
  // Get all sidebar items and remove the active class from all
  const sidebarItems = document.querySelectorAll(".sidebar li");
  sidebarItems.forEach((item) => item.classList.remove("active"));

  document.getElementById("generalSearch").style.display = "none";
  document.getElementById("showRecords").style.display = "none";
  document.getElementById("addForm").style.display = "block";
  initializeForm();
}

// Function to initialize the form with 5 rows
function initializeForm() {
  const formBody = document.getElementById("formBody");
  formBody.innerHTML = "";

  // Create 5 initial rows
  addMultipleRows(5);
}

// Function add multiple rows
function addMultipleRows(rowCount) {
  const formBody = document.getElementById("formBody");
  const currentRowCount = formBody.rows.length;

  // Loop to add rows with correct numbering
  for (let i = 1; i <= rowCount; i++) {
    addRow(currentRowCount + i);
  }
}

// Function to add a new row to the form
function addRow(number = null, rows = 1) {
  const formBody = document.getElementById("formBody");
  const rowNumber = number || formBody.rows.length + 1;

  const row = document.createElement("tr");
  row.innerHTML = `
        <td>${rowNumber}</td>
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

// Function to clear all data from the form
function clearAllRows() {
  const formBody = document.getElementById("formBody");
  formBody.innerHTML = "";

  initializeForm();
}

//  Function to remove a row from the form
function removeRow(button) {
  // Find the row that contains the clicked button
  const row = button.closest("tr");
  row.remove();

  // Reset the row numbers for all rows
  resetRowNumbers();
}

function closeSheet() {
  document.getElementById("addForm").style.display = "none";
  document.getElementById("showRecords").style.display = "block";
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
    showToast("Please select a date for the records.", "error");
    return;
  }

  // Loop through each row and extract data and make sure none of the fields are empty
  for (let i = 0; i < rows.length; i++) {
    rows[i].style.backgroundColor = "transparent";
    const number = rows[i].getElementsByTagName("td")[0].textContent;
    const inputs = rows[i].getElementsByTagName("input");
    const selects = rows[i].getElementsByTagName("select");
    const name = inputs[0].value;
    const bloodGroup = selects[0].value;
    const rhesus = selects[1].value;

    if (!name) {
      rows[i].style.backgroundColor = "red";
      showToast(`Row ${number} has missing data.`, "error");
      return;
    }

    if (!bloodGroup) {
      rows[i].style.backgroundColor = "red";
      showToast(`Row ${number} has missing data.`, "error");
      return;
    }

    if (!rhesus) {
      rows[i].style.backgroundColor = "red";
      showToast(`Row ${number} has missing data.`, "error");
      return;
    }

    // TODO: Validate data before saving and do error handling
    records.push({ date: recordDate, number, name, bloodGroup, rhesus });
  }

  if (records.length === 0) {
    showToast("No records to save.", "error");
    return;
  }

  // Add each row's data to the new records
  // Use IPC or direct SQL query to save each record
  records.forEach((record) => {
    window.api.saveRecord(record);
  });

  showToast("Records saved successfully!", "success");
}

// Get the selected date from the hidden date input field and format it
function formatSelectedDate() {
  const dateInput = document.getElementById("recordDate").value;
  if (!dateInput) return;

  // Convert the date to a JavaScript Date object
  const date = new Date(dateInput);

  // Format the date
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const formattedDate = date.toLocaleDateString("en-US", options);

  // Add day suffix (st, nd, rd, th)
  const day = date.getDate();
  const daySuffix = getDaySuffix(day);
  const formattedDateWithSuffix = formattedDate.replace(
    day,
    `${day}${daySuffix}`
  );

  // Display the formatted date in the text field
  document.getElementById("formattedDateDisplay").textContent =
    formattedDateWithSuffix;
}

// Helper function to determine the correct day suffix
function getDaySuffix(day) {
  if (day > 3 && day < 21) return "th"; // Covers 11th-19th
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

// listen for the "open-new-worksheet" event from the main process
window.api.onOpenNewWorksheet(showForm);
