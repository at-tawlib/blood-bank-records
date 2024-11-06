// Get the most recent date for a specific day,
// i.e. if today is Wednesday and the day selected is Sunday, the function will return the most recent Sunday's date.
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
  let difference = today.getDay() - dayMap[day];
  if (difference < 0) difference += 7;

  const mostRecentDate = new Date();
  mostRecentDate.setDate(today.getDate() - difference);
  return mostRecentDate.toISOString().split("T")[0];
}

// Format date as "DD Month YYYY" with suffix
function formatDate(dateString) {
  const date = new Date(dateString);
  const day = date.getDate();
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
  return `${day}${getDaySuffix(day)} ${
    monthNames[date.getMonth()]
  }, ${date.getFullYear()}`;
}

// Determine day suffix (st, nd, rd, th)
function getDaySuffix(day) {
  if (day > 3 && day < 21) return "th";
  return ["st", "nd", "rd"][(day % 10) - 1] || "th";
}

// Get the date range for the current week
function getWeekDateRange() {
  const today = new Date();

  // Calculate the start date (7 days ago)
  const firstDate = new Date(today);
  firstDate.setDate(today.getDate() - 6);

  // Format both dates as YYYY-MM-DD
  return {
    firstDate: firstDate.toISOString().split("T")[0],
    lastDate: today.toISOString().split("T")[0],
  };
}

// Get the date range for the current month
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
  return daysOfWeek[new Date(dateString).getDay()];
}

// Remove active class from all sidebar items and add it to the clicked item
function setActiveNavItem(clickedItem) {
  const sidebarItems = document.querySelectorAll(".sidebar li");
  sidebarItems.forEach((item) => item.classList.remove("active"));

  // Find the clicked item and add the active class to it
  const activeItem = Array.from(sidebarItems).find(
    (item) => item.textContent === clickedItem
  );

  if (activeItem) {
    activeItem.classList.add("active");
  }
}

// Export the functions
module.exports = {
  getMostRecentDateForDay,
  formatDate,
  getDaySuffix,
  getWeekDateRange,
  getMonthDateRange,
  getDayFromDate,
  setActiveNavItem,
};