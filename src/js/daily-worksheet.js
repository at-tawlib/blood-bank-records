// Sample blood bank data
const bloodData = {
  Monday: [
    { number: 1, name: "John Doe", bloodGroup: "O+", rhesus: "Positive" },
    { number: 2, name: "Jane Smith", bloodGroup: "A-", rhesus: "Negative" },
  ],
  Tuesday: [
    { number: 1, name: "Mark Taylor", bloodGroup: "B+", rhesus: "Positive" },
    { number: 2, name: "Emily Johnson", bloodGroup: "AB-", rhesus: "Negative" },
    { number: 3, name: "Michael Brown", bloodGroup: "O+", rhesus: "Positive" },
    { number: 4, name: "Sarah Davis", bloodGroup: "A-", rhesus: "Negative" },
    { number: 5, name: "Chris Wilson", bloodGroup: "AB+", rhesus: "Positive" },
  ],

  Wednesday: [
    { number: 1, name: "Mark Taylor", bloodGroup: "B+", rhesus: "Positive" },
    { number: 2, name: "Emily Johnson", bloodGroup: "AB-", rhesus: "Negative" },
    { number: 3, name: "Michael Brown", bloodGroup: "O+", rhesus: "Positive" },
    { number: 4, name: "Sarah Davis", bloodGroup: "A-", rhesus: "Negative" },
    { number: 5, name: "Chris Wilson", bloodGroup: "AB+", rhesus: "Positive" },
  ],

  Sunday: [
    { number: 1, name: "Mark Taylor", bloodGroup: "B+", rhesus: "Positive" },
    { number: 2, name: "Emily Johnson", bloodGroup: "AB-", rhesus: "Negative" },
    { number: 3, name: "Michael Brown", bloodGroup: "O+", rhesus: "Positive" },
    { number: 4, name: "Sarah Davis", bloodGroup: "A-", rhesus: "Negative" },
    { number: 5, name: "Chris Wilson", bloodGroup: "AB+", rhesus: "Positive" },
  ],
};

// Function to display data based on the day selected
function displayRecords(day) {
  document.getElementById("addForm").style.display = "none"; // Hide form
  document.getElementById("showRecords").style.display = "block"; // Show table

  const worksheetDay = document.getElementById("worksheetDay");
  worksheetDay.innerHTML = day;

  // TODO: get and display the date too

  const tableBody = document.getElementById("bloodRecords");
  tableBody.innerHTML = ""; // Clear existing records

  const records = bloodData[day] || []; // Get data for the selected day
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

// Initially load records for Monday
window.onload = () => {
  displayRecords("Monday");
};
