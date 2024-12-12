const { By } = require("selenium-webdriver");
const SeleniumHelper = require("./SeleniumHelper");
const path = require("path");

class Scraper {
  constructor(headless = true) {
    this.helper = new SeleniumHelper(true);
    // this.driver = this.helper.getDriver();
    console.info("Scraper initialized successfully.");
  }

  /**
   * Scrape the population table from Wikipedia.
   * @returns {Promise<Array>} - List of countries and populations.
   */
  async scrapePopulationTable() {
    try {
      const url =
        "https://en.wikipedia.org/wiki/List_of_countries_and_dependencies_by_population";
      console.info("Accessing URL:", url);

      //   const driver = this.helper.getDriver();
      //   await driver.get(url);
      await this.helper.getDriver().get(url);

      const table = await driver.findElement(By.css("table.wikitable"));
      const rows = await table.findElements(By.css("tr"));

      const data = [];
      for (let i = 1; i < rows.length; i++) {
        const columns = await rows[i].findElements(By.css("td"));
        if (columns.length > 1) {
          const country = await columns[1].getText();
          const population = await columns[2].getText();
          data.push({ country: country.trim(), population: population.trim() });
        }
      }

      console.info("Population table scraped successfully.");
      return data;
    } catch (error) {
      console.error("Error scraping population table:", error);
      return {
        error: "Failed to scrape population table.",
        details: error.message,
      };
    }
  }

  /**
   * Scrape the GDP table from Wikipedia (example).
   * @returns {Promise<Array>} - Placeholder GDP data.
   */
  async scrapeGdpTable() {
    try {
      const url =
        "https://en.wikipedia.org/wiki/List_of_countries_by_GDP_(nominal)";
      console.info("Accessing URL:", url);

      //   const driver = this.helper.getDriver();
      //   await driver.get(url);
      await this.helper.getDriver().get(url);

      // Add GDP scraping logic here
      const data = [
        { name: "Esi Yeboah", id: "AC-U45-LKG6789" },
        { name: "Yaw Baah", id: "AC-V67-NHJ1234" },
        { name: "Kwame Danso", id: "AC-W89-UIO5678" },
        { name: "Efua Nkrumah", id: "AC-X01-PLM9012" },
        { name: "Abena Ampofo", id: "AC-Y23-BGT3456" },
        { name: "Adwoa Anane", id: "AC-Z45-QER7890" },
        { name: "Yaw Aboagye", id: "AC-A67-ZXC2345" },
        { name: "Ama Baah", id: "AC-B89-WER6789" },
        { name: "Kojo Tetteh", id: "AC-C12-MLP1234" },
        { name: "Kofi Akoto", id: "AC-D34-JHG5678" },
        { name: "Akosua Mensah", id: "AC-E56-BVD9012" },
        { name: "Mavis Osei", id: "AC-F78-NHJ3456" },
        { name: "Yaw Kusi", id: "AC-G90-MNB7890" },
        { name: "Elizabeth Amankwa", id: "AC-H23-QET2345" },
        { name: "John Agyapong", id: "AC-I45-ZXC6789" },
        { name: "Akua Boakye", id: "AC-J67-PLO1234" },
        { name: "Abena Asare", id: "AC-K89-BTG5678" },
        { name: "Kwame Kyei", id: "AC-L01-QWE9012" },
        { name: "Kwadwo Adofo", id: "AC-M23-SDC3456" },
        { name: "Efua Opoku", id: "AC-N45-PLK7890" },
        { name: "Kojo Frimpong", id: "AC-O67-MLP2345" },
        { name: "Akosua Boaten", id: "AC-P89-WER6789" },
        { name: "Yaw Tetteh", id: "AC-Q12-XCF1234" },
        { name: "Esi Akyea", id: "AC-R34-NBG5678" },
        { name: "Kwame Nyarko", id: "AC-S56-BVC9012" },
        { name: "Adwoa Danquah", id: "AC-T78-NHB3456" },
        { name: "Akua Manu", id: "AC-U90-KLM7890" },
        { name: "Abena Kwakye", id: "AC-V23-JIK2345" },
        { name: "Kofi Quaye", id: "AC-W45-YUT6789" },
        { name: "Mavis Arthur", id: "AC-X67-ZAQ1234" },
      ];

      console.info("GDP table scraped successfully.");
      return data;
    } catch (error) {
      console.error("Error scraping GDP table:", error);
      return { error: "Failed to scrape GDP table.", details: error.message };
    }
  }

  /**
   * Close the Selenium WebDriver.
   */
  async close() {
    await this.helper.closeDriver();
    console.info("Scraper closed successfully.");
  }
}

module.exports = Scraper;
