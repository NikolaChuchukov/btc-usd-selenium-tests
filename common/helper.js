const { Builder, By, Key, until } = require("selenium-webdriver");
const { googleFinanceUrl } = require("./config");
const fs = require("fs");

// Read the file containing identifiers
const selectors = JSON.parse(fs.readFileSync("selectors.json", "utf8"));

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class Helper {
  // Function to retrieve Bitcoin price from Google Finance
  static async getBitcoinPrice() {
    let driver = await new Builder().forBrowser("chrome").build();
    let initialPriceAsInt = 0;
    // Set up the WebDriver for Chrome

    try {
      // Open Google Finance website
      await driver.manage().window().maximize();
      await driver.get(googleFinanceUrl);

      // Wait for the cookie banner to appear
      await driver.wait(
        until.elementLocated(By.xpath(selectors.acceptCookies.xpath)),
        5000
      );

      // Find and click the "Accept" button
      const acceptButton = await driver.findElement(
        By.xpath(selectors.acceptCookies.xpath)
      );
      await acceptButton.click();

      // Wait for the cookie banner to disappear
      await driver.wait(until.stalenessOf(acceptButton), 5000);

      // Wait for the search input field to be visible
      await driver.wait(
        until.elementLocated(By.xpath(selectors.inputField.xpath)),
        5000
      );

      // Search for Bitcoin price
      await driver
        .findElement(By.xpath(selectors.inputField.xpath))
        .sendKeys("BTC-USD");

      await driver
        .findElement(By.xpath(selectors.inputField.xpath))
        .sendKeys(Key.ENTER);

      // Wait for Bitcoin price to appear
      await driver.wait(
        until.elementLocated(By.css(selectors.bitcoinPriceField.css)),
        5000
      );

      // Get the Bitcoin price element
      const btcPriceElement = await driver.findElement(
        By.css(selectors.bitcoinPriceField.css)
      );

      // Get the text of the Bitcoin price element
      const initialPrice = await btcPriceElement.getText();

      initialPriceAsInt = parseInt(initialPrice.replace(/,/g, ""), 10);

      // Print Bitcoin price to console
      console.log("Bitcoin Initial Price:", initialPriceAsInt);
    } finally {
      // Quit the WebDriver
      await driver.quit();
    }

    return initialPriceAsInt;
  }

  static getAvgPrice(list) {
    // Check if the list is empty
    if (list.length === 0) {
      return 0;
    }

    // Calculate the sum of all values in the list
    const sum = list.reduce((acc, value) => acc + value, 0);

    // Calculate the average by dividing the sum by the number of elements
    const average = sum / list.length;

    return average;
  }

  static calculatePercentage(initialPrice, currentPrice) {
    // Calculate the absolute change in price
    const priceChange = currentPrice - initialPrice;

    // Calculate the percentage change
    const percentageChange = (priceChange / initialPrice) * 100;

    // Return the percentage change
    return percentageChange;
  }

  static async checkBitcoinPrice(seconds, minutes) {
    // Set up the WebDriver for Chrome
    let driver = await new Builder().forBrowser("chrome").build();
    let btcPrices = [];
    let i = 0;

    try {
      // Open Google Finance website
      await driver.manage().window().maximize();
      await driver.get(googleFinanceUrl);

      // Wait for the cookie banner to appear
      await driver.wait(
        until.elementLocated(By.xpath(selectors.acceptCookies.xpath)),
        5000
      );

      // Find and click the "Accept" button
      const acceptButton = await driver.findElement(
        By.xpath(selectors.acceptCookies.xpath)
      );
      await acceptButton.click();

      // Wait for the cookie banner to disappear
      await driver.wait(until.stalenessOf(acceptButton), 5000);

      // Wait for the search input field to be visible
      await driver.wait(
        until.elementLocated(By.xpath(selectors.inputField.xpath)),
        5000
      );

      // Search for Bitcoin price
      await driver
        .findElement(By.xpath(selectors.inputField.xpath))
        .sendKeys("BTC-USD", Key.ENTER);
      await driver
        .findElement(By.xpath(selectors.inputField.xpath))
        .sendKeys(Key.ENTER);

      while (i < (minutes * 60) / seconds) {
        const priceElement = await driver.wait(
          until.elementLocated(By.css(selectors.bitcoinPriceField.css)),
          5000
        );
        let btcPriceNow = await priceElement.getText();
        console.log(btcPriceNow.replace(/,/g, ""));
        let btcPriceInInt = parseInt(btcPriceNow.replace(/,/g, "", 10));
        btcPrices.push(btcPriceInInt);
        i++;        
        await sleep(seconds * 1000);        
        await driver.navigate().refresh();
      }

      console.log("Bitcoin Prices:", btcPrices);
    } finally {
      // Quit the WebDriver
      await driver.quit();
    }

    return btcPrices;
  }
}

module.exports = Helper;
