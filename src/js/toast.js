// Function to show a toast notification
function showToast(message, type = "success") {
  console.log("showToast called: ", message, type);

  const toastText = document.createElement("p");
  toastText.className = "toast-text";
  toastText.textContent = message;

  // Append toast to container
  const container = document.getElementById("toastContainer");
  container.appendChild(toastText);
  container.classList.add(`toast-${type}`);

  // Remove toast after 3 seconds
    setTimeout(() => {
      toastText.remove();
    }, 3000);
}
