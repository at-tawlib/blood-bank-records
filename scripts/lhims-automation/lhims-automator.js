const { By, until } = require("selenium-webdriver");
const SeleniumHelper = require("./SeleniumHelper");
const { Select } = require("selenium-webdriver/lib/select");

const LHIMS_URL = "http://10.255.7.4/lhims_23/login.php";

class LHIMSAutomator {
  constructor(username, password, headless = false) {
    this.username = username;
    this.password = password;

    this.helper = new SeleniumHelper(headless);
    this.driver = this.helper.getDriver();
    console.log("LHIMS Automator initialized successfully.");
  }

  // Open the LHIMS link and login
  async login() {
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

      const dashboardTitle = await this.driver.getTitle();
      return dashboardTitle;
    } catch (error) {
      console.error("Error during login:", error.message);
      this.quitDriver();
      return { success: false, message: "Error during login" };
    }
  }

  async checkLoginDetails() {
    try {
      const dashboardTitle = await this.login();

      if (dashboardTitle === "LHIMS : Lab Management") {
        console.log("Redirected to ", dashboardTitle);
        console.info("Logged in successfully.");
        return { success: true, message: "Logged in successfully" };
      }
      console.log("Log in failed");
      return {
        success: false,
        message: "Login failed, check your username and password",
      };
    } catch (error) {
      console.error("Error logging in:", error.message);
      return { success: false, message: "Login failed" };
    }
  }

  // Open Blood Bank Lab Services
  // logins then > Opens Dashboard > Blood Bank Dashboard > Blood Bank - Lab Services
  async openBloodBankLabServices() {
    try {
      const dashboardTitle = await this.login();

      if (dashboardTitle !== "LHIMS : Lab Management") {
        console.log("Error opening the dashboard");
        return {
          success: false,
          message: `Error opening dashboard. Unexpected title: ${dashboardTitle}`,
        };
      }

      console.info("Opening Blood Bank Dashboard...");
      await this.driver
        .findElement(By.linkText("Blood Bank Dashboard"))
        .click();

      const bloodBankTitle = await this.driver.getTitle();
      console.log("Redirected to ", bloodBankTitle);
      if (bloodBankTitle !== "LHIMS : Blood Bank") {
        console.log("Error opening Blood Bank dashboard");
        return {
          success: false,
          message: `Error opening Blood Bank dashboard. Unexpected title: ${bloodBankTitle}`,
        };
      }

      // Select OBS & GYNAE BLOOD BANK and lock it
      const dropdown = await this.driver.wait(
        until.elementLocated(By.id("idBloodBank")),
        3000
      );

      await this.driver.sleep(1000);
      // const dropdown = await this.driver.findElement(By.id("idBloodBank"));
      const select = new Select(dropdown);
      await select.selectByValue("2");
      await this.driver.sleep(1000);

      // Lock the selected section
      const lockButton = await this.driver.findElement(
        By.id("idLockBloodBank")
      );
      await lockButton.click();

      // Confirm page reload and new URL
      const expectedUrl =
        "http://10.255.7.4/lhims_23/bloodTransfusionDashboard.php?iBloodBankID=2";
      await this.driver.wait(until.urlIs(expectedUrl), 5000);
      console.log("Section locked and redirected successfully.");

      // Wait for the link to appear and click
      const linkSelector = "#buttonContainer > a:nth-child(6)";
      await this.driver.wait(until.elementLocated(By.css(linkSelector)), 3000);
      await this.driver.findElement(By.css(linkSelector)).click();

      const labServicesTitle = await this.driver.getTitle();
      console.log("Redirected to ", labServicesTitle);
      return labServicesTitle;
    } catch (err) {
      this.quitDriver();
      if (err.name === "UnhandledAlertException") {
        // Handle unexpected alerts
        const alert = await driver.switchTo().alert();
        const alertText = alert.getText();
        console.warn("Unexpected alert: ", alertText);
        await alert.accept();
        return { success: false, message: `Alert detected: ${alertText}` };
      }
      console.error("Error encountered: ", err.message);
      return { success: false, message: err.message };
    }
  }

  // Open Lab Test Listing
  // Opens Dashboard > Blood Bank Dashboard > Blood Bank - Lab Services > Lab Test Listing
  async openLabTestListing() {
    try {
      const labServicesTitle = await this.openBloodBankLabServices();

      if (labServicesTitle !== "Blood Bank - Lab Services") {
        console.log("Error opening Blood Bank - Lab Services");
        return {
          success: false,
          message: `Error opening Blood Bank - Lab Services. Unexpected title: ${labServicesTitle}`,
        };
      }

      console.log("Opened : ", labServicesTitle);
      console.log("Opening Lab Test Listing");
      await this.driver.findElement(By.linkText("Lab Test Listing")).click();
      const labTestListingTitle = await this.driver.getTitle();
      console.log("Redirected to ", labTestListingTitle);

      return labTestListingTitle;
    } catch (error) {
      this.quitDriver();
      console.error("Error during Lab Test Listing:", error.message);
      throw error;
    }
  }

  // Open patient LHIMS
  async openPatientLHIMS(lhimsNumber) {
    try {
      const dashboardTitle = await this.login();

      // const dashboardTitle = await this.driver.wait(until.titleIs(""), 4000);
      if (dashboardTitle !== "LHIMS : Lab Management") {
        console.log("Error opening the dashboard");
        this.quitDriver();
        return {
          success: false,
          message: `Error opening dashboard. Unexpected title: ${dashboardTitle}`,
        };
      }
      console.log("Opened : ", dashboardTitle);

      // Select and open Add new Appointment
      await this.driver.findElement(By.linkText("Add New Appointment")).click();

      // Enter lhimsNumber and search
      await this.driver.wait(until.elementLocated(By.css("#Regno")), 5000);
      await this.driver.findElement(By.css("#Regno")).sendKeys(lhimsNumber);
      await this.driver
        .findElement(
          By.css(
            "#idFormPatientVisit > div > table > tbody > tr:nth-child(7) > td:nth-child(2) > img"
          )
        )
        .click();

        // Click on search result
        await this.driver.wait(until.elementLocated(By.css("#idPatientNameListing > table > tbody > tr > td > u > span"), 5000));
        await this.driver.findElement(By.css("#idPatientNameListing > table > tbody > tr > td > u > span")).click();
        await this.driver.sleep(2000);
        await this.driver.findElement(By.css("#idSubmitPatientRegistration")).click();

        // Wait for five minutes then close
        await this.driver.sleep(50000);
        await this.quitDriver();

    } catch (error) {
      console.error("Error opening patient LHIMS: ", error.message);
      this.quitDriver();
      throw error;
    }
  }

  // Selects a date, enters GROUPING AND CROSSMATCH IN input and returns list of patients
  async getGXMList(date) {
    try {
      const labTestListingTitle = await this.openLabTestListing();

      if (labTestListingTitle !== "Lab Test Listing") {
        console.log("Error opening Lab Test Listing");
        return {
          success: false,
          message: `Error opening Lab Test Listing. Unexpected title: ${labTestListingTitle}`,
        };
      }
      console.log("Opened: ", labTestListingTitle);

      // Try to select date if date is included
      const todayItem =
        "body > div.daterangepicker.dropdown-menu.ltr.opensright > div.ranges > ul > li:nth-child(1)";
      const yesterdayItem =
        "body > div.daterangepicker.dropdown-menu.ltr.opensright > div.ranges > ul > li:nth-child(2)";
      const lastSevenDaysItem =
        "body > div.daterangepicker.dropdown-menu.ltr.opensright > div.ranges > ul > li:nth-child(3)";
      const lastThirtyDaysItems =
        "body > div.daterangepicker.dropdown-menu.ltr.opensright > div.ranges > ul > li:nth-child(4)";
      const thisMonthItem =
        "body > div.daterangepicker.dropdown-menu.ltr.opensright > div.ranges > ul > li:nth-child(5)";
      const lastMonthItem =
        "body > div.daterangepicker.dropdown-menu.ltr.opensright > div.ranges > ul > li:nth-child(6)";

      await this.driver.sleep(3000); // TODO: add delay time if first run fails
      await this.driver.wait(
        until.elementLocated(By.css("#idFilterDate")),
        3000
      );
      await this.driver.findElement(By.css("#idFilterDate")).click();
      await this.driver.sleep(1000);
      switch (date) {
        case "Today":
          await this.driver.findElement(By.css(todayItem)).click();
          break;
        case "Yesterday":
          await this.driver.findElement(By.css(yesterdayItem)).click();
          break;
        case "Last 7 Days":
          await this.driver.findElement(By.css(lastSevenDaysItem)).click();
          break;
        case "Last 30 Days":
          await this.driver.findElement(By.css(lastThirtyDaysItems)).click();
          break;
        case "This Month":
          await this.driver.findElement(By.css(thisMonthItem)).click();
          break;
        case "Last Month":
          await this.driver.findElement(By.css(lastMonthItem)).click();
          break;
        default:
          await this.driver.findElement(By.css(todayItem));
      }

      // Enter GROUPING AND CROSS MATCHING in input and select it
      await this.driver.sleep(1000);
      await this.driver
        .findElement(By.id("select2-idServiceID-container"))
        .click();
      await this.driver
        .findElement(
          By.css(
            "body > span > span > span.select2-search.select2-search--dropdown > input"
          )
        )
        .sendKeys("GROUPING AND CROSS MATCHING");
      await this.driver.sleep(1000);
      await this.driver.wait(
        until.elementsLocated(By.css("#select2-idServiceID-results > li")),
        3000
      );
      await this.driver
        .findElement(By.css("#select2-idServiceID-results > li"))
        .click();

      await this.driver.sleep(1000);
      await this.driver.findElement(By.id("idSearchDetails")).click();
      await this.driver.sleep(2000);
      console.log("Set date and input and lock...");

      console.log("Getting data from table...");
      const table = await this.driver.findElement(
        By.css("#idTableBloodBankLabTestListing")
      );
      const rows = await table.findElements(By.css("tr"));

      const data = [];
      for (let i = 1; i < rows.length; i++) {
        const columns = await rows[i].findElements(By.css("td"));
        if (columns.length > 1) {
          const nameLHIMS = await columns[3].getText();
          const details = nameLHIMS.split("\n");
          data.push({ name: details[0], lhimsNumber: details[1] });
        }
      }
      this.quitDriver();
      return { success: true, data };
    } catch (error) {
      this.quitDriver();
      console.error("Error getting lists:", error.message);
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

  // Quit Driver
  async quitDriver() {
    try {
      if (this.helper) {
        console.info("Closing Selenium WebDriver...");
        await this.driver.quit();
        this.helper.closeDriver();
        console.info("WebDriver closed successfully.");
      }
    } catch (error) {
      console.warn("Error during WebDriver closure:", error.message);
    }
  }
}

module.exports = LHIMSAutomator;
