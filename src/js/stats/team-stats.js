// Display stats for a specific month and year
async function displayTeamStats() {
  showContainer("team-month-stats-table");

  const month = document.getElementById("teamStatsMonth").value;
  const year = document.getElementById("teamStatsYear").value;

  if (!month || !year) {
    showToast("Please select a month and year", "error");
    return;
  }

  const stats = await window.statsPage.getTeamStats({ month, year });

  const tableBody = document.getElementById("teamMonthlyStatsTable");
  const tableHead = document.getElementById("teamMonthlyStatsHeader");
  const tableFooter = document.getElementById("teamMonthlyStatsFooter");
  tableBody.innerHTML = "";
  tableHead.innerHTML = "";
  tableFooter.innerHTML = "";

  tableHead.innerHTML = `${month}, ${year}`;

  if (stats.success === false) {
    showToast(`Error fetching data: ${stats.error}`, "error");
    return;
  }

  if (stats.data.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="4">No data found for ${month}, ${year}</td>`;
    tableBody.appendChild(row);
    return;
  }

  stats.data.forEach((stat) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${stat.team}</td>
      <td>${stat.obstetrics}</td>
      <td>${stat.gynaecology}</td>
      <td>${stat.obstetrics + stat.gynaecology}</td>
    `;
    tableBody.appendChild(row);
  });

  // Calculate totals
  const totals = stats.data.reduce(
    (acc, curr) => {
      acc.obstetrics += curr.obstetrics;
      acc.gynaecology += curr.gynaecology;
      return acc;
    },
    { obstetrics: 0, gynaecology: 0 }
  );

  const footerRow = document.createElement("tr");
  footerRow.innerHTML = `
      <td>Total: </td>
      <td>${totals.obstetrics}</td>
      <td>${totals.gynaecology}</td>
      <td>${totals.obstetrics + totals.gynaecology}</td>
      `;
  tableFooter.appendChild(footerRow);
}

