let currentTeamStatsEditRow = null;

// ************************* TEAM STATS TABLE *************************
document.getElementById("teamStatsMenuBtn").addEventListener("click", () => {
  statsUtils.showContainer("team-month-stats-table");
});

async function displayTeamStats() {
  if (currentTeamStatsEditRow !== null) {
    showToast("Finish editing selected row first", "error");
    return;
  }

  document.getElementById("teamStatsTableContainer").style.display = "table";

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
    document.getElementById("teamStatsTableContainer").style.display = "none";
    document.getElementById("teamStatsNotFoundDiv").style.display = "none";
    showToast(`Error fetching data: ${stats.error}`, "error");
    return;
  }

  if (stats.data.length === 0) {
    document.getElementById("teamStatsTableContainer").style.display = "none";
    document.getElementById("teamStatsNotFoundDiv").style.display = "block";
    return;
  }

  document.getElementById("teamStatsTableContainer").style.display = "block";
  document.getElementById("teamStatsNotFoundDiv").style.display = "none";

  stats.data.forEach((stat, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${stat.team}</td>
      <td>${stat.obstetrics}</td>
      <td>${stat.gynaecology}</td>
      <td>${stat.obstetrics + stat.gynaecology}</td>
      <td class="btn-edit-record" onclick="showTeamStatsEditRow(this, ${index})"><i class="fa-solid fa-edit"> Edit</i></td>
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
      <td></td>
      `;
  tableFooter.appendChild(footerRow);
}

function showTeamStatsEditRow(element, index) {
  // make sure that only one row is editable at a time
  if (currentTeamStatsEditRow !== null) {
    showToast("Finish editing selected row first", "error");
    return;
  }

  const row = element.closest("tr");
  currentTeamStatsEditRow = row;

  document.getElementById("teamStatsMonth").disabled = true;
  document.getElementById("teamStatsYear").disabled = true;

  row.style.backgroundColor = "transparent";
  const team = row.getElementsByTagName("td")[0].textContent;
  const obstetrics = row.getElementsByTagName("td")[1].textContent;
  const gynaecology = row.getElementsByTagName("td")[2].textContent;

  // Create input fields
  const newRow = document.createElement("tr");
  newRow.id = "editRow";

  newRow.innerHTML = `
    <td>${team}</td>
    <td><input type="number" id="editObstetrics" value="${obstetrics}"/></td>
    <td><input type="number" id="editGynaecology" value="${gynaecology}"/></td>
    <td></td>
    <td>
      <div class="btn-group-edit">
        <button class="btn-edit-save" onclick="saveTeamStatsEditRow()"><i class="fa-solid fa-save"> Save</i></button>
        <button class="btn-edit-cancel" onclick="cancelTeamStatsEditRow(${index})"><i class="fa-solid fa-x"> Cancel</i></button>
      </div>
    </td>
  `;

  const tableBody = document.getElementById("teamMonthlyStatsTable");
  row.remove();
  tableBody.insertBefore(newRow, tableBody.childNodes[index]);
}

async function saveTeamStatsEditRow() {
  const row = document.getElementById("editRow");
  const team = row.getElementsByTagName("td")[0].textContent;
  const obstetrics = row.getElementsByTagName("input")[0].value;
  const gynaecology = row.getElementsByTagName("input")[1].value;

  if (!validateRowData(row, obstetrics, gynaecology)) return;

  const month = document.getElementById("teamStatsMonth").value;
  const year = document.getElementById("teamStatsYear").value;

  const record = { team, obstetrics, gynaecology, month, year };

  const response = await window.statsPage.updateTeamStats(record);

  if (!response.success) {
    showToast(`Error updating record: ${response.error}`, "error");
    return;
  }

  document.getElementById("teamStatsMonth").disabled = false;
  document.getElementById("teamStatsYear").disabled = false;

  showToast("Record updated successfully", "success");
  currentTeamStatsEditRow = null;
  displayTeamStats();
}

function cancelTeamStatsEditRow(index) {
  const team =
    currentTeamStatsEditRow.getElementsByTagName("td")[0].textContent;
  const obstetrics =
    currentTeamStatsEditRow.getElementsByTagName("td")[1].textContent;
  const gynaecology =
    currentTeamStatsEditRow.getElementsByTagName("td")[2].textContent;

  const newRow = document.createElement("tr");
  newRow.innerHTML = `
    <td>${team}</td>
    <td>${obstetrics}</td>
    <td>${gynaecology}</td>
    <td>${parseInt(obstetrics) + parseInt(gynaecology)}</td>
    <td class="btn-edit-record" onclick="showTeamStatsEditRow(this, ${index})"><i class="fa-solid fa-edit"> Edit</i></td>
  `;

  const tableBody = document.getElementById("teamMonthlyStatsTable");
  tableBody.insertBefore(newRow, tableBody.children[index + 1]);
  tableBody.children[index].remove();

  document.getElementById("teamStatsMonth").disabled = false;
  document.getElementById("teamStatsYear").disabled = false;
  currentTeamStatsEditRow = null;
}

// ************************* TEAM STATS FORM *************************
document.getElementById("newTeamStatsMenuBtn").addEventListener("click", () => {
  console.log("newTeamStatsMenuBtn");
  statsUtils.showContainer("team-month-stats-form");
});

document
  .getElementById("teamStatsFormSetBtn")
  .addEventListener("click", async () => {
    const monthInput = document.getElementById("teamStatsFormMonth");
    const yearInput = document.getElementById("teamStatsFormYear");
    monthInput.style.backgroundColor = "transparent";
    yearInput.style.backgroundColor = "transparent";

    const month = monthInput.value;
    const year = yearInput.value;

    if (!statsUtils.checkMonthYear(month, year, monthInput, yearInput)) return;

    const response = await window.statsPage.checkTeamStatsExist({
      month,
      year,
    });

    console.log(response);

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
    document.getElementById("teamStatsFormTableContainer").style.display =
      "table";
    document.getElementById("teamStatsFormChangeDateBtn").style.display =
      "block";
    document.getElementById("teamStatsFormSetBtn").style.display = "none";

    const teams = ["Team A", "Team B", "Team C", "Team D", "Team E"];
    const formBody = document.getElementById("teamMonthlyStatsFormBody");
    formBody.innerHTML = "";

    teams.forEach((team) => {
      const row = document.createElement("tr");
      row.innerHTML = `
          <td>${team}</td>
          <td><input type="number" id="obstetrics"/></td>
          <td><input type="number" id="gynaecology"/></td>
          `;
      formBody.appendChild(row);
    });
  });

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
    .getElementById("teamMonthlyStatsFormBody")
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
  displayTeamStats();
}

document
  .getElementById("teamStatsFormChangeDateBtn")
  .addEventListener("click", () => {
    // TODO: show a confirm dialog to warn changing date will delete all records before proceeding
    const monthInput = document.getElementById("teamStatsFormMonth");
    const yearInput = document.getElementById("teamStatsFormYear");
    monthInput.disabled = false;
    yearInput.disabled = false;

    document.getElementById("teamStatsFormTableContainer").style.display =
      "none";
    document.getElementById("teamStatsFormChangeDateBtn").style.display =
      "none";
    document.getElementById("teamStatsFormSetBtn").style.display = "block";
  });

document
  .getElementById("clearTeamStatsFormBtn")
  .addEventListener("click", () => {
    clearAllRows();
  });

function clearAllRows() {
  const rows = document
    .getElementById("teamMonthlyStatsFormBody")
    .getElementsByTagName("tr");

  for (let row of rows) {
    row.style.backgroundColor = "transparent";
    row.getElementsByTagName("input")[0].value = "";
    row.getElementsByTagName("input")[1].value = "";
  }
}

// ************************** TEAM STATS YEARLY TABLE
async function displayYearlyTeamStats(year) {
  const response = await window.statsPage.aggregateTeamStats(year);

  const tableBody = document.getElementById("teamYearlyStatsTableBody");
  const tableHead = document.getElementById("teamYearlyStatsTableHead");
  const tableFooter = document.getElementById("teamYearlyStatsTableFooter");
  tableHead.innerHTML = "";
  tableBody.innerHTML = "";
  tableFooter.innerHTML = "";

  tableHead.innerHTML = `Stats for ${year}`;

  if (response.success == false) {
    document.getElementById("teamStatsYearNotFoundDiv").style.display = "none";
    document.getElementById("teamStatsYearTable").style.display = "none";
    showToast(`Error fetching data: ${stats.error}`, "error");
    return;
  }

  if (response.data.length == 0) {
    document.getElementById("teamStatsYearNotFoundDiv").style.display = "block";
    document.getElementById("teamStatsYearTable").style.display = "none";
    return;
  }

  document.getElementById("teamStatsYearNotFoundDiv").style.display = "none";
  document.getElementById("teamStatsYearTable").style.display = "table";

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
    const data = response.data.find((stat) => stat.month === month);
    row.innerHTML = `
      <td>${month}</td>
      <td>${data ? data.total_obstetrics : "-"}</td>
      <td>${data ? data.total_gynaecology : "-"}</td>
      <td>${data ? data.total_obstetrics + data.total_gynaecology : "-"}</td>
    `;
    tableBody.appendChild(row);
  });

  // Calculate totals
  const totals = response.data.reduce(
    (acc, curr) => {
      acc.total_obstetrics += curr.total_obstetrics;
      acc.total_gynaecology += curr.total_gynaecology;
      return acc;
    },
    { total_obstetrics: 0, total_gynaecology: 0 }
  );

  const footerRow = document.createElement("tr");
  footerRow.innerHTML = `
    <td>Total:</td>
    <td>${totals.total_obstetrics}</td>
    <td>${totals.total_gynaecology}</td>
    <td>${totals.total_gynaecology + totals.total_obstetrics}</td>
  `;
  tableFooter.appendChild(footerRow);
}

// ***************** COMMON FUNCTIONS *****************
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

window.onload = () => {
  displayYearlyTeamStats(2020);
};
