const { By, until } = require("selenium-webdriver");
const SeleniumHelper = require("./SeleniumHelper");

class LHIMSAutomator {
  constructor(username, password, headless = true) {
    this.username = username;
    this.password = password;

    this.helper = new SeleniumHelper(headless);
    this.driver = this.helper.getDriver();
    console.log("LHIMS Automator initialized successfully.");
  }

  // Open teh LHIMS link and login
  async login(LHIMS_URL) {
    try {
      console.info("Logging in...");
      await this.driver.get(LHIMS_URL);

      await this.driver
        .findElement(By.id("idUsername"))
        .sendKeys(this.username);
      await this.driver
        .findElement(By.id("idPassword"))
        .sendKeys(this.password);
      await this.driver.findElement(By.id("idSecureLoginButton")).click();

      console.info("Logged in successfully.");
    } catch (error) {
      console.error("Error during login:", error.message);
      throw error;
    }
  }

  // Open Blood Bank Lab Services
  // logins then > Opens Dashboard > Blood Bank Dashboard > Blood Bank - Lab Services
  async openBloodBankLabServices(LHIMS_URL) {
    try {
      await this.login(LHIMS_URL);

      console.info("Opening Blood Bank Dashboard...");
      await this.driver
        .findElement(By.linkText("Blood Bank Dashboard"))
        .click();
      await this.driver.sleep(1000);

      const section = await this.driver.findElement(By.id("idBloodBank"));
      const select = await section.findElement(By.css("select"));
      await select.sendKeys("2");

      await this.driver.sleep(1000);
      await this.driver.findElement(By.id("idLockBloodBank")).click();
      await this.driver.sleep(2000);
      await this.driver
        .findElement(By.css("#buttonContainer > a:nth-child(6)"))
        .click();

      await this.driver.wait(
        until.elementLocated(By.id("idBloodBankLabServices")),
        10000
      );
      console.info("Blood Bank Lab Services opened successfully.");
    } catch (error) {
      console.error("Error during Blood Bank Lab Services:", error.message);
      throw error;
    }
  }

  // Bill Patient
  // Opens Dashboard > Blood Bank Dashboard > Blood Bank - Lab Services > Add Lab Test
  // Enters lhims_number and selects procedure then bills the patient, waits for user to confirm
  async billPatient(LHIMS_URL, lhimsNumber) {
    try {
      await this.openBloodBankLabServices(LHIMS_URL);

      console.info("Billing patient...");
      await this.driver.findElement(By.linkText("Add Lab Test")).click();
      await this.driver.sleep(2000);

      const labTestForSelect = await this.driver.findElement(
        By.id("idLabTestFor")
      );
      await labTestForSelect.sendKeys("3");

      const dropdownTrigger = await this.driver.findElement(
        By.xpath('//*[@id="select2-idPatientSearch-container"]/span')
      );
      await dropdownTrigger.click();

      const inputField = await this.driver.wait(
        until.elementLocated(By.xpath("/html/body/span/span/span[1]/input")),
        10000
      );
      await inputField.sendKeys(lhimsNumber);

      const resultItem = await this.driver.wait(
        until.elementLocated(By.xpath("/html/body/span/span/span[2]/ul/li")),
        10000
      );
      await resultItem.click();

      console.info("Patient billed successfully.");
    } catch (error) {
      console.error("Error during billing:", error.message);
      throw error;
    }
  }

  // Open Lab Test Listing
  // Opens Dashboard > Blood Bank Dashboard > Blood Bank - Lab Services > Lab Test Listing
  async openLabTestListing(LHIMS_URL) {
    try {
      await this.openBloodBankLabServices(LHIMS_URL);

      console.info("Opening Lab Test Listing...");
      await this.driver.findElement(By.linkText("Lab Test Listing")).click();
      await this.driver.sleep(1000);

      const serviceContainer = await this.driver.findElement(
        By.id("select2-idServiceID-container")
      );
      await serviceContainer.click();

      const inputField = await this.driver.findElement(
        By.xpath("/html/body/span/span/span[1]/input")
      );
      await inputField.sendKeys("GROUPING AND CROSS MATCHING");

      await this.driver.sleep(3000);

      const resultItem = await this.driver.findElement(
        By.css("#select2-idServiceID-results > li")
      );
      await resultItem.click();

      console.info("Lab Test Listing opened successfully.");
    } catch (error) {
      console.error("Error during Lab Test Listing:", error.message);
      throw error;
    }
  }

  // Quit Driver
  async quitDriver() {
    try {
      if (this.helper) {
        console.info("Closing Selenium WebDriver...");
        // await this.driver.quit();
        this.helper.closeDriver();
        console.info("WebDriver closed successfully.");
      }
    } catch (error) {
      console.warn("Error during WebDriver closure:", error.message);
    }
  }
}

module.exports = LHIMSAutomator;
