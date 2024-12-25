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

module.exports = {
  showContainer,
};
