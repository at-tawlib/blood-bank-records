// Get elements
const modal = document.getElementById("patientModal");
const closeModalBtn = document.querySelector(".close-btn");

// Open modal on button click
function openModal(record) {
  modal.style.display = "block";

  const modalContent = modal.querySelector(".modal-content");
  modalContent.innerHTML = `
        <p><strong>Name:  </strong>${record.name}</p>
        <p><strong>Blood Group:  </strong> ${record.bloodGroup} Rh "D" ${record.rhesus}</p>
        <p><strong>LHIMS:  </strong>${record.lhimsNumber || ""}</p>
    `;
}

// Close modal when clicking the close button (X)
closeModalBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

// Close modal when clicking outside the modal content
window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});
