// Set data in sessionStorage with an expiry
function setSessionData(key, value, expiryInHours) {
  const now = new Date();
  const expiry = now.getTime() + expiryInHours * 60 * 60 * 1000; // Convert hours to milliseconds
  const sessionData = { value, expiry };
  sessionStorage.setItem(key, JSON.stringify(sessionData));
}

// Get data from sessionStorage, check expiry
function getSessionData(key) {
  const data = sessionStorage.getItem(key);
  if (!data) return null;

  const parsedData = JSON.parse(data);
  const now = new Date();

  if (now.getTime() > parsedData.expiry) {
    // If the data has expired, remove it
    sessionStorage.removeItem(key);
    return null;
  }

  return parsedData.value;
}

// Check if session data exists
function checkSessionData() {
  const username = getSessionData("username");
  const password = getSessionData("password");

  if (username && password) {
    return true;
  }
  return false;
}

// Clear sessionStorage for a specific key
function clearSessionData(key) {
  sessionStorage.removeItem(key);
}

// Clear all session data
function clearAllSessionData() {
  sessionStorage.clear();
}

module.exports = {
  setSessionData,
  getSessionData,
  clearSessionData,
  clearAllSessionData,
  checkSessionData
};
