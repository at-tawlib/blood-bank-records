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