const { Builder } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const { getChromeDriverPath } = require("../file-paths");
// const { path: chromedriverPath } = require("chromedriver");

class SeleniumHelper {
  constructor(headless = true) {
    this.headless = headless;
    this.driver = this.initDriver();
  }

  /**
   * Initialize the Selenium WebDriver.
   * @returns {WebDriver} - The initialized WebDriver instance.
   */
  initDriver() {
    try {
      const options = new chrome.Options();

      if (this.headless) {
        options.addArguments("--headless", "--disable-gpu", "--no-sandbox");
      }

      options.addArguments(
        "--disable-dev-shm-usage",
        "--disable-extensions",
        "--start-maximized",
        "--ignore-certificate-errors"
      );

      console.info("Initializing Selenium WebDriver...");

      const chromeDriverPath = getChromeDriverPath();
      const driver = new Builder()
        .forBrowser("chrome")
        .setChromeOptions(options)
        .setChromeService(new chrome.ServiceBuilder(chromeDriverPath))
        .build();

      console.info("Selenium WebDriver initialized successfully.");
      return driver;
    } catch (error) {
      console.error("Failed to initialize Selenium WebDriver:", error.message);
      throw new Error("Error initializing Selenium WebDriver.");
    }
  }

  /**
   * Get the active WebDriver instance.
   * @returns {WebDriver} - The active WebDriver instance.
   */
  getDriver() {
    if (!this.driver) {
      throw new Error("WebDriver is not initialized. Call initDriver() first.");
    }
    return this.driver;
  }

  /**
   * Close and quit the WebDriver instance.
   */
  async closeDriver() {
    try {
      if (this.driver) {
        console.info("Closing Selenium WebDriver...");
        await this.driver.quit();
        this.driver = null;
        console.info("Selenium WebDriver closed successfully.");
      }
    } catch (error) {
      console.warn("Error while closing Selenium WebDriver:", error.message);
    }
  }
}

module.exports = SeleniumHelper;
