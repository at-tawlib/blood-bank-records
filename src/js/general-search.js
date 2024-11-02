var startDate = "";
var endDate = "";

// Custom date picker with flatpickr
flatpickr("#dateRangePicker", {
  mode: "range", // Enables date range selection
  dateFormat: "Y-m-d", // Sets date format to "YYYY-MM-DD"
  onChange: function (selectedDates) {
    startDate = selectedDates[0]
      ? selectedDates[0].toISOString().split("T")[0]
      : null;
    endDate = selectedDates[1]
      ? selectedDates[1].toISOString().split("T")[0]
      : null;
  },
});

// Show custom date picker when the date range custom is clicked
document.getElementById("dateRange").addEventListener("change", function () {
  const dateRangeSelected = document.getElementById("dateRange").value;
  switch (dateRangeSelected) {
    case "week":
      document.getElementById("customDatePickerContainer").style.display =
        "none";
      const { firstDate, lastDate } = getWeekDateRange();
      fetchRecordsRange(firstDate, lastDate);
      break;
    case "custom":
      document.getElementById("customDatePickerContainer").style.display =
        "flex";
      break;
    case "month":
      document.getElementById("customDatePickerContainer").style.display =
        "none";
      const { firstMonthDay, lastMonthDay } = getMonthDateRange();
      fetchRecordsRange(firstMonthDay, lastMonthDay);
      break;
  }
});

// Apply filter button click event
document.getElementById("applyFilter").addEventListener("click", function () {
  fetchRecordsRange(startDate, endDate);
});

function fetchRecordsRange(startDate_, endDate_) {
  const records = window.api.getWeekRecords(startDate_, endDate_);

  document.getElementById("searchName").value = ""; // clear search input

  document.getElementById("generalSearch").style.display = "block";
  document.getElementById("showRecords").style.display = "none";
  document.getElementById("addForm").style.display = "none";

  const tableBody = document.getElementById("searchResults");
  tableBody.innerHTML = ""; // clear previous content

  if(records.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = "<td colspan='6'>No records found for  selected date range</td>";
    tableBody.appendChild(row);
    return;
  }

  records.forEach((record) => {
    const row = document.createElement("tr");
    const day = getDayFromDate(record.date);

    row.innerHTML = `
    <td>${record.date}</td>
    <td>${day}</td>
    <td>${record.number}</td>
    <td>${record.name}</td>
    <td>${record.bloodGroup}</td>
    <td>${record.rhesus}</td>
    `;

    setDayColors(row.children[1], day);
    setRhesusColors(row.children[5], record.rhesus);
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
  const firstDate = new Date(today);
  firstDate.setDate(today.getDate() - 6);

  // Format both dates as YYYY-MM-DD
  const startDateStr = firstDate.toISOString().split("T")[0];
  const endDateStr = today.toISOString().split("T")[0];

  return { firstDate: startDateStr, lastDate: endDateStr };
}

// Calculate the start and end dates of the current month and return them
function getMonthDateRange() {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];
  return { firstMonthDay: firstDay, lastMonthDay: lastDay };
}

// Get the day of the week from a date string (YYYY-MM-DD)
function getDayFromDate(dateString) {
  const date = new Date(dateString);
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // Get the day of the week (0 for Sunday, 6 for Saturday)
  const dayIndex = date.getDay();

  return daysOfWeek[dayIndex];
}

// Set the background color of the day column based on the day
function setDayColors(element, day) {
  switch (day) {
    case "Sunday":
      element.classList.add("sunday");
      break;
    case "Monday":
      element.classList.add("monday");
      break;
    case "Tuesday":
      element.classList.add("tuesday");
      break;
    case "Wednesday":
      element.classList.add("wednesday");
      break;
    case "Thursday":
      element.classList.add("thursday");
      break;
    case "Friday":
      element.classList.add("friday");
      break;
    case "Saturday":
      element.classList.add("saturday");
      break;
  }
}

// Set the background color of the blood group column based on the blood group
function setRhesusColors(element, rhesus) {
  switch (rhesus) {
    case "Positive":
      element.classList.add("positive");
      break;
    case "Negative":
      element.classList.add("negative");
      break;
  }
}

// Initial load of open general search
function initGeneralSearch() {
  document.getElementById("dateRange").value = "week";
  document.getElementById("customDatePickerContainer").style.display = "none";
  const { firstDate, lastDate } = getWeekDateRange();
  fetchRecordsRange(firstDate, lastDate);
}

// Listen for the "open-general-search" event from the main process
window.api.onOpenGeneralSearch(initGeneralSearch);
