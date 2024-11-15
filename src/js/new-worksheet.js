const lhimsData = [
  { name: "Samuel Appiah", id: "AC-A12-XZP1234" },
  { name: "John Mensah", id: "AC-B34-QWE5678" },
  { name: "Elizabeth Tetteh", id: "AC-C56-RFT9012" },
  { name: "Yaw Owusu", id: "AC-D78-ZXD3456" },
  { name: "Ama Asantewaa", id: "AC-E90-RTG7890RTG7890RTG7890" },
  { name: "Kwame Boateng", id: "AC-F23-FTY2345" },
  { name: "Kojo Antwi", id: "AC-G45-MNB6789" },
  { name: "Akosua Nyarko", id: "AC-H67-ASD1234" },
  { name: "Efua Annan", id: "AC-I89-DSF5678" },
  { name: "Kofi Adjei", id: "AC-J01-WER9012" },
  { name: "Yaw Darko", id: "AC-K23-RTY3456" },
  { name: "Ama Nyame", id: "AC-L45-SAD7890" },
  { name: "Esi Frimpong", id: "AC-M67-KLM2345" },
  { name: "Akua Acheampong", id: "AC-N89-VBN6789" },
  { name: "Mavis Badu", id: "AC-O12-POI1234" },
  { name: "Yaw Ankomah", id: "AC-P34-UYT5678" },
  { name: "Kojo Akoto", id: "AC-Q56-XCV9012" },
  { name: "Ama Mensah", id: "AC-R78-QAZ3456" },
  { name: "Akosua Agyeman", id: "AC-S90-WSD7890" },
  { name: "Kwadwo Ofori", id: "AC-T23-ZXF2345" },
  { name: "Esi Yeboah", id: "AC-U45-LKG6789" },
  { name: "Yaw Baah", id: "AC-V67-NHJ1234" },
  { name: "Kwame Danso", id: "AC-W89-UIO5678" },
  { name: "Efua Nkrumah", id: "AC-X01-PLM9012" },
];

let currentFocusedInput = null;

// Add event listener to all input fields dynamically
document.getElementById("formBody").addEventListener("focusin", (event) => {
  // Check if the focused element is an input field
  if (event.target.tagName === "INPUT" && event.target.type === "text") {
    currentFocusedInput = event.target;
  }
});

// Initialize form with a specified number of rows
function initializeForm(rowCount) {
  utils.setActiveNavItem("New Worksheet"); // set current item to active
  const formBody = document.getElementById("formBody");
  formBody.innerHTML = "";
  document.getElementById("lhimsTable").style.display = "none";
  addRows(rowCount);
}

// Function to show the form and hide the table
function showForm() {
  document.getElementById("recordDate").value = "";
  document.getElementById("formattedDateDisplay").textContent = "";

  document.getElementById("generalSearch").style.display = "none";
  document.getElementById("showRecords").style.display = "none";
  document.getElementById("addForm").style.display = "block";

  initializeForm(5);
}

