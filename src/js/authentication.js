function login() {
  document.getElementById("loginModal").style.display = "block";
}

async function submitLogin() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    alert("Please enter both username and password");
    return;
  }

  const loginResult = await window.lhims.lhimsLogin(username, password);

  console.log("Login result...", loginResult);
  if (loginResult.success === false) {
    console.log("wrong username or password");
    document.getElementById("username").style.border = "1px solid red";
    document.getElementById("password").style.border = "1px solid red";
    const error = document.getElementById("loginError");
    error.style.display = "block";
    error.innerHTML = loginResult.message;
    return;
  }

  // Store in sessionStorage with a 4-hour expiry
  sessionData.setSessionData("username", username, 4);
  sessionData.setSessionData("password", password, 4);

  document.getElementById("username").value = "";
  document.getElementById("password").value = "";

  document.getElementById("accountInfo").style.display = "flex";
  document.getElementById("loginBtn").style.display = "none";

  closeModal();
}

function logout() {
  sessionData.clearAllSessionData();
  document.getElementById("accountInfo").style.display = "none";
  document.getElementById("loginBtn").style.display = "block";
}

function closeModal() {
  document.getElementById("loginModal").style.display = "none";
}
