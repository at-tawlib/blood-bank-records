/** @format */

let currentDailyEditRow = null;
let addDailyRecordRowShown = false;

// *************** FOR DAILY STATS TABLE ***********************
document.getElementById("dailyStatsSearchBtn").addEventListener("click", () => {
  if (currentDailyEditRow) {
    showToast("Finish editing table first.", "error");
    return;
  }

  if (addDailyRecordRowShown) {
    showToast("Finish adding data first.", "error");
    return;
  }

  const month = document.getElementById("dailyRecordsMonth").value;
  const year = document.getElementById("dailyRecordsYear").value;
  showDailyStats(month, year);
});

document
  .getElementById("dailyStatsMenuBtn")
  .addEventListener("click", () =>
    statsUtils.showContainer("daily-stats-table")
  );

async function showDailyStats(month, year) {
  statsUtils.showContainer("daily-stats-table");

  if (!month || !year) {
    showToast("Please select a month and year", "error");
    return;
  }

  const records = await window.statsPage.getDailyRecords({ month, year });

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
    document.getElementById("dailyRecordsTableContainer").style.display =
      "none";
    document.getElementById("notFoundDiv").style.display = "none";
    return;
  }

  if (records.data.length === 0) {
    document.getElementById("dailyRecordsTableContainer").style.display =
      "none";
    document.getElementById("notFoundDiv").style.display = "block";
    document.getElementById("addRowButtons").style.display = "none";
    document.getElementById("updateSheetButtons").style.display = "none";
    return;
  }

  document.getElementById("addRowButtons").style.display = "flex";
  document.getElementById("dailyRecordsTableContainer").style.display = "block";
  document.getElementById("notFoundDiv").style.display = "none";

  records.data.forEach((record, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${record.day}</td>
        <td>${record.bloodGroup}</td>
        <td>${record.crossmatch}</td>
        <td>${record.issued}</td>
        <td>${record.returned}</td>
        <td>${record.issued - record.returned}</td>
        <td>
          <div style="display: flex; justify-content: center">
           <button id="btnEditDailyStats" class="btn-edit-record" title="Edit record">
            <i class="fa-solid fa-edit"></i>
            Edit
          </button>
          </div>
        </td>
      `;

    row.querySelector(".btn-edit-record").addEventListener("click", () => {
      showDailyStatsEditRow(row, index);
    });
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
        <td></td>
        `;
  tableFooter.appendChild(footerRow);
}

function showDailyStatsEditRow(row, index) {
  if (addDailyRecordRowShown) {
    showToast("Finish adding new record first", "error");
    return;
  }

  // make sure that only one row is editable at a time
  if (currentDailyEditRow !== null) {
    showToast("Finish editing selected row first", "error");
    return;
  }

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
        <button class="btn-edit-save" title="Update" onclick="saveDailyEditRow()"><i class="fa-solid fa-save"></i></button>
        <button class="btn-edit-cancel" title="Cancel" onclick="cancelDailyEditRow(${index})"><i class="fa-solid fa-remove"></i></button>
      </div>
      </td>
  `;

  // Insert the editable row after the current row and hide the current row
  const tableBody = document.getElementById("dailyStatsTableBody");
  // tableBody.children[index].style.display = "none";
  // row.style.display = "none";
  row.remove();
  tableBody.insertBefore(newRow, tableBody.children[index]);
}

function cancelDailyEditRow(index) {
  const day = currentDailyEditRow.getElementsByTagName("td")[0].textContent;
  const bloodGroup =
    currentDailyEditRow.getElementsByTagName("td")[1].textContent;
  const crossmatch =
    currentDailyEditRow.getElementsByTagName("td")[2].textContent;
  const issued = currentDailyEditRow.getElementsByTagName("td")[3].textContent;
  const returned =
    currentDailyEditRow.getElementsByTagName("td")[4].textContent;

  const tableBody = document.getElementById("dailyStatsTableBody");
  tableBody.insertBefore(currentDailyEditRow, tableBody.children[index + 1]);
  tableBody.children[index].remove();

  const yearInput = document.getElementById("dailyRecordsYear");
  const monthInput = document.getElementById("dailyRecordsMonth");
  monthInput.disabled = false;
  yearInput.disabled = false;

  currentDailyEditRow = null;
}

async function saveDailyEditRow() {
  // Get updated values
  const day = document.getElementById("editDay").textContent;
  const bloodGroup = document.getElementById("editBloodGroup").value;
  const crossmatch = document.getElementById("editCrossmatch").value;
  const issued = document.getElementById("editIssued").value;
  const returned = document.getElementById("editReturned").value;

  if (!day || !bloodGroup || !crossmatch || !issued || !returned) {
    showToast("Please enter values for all fields", "error");
    return;
  }

  const month = document.getElementById("dailyRecordsMonth").value;
  const year = document.getElementById("dailyRecordsYear").value;
  const record = { day, bloodGroup, crossmatch, issued, returned, month, year };

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

  const yearInput = document.getElementById("dailyRecordsYear");
  const monthInput = document.getElementById("dailyRecordsMonth");
  monthInput.disabled = false;
  yearInput.disabled = false;
  showDailyStats(month, year);
}

function addDailyRecords(number) {
  addDailyRecordRowShown = true;
  if (currentDailyEditRow !== null) {
    showToast("Finish editing selected row first", "error");
    return;
  }

  // check if rows are more than 30 or 31 and stop depending on day and month
  const tableBody = document.getElementById("dailyStatsTableBody");
  document.getElementById("updateSheetButtons").style.display = "flex";

  const monthInput = document.getElementById("dailyRecordsMonth");
  const yearInput = document.getElementById("dailyRecordsYear");

  monthInput.disabled = true;
  yearInput.disabled = true;

  const month = monthInput.value;
  const year = yearInput.value;

  for (let i = 0; i < number; i++) {
    // Check if the day is the last day of the month
    const nextDay = tableBody.rows.length + 1;
    if (isLastDayOfMonth(nextDay - 1, month, year)) {
      showToast(
        `The selected month and year has only ${nextDay - 1} days`,
        "error"
      );
      return;
    }

    const row = document.createElement("tr");
    row.id = "saveRow";
    row.innerHTML = `
          <td>${nextDay}</td>
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
  if (newLastRow.id !== "saveRow") {
    document.getElementById("updateSheetButtons").style.display = "none";

    const yearInput = document.getElementById("dailyRecordsYear");
    const monthInput = document.getElementById("dailyRecordsMonth");
    monthInput.disabled = false;
    yearInput.disabled = false;
    addDailyRecordRowShown = false;
  }
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
    if (!response.success) {
      showToast(
        `Error saving record for ${record.day} ${record.month} ${record.year}: ${response.error}`,
        "error"
      );
      return;
    }
  }

  showToast("Records saved successfully", "success");

  document.getElementById("updateSheetButtons").style.display = "none";
  addDailyRecordRowShown = false;
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
    const yearInput = document.getElementById("dailyRecordsYear");
    const monthInput = document.getElementById("dailyRecordsMonth");
    monthInput.disabled = false;
    yearInput.disabled = false;
    addDailyRecordRowShown = false;
  });
});

