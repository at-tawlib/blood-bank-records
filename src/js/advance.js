let selectedDatabaseRow = null;
let selectedScrapedRow = null;

// Date validation and formatting on change
document.getElementById("recordDate").addEventListener("change", function () {
  const date = this.value;
  const records = window.api.getRecords(date);

  displayRecords(records);
});

function displayRecords(records) {
  console.log(records);
  const tableBody = document.getElementById("dataTable").querySelector("tbody");
  tableBody.innerHTML = ""; // Clear any existing rows

  if (records.length === 0 || !records) {
    document.getElementById("dataTable").style.display = "none";
    document.getElementById("noData").style.display = "block";
    return;
  }

  records.forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="hidden">${row.id}</td>
      <td>${row.number}</td>
      <td>${row.name}</td>
      <td>${row.lhimsNumber || ""}</td>
      <td></td>
      <td></td>
      `;
    // Add the onclick event listener to the row
    tr.addEventListener("click", () => {
      selectRow(tr);
    });
    tableBody.appendChild(tr);
  });

  document.getElementById("noData").style.display = "none";
  document.getElementById("dataTable").style.display = "table";
}

async function runBilling() {
  console.log("Billing initiated");

  const tableBody = document
    .getElementById("populationTable")
    .querySelector("tbody");
  tableBody.innerHTML = ""; // Clear any existing rows
  loadingIndicator.style.display = "block"; // Show the loading indicator

  try {
    const data = await window.advancePage.runPythonScript();

    // Hide loading indicator when data is received
    loadingIndicator.style.display = "none";
    data.slice(1, 10).forEach((row) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${row.country}</td><td>${row.population}</td>`;
      tableBody.appendChild(tr);
    });
  } catch (error) {
    console.log(error);
    loadingIndicator.style.display = "none";
  }
}

function applyFilters() {
  // Code to apply filters based on selected criteria
  console.log("Filters applied");
}

function bulkUpload() {
  // Code for bulk upload
  console.log("Bulk upload initiated");
}

function generateReport() {
  // Code to generate report based on date range
  console.log("Report generated");
}

function applySettings() {
  const theme = document.getElementById("theme").value;
  document.body.className = theme; // Example: Apply theme by changing body class
  console.log("Settings applied:", theme);
}

function getMockData() {
  const people = [
    { name: "David Beckham", id: "AC-A02-ABC1234" },
    { name: "Roy Vanistelroy", id: "AC-B13-DEF5678" },
    { name: "Zinedine Zidane", id: "AC-C21-GHI9012" },
    { name: "Ronaldinho Gaucho", id: "AC-D42-JKL3456" },
    { name: "Wayne Rooney", id: "AC-E53-MNO7890" },
    { name: "Abedi Pele", id: "AC-F64-PQR2345" },
    { name: "Dede Ayew", id: "AC-G75-STU6789" },
    { name: "David Ayew", id: "AC-H86-VWX1234" },
    { name: "Ronaldinho Beckham", id: "AC-I97-YZA5678" },
    { name: "Zidane Pele", id: "AC-J08-BCD9012" },
  ];

  const tableBody = document
    .getElementById("scrapedTable")
    .querySelector("tbody");
  tableBody.innerHTML = "";

  people.forEach((person) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${person.name}</td><td>${person.id}</td>`;
    tr.addEventListener("click", () => {
      selectedScrapedRow = tr;
      reconcile();
    });
    tableBody.appendChild(tr);
  });

  document.getElementById("noScrapeData").style.display = "none";
  document.getElementById("scrapedTable").style.display = "table";
}

// Function to select a row and highlight it
function selectRow(row) {
  // Deselect previous selection for the table
  if (selectedDatabaseRow) selectedDatabaseRow.classList.remove("active");
  selectedDatabaseRow = row;
  row.classList.add("active");
}

// Function to copy selected row from one table to another
function reconcile() {
  // Ensure both rows are selected
  if (!selectedDatabaseRow || !selectedScrapedRow) {
    alert("Please select a row from both tables to reconcile");
    return;
  }

  const name = selectedScrapedRow.cells[0].innerText;
  const id = selectedScrapedRow.cells[1].innerText;

  // Append ID and name to the last column of the selected database row
  selectedDatabaseRow.cells[3].innerText = `${id}`;
  selectedDatabaseRow.cells[4].innerText = `${name}`;
  selectedDatabaseRow.cells[5].innerHTML = `
        <div class="btn-group-edit">
          <button class="btn-edit-save" title="Update" type="button">
            <i class="fa-solid fa-save"></i>
          </button>
          <button class="btn-edit-cancel" title="Cancel" type="button">
            <i class="fa-solid fa-remove"></i>
          </button>
        </div>
    `;

  // Add click event listeners for the buttons
  const saveButton = selectedDatabaseRow.querySelector(".btn-edit-save");
  const cancelButton = selectedDatabaseRow.querySelector(".btn-edit-cancel");

  saveButton.addEventListener("click", (event) => {
    event.stopPropagation(); // Prevent the row's click event from firing
    const row = event.currentTarget.closest("tr"); // Get the row
    update(row);
    // Your save logic here
  });

  // Cancel button event listener
  cancelButton.addEventListener("click", (event) => {
    event.stopPropagation(); // Prevent the row's click event from firing
    const row = event.currentTarget.closest("tr"); // Get the row
    removeReconciledRow(row);
  });

  // Remove the selected row from the scraped table
  selectedScrapedRow.remove();

  // Clear selections
  selectedDatabaseRow.classList.remove("active");
  selectedScrapedRow.classList.remove("active");

  selectedDatabaseRow = null;
  selectedScrapedRow = null;
}

function removeReconciledRow(row) {
  const name = row.cells[4].innerText;
  const id = row.cells[3].innerText;

  // Clear data
  row.cells[3].innerText = "";
  row.cells[4].innerHTML = "";
  row.cells[5].innerHTML = "";

  // Add removed data to the scraped table
  const tr = document.createElement("tr");
  tr.innerHTML = `<td>${name}</td><td>${id}</td>`;
  tr.addEventListener("click", () => {
    selectedScrapedRow = tr;
    reconcile();
  });

  document
    .getElementById("populationTable")
    .querySelector("tbody")
    .appendChild(tr);
}

// Function to update the record in the database
async function update(row) {
  const id = row.cells[0].innerText;
  const lhims = row.cells[3].innerText;
  const updatedRecord = { id, lhimsNumber: lhims };

  const result = await window.api.updateLHIMSNumber(updatedRecord);

  if (result === "Success") {
    row.cells[5].innerHTML = ""; // Clear the buttons
    row.classList.remove("active"); // Remove the active class
    showToast("Success", "success");
  } else {
    showToast("Unable to reconcile data", "error");
  }
}

function fetchData() {
  const date = document.getElementById("scrapeDate").value;
  console.log("Fetching data...", date);
  getMockData();
}

// Initial load: display records for Monday on page load
window.onload = () => {
  // getMockData();
};