// Add new rows to the form
function addRows(rowCount) {
  const formBody = document.getElementById("formBody");

  // Loop to add rows with correct numbering
  for (let i = 1; i <= rowCount; i++) {
    // addRow(formBody.rows.length + 1);
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${formBody.rows.length + 1}</td>
        <td style="position: relative;">
          <input type="text" name="name" placeholder="Name" required />
          <input type="hidden" name="id" />
          <ul class="suggestion-list"></ul>
        </td>
        <td>
          <select name="bloodGroup" required>
            <option value="" disabled selected>Blood Group</option>
            <option value="O">O</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="AB">AB</option>
          </select>
        </td>
        <td>
          <select name="rhesus" required>
            <option value="" disabled selected>Rhesus</option>
            <option value="Positive">Positive</option>
            <option value="Negative">Negative</option>
          </select>
        </td>
        <td>
          <button class="btn-delete" type="button" tabindex="-1" title="Remove row" onclick="removeRow(this)">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      `;
    formBody.appendChild(row);

    // Attach event listener to the input for auto-suggest
    const input = row.querySelector('input[name="name"]');
    const hiddenIdInput = row.querySelector('input[name="id"]');
    const suggestionList = row.querySelector(".suggestion-list");
    attachAutoSuggest(input, hiddenIdInput, suggestionList);
  }
}

// Date validation and formatting on change
document.getElementById("recordDate").addEventListener("change", function () {
  const date = this.value;
  const currentDate = new Date().toISOString().split("T")[0];

  // Check if date already exists in the database
  if (window.api.checkDate(date)) {
    showToast(
      "Records already exist for this date. Please select another date.",
      "error"
    );
    resetDateInput();
    return;
  }

  // Ensure the selected date is not in the future
  if (date > currentDate) {
    showToast("Cannot select a future date.", "error");
    resetDateInput();
  } else {
    formatSelectedDate();
  }
});

// Function to attach auto-suggest to an input field
function attachAutoSuggest(input, hiddenIdInput, suggestionList) {
  input.addEventListener("input", function () {
    const query = input.value.trim().toLowerCase();

    // Hide suggestions if less than 3 characters
    if (query.length < 3) {
      suggestionList.style.display = "none";
      return;
    }

    // Filter lhimsData based on the query
    const matches = lhimsData.filter((item) =>
      item.name.toLowerCase().includes(query)
    );

    // Clear and populate suggestion list
    suggestionList.innerHTML = "";
    if (matches.length > 0) {
      matches.forEach((match) => {
        const li = document.createElement("li");
        li.textContent = match.name;
        li.style.padding = "5px";
        li.style.cursor = "pointer";

        // Add click event to populate input and hide suggestions
        li.addEventListener("click", function () {
          input.value = match.name; // Set the input value
          hiddenIdInput.value = match.id; // Set the hidden id value
          suggestionList.style.display = "none"; // Hide suggestions
        });

        suggestionList.appendChild(li);
      });

      // Show the suggestion list
      suggestionList.style.display = "block";
    } else {
      suggestionList.style.display = "none";
    }
  });

  // Hide suggestions when clicking outside the input
  document.addEventListener("click", function (event) {
    if (
      !input.contains(event.target) &&
      !suggestionList.contains(event.target)
    ) {
      suggestionList.style.display = "none";
    }
  });
}

// Function to reset date input and display
function resetDateInput() {
  document.getElementById("recordDate").value = "";
  document.getElementById("formattedDateDisplay").textContent = "";
}

// Function to clear all data from the form
function clearAllRows() {
  const formBody = document.getElementById("formBody");
  formBody.innerHTML = "";
  initializeForm(5);
}

// Find the row that contains the clicked button and remove it from the form
function removeRow(button) {
  button.closest("tr").remove();
  resetRowNumbers();
}

// Reset row numbers after removing a row
// Select all rows in the form body, and set the first cell (row number) to the current index + 1
function resetRowNumbers() {
  document.querySelectorAll("#formBody tr").forEach((row, index) => {
    row.cells[0].textContent = index + 1;
  });
}

// Close the form and display records table
function closeSheet() {
  document.getElementById("addForm").style.display = "none";
  document.getElementById("showRecords").style.display = "block";
}

// Function to save records from the form
function saveRecords() {
  const recordDate = document.getElementById("recordDate").value;
  if (!recordDate || recordDate === "") {
    showToast("Please select a date for the records.", "error");
    return;
  }

  const records = [];
  const rows = document.getElementById("formBody").getElementsByTagName("tr");

  // Loop through each row and extract data and make sure none of the fields are empty
  for (let row of rows) {
    row.style.backgroundColor = "transparent";
    const number = row.cells[0].textContent;
    const name = row.querySelector("input[name='name']").value;
    const bloodGroup = row.querySelector("select[name='bloodGroup']").value;
    const rhesus = row.querySelector("select[name='rhesus']").value;
    const lhimsNumber = row.querySelector("input[name='id']").value;

    if (!validateRowData(row, number, name, bloodGroup, rhesus)) return;
    records.push({
      date: recordDate,
      number,
      name,
      bloodGroup,
      rhesus,
      lhimsNumber,
    });
  }

  if (records.length === 0) {
    showToast("No records to save.", "error");
    return;
  }

  // Add each row's data to the new records
  // Use IPC or direct SQL query to save each record
  records.forEach((record) => window.api.saveRecord(record));
  showToast("Records saved successfully!", "success");
  closeSheet();
}

// Validate form row data
function validateRowData(row, number, name, bloodGroup, rhesus) {
  if (!name) {
    row.style.backgroundColor = "red";
    showToast(`Row ${number} has no name.`, "error");
    return false;
  }
  if (!bloodGroup) {
    row.style.backgroundColor = "red";
    showToast(`Select blood group for Row ${number}`, "error");
    return false;
  }
  if (!rhesus) {
    row.style.backgroundColor = "red";
    showToast(`Select rhesus for Row ${number}`, "error");
    return false;
  }
  return true;
}

// Format selected date and display with suffix
function formatSelectedDate() {
  // Convert the date to a JavaScript Date object
  const date = new Date(document.getElementById("recordDate").value);
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const formattedDate = date.toLocaleDateString("en-US", options);
  const daySuffix = utils.getDaySuffix(date.getDate());

  document.getElementById("formattedDateDisplay").textContent =
    formattedDate.replace(date.getDate(), `${date.getDate()}${daySuffix}`);
}

function fetchLHIMSData() {
  // window.api.fetchLHIMSData();
  const data = lhimsData;

  const tableBody = document
    .getElementById("lhimsTable")
    .querySelector("tbody");
  tableBody.innerHTML = "";

  data.forEach((person) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${person.name}</td><td>${person.id}</td>`;
    tr.addEventListener("click", () => {
      if (currentFocusedInput) {
        currentFocusedInput.value = person.name;
        currentFocusedInput
          .closest("tr")
          .querySelector('input[name="id"]').value = person.id;
        currentFocusedInput
          .closest("tr")
          .querySelector(".suggestion-list").style.display = "none";
        currentFocusedInput = null;
      } else {
        showToast("Please select an input field to populate.", "error");
      }
    });
    tableBody.appendChild(tr);
  });

  document.getElementById("lhimsTable").style.display = "table";
}

// listen for the "open-new-worksheet" event from the main process
window.api.onOpenNewWorksheet(showForm);
