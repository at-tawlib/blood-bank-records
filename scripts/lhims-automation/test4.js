const SeleniumHelper = require("./SeleniumHelper");

async function testGoogleSearch() {
  const selenium = new SeleniumHelper();

  try {
    await selenium.openPage("https://test-login-app.vercel.app/");

    // Select input elements and fill them out
    await selenium.sendKeysToElement(await selenium.findElementById("email"), "test@gmail.com");
    await selenium.sendKeysToElement(await selenium.findElementById("password"), "Password@12345");

    // Select login button to invoke click action
    await selenium.clickElement(await selenium.findElementByName("login"));

    //On successful login get page title
    const pageTitle = await selenium.getTitle();
    console.log(pageTitle);

    // Check if redirect to login page was successful
    await selenium.waitUntilTitleIs("Welcomepage", 4000);

    console.log("Page Title:", await selenium.getTitle());


    await selenium.wait(4000);
  } finally {
    await selenium.quit();
  }
}

testGoogleSearch();