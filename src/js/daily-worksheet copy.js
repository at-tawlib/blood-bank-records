// Function to get and load records for a specific day from SQLite (via IPC)
let currentEditRow = null;
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

  // Render the records in the table
  records.forEach((record, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
                <td>${record.number}</td>
                <td>${record.name}</td>
                <td>${record.bloodGroup}</td>
                <td>${record.rhesus}</td>
                <button class="btn-edit-record" type="button" title="Edit record" onclick="showEditRow(${index})">
                    <i class="fa-solid fa-edit"></i>
                  </button>
                </button></td>
            `;
    tableBody.appendChild(row);
  });

  // Set the current records to a global variable (for editing)
  // We store the current records globally for easy access during editing
  window.currentRecords = records;
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

// Function to open the modal and populate it with the selected record's data
function openEditModal(index) {
  const record = window.currentRecords[index];
  currentEditRow = index;

  // Populate the modal fields with the record's current data
  document.getElementById("editName").value = record.name;
  document.getElementById("editBloodGroup").value = record.bloodGroup;
  document.getElementById("editRhesus").value = record.rhesus;

  document.getElementById("editModal").style.display = "block";
}

// Function to close the modal
document.getElementById("closeModal").onclick = function () {
  document.getElementById("editModal").style.display = "none";
};

// Function to save the edited data
document.getElementById("saveEdit").onclick = function () {
  // Get the updated values from the modal
  const updatedName = document.getElementById("editName").value;
  const updatedBloodGroup = document.getElementById("editBloodGroup").value;
  const updatedRhesus = document.getElementById("editRhesus").value;

  // Update the record in the currentRecords array
  window.currentRecords[currentEditRow].name = updatedName;
  window.currentRecords[currentEditRow].bloodGroup = updatedBloodGroup;
  window.currentRecords[currentEditRow].rhesus = updatedRhesus;

  // Update the table to reflect the changes
  const tableBody = document.getElementById("bloodRecords");
  const row = tableBody.rows[currentEditRow];
  row.cells[1].textContent = updatedName;
  row.cells[2].textContent = updatedBloodGroup;
  row.cells[3].textContent = updatedRhesus;

  // Save the changes to the database (via IPC or direct SQLite queries)
  window.api.updateRecord(window.currentRecords[currentEditRow]);
  document.getElementById("editModal").style.display = "none";
};

// Show the editable row with pre-filled data
function showEditRow(index) {
  const record = window.currentRecords[index];
  currentEditRow = index;

  const row = document.createElement("tr");
  row.innerHTML = `
        <tr id="editRow">
                <td id="editNumberCell"></td>
                <td>
                  <input
                    type="text"
                    id="editName"
                    name="editName"
                    value="${record.name}"
                    required
                    placeholder="Name"
                  />
                </td>
                <td>
                  <select id="editBloodGroup" selected="${record.bloodGroup}" name="editBloodGroup" required>
                    <option value="O">O</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                  </select>
                </td>
                <td>
                  <select id="editRhesus" value="${record.rhesus}" name="editRhesus" required>
                    <option value="Positive">Positive</option>
                    <option value="Negative">Negative</option>
                  </select>
                </td>
                <td>
                  <button id="saveEdit" type="button" id="saveEdit" title="Update">
                    <i class="fa-solid fa-edit"></i>
                  </button>
                  <button id="cancelEditBtn" type="button" title="Cancel"><i class="fa-solid fa-cancel"></i></button>
                </td>
              </tr>
  `;

  // Populate the fields with the record's current data
  // document.getElementById("editNumberCell").textContent = record.number;
  // document.getElementById("editName").value = record.name;
  // document.getElementById("editBloodGroup").value = record.bloodGroup;
  // document.getElementById("editRhesus").value = record.rhesus;

  // Insert the edit row directly after the row being edited
  const tableBody = document.getElementById("bloodRecords");
  tableBody.insertBefore(row, tableBody.children[index + 1]);

  document.getElementById("saveEdit").onclick = function () {
    console.log("Saving................")
    const updatedName = document.getElementById("editName").value;
    const updatedBloodGroup = document.getElementById("editBloodGroup").value;
    const updatedRhesus = document.getElementById("editRhesus").value;
    console.log(updatedName, updatedBloodGroup, updatedRhesus);

    window.api.updateRecord(window.currentRecords[currentEditRow]);
    row.style.display = "none";
  };

  // Hide the edited row being edited
  document.getElementById("cancelEditBtn").onclick = function () {
    row.style.display = "none";
  };
}

// Save the edited data and update the row in the table
function saveEdit() {
  const updatedName = document.getElementById("editName").value;
  const updatedBloodGroup = document.getElementById("editBloodGroup").value;
  const updatedRhesus = document.getElementById("editRhesus").value;

  console.log(updatedName, updatedBloodGroup, updatedRhesus);
  console.log(document.getElementById("editRow"));

  // Update the record in the global array
  window.currentRecords[currentEditRow].name = updatedName;
  window.currentRecords[currentEditRow].bloodGroup = updatedBloodGroup;
  window.currentRecords[currentEditRow].rhesus = updatedRhesus;

  // Update the displayed table row
  const tableBody = document.getElementById("bloodRecords");
  const row = tableBody.children[currentEditRow];
  row.cells[1].textContent = updatedName;
  row.cells[2].textContent = updatedBloodGroup;
  row.cells[3].textContent = updatedRhesus;

  // Hide the editable row
  document.getElementById("editRow").style.display = "none";

  // Optionally, save the updated data back to the database or server here
  // window.api.updateRecord(window.currentRecords[currentEditRow]);
}

// Cancel the edit action and hide the edit row
function cancelEdit() {
  console.log("Cancelling edit ...................");
  document.getElementById("editRow").style.display = "none";
  currentEditRow = null; // Reset the index
}

// Initially load records for Monday
window.onload = () => {
  displayRecords("Monday");
};
