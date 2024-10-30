function fetchWeekRecords() {
  const { startDate, endDate } = getWeekDateRange();
  const records = window.api.getWeekRecords(startDate, endDate);

  document.getElementById("generalSearch").style.display = "block";
  document.getElementById("showRecords").style.display = "none";
  document.getElementById("addForm").style.display = "none";

  const tableBody = document.getElementById("searchResults");
  tableBody.innerHTML = ""; // clear previous content

  records.forEach((record) => {
    const row = document.createElement("tr");
    row.innerHTML = `
    <td>${record.date}</td>
    <td>${getDayFromDate(record.date)}</td>
    <td>${record.number}</td>
    <td>${record.name}</td>
    <td>${record.bloodGroup}</td>
    <td>${record.rhesus}</td>
    `;
    tableBody.appendChild(row);
  });
}

function filterSearchTable() {
  const searchValue = document.getElementById("searchName").value.toLowerCase();
  const tableRows = document
    .getElementById("searchResults")
    .getElementsByTagName("tr");

  for (let row of tableRows) {
    const cells = row.getElementsByTagName("td");
    const nameCell = cells[3]?.textContent.toLowerCase();

    if (!nameCell) return;

    // Check if search value is included in the name
    if (nameCell.includes(searchValue)) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  }
}

// Calculate the start and end dates of the current week
// considering the current date
function getWeekDateRange() {
  const today = new Date();

  // Calculate the start date (7 days ago)
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 6);

  // Format both dates as YYYY-MM-DD
  const startDateStr = startDate.toISOString().split("T")[0];
  const endDateStr = today.toISOString().split("T")[0];

  return { startDate: startDateStr, endDate: endDateStr };
}

// Get the day of the week from a date string (YYYY-MM-DD)
function getDayFromDate(dateString) {
  const date = new Date(dateString);
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  // Get the day of the week (0 for Sunday, 6 for Saturday)
  const dayIndex = date.getDay();
  
  return daysOfWeek[dayIndex];
}
