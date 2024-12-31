/** @format */

// Function to show a specific container
function showContainer(container) {
  switch (container) {
    case "team-month-stats-table":
      document.getElementById("teamStatsContainer").style.display = "block";
      document.getElementById("teamStatsFormContainer").style.display = "none";
      document.getElementById("dailyStatsTableContainer").style.display =
        "none";
      document.getElementById("dailyStatsFormContainer").style.display = "none";
      document.getElementById("monthlyRecordsContainer").style.display =
        "none";
      break;
    case "team-month-stats-form":
      document.getElementById("teamStatsContainer").style.display = "none";
      document.getElementById("teamStatsFormContainer").style.display = "block";
      document.getElementById("dailyStatsTableContainer").style.display =
        "none";
      document.getElementById("dailyStatsFormContainer").style.display = "none";
      document.getElementById("monthlyRecordsContainer").style.display =
        "none";
      break;
    case "daily-stats-table":
      document.getElementById("teamStatsContainer").style.display = "none";
      document.getElementById("teamStatsFormContainer").style.display = "none";
      document.getElementById("dailyStatsTableContainer").style.display =
        "block";
      document.getElementById("dailyStatsFormContainer").style.display = "none";
      document.getElementById("monthlyRecordsContainer").style.display =
        "none";
      break;
    case "daily-stats-form":
      document.getElementById("teamStatsContainer").style.display = "none";
      document.getElementById("teamStatsFormContainer").style.display = "none";
      document.getElementById("dailyStatsTableContainer").style.display =
        "none";
      document.getElementById("dailyStatsFormContainer").style.display =
        "block";
      document.getElementById("monthlyRecordsContainer").style.display =
        "none";
      break;
    case "monthly-records-table":
      document.getElementById("teamStatsContainer").style.display = "none";
      document.getElementById("teamStatsFormContainer").style.display = "none";
      document.getElementById("dailyStatsTableContainer").style.display =
        "none";
      document.getElementById("dailyStatsFormContainer").style.display = "none";
      document.getElementById("monthlyRecordsContainer").style.display =
        "block";
      break;
  }
}

// Function to show a toast notification
function showToast(message, type = "success") {
  const toastText = document.createElement("p");
  toastText.className = "toast-text";
  toastText.textContent = message;

  // Append toast to container
  const container = document.getElementById("toastContainer");
  container.classList.remove("toast-success", "toast-error");
  container.appendChild(toastText);
  container.classList.add(`toast-${type}`);

  // Remove toast after 3 seconds
  setTimeout(() => {
    toastText.remove();
  }, 5000);
}

function checkMonthYear(month, year, monthInput, yearInput) {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  if (!month || month === "") {
    monthInput.style.backgroundColor = "red";
    showToast("Please select a month", "error");
    return false;
  }

  if (!year || year === "") {
    yearInput.style.backgroundColor = "red";
    showToast("Please enter a year", "error");
    return false;
  }

  if (month > currentMonth) {
    monthInput.style.backgroundColor = "red";
    showToast("Month cannot be in the future", "error");
    return false;
  }

  if (year > currentYear) {
    yearInput.style.backgroundColor = "red";
    showToast("Year cannot be in the future", "error");
    return false;
  }

  return true;
}

module.exports = {
  showContainer,
  checkMonthYear,
  showToast,
};
