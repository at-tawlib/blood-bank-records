// Function to get and load records for a specific day from SQLite (via IPC)
function displayRecords(day) {
  // Get the most recent date for the selected day
  const mostRecentDate = getMostRecentDateForDay(day);
  const records = window.api.getRecords(mostRecentDate);

  // TODO: Handle errors and output no data if no records are  found

  // Hide the form and show the records table
  document.getElementById("addForm").style.display = "none";
  document.getElementById("showRecords").style.display = "block";

  const worksheetDay = document.getElementById("worksheetDay");
  worksheetDay.innerHTML = `${day} (${formatDate(mostRecentDate)})`;

  const tableBody = document.getElementById("bloodRecords");
  tableBody.innerHTML = "";

  // Populate table with data
  records.forEach((record) => {
    const row = document.createElement("tr");
    row.innerHTML = `
                <td>${record.number}</td>
                <td>${record.name}</td>
                <td>${record.bloodGroup}</td>
                <td>${record.rhesus}</td>
            `;
    tableBody.appendChild(row);
  });
}

// Function to get the most recent date for a specific day
function getMostRecentDateForDay(day) {
  const dayMap = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  const today = new Date();
  const currentDay = today.getDay();

  // Get the numeric value of the selected day
  const selectedDay = dayMap[day];

  // Calculate the difference between the current day and the selected day and adjust if necessary
  // If today's day is before the target day (e.g., today is Wednesday, target is Monday),
  // adjust to get the previous week's target day.
  let difference = currentDay - selectedDay;
  if (difference < 0) {
    difference += 7;
  }

  // Get the most recent date for the selected day by subtracting the difference in days
  const mostRecentDate = new Date();
  mostRecentDate.setDate(today.getDate() - difference);

  // Format the date as YYYY-MM-DD
  const year = mostRecentDate.getFullYear();
  const month = ("0" + (mostRecentDate.getMonth() + 1)).slice(-2);
  const todayDay = ("0" + mostRecentDate.getDate()).slice(-2);

  return `${year}-${month}-${todayDay}`;
}

// Function to format the date as "DD Month YYYY"
function formatDate(dateString) {
  const date = new Date(dateString);
  const day = date.getDate();

  const daySuffix = getDaySuffix(day);
  const monthNames = [
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
  const month = monthNames[date.getMonth()];

  return `${day}${daySuffix} ${month}, ${date.getFullYear()}`;
}

// Helper function to get the suffix for the day
function getDaySuffix(day) {
  if (day > 3 && day < 21) return "th"; // For 11th to 19th
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

// Initially load records for Monday
window.onload = () => {
  displayRecords("Monday");
};
