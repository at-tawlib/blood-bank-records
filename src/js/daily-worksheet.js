// Function to display records for a specific day
let currentEditRow = null;
let currentDay = "Monday";
function displayRecords(day) {
  // Fetch and format the date for the selected day
  const mostRecentDate = getMostRecentDateForDay(day);
  const records = window.api.getRecords(mostRecentDate);

  // Show records table and hide the form
  document.getElementById("addForm").style.display = "none";
  document.getElementById("showRecords").style.display = "block";
  document.getElementById("worksheetDay").innerHTML = `${day} (${formatDate(
    mostRecentDate
  )})`;

  // Populate table with records
  const tableBody = document.getElementById("bloodRecords");
  tableBody.innerHTML = ""; // Clear previous content

  records.forEach((record, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${record.number}</td>
      <td>${record.name}</td>
      <td>${record.bloodGroup}</td>
      <td>${record.rhesus}</td>
      <td>
        <button class="btn-edit-record" type="button" title="Edit record" onclick="showEditRow(${index})">
          <i class="fa-solid fa-edit"></i>
        </button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  // Store records globally for easy access in editing functions
  window.currentRecords = records;
}

// Helper: Get the most recent date for a specific day
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
  if (difference < 0) difference += 7; // Adjust for days earlier in the week

  const mostRecentDate = new Date();
  mostRecentDate.setDate(today.getDate() - difference);

  return mostRecentDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD
}

// Helper: Format date to "DD Month YYYY" with suffix
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

// Helper: Determine day suffix (st, nd, rd, th)
function getDaySuffix(day) {
  if (day > 3 && day < 21) return "th";
  return ["st", "nd", "rd"][(day % 10) - 1] || "th";
}

// Function to show the editable row with pre-filled data
function showEditRow(index) {
  // make sure that only one row is editable at a time
  if (currentEditRow !== null) {
    cancelEdit();
  }

  const record = window.currentRecords[index];
  currentEditRow = index;

  // Create and insert an editable row
  const row = document.createElement("tr");
  row.id = "editRow";
  row.innerHTML = `
    <td>${record.number}</td>
    <td><input type="text" id="editName" value="${record.name}" required /></td>
    <td>
      <select id="editBloodGroup" required>
        <option value="O" ${
          record.bloodGroup === "O" ? "selected" : ""
        }>O</option>
        <option value="A" ${
          record.bloodGroup === "A" ? "selected" : ""
        }>A</option>
        <option value="B" ${
          record.bloodGroup === "B" ? "selected" : ""
        }>B</option>
        <option value="AB" ${
          record.bloodGroup === "AB" ? "selected" : ""
        }>AB</option>
      </select>
    </td>
    <td>
      <select id="editRhesus" required>
        <option value="Positive" ${
          record.rhesus === "Positive" ? "selected" : ""
        }>Positive</option>
        <option value="Negative" ${
          record.rhesus === "Negative" ? "selected" : ""
        }>Negative</option>
      </select>
    </td>
    <td>
      <div class="btn-group-edit">
      <button class="btn-edit-save" title="Update" type="button" onclick="saveEdit()"><i class="fa-solid fa-save"></i></button>
      <button class="btn-edit-cancel" title="Cancel" type="button" onclick="cancelEdit()"><i class="fa-solid fa-remove"></i></button>
      </div>
    </td>
  `;

  // Insert editable row after the current row and hide the current row
  const tableBody = document.getElementById("bloodRecords");
  tableBody.children[index].style.display = "none";
  tableBody.insertBefore(row, tableBody.children[index + 1]);
}

// Save the edited data
function saveEdit() {
  // Get updated values
  const updatedName = document.getElementById("editName").value;
  const updatedBloodGroup = document.getElementById("editBloodGroup").value;
  const updatedRhesus = document.getElementById("editRhesus").value;

  // Update global records and table row
  const record = window.currentRecords[currentEditRow];
  record.name = updatedName;
  record.bloodGroup = updatedBloodGroup;
  record.rhesus = updatedRhesus;

  const row = document.getElementById("bloodRecords").children[currentEditRow];
  row.cells[1].textContent = updatedName;
  row.cells[2].textContent = updatedBloodGroup;
  row.cells[3].textContent = updatedRhesus;

  // Hide editable row and update database
  document.getElementById("editRow").remove();
  window.api.updateRecord(record);
}

// Cancel editing
function cancelEdit() {
  // Remove editable row and show the original row
  document.getElementById("bloodRecords").children[
    currentEditRow
  ].style.display = "table-row";
  document.getElementById("editRow").remove();
  currentEditRow = null;
}

// Initial load: display records for Monday on page load
window.onload = () => displayRecords(currentDay);
