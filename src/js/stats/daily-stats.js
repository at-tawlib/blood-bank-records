let currentDailyEditRow = null;
// *************** FOR DAILY STATS TABLE ***********************
document.getElementById("dailyStatsSearchBtn").addEventListener("click", () => {
  const month = document.getElementById("dailyRecordsMonth").value;
  const year = document.getElementById("dailyRecordsYear").value;
  showDailyStats(month, year);
});

async function showDailyStats(month, year) {
  statsUtils.showContainer("daily-stats-table");

  if (!month || !year) {
    showToast("Please select a month and year", "error");
    return;
  }

  const records = await window.statsPage.getDailyRecords({ month, year });

  console.log(records);
  const tableBody = document.getElementById("dailyStatsTableBody");
  const tableHead = document.getElementById("dailyStatsTableHeader");
  const tableFooter = document.getElementById("dailyStatsTableFooter");
  tableBody.innerHTML = "";
  tableHead.innerHTML = "";
  tableFooter.innerHTML = "";

  tableHead.innerHTML = `${month}, ${year}`;

  if (records.success === false) {
    showToast(`Error fetching data: ${records.error}`, "error");
    document.getElementById("addRowButtons").style.display = "none";
    document.getElementById("updateSheetButtons").style.display = "none";
    return;
  }

  if (records.data.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="5">No data found for ${month}, ${year}</td>`;
    tableBody.appendChild(row);
    document.getElementById("addRowButtons").style.display = "none";
    document.getElementById("updateSheetButtons").style.display = "none";
    return;
  }

  document.getElementById("addRowButtons").style.display = "flex";

  records.data.forEach((record, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${record.day}</td>
        <td>${record.bloodGroup}</td>
        <td>${record.crossmatch}</td>
        <td>${record.issued}</td>
        <td>${record.returned}</td>
        <td>${record.issued - record.returned}</td>
        <td class="btn-edit-record" onclick="showDailyStatsEditRow(this, ${index})"><i class="fa-solid fa-edit"> Edit</i></td>
      `;
    tableBody.appendChild(row);
  });

  // Calculate totals
  const totals = records.data.reduce(
    (acc, curr) => {
      acc.bloodGroup += curr.bloodGroup;
      acc.crossmatch += curr.crossmatch;
      acc.issued += curr.issued;
      acc.returned += curr.returned;
      return acc;
    },
    { bloodGroup: 0, crossmatch: 0, issued: 0, returned: 0 }
  );

  const footerRow = document.createElement("tr");
  footerRow.innerHTML = `
        <td>Total: </td>
        <td>${totals.bloodGroup}</td>
        <td>${totals.crossmatch}</td>
        <td>${totals.issued}</td>
        <td>${totals.returned}</td>
        <td>${totals.issued - totals.returned}</td>
        `;
  tableFooter.appendChild(footerRow);
}

function showDailyStatsEditRow(button, index) {
  // make sure that only one row is editable at a time
  if (currentDailyEditRow !== null) {
    showToast("Finish editing selected row first", "error")
    return;
  }

  const row = button.closest("tr");
  currentDailyEditRow = row;

  document.getElementById("dailyRecordsMonth").disabled = true;
  document.getElementById("dailyRecordsYear").disabled = true;

  row.style.backgroundColor = "transparent";
  const day = row.getElementsByTagName("td")[0].textContent;
  const bloodGroup = row.getElementsByTagName("td")[1].textContent;
  const crossmatch = row.getElementsByTagName("td")[2].textContent;
  const issued = row.getElementsByTagName("td")[3].textContent;
  const returned = row.getElementsByTagName("td")[4].textContent;

  // Create and insert an editable row
  const newRow = document.createElement("tr");
  newRow.id = "editRow";

  newRow.innerHTML = `
      <td id="editDay">${day}</td>
      <td><input type="number" id="editBloodGroup" value="${bloodGroup}"></td>
      <td><input type="number" id="editCrossmatch" value="${crossmatch}"></td>
      <td><input type="number" id="editIssued" value="${issued}"></td>
      <td><input type="number" id="editReturned" value="${returned}"></td>
      <td></td>
      <td>
       <div class="btn-group-edit">
        <button class="btn-edit-save" title="Update" type="button" onclick="saveDailyEditRow()"><i class="fa-solid fa-save"></i></button>
        <button class="btn-edit-cancel" title="Cancel" type="button" onclick="cancelDailyEditRow(${index})"><i class="fa-solid fa-remove"></i></button>
      </div>
      </td>
  `;

  // Insert the editable row after the current row and hide the current row
  const tableBody = document.getElementById("dailyStatsTableBody");
  // tableBody.children[index].style.display = "none";
  // row.style.display = "none";
  row.remove();
  tableBody.insertBefore(newRow, tableBody.children[index]);

  // currentDailyEditRow = newRow;
}

