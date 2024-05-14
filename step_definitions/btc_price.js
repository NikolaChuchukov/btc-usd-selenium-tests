// btc_price_steps.js

const { Given, When, Then } = require("@cucumber/cucumber");
const { Builder, By, Key, until } = require("selenium-webdriver");
const Helper = require("../common/helper");

let btcPrices = [];
let initialPrice;
let avgPrice;

Given(
  "A baseline price is recorded",
  { timeout: 60 * 1000 },
  async function () {
    initialPrice = await Helper.getBitcoinPrice();
    console.log(initialPrice);
  }
);

When(
  "The price is checked every {int} seconds for {int} minutes",
  { timeout: 600 * 1000 },
  async function (seconds, minutes) {
    btcPrices = await Helper.checkBitcoinPrice(seconds, minutes);
    console.log(
      "Prices for the interval of " + minutes + " minutes are ",
      btcPrices
    );
  }
);

Then(
  "The avarage price difference for {int} minutes is less than {int} percent",
  { timeout: 600 * 1000 },
  function (minutes, percent) {
    avgPrice = Helper.getAvgPrice(btcPrices);
    console.log("Avg price is ", avgPrice);
    percentageDiff = Helper.calculatePercentage(initialPrice, avgPrice);
    console.log("Percentage diff is ", percentageDiff);
    if (percentageDiff >= percent && percentageDiff <= -percent) {
      throw new Error(
        "Percentage difference for the time period of " +
          minutes +
          " minutes is more than " +
          percent +
          "%"
      );
    }
  }
);

Then(
  "Each price for {int} minutes does not vary by more than {int} percent",
  { timeout: 600 * 1000 },
  function (minutes, percent) {
    for (let i = 0; i < btcPrices.length - 1; i++) {
      for (let j = i + 1; j < btcPrices.length; j++) {
        const value1 = btcPrices[i];
        const value2 = btcPrices[j];
        percentageDiff = Helper.calculatePercentage(value1, value2);
        console.log("Percentage difference is ", percentageDiff);
        if (percentageDiff >= percent && percentageDiff <= -percent) {
          throw new Error(
            "Percentage difference for time period of " +
              minutes +
              " between price " +
              value1 +
              " and price " +
              value2 +
              " is more than " +
              percent +
              "%"
          );
        }
      }
    }
  }
);
