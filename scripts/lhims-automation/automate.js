const LHIMSAutomator = require("./lhims-automator");
const Scraper = require("./scrape-table");

async function main() {
  const scraper = new Scraper();

  try {
    const populationData = await scraper.scrapePopulationTable();
    console.log("Population Data:", populationData);

    const gdpData = await scraper.scrapeGdpTable();
    console.log("GDP Data:", gdpData);
  } catch (error) {
    console.error("Error during scraping:", error);
  } finally {
    await scraper.close();
  }
}

async function fetchPopulationData() {
  const scraper = new Scraper(true);
  const data = await scraper.scrapeGdpTable();
  await scraper.close();
  return data;
}

async function fetchLHIMSData(username, password) {
    const lhimsAutomator = new LHIMSAutomator(username, password);
    await lhimsAutomator.openBloodBankLabServices();
}

// main();
module.exports = { fetchPopulationData };