function cancelDailyEditRow(index) {
  const day = currentDailyEditRow.getElementsByTagName("td")[0].textContent;
  const bloodGroup = currentDailyEditRow.getElementsByTagName("td")[1].textContent;
  const crossmatch = currentDailyEditRow.getElementsByTagName("td")[2].textContent;
  const issued = currentDailyEditRow.getElementsByTagName("td")[3].textContent;
  const returned = currentDailyEditRow.getElementsByTagName("td")[4].textContent;

  const row = document.createElement("tr");
  row.innerHTML = `
      <td>${day}</td>
      <td>${bloodGroup}</td>
      <td>${crossmatch}</td>
      <td>${issued}</td>
      <td>${returned}</td>
      <td>${issued - returned}</td>
      <td class="btn-edit-record" onclick="showDailyStatsEditRow(this, ${index})"><i class="fa-solid fa-edit"> Edit</i></td>
    `;

  const tableBody = document.getElementById("dailyStatsTableBody");
  tableBody.insertBefore(row, tableBody.children[index + 1]);
  tableBody.children[index].remove();

  document.getElementById("dailyRecordsMonth").disabled = false;
  document.getElementById("dailyRecordsYear").disabled = false;
  currentDailyEditRow = null;
}

async function saveDailyEditRow() {
  // Get updated values
  const day = document.getElementById("editDay").textContent;
  const bloodGroup = document.getElementById("editBloodGroup").value;
  const crossmatch = document.getElementById("editCrossmatch").value;
  const issued = document.getElementById("editIssued").value;
  const returned = document.getElementById("editReturned").value;

  if(!day || !bloodGroup || !crossmatch || !issued || !returned){
    showToast("Please enter values for all fields", "error");
    return;
  }

  const month = document.getElementById("dailyRecordsMonth").value;
  const year = document.getElementById("dailyRecordsYear").value;
  const record = { day, bloodGroup, crossmatch, issued, returned, month, year };

  console.log(day, bloodGroup, crossmatch, issued, returned, month, year)

  const response = await window.statsPage.updateDailyRecord(record);
  if (!response.success) {
    showToast(
      `Error saving record for ${record.day} ${record.month} ${record.year}: ${response.error}`,
      "error"
    );
    return;
  }
  currentDailyEditRow = null;
  showToast("Record updated successfully", "success");
  document.getElementById("dailyRecordsMonth").disabled = false;
  document.getElementById("dailyRecordsYear").disabled = false;
  showDailyStats(month, year)
}

function addDailyRecords(number) {
  // TODO: check if rows are more than 30 or 31 and stop depending on day and month
  const tableBody = document.getElementById("dailyStatsTableBody");
  document.getElementById("updateSheetButtons").style.display = "flex";
  for (let i = 0; i < number; i++) {
    const row = document.createElement("tr");
    row.id = "saveRow";
    row.innerHTML = `
          <td>${tableBody.rows.length + 1}</td>
          <td><input type="number" id="bloodGroup"></td>
          <td><input type="number" id="crossmatch"></td>
          <td><input type="number" id="issued"></td>
          <td><input type="number" id="returned"></td>
          <td></td>
          <td>
            <div class="btn-group-edit">
            <button class="btn-edit-cancel" title="Remove row" type="button" onclick="removeRecord(this)" tabIndex="-1"><i class="fa-solid fa-trash"></i></button>
            </div>
          </td>
       `;

    tableBody.insertBefore(row, tableBody.children[-2]);
  }
}