// Create and show the form for entering team stats
function showTeamStatsForm() {
  showContainer("team-month-stats-form");

  const teams = ["Team A", "Team B", "Team C", "Team D", "Team E"];
  const formBody = document.getElementById("teamMonthlyStatsForm");
  formBody.innerHTML = "";
  document.getElementById("teamStatsFormMonth").value = "";
  document.getElementById("teamStatsFormYear").value = "";

  teams.forEach((team) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${team}</td>
            <td>
                <input
                type="number"
                id="obstetrics"
                />
            </td>
            <td>
                <input
                type="number"
                id="gynaecology"
                />
            </td>
        `;
    formBody.appendChild(row);
  });
}

// Save team stats data into the database
async function saveTeamStats() {
  const data = [];

  const month = document.getElementById("teamStatsFormMonth").value;
  const year = document.getElementById("teamStatsFormYear").value;

  if (!month || !year) {
    showToast("Please select a month and year", "error");
    return;
  }

  const rows = document
    .getElementById("teamMonthlyStatsForm")
    .getElementsByTagName("tr");

  for (let row of rows) {
    row.style.backgroundColor = "transparent";
    const team = row.getElementsByTagName("td")[0].textContent;
    const obstetrics = row.getElementsByTagName("input")[0].value;
    const gynaecology = row.getElementsByTagName("input")[1].value;

    if (!validateRowData(row, obstetrics, gynaecology)) return;
    data.push({ team, obstetrics, gynaecology });
  }

  for (const record of data) {
    const response = await window.statsPage.saveTeamStats({
      month,
      year,
      data: record,
    });
    console.log("Response: ", response);
    if (!response.success) {
      showToast(
        `Error saving record for ${record.team}: ${response.error}`,
        "error"
      );
      return;
    }
  }

  showToast("Records saved successfully", "success");
  document.getElementById("teamStatsFormMonth").value = "";
  document.getElementById("teamStatsFormYear").value = "";
  clearAllRows();
}

function clearAllRows() {
  const rows = document
    .getElementById("teamMonthlyStatsForm")
    .getElementsByTagName("tr");

  for (let row of rows) {
    row.style.backgroundColor = "transparent";
    row.getElementsByTagName("input")[0].value = "";
    row.getElementsByTagName("input")[1].value = "";
  }
}

async function showDailyStats(month, year) {
  showContainer("daily-stats-table");

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
    return;
  }

  if (records.data.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="4">No data found for ${month}, ${year}</td>`;
    tableBody.appendChild(row);
    return;
  }

  records.data.forEach((record) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${record.day}</td>
      <td>${record.bloodGroup}</td>
      <td>${record.crossmatch}</td>
      <td>${record.issued}</td>
      <td>${record.returned}</td>
      <td>${record.issued - record.returned}</td>
      <td>Edit</td>
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

function showDailyStatsForm() {
  showContainer("daily-stats-form");

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
    `;
    formBody.appendChild(row);
  }
}

async function saveDailyStats() {
  const data = [];
  const month = document.getElementById("dailyRecordsFormMonth").value;
  const year = document.getElementById("dailyRecordsFormYear").value;
  const rows = document
    .getElementById("dailyStatsFormBody")
    .getElementsByTagName("tr");

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

  console.log("Data: ", data);

  for (const record of data) {
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
  document.getElementById("dailyRecordsFormMonth").value = "";
  document.getElementById("dailyRecordsFormYear").value = "";
  // clearAllRows();
}

// Function to show a specific container
function showContainer(container) {
  switch (container) {
    case "team-month-stats-table":
      document.getElementById("teamStatsMonthContainer").style.display =
        "block";
      document.getElementById("teamStatsFormContainer").style.display = "none";
      document.getElementById("dailyStatsTableContainer").style.display =
        "none";
      document.getElementById("dailyStatsFormContainer").style.display = "none";
      break;
    case "team-month-stats-form":
      document.getElementById("teamStatsMonthContainer").style.display = "none";
      document.getElementById("teamStatsFormContainer").style.display = "block";
      document.getElementById("dailyStatsTableContainer").style.display =
        "none";
      document.getElementById("dailyStatsFormContainer").style.display = "none";
      break;
    case "daily-stats-table":
      document.getElementById("teamStatsMonthContainer").style.display = "none";
      document.getElementById("teamStatsFormContainer").style.display = "none";
      document.getElementById("dailyStatsTableContainer").style.display =
        "block";
      document.getElementById("dailyStatsFormContainer").style.display = "none";
      break;
    case "daily-stats-form":
      document.getElementById("teamStatsMonthContainer").style.display = "none";
      document.getElementById("teamStatsFormContainer").style.display = "none";
      document.getElementById("dailyStatsTableContainer").style.display =
        "none";
      document.getElementById("dailyStatsFormContainer").style.display =
        "block";
      break;
  }
}

// Make sure all rows have data to save
function validateRowData(row, obstetrics, gynaecology) {
  if (!row || !obstetrics || !gynaecology) {
    row.style.backgroundColor = "red";
    showToast("Please fill in all fields", "error");
    return false;
  }

  if (obstetrics < 0 || gynaecology < 0) {
    row.style.backgroundColor = "red";
    showToast("Values cannot be negative", "error");
    return false;
  }

  return true;
}

function addDailyRecords(number) {
  document.getElementById("updateSheetButtons").style.display = "flex";
  for (let i = 0; i < number; i++) addDailyRow();
}

function addDailyRow() {
  const tableBody = document.getElementById("dailyStatsTableBody");
  // Create and insert an editable row
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

  console.log(records);

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

function removeDailyRows() {}

document.getElementById("dailyStatsSearchBtn").addEventListener("click", () => {
  const month = document.getElementById("dailyRecordsMonth").value;
  const year = document.getElementById("dailyRecordsYear").value;
  showDailyStats(month, year);
});