// *************** FOR DAILY STATS FORM TABLE *******************
// TODO: I realised that some of the views occur multiple times, should we make them global
// and access them anytime we need them,
function showDailyStatsForm() {
  statsUtils.showContainer("daily-stats-form");
}

function addDailyRowToForm(rowCount) {
  // TODO: check if rows are more than 30 or 31 and stop depending on day and month
  const tableBody = document.getElementById("dailyStatsFormBody");

  const month = document.getElementById("dailyRecordsFormMonth").value;
  const year = document.getElementById("dailyRecordsFormYear").value;

  for (let i = 0; i < rowCount; i++) {
    const nextDay = tableBody.rows.length + 1;

    if (isLastDayOfMonth(nextDay - 1, month, year)) {
      showToast(
        `The selected month and year has only ${nextDay - 1} days`,
        "error"
      );
      return;
    }
    // Create and insert an editable row
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${nextDay}</td>
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

// Button checks if data for the date and month already in the database, if the data is present, shows a toast
// else the button is hidden and the form is shown
document
  .getElementById("dailyRecordsFormSetBtn")
  .addEventListener("click", async () => {
    const monthInput = document.getElementById("dailyRecordsFormMonth");
    const yearInput = document.getElementById("dailyRecordsFormYear");
    monthInput.style.backgroundColor = "transparent";
    yearInput.style.backgroundColor = "transparent";

    const month = monthInput.value;
    const year = yearInput.value;

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

    const response = await window.statsPage.checkDailyRecordPresent({
      month,
      year,
    });

    if (!response.success) {
      showToast("An error occurred connecting to the database", "error");
      return;
    }

    if (response.success && response.exists) {
      showToast(
        "Data already available for the selected date. Try editing the data",
        "error"
      );
      return;
    }

    monthInput.disabled = true;
    yearInput.disabled = true;
    monthInput.style.backgroundColor = "transparent";
    yearInput.style.backgroundColor = "transparent";

    document.getElementById("dailyRecordsFormTableContainer").style.display =
      "block";
    document.getElementById("dailyRecordsFormChangeDateBtn").style.display =
      "block";
    document.getElementById("dailyRecordsFormSetBtn").style.display = "none";

    const formBody = document.getElementById("dailyStatsFormBody");
    formBody.innerHTML = "";

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
  });

// Button to change the date. Enables the month, year fields and set button, then hides the table
document
  .getElementById("dailyRecordsFormChangeDateBtn")
  .addEventListener("click", async () => {
    // TODO: show a confirm dialog to warn changing date will delete all records before proceeding
    const monthInput = document.getElementById("dailyRecordsFormMonth");
    const yearInput = document.getElementById("dailyRecordsFormYear");
    monthInput.disabled = false;
    yearInput.disabled = false;

    document.getElementById("dailyRecordsFormTableContainer").style.display =
      "none";
    document.getElementById("dailyRecordsFormChangeDateBtn").style.display =
      "none";
    document.getElementById("dailyRecordsFormSetBtn").style.display = "block";
  });

// ******************** MONTHLY STATS TABLE ********************
document.getElementById("monthlyStatsMenuBtn").addEventListener("click", () => {
  statsUtils.showContainer("monthly-records-table");
  // document.getElementById("monthlyRecordsContainer").style.display = "block"
});

document
  .getElementById("monthlyRecordsSearchBtn")
  .addEventListener("click", async () => {
    const year = document.getElementById("monthlyRecordsYear").value;

    if (!year || year == "") {
      showToast("Enter a year", "error");
      return;
    }

    const response = await window.statsPage.getDailyRecordsByYear(year);
    console.log(response);

    if (response.success == false) {
      document.getElementById("monthlyRecordsNotFoundDiv").style.display =
        "none";
      document.getElementById("monthlyRecordsTableContainer").style.display =
        "none";
      showToast(`Error fetching data: ${stats.error}`, "error");
      return;
    }

    if (response.data.length == 0) {
      document.getElementById("monthlyRecordsNotFoundDiv").style.display =
        "block";
      document.getElementById("monthlyRecordsTableContainer").style.display =
        "none";
      return;
    }

    document.getElementById("monthlyRecordsNotFoundDiv").style.display = "none";
    document.getElementById("monthlyRecordsTableContainer").style.display =
      "block";

    const tableBody = document.getElementById("monthlyRecordsTableBody");
    const tableHead = document.getElementById("monthlyRecordsTableHeader");
    const tableFooter = document.getElementById("monthlyRecordsTableFooter");
    tableHead.innerHTML = "";
    tableBody.innerHTML = "";
    tableFooter.innerHTML = "";

    tableHead.innerHTML = `Stats for ${year}`;

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    months.forEach((month) => {
      const row = document.createElement("tr");
      const monthData = response.data.find((stat) => stat.month === month);

      row.innerHTML = `
          <td>${month}</td>
          <td>${monthData ? monthData.days_count : "-"}</td>
          <td>${monthData ? monthData.total_bloodGroup : "-"}</td>
          <td>${monthData ? monthData.total_crossmatch : "-"}</td>
          <td>${monthData ? monthData.total_issued : "-"}</td>
          <td>${monthData ? monthData.total_returned : "-"}</td>
          <td>${
            monthData ? monthData.total_issued - monthData.total_returned : "-"
          }</td>
      `;

      tableBody.appendChild(row);
    });

      // Calculate totals
  const totals = response.data.reduce(
    (acc, curr) => {
      acc.days_count += curr.days_count;
      acc.total_bloodGroup += curr.total_bloodGroup;
      acc.total_crossmatch += curr.total_crossmatch;
      acc.total_issued += curr.total_issued;
      acc.total_returned += curr.total_returned;
      return acc;
    },
    { days_count: 0, total_bloodGroup: 0, total_crossmatch: 0, total_issued: 0, total_returned: 0 }
  );

  const footerRow = document.createElement("tr");
  footerRow.innerHTML = `
    <td>Total:</td>
    <td>${totals.days_count}</td>
    <td>${totals.total_bloodGroup}</td>
    <td>${totals.total_crossmatch}</td>
    <td>${totals.total_issued}</td>
    <td>${totals.total_returned}</td>
    <td>${totals.total_issued - totals.total_returned}</td>
  `;
  tableFooter.appendChild(footerRow);
  });

// *************** SHARED FUNCTIONS *******************

// TODO: move to monthly records file
// Function to check the number of days for selected month and year
function isLastDayOfMonth(day, month, year) {
  try {
    // Get the numeric value of the month (1-based)
    const monthMap = {
      January: 1,
      February: 2,
      March: 3,
      April: 4,
      May: 5,
      June: 6,
      July: 7,
      August: 8,
      September: 9,
      October: 10,
      November: 11,
      December: 12,
    };
    const monthNumber = monthMap[month];

    if (!monthNumber) {
      showToast(`Invalid month name: ${month}`, "error");
      return;
    }

    // Get the last day of the month by creating a Date object for the next month and subtracting 1 day
    const lastDay = new Date(year, monthNumber, 0).getDate();

    // Check if the provided day is equal to the last day of the month
    return day === lastDay;
  } catch (error) {
    // TODO: log to file
    console.error("Error determining the last day of the month:", error);
    return false;
  }
}

// TODO: Very Important. Use event listeners for buttons
// TODO: make the month and year uneditable if saveEdit or new rows are data do not let user to change month and date
// First check if it has changed first
// TODO: add button to remove all rows

// TODO: Add next month buttons to move to the next month
// TODO: show data summary i.e highest, lowest etc.
// TODO: for monthly records use a red colour if the days is not up to the total number of days