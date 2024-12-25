// Display stats for a specific month and year
async function displayTeamStats() {
  statsUtils.showContainer("team-month-stats-table");

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