// Get elements
const modal = document.getElementById("patientModal");
const closeModalBtn = document.getElementById("closeBtn");

const patient = {};
// Open modal on button click
function openModal(record) {
  modal.style.display = "block";

  const modalContent = modal.querySelector(".modal-content");
  modalContent.innerHTML = `
        <p><strong>Name:  </strong>${record.name}</p>
        <p><strong>Blood Group:  </strong> ${record.bloodGroup} Rh "D" ${
    record.rhesus
  }</p>
        <p><strong>Date:  </strong>${record.date}</p>
        <p><strong>Worksheet Number:  </strong>${record.number}</p>
        <p><strong>LHIMS:  </strong><span id="modalLHIMSNumber">${
          record.lhimsNumber || ""
        }</span></p>
    `;
}

// Close modal when clicking the close button (X)
closeModalBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

document
  .getElementById("openLHIMS")
  .addEventListener("click", async (event) => {
    const username = sessionData.getSessionData("username");
    const password = sessionData.getSessionData("password");

    if (!username && !password) {
      console.log("Login to proceed");
      return;
    }

    const lhimsNumber = document.getElementById("modalLHIMSNumber").textContent;

    if (lhimsNumber)
      await window.lhims.openPatientLHIMS(username, password, lhimsNumber);
    else console.log("Invalid lhims number");
  });

document.getElementById("closeX").addEventListener("click", (event) => {
  modal.style.display = "none";
});

// Close modal when clicking outside the modal content
window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});
