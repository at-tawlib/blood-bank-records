const LHIMSAutomator = require("./lhims-automator");
const Scraper = require("./scrape-table");

async function lhimsLogin(username, password) {
  const lhimsAutomator = new LHIMSAutomator(username, password, true);
  const login = lhimsAutomator.checkLoginDetails();
  console.log(login);
  return login;
}

async function fetchDailyLHIMSData(username, password, date = "Today") {
  const lhimsAutomator = new LHIMSAutomator(username, password, true);
  // TODO: values are Today, Yesterday, Last 7 Days, Last 30 Days, This Month, Last Month
  const result = await lhimsAutomator.getGXMList(date);
  console.log(result);
  return result;
}

async function openPatientLHIMS(username, password, lhimsNumber) {
  const lhimsAutomator = new LHIMSAutomator(username, password);
  lhimsAutomator.openPatientLHIMS(lhimsNumber);
}

// main();
module.exports = {
  lhimsLogin,
  fetchDailyLHIMSData,
  openPatientLHIMS,
};

// fetchDailyLHIMSData("sno-4664", "abdul57")
// openPatientLHIMS("sno-4664", "abdul57", "GA-A19-AAB8195")
