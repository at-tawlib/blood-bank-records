// Function to display records for a specific day
let currentEditRow = null;
let currentDay = "Monday";
let currentDate = "";
let updateTable = false;
let focusedInput = null;

// Add event listener to all input fields dynamically
document.getElementById("bloodRecords").addEventListener("focusin", (event) => {
  // Check if the focused element is an input field
  if (event.target.tagName === "INPUT" && event.target.type === "text") {
    focusedInput = event.target;
  }
});

// Function to display records in the worksheet
function displayRecords(day) {
  currentDay = day;
  localStorage.setItem("currentWorksheetDay", day);
  document.getElementById("updateSheetButtons").style.display = "none";
  document.getElementById("statsTable").style.display = "table";
  document.getElementById("dailyLHIMSTable").style.display = "none";
  document.getElementById("dailyScientistContainer").style.display = "none";
  document.getElementById("pastRecordDateContainer").style.display = "none";

  // clear search input on page load
  document.getElementById("searchInput").value = "";

  // Fetch and format the date for the selected day
  // const mostRecentDate = utils.getMostRecentDateForDay(day);
  currentDate = utils.getMostRecentDateForDay(day);
  const records = window.api.getRecords(currentDate);

  utils.setActiveNavItem(currentDay); // Set selected day as active nav item
  displayTable(records);
  updateStats(records);

  // Show records table and hide the form and the search results
  document.getElementById("generalSearch").style.display = "none";
  document.getElementById("addForm").style.display = "none";
  document.getElementById("showRecords").style.display = "block";
  document.getElementById("workSheetDateContainer").style.display = "flex";
  document.getElementById(
    "worksheetDay"
  ).innerHTML = `${day} (${utils.formatDate(currentDate)})`;

  // Store records globally for easy access in editing functions
  window.currentRecords = records;
}