function removeRecord(button) {
  // Find the row that contains the clicked button
  const lastRow = document.getElementById(
    "dailyStatsTableBody"
  ).lastElementChild;
  const row = button.closest("tr");
  if (lastRow === row) row.remove();
  else showToast("Only last row can be removed", "error");

  const newLastRow = document.getElementById(
    "dailyStatsTableBody"
  ).lastElementChild;
  if (newLastRow.id !== "saveRow")
    document.getElementById("updateSheetButtons").style.display = "none";
}

async function updateDailyRecords() {
  const month = document.getElementById("dailyRecordsMonth").value;
  const year = document.getElementById("dailyRecordsYear").value;

  const formBody = document.getElementById("dailyStatsTableBody");
  const rows = formBody.getElementsByTagName("tr");

  const records = [];

  // Loop through each row and extract data and make sure none of the fields are empty
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].id !== "saveRow") continue;
    rows[i].style.backgroundColor = "transparent";
    const day = rows[i].getElementsByTagName("td")[0].textContent;
    const inputs = rows[i].getElementsByTagName("input");
    const bloodGroup = inputs[0].value;
    const crossmatch = inputs[1].value;
    const issued = inputs[2].value;
    const returned = inputs[3].value;

    if (!bloodGroup) {
      rows[i].style.backgroundColor = "red";
      showToast(`Row ${day} has no blood group value.`, "error");
      return;
    }

    if (!crossmatch) {
      rows[i].style.backgroundColor = "red";
      showToast(`Row ${day} has no crossmatch value.`, "error");
      return;
    }

    if (!issued) {
      rows[i].style.backgroundColor = "red";
      showToast(`Row ${day} has no issued value.`, "error");
      return;
    }

    if (!returned) {
      rows[i].style.backgroundColor = "red";
      showToast(`Row ${day} has no returned value.`, "error");
      return;
    }

    records.push({
      day,
      bloodGroup,
      crossmatch,
      issued,
      returned,
      month,
      year,
    });
  }

  if (records.length === 0) {
    showToast("No records to save.", "error");
    return;
  }

  for (const record of records) {
    const response = await window.statsPage.insertDailyRecord(record);
    console.log("Response: ", response);
    if (!response.success) {
      showToast(
        `Error saving record for ${record.day} ${record.month} ${record.year}: ${response.error}`,
        "error"
      );
      return;
    }
  }

  showToast("Records saved successfully", "success");
  showDailyStats(month, year);
}

// Remove all added new rows from the daily stats table
document.getElementById("clearDailyRowsBtn").addEventListener("click", () => {
  const rows = document.querySelectorAll("#dailyStatsTableBody tr");
  rows.forEach((row) => {
    if (row.id === "saveRow") {
      row.remove();
    }
    document.getElementById("updateSheetButtons").style.display = "none";
  });
});

// *************** FOR DAILY STATS FORM TABLE *******************
function showDailyStatsForm() {
  statsUtils.showContainer("daily-stats-form");

  const formBody = document.getElementById("dailyStatsFormBody");
  formBody.innerHTML = "";
  document.getElementById("dailyRecordsFormMonth").style.backgroundColor =
    "transparent";
  document.getElementById("dailyRecordsFormYear").style.backgroundColor =
    "transparent";

  for (let i = 1; i <= 5; i++) {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${i}</td>
        <td><input type="number" id="bloodGroup"></td>
        <td><input type="number" id="crossmatch"></td>
        <td><input type="number" id="issued"></td>
        <td><input type="number" id="returned"></td>
        <td>
          <button class="btn-delete" type="button" tabindex="-1" title="Remove row" onclick="removeDailyStatsFormRow(this)">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      `;
    formBody.appendChild(row);
  }
}

function addDailyRowToForm(rowCount) {
  // TODO: check if rows are more than 30 or 31 and stop depending on day and month
  const tableBody = document.getElementById("dailyStatsFormBody");
  for (let i = 0; i < rowCount; i++) {
    // Create and insert an editable row
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${tableBody.rows.length + 1}</td>
        <td><input type="number" id="bloodGroup"></td>
        <td><input type="number" id="crossmatch"></td>
        <td><input type="number" id="issued"></td>
        <td><input type="number" id="returned"></td>
        <td>
          <button class="btn-delete" type="button" tabindex="-1" title="Remove row" onclick="removeDailyStatsFormRow(this)">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
     `;
    tableBody.appendChild(row);
  }
}

