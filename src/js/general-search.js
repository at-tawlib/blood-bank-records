// Variables for date range selection
var startDate = "";
var endDate = "";

// Initialize flatpickr for custom date range picker
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

// Event listener for date range selection
document.getElementById("dateRange").addEventListener("change", function () {
  const dateRangeSelected = document.getElementById("dateRange").value;
  const customPickerContainer = document.getElementById(
    "customDatePickerContainer"
  );

  switch (dateRangeSelected) {
    case "week":
      customPickerContainer.style.display = "none";
      const { firstDate, lastDate } = utils.getWeekDateRange();
      displayRecordsForDateRange(firstDate, lastDate);
      break;
    case "custom":
      customPickerContainer.style.display = "flex";
      break;
    case "month":
      customPickerContainer.style.display = "none";
      const { firstMonthDay, lastMonthDay } = utils.getMonthDateRange();
      displayRecordsForDateRange(firstMonthDay, lastMonthDay);
      break;
  }
});

// Event listener for apply filter button
document.getElementById("applyFilter").addEventListener("click", function () {
  displayRecordsForDateRange(startDate, endDate);
});

// Fetch and display records for a date range
function displayRecordsForDateRange(start, end) {
  const records = window.api.getWeekRecords(start, end);

  // Clear search input and display search results
  document.getElementById("searchName").value = "";
  document.getElementById("generalSearch").style.display = "block";
  document.getElementById("showRecords").style.display = "none";
  document.getElementById("addForm").style.display = "none";

  const tableBody = document.getElementById("searchResults");
  tableBody.innerHTML = records.length
    ? ""
    : "<tr><td colspan='5'>No records found for selected date range</td></tr>";

  records.forEach((record) => {
    const row = document.createElement("tr");
    const day = utils.getDayFromDate(record.date);

    row.innerHTML = `
    <td>${record.date}</td>
    <td>${day}</td>
    <td>${record.number}</td>
    <td>${record.name}</td>
    <td>${record.bloodGroup}</td>
    <td>${record.rhesus}</td>
    <td>${record.scientist || ""}</td>
    <td>
      <button class="btn-view-record" type="button" title="View record">
        <i class="fa-solid fa-eye"></i>
      </button>
    </td>
    `;

    row.querySelector(".btn-view-record").addEventListener("click", () => {
      openPatientModal(record);
    });

    setDayColors(row.children[1], day);
    setRhesusColors(row.children[5], record.rhesus);
    tableBody.appendChild(row);
  });
}

// Set the text color of the day data based on the day
function setDayColors(element, day) {
  const dayColors = {
    Sunday: "sunday",
    Monday: "monday",
    Tuesday: "tuesday",
    Wednesday: "wednesday",
    Thursday: "thursday",
    Friday: "friday",
    Saturday: "saturday",
  };
  element.classList.add(dayColors[day]);
}

// Set background color for rhesus column based on rhesus type
function setRhesusColors(element, rhesus) {
  element.classList.add(rhesus === "Positive" ? "positive" : "negative");
}

// Filter search results by name
function filterSearchTable() {
  const searchValue = document.getElementById("searchName").value.toLowerCase();
  const tableRows = document
    .getElementById("searchResults")
    .getElementsByTagName("tr");

  for (let row of tableRows) {
    const nameCell = row
      .getElementsByTagName("td")[3]
      ?.textContent.toLowerCase();
    row.style.display =
      nameCell && nameCell.includes(searchValue) ? "" : "none";
  }
}

// Initialize the general search section with the current week date range
function initGeneralSearch() {
  utils.setActiveNavItem("General Search");
  document.getElementById("dateRange").value = "week";
  document.getElementById("customDatePickerContainer").style.display = "none";
  const { firstDate, lastDate } = utils.getWeekDateRange();
  displayRecordsForDateRange(firstDate, lastDate);
}

// Listen for the "open-general-search" event from the main process
window.api.onOpenGeneralSearch(initGeneralSearch);