// Function to create and display records in a table
function displayTable(records) {
  if (records.length === 0) {
    document.getElementById("worksheetContent").style.display = "none";
    document.getElementById("noData").style.display = "block";
    document.getElementById("noData").innerText =
      "No records found for this day.";
    return;
  }

  // Populate table with records
  const tableBody = document.getElementById("bloodRecords");
  tableBody.innerHTML = ""; // Clear previous content

  document.getElementById("worksheetContent").style.display = "block";
  document.getElementById("noData").style.display = "none";
  records.forEach((record, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
    <td>${record.number}</td>
    <td>${record.name}</td>
    <td>${record.bloodGroup}</td>
    <td>${record.rhesus}</td>
    <td>${record.scientist || ""}</td>
    <td>
    <div class="btn-group-edit">
      <button class="btn-edit-record" type="button" title="Edit record" onclick="showEditRow(${index})">
        <i class="fa-solid fa-edit"></i>
      </button>
      <button class="btn-view-record" type="button" title="View record">
        <i class="fa-solid fa-eye"></i>
      </button>
    </div>
    </td>
  `;

    row.querySelector(".btn-view-record").addEventListener("click", () => {
      openPatientModal(record);
    });

    setRhesusColors(row.children[3], record.rhesus);
    tableBody.appendChild(row);
  });
  document.getElementById("addRowButtons").style.display = "flex";
}

function displayPastRecords() {
  // Show records table and hide the form and the search results
  document.getElementById("generalSearch").style.display = "none";
  document.getElementById("addForm").style.display = "none";
  document.getElementById("showRecords").style.display = "block";
  document.getElementById("pastRecordDateContainer").style.display = "flex";

  document.getElementById("workSheetDateContainer").style.display = "none";
  document.getElementById("worksheetContent").style.display = "none";
  document.getElementById("noData").style.display = "none";
  utils.setActiveNavItem("Past Worksheet");
}

document
  .getElementById("pastRecordDate")
  .addEventListener("change", async function () {
    const date = this.value;
    const todaysDate = new Date().toISOString().split("T")[0];

    // Ensure the selected date is not in the future
    if (date > todaysDate) {
      showToast("Cannot select a future date.", "error");
      return;
    }

    const records = window.api.getRecords(date);
    displayTable(records);
    updateStats(records);
    
    document.getElementById("workSheetDateContainer").style.display = "flex";
    document.getElementById("worksheetDay").innerHTML = `${utils.formatDate(
      date
    )}`;
    
    // Store records globally for easy access in editing functions
    currentDate = date;
    window.currentRecords = records;
  });

// Group and count blood groups and rhesus and show in table
function updateStats(records) {
  const bloodGroupCount = records.reduce((acc, record) => {
    acc[record.bloodGroup] = (acc[record.bloodGroup] || 0) + 1;
    return acc;
  }, {});

  // Combine blood group and rhesus and count each unique combination
  const combinedCount = records.reduce((acc, record) => {
    const key = `${record.bloodGroup} ${record.rhesus}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const statsTable = document.getElementById("statsBody");
  statsTable.innerHTML = "";

  const totalRow = document.createElement("tr");
  totalRow.innerHTML = `
    <td>Total </td><td>${records.length}</td>`;
  statsTable.appendChild(totalRow);

  // Iterate over blood groups and rhesus to display stats
  for (const [type, count] of Object.entries(combinedCount)) {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${type}</td><td>${count}</td>`;
    statsTable.appendChild(row);
  }
}

// Add multiple rows to the table
function addMultipleRecords(number) {
  if (!updateTable) updateTable = true;

  // Check and remove any active edit row
  if (currentEditRow !== null) {
    document.getElementById("bloodRecords").children[
      currentEditRow
    ].style.display = "table-row";
    document.getElementById("editRow")?.remove();
    currentEditRow = null;
  }

  document.getElementById("statsTable").style.display = "none";
  document.getElementById("dailyLHIMSTable").style.display = "table";
  document.getElementById("dailyScientistContainer").style.display = "flex";

  document.getElementById("updateSheetButtons").style.display = "flex";
  for (let i = 0; i < number; i++) addRecord();
}

// Add a new record to the table i.e add a new row
function addRecord() {
  const tableBody = document.getElementById("bloodRecords");
  // Create and insert an editable row
  const row = document.createElement("tr");
  row.id = "saveRow";
  row.innerHTML = `
      <td>${tableBody.rows.length + 1}</td>
        <td style="position: relative;">
          <input type="text" id="saveName" name="name" placeholder="Name" required />
          <ul class="suggestion-list"></ul>
      </td>
      <td>
        <select id="saveBloodGroup" required>
        <option value="" disabled selected>Blood Group</option>
          <option value="O">O</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="AB">AB</option>
        </select>
      </td>
      <td>
        <select id="saveRhesus" required>
        <option value="" disabled selected>Rhesus</option>
          <option value="Positive">Positive</option>
          <option value="Negative">Negative</option>
        </select>
      </td>
      <td></td>
      <td>
        <div class="btn-group-edit">
        <button class="btn-edit-cancel" title="Remove row" type="button" onclick="removeRecord(this)" tabIndex="-1"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
   `;

  tableBody.insertBefore(row, tableBody.children[-1]);

  // Attach event listener to the input for auto-suggest
  const input = row.querySelector('input[name="name"]');
  const hiddenIdInput = row.querySelector('input[name="id"]');
  const suggestionList = row.querySelector(".suggestion-list");
  attachAutoSuggest(input, hiddenIdInput, suggestionList, lhimsData);
}

// Function to show the editable row with pre-filled data
function showEditRow(index) {
  // If table is being updated, do not show editable row
  if (updateTable) return;

  // make sure that only one row is editable at a time
  if (currentEditRow !== null) {
    cancelEdit();
  }

  const record = window.currentRecords[index];
  currentEditRow = index;

  // Create and insert an editable row
  const row = document.createElement("tr");
  row.id = "editRow";
  row.innerHTML = `
    <td>${record.number}</td>
    <td><input type="text" id="editName" value="${record.name}" required /></td>
    <td>
      <select id="editBloodGroup" required>
        <option value="O" ${
          record.bloodGroup === "O" ? "selected" : ""
        }>O</option>
        <option value="A" ${
          record.bloodGroup === "A" ? "selected" : ""
        }>A</option>
        <option value="B" ${
          record.bloodGroup === "B" ? "selected" : ""
        }>B</option>
        <option value="AB" ${
          record.bloodGroup === "AB" ? "selected" : ""
        }>AB</option>
      </select>
    </td>
    <td>
      <select id="editRhesus" required>
        <option value="Positive" ${
          record.rhesus === "Positive" ? "selected" : ""
        }>Positive</option>
        <option value="Negative" ${
          record.rhesus === "Negative" ? "selected" : ""
        }>Negative</option>
      </select>
    </td>
    <td>${record.scientist || ""}</td>
    <td>
      <div class="btn-group-edit">
      <button class="btn-edit-save" title="Update" type="button" onclick="saveEdit()"><i class="fa-solid fa-save"></i></button>
      <button class="btn-edit-cancel" title="Cancel" type="button" onclick="cancelEdit()"><i class="fa-solid fa-remove"></i></button>
      </div>
    </td>
  `;

  // Insert editable row after the current row and hide the current row
  const tableBody = document.getElementById("bloodRecords");
  tableBody.children[index].style.display = "none";
  tableBody.insertBefore(row, tableBody.children[index + 1]);

  document.getElementById("statsTable").style.display = "none";
  document.getElementById("dailyLHIMSTable").style.display = "table";
}

// Clear daily LHIMS data from table
function clearDailyLHIMSData() {
  document.getElementById("dailyLHIMSTable").querySelector("tbody").innerHTML =
    "";
}

// Save the edited data
function saveEdit() {
  // Get updated values
  const updatedName = document.getElementById("editName").value;
  const updatedBloodGroup = document.getElementById("editBloodGroup").value;
  const updatedRhesus = document.getElementById("editRhesus").value;

  // Make sure all fields are filled
  if (
    !updatedName ||
    updatedName === "" ||
    !updatedBloodGroup ||
    !updatedRhesus
  ) {
    showToast("Please fill all fields", "error");
    return;
  }

  // Update global records and table row
  const record = window.currentRecords[currentEditRow];
  // Make sure no changes were made
  if (
    record.name === updatedName &&
    record.bloodGroup === updatedBloodGroup &&
    record.rhesus === updatedRhesus
  ) {
    showToast("No changes made", "error");
    return;
  }

  record.name = updatedName;
  record.bloodGroup = updatedBloodGroup;
  record.rhesus = updatedRhesus;

  const row = document.getElementById("bloodRecords").children[currentEditRow];
  row.cells[1].textContent = updatedName;
  row.cells[2].textContent = updatedBloodGroup;
  row.cells[3].textContent = updatedRhesus;

  // Save current day to local storage before updating the record
  localStorage.setItem("currentWorksheetDay", currentDay);
  // Hide editable row and update database
  document.getElementById("editRow").remove();
  window.api.updateRecord(record);
  showToast("Record updated successfully", "success");
  displayRecords(currentDay);
}

// Cancel editing
function cancelEdit() {
  // Remove editable row and show the original row
  document.getElementById("bloodRecords").children[
    currentEditRow
  ].style.display = "table-row";
  document.getElementById("editRow")?.remove();
  currentEditRow = null;

  document.getElementById("statsTable").style.display = "table";
  document.getElementById("dailyLHIMSTable").style.display = "none";
}

// Update the records in the database with the new records
// Add new records to the database of the same date
function updateWorksheet() {
  // const recordDate = utils.getMostRecentDateForDay(currentDay);
  const formBody = document.getElementById("bloodRecords");
  const rows = formBody.getElementsByTagName("tr");

  const records = [];

  // Loop through each row and extract data and make sure none of the fields are empty
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].id !== "saveRow") continue;
    rows[i].style.backgroundColor = "transparent";
    const number = rows[i].getElementsByTagName("td")[0].textContent;
    const inputs = rows[i].getElementsByTagName("input");
    const selects = rows[i].getElementsByTagName("select");
    const name = inputs[0].value;
    const bloodGroup = selects[0].value;
    const rhesus = selects[1].value;

    if (!name) {
      rows[i].style.backgroundColor = "red";
      showToast(`Row ${number} has no name.`, "error");
      return;
    }

    if (!bloodGroup) {
      rows[i].style.backgroundColor = "red";
      showToast(`Select blood group for Row ${number}`, "error");
      return;
    }

    if (!rhesus) {
      rows[i].style.backgroundColor = "red";
      showToast(`Select rhesus for Row${number}`, "error");
      return;
    }

    records.push({
      date: currentDate,
      number,
      name,
      bloodGroup,
      rhesus,
    });
  }

  if (records.length === 0) {
    showToast("No records to save.", "error");
    return;
  }

  // Check if scientist name has been entered
  const scientist = document.getElementById("scientistName").value;
  if (!scientist) {
    showToast("Please enter your name", "error");
    document.getElementById("scientistName").style.backgroundColor = "red";
    return;
  }

  // Add each row's data to the new records array
  records.forEach((record) => {
    window.api.saveRecord({ ...record, scientist });
  });

  document.getElementById("scientistName").style.display = "none";
  document.getElementById("scientistName").value = "";

  updateTable = false;
  showToast("Worksheet updated successfully!", "success");
  displayRecords(currentDay);
}

// Remove the new record row
function removeRecord(button) {
  // Find the row that contains the clicked button
  const row = button.closest("tr");
  row.remove();

  // Reset the row numbers for all rows
  resetWorksheetRowNumbers();

  // Hide the update buttons if there are no empty rows
  const lastRow = document.querySelector("#bloodRecords").lastElementChild;
  if (lastRow.id !== "saveRow") {
    document.getElementById("updateSheetButtons").style.display = "none";
    document.getElementById("statsTable").style.display = "table";
    document.getElementById("dailyLHIMSTable").style.display = "none";
    document.getElementById("dailyScientistContainer").style.display = "none";
    updateTable = false;
  }
}

// Remove all new rows
function removeNewRows() {
  const rows = document.querySelectorAll("#bloodRecords tr");
  rows.forEach((row) => {
    if (row.id === "saveRow") {
      row.remove();
    }
  });

  document.getElementById("scientistName").value = "";
  document.getElementById("updateSheetButtons").style.display = "none";
  document.getElementById("statsTable").style.display = "table";
  document.getElementById("dailyLHIMSTable").style.display = "none";
  document.getElementById("dailyScientistContainer").style.display = "none";
  updateTable = false;
}

// Function to reset the row numbers after a row is removed
function resetWorksheetRowNumbers() {
  // Select all rows in the form body
  const rows = document.querySelectorAll("#bloodRecords tr");
  rows.forEach((row, index) => {
    // Set the first cell (row number) to the current index + 1
    row.cells[0].textContent = index + 1;
  });
}

// Function to filter the table based on search input
function filterTable() {
  const searchValue = document
    .getElementById("searchInput")
    .value.toLowerCase();
  const tableRows = document
    .getElementById("bloodRecords")
    .getElementsByTagName("tr");

  for (let row of tableRows) {
    const cells = row.getElementsByTagName("td");
    const nameCell = cells[1]?.textContent.toLowerCase();

    if (!nameCell) return;

    // Check if search value is included in the name
    if (nameCell.includes(searchValue)) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  }
}

// Function to export data to excel
function exportToExcel() {
  const data = window.currentRecords.map((record) => {
    return {
      Date: record.date,
      Number: record.number,
      Name: record.name,
      "Blood Group": record.bloodGroup,
      Rhesus: record.rhesus,
      LHIMS: record.lhimsNumber,
    };
  });

  if (data.length === 0) {
    showToast("No data to export", "error");
    return;
  }

  window.db.exportToExcel(data, data[0].Date);
}

// Fetch LHIMS data and display in a table
// TODO: same implementation as fetchLHIMSData in the new-worksheet.js file
async function fetchDailyLHIMSData() {
  const tableBody = document
    .getElementById("dailyLHIMSTable")
    .querySelector("tbody");
  const date = document.getElementById("dailyLHIMSdate").value;
  tableBody.innerHTML = "";

  const loadingRow = document.createElement("tr");
  loadingRow.innerHTML = `<td colspan="2">Loading LHIMS data...</td>`;
  tableBody.appendChild(loadingRow);

  if (!sessionData.checkSessionData()) {
    showToast("Please login to fetch LHIMS data.", "error");
    const loadingRow = document.createElement("tr");
    loadingRow.innerHTML = `<td colspan="2">Login to fetch LHIMS Data</td>`;

    const trButton = document.createElement("tr");
    trButton.innerHTML = `
      <td colspan="2">
        <button class="btn" onclick="fetchDailyLHIMSData()">Retry</button>
      </td>
    `;
    trButton.style.textAlign = "center";

    tableBody.appendChild(loadingRow);
    tableBody.appendChild(trButton);
    return;
  }

  const username = sessionData.getSessionData("username");
  const password = sessionData.getSessionData("password");

  const data = await window.lhims.fetchDailyLHIMSData(username, password, date);

  if (!data.success) {
    // TODO: Add error log here
    showToast("Failed to fetch LHIMS data. Please try again.", "error");
    tableBody.innerHTML = "";
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="2">Failed to fetch LHIMS data</td>`;
    tr.style.textAlign = "center";

    const trButton = document.createElement("tr");
    trButton.innerHTML = `
      <td colspan="2">
        <button class="btn" onclick="fetchDailyLHIMSData()">Retry</button>
      </td>
    `;
    trButton.style.textAlign = "center";

    tableBody.appendChild(tr);
    tableBody.appendChild(trButton);
    return;
  } else {
    lhimsData.splice(0);
    lhimsData.push(...data.data);
  }

  if (lhimsData.length === 0) {
    tableBody.innerHTML = "";
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="2">No data found for date</td>`;
    tr.style.textAlign = "center";
    tableBody.appendChild(tr);
    return;
  }

  tableBody.innerHTML = "";
  lhimsData.forEach((item) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${item.name}</td><td>${item.lhimsNumber}</td>`;
    tr.addEventListener("click", () => {
      if (focusedInput) {
        focusedInput.value = item.name;
        focusedInput.closest("tr").querySelector('input[name="id"]').value =
          item.lhimsNumber;
        focusedInput
          .closest("tr")
          .querySelector(".suggestion-list").style.display = "none";
        focusedInput = null;
      } else {
        showToast("Please select an input field to populate.", "error");
      }
    });
    tableBody.appendChild(tr);
  });

  // document.getElementById("dailyLHIMSTable").style.display = "table";
}

// Initial load: display records for Monday on page load
window.onload = () => {
  const lastViewedDay = localStorage.getItem("currentWorksheetDay") || "Monday";
  displayRecords(lastViewedDay);

  document.getElementById("dailyLHIMSTable").style.display = "none";
  document.getElementById("accountInfo").style.display = "none";
  document.getElementById("dailyScientistContainer").style.display = "none";

  // Check if user is logged in
  const username = sessionData.getSessionData("username");
  const password = sessionData.getSessionData("password");
  if (username && password) {
    document.getElementById("accountInfo").style.display = "flex";
    document.getElementById("loginBtn").style.display = "none";
  }
};