// Remove a dailyStats form row and resetting the row numbers
function removeDailyStatsFormRow(button) {
  button.closest("tr").remove();
  resetDailyStatsFormRowNumbers();
}

// Reset row numbers after removing a row
function resetDailyStatsFormRowNumbers() {
  document.querySelectorAll("#dailyStatsFormBody tr").forEach((row, index) => {
    row.cells[0].textContent = index + 1;
  });
}

async function saveDailyStats() {
  const data = [];
  const month = document.getElementById("dailyRecordsFormMonth").value;
  const year = document.getElementById("dailyRecordsFormYear").value;
  const rows = document
    .getElementById("dailyStatsFormBody")
    .getElementsByTagName("tr");

  document.getElementById("dailyRecordsFormMonth").style.backgroundColor =
    "transparent";
  document.getElementById("dailyRecordsFormYear").style.backgroundColor =
    "transparent";

  // TODO: check if the month format is okay ..i.e. check if year is between 2020 to 2040
  if (!month || month === "") {
    showToast("Please select a month", "error");
    document.getElementById("dailyRecordsFormMonth").style.backgroundColor =
      "red";
    return;
  }

  if (!year || year === "") {
    showToast("Please enter a year", "error");
    document.getElementById("dailyRecordsFormYear").style.backgroundColor =
      "red";
    return;
  }

  for (let row of rows) {
    row.style.backgroundColor = "transparent";
    const day = row.getElementsByTagName("td")[0].textContent;
    const bloodGroup = row.getElementsByTagName("input")[0].value;
    const crossmatch = row.getElementsByTagName("input")[1].value;
    const issued = row.getElementsByTagName("input")[2].value;
    const returned = row.getElementsByTagName("input")[3].value;

    if (!validateRowData(row, bloodGroup, crossmatch, issued, returned)) return;
    data.push({ day, bloodGroup, crossmatch, issued, returned, month, year });
  }

  for (const record of data) {
    const response = await window.statsPage.insertDailyRecord(record);
    if (!response.success) {
      showToast(
        `Error saving record for ${record.day} ${record.month} ${record.year}: ${response.error}`,
        "error"
      );
      return;
    }
  }

  showToast("Records saved successfully", "success");
  document.getElementById("dailyRecordsFormMonth").value = "";
  document.getElementById("dailyRecordsFormYear").value = "";
  clearDailyStatsForm();
  showDailyStatsForm();
}

// Clear all rows in the daily stats table form
function clearDailyStatsForm() {
  const rows = document
    .getElementById("dailyStatsFormBody")
    .getElementsByTagName("tr");

  for (let row of rows) {
    row.style.backgroundColor = "transparent";
    row.getElementsByTagName("input")[0].value = "";
    row.getElementsByTagName("input")[1].value = "";
    row.getElementsByTagName("input")[2].value = "";
    row.getElementsByTagName("input")[3].value = "";
  }
}

// *************** SHARED FUNCTIONS *******************

// TODO: move to monthly records file
document
  .getElementById("monthlyRecordsSearchBtn")
  .addEventListener("click", async () => {
    const year = document.getElementById("monthlyRecordsYear").value;
    console.log("Getting record for: ", year);

    const records = await window.statsPage.getDailyRecordsByYear(year);
    console.log(year, records);
  });

// TODO: function to check day and month, i.e. make sure it does not exceed the number of days
//  eg. if January has 31 days, you cannot add more than 30 days data

// TODO: Very Important. Use event listeners for buttons
// TODO: make the month and year uneditable if saveEdit or new rows are data do not let user to change month and date
// First check if it has changed first