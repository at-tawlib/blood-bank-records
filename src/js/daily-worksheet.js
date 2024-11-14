// Function to display records for a specific day
let currentEditRow = null;
let currentDay = "Monday";

// Function to display records in the worksheet
function displayRecords(day) {
  currentDay = day;
  localStorage.setItem("currentWorksheetDay", day);
  document.getElementById("updateSheetButtons").style.display = "none";

  // clear search input on page load
  document.getElementById("searchInput").value = "";

  // Fetch and format the date for the selected day
  const mostRecentDate = utils.getMostRecentDateForDay(day);
  const records = window.api.getRecords(mostRecentDate);

  utils.setActiveNavItem(currentDay); // Set selected day as active nav item
  displayTable(records);
  updateStats(records);

  // Show records table and hide the form and the search results
  document.getElementById("generalSearch").style.display = "none";
  document.getElementById("addForm").style.display = "none";
  document.getElementById("showRecords").style.display = "block";
  document.getElementById(
    "worksheetDay"
  ).innerHTML = `${day} (${utils.formatDate(mostRecentDate)})`;

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
      openModal(record);
    });

    setRhesusColors(row.children[3], record.rhesus);
    tableBody.appendChild(row);
  });
  document.getElementById("addRowButtons").style.display = "flex";
}

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

// Set active nav item
// function setActiveNavItem() {
//   // Get all sidebar items and remove the active class from all
//   const sidebarItems = document.querySelectorAll(".sidebar li");
//   utils.removeNavActiveClass();

//   // Find the clicked day item and add the active class to it
//   const activeItem = Array.from(sidebarItems).find(
//     (item) => item.textContent === currentDay
//   );

//   if (activeItem) {
//     activeItem.classList.add("active");
//   }
// }

// Add multiple rows to the table
function addMultipleRecords(number) {
  document.getElementById("updateSheetButtons").style.display = "flex";
  for (let i = 0; i < number; i++) addRecord();
}

// Add a new record to the table i.e add a new row
function addRecord() {
  const records = window.currentRecords;

  const tableBody = document.getElementById("bloodRecords");
  // Create and insert an editable row
  const row = document.createElement("tr");
  row.id = "saveRow";
  row.innerHTML = `
     <td>${tableBody.rows.length + 1}</td>
     <td><input type="text" id="saveName" required /></td>
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
     <td>
       <div class="btn-group-edit">
       <button class="btn-edit-cancel" title="Remove row" type="button" onclick="removeRecord(this)" tabIndex="-1"><i class="fa-solid fa-trash"></i></button>
       </div>
     </td>
   `;

  tableBody.insertBefore(row, tableBody.children[-1]);
}

// Function to show the editable row with pre-filled data
function showEditRow(index) {
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
}

// Update the records in the database with the new records
function updateWorksheet() {
  const recordDate = utils.getMostRecentDateForDay(currentDay);
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

    records.push({ date: recordDate, number, name, bloodGroup, rhesus });
  }

  if (records.length === 0) {
    showToast("No records to save.", "error");
    return;
  }

  // Add each row's data to the new records
  records.forEach((record) => {
    window.api.saveRecord(record);
  });

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

  document.getElementById("updateSheetButtons").style.display = "none";
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

  if(data.length === 0) {
    showToast("No data to export", "error");
    return;
  }

  window.db.exportToExcel(data, data[0].Date);
}

// Initial load: display records for Monday on page load
window.onload = () => {
  const lastViewedDay = localStorage.getItem("currentWorksheetDay") || "Monday";
  displayRecords(lastViewedDay);
};
