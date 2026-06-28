const axios = require("axios");
require("dotenv").config();
const { App } = require("@slack/bolt");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});

app.command("/brokenbot-ping", async ({ ack, respond }) => {
  const start = Date.now();

  await ack();

  const latency = Date.now() - start;
  await respond({ text: `Po!\nLatency: ${latency}ms` });
});

app.command("/brokenbot-help", async ({ ack, respond }) => {
  await ack();

  await respond({
    text: `Available Commands:
/brokenbot-ping - Check bot latency
/brokenbot-catfact - Get a cat fact
/brokenbot-joke - Get a joke
/brokenbot-weather [city] - Get weather`,
  });
});

app.command("/brokenbot-catfact", async ({ ack, respond }) => {
  await ack();
  //console.log('1')
  try {
    const response = await axios.get("https://catfact.ninja/fact", {
      timeout: 3000,
    });

    await respond({ text: `Cat Fact:\n${response.data.fact}` });
  } catch (err) {
    await respond({ text: "Failed to fetch a cat fact." });
  }
});

app.command("/brokenbot-joke", async ({ ack, respond }) => {
  await ack();

  try {
    const response = await axios.get(
      "https://official-joke-api.appspot.com/random_joke",
      { timeout: 3000 },
    );

    await respond({
      text: `Here's a joke for you:\n${response.data.setup}\n${response.data.punchline}`,
    });
  } catch (err) {
    await respond({ text: "Failed to fetch a joke." });
  }
});

app.command("/brokenbot-weather", async ({ ack, respond, command }) => {
  await ack();


  const city = command.text.trim();


  if (!city) {
    await respond({ text: "Please provide a city name. Usage: /brokenbot-weather [city]" });
    return;
  }

  try {
    const response = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
      params: {
        q: city,
        appid: process.env.OPENWEATHER_API_KEY,
        units: "metric",
      },
      timeout: 5000,
    });

    const weather = response.data;

    //console.log("OpenWeather returned:", weather.name);

    await respond({
      text: `Weather in ${weather.name}:\n${weather.weather[0].description}\nTemperature: ${weather.main.temp}°C`,
    });
  } catch (err) {
    //console.error("error status:", err.response?.status);
    //console.error("data", err.response?.data);
    //console.error("message", err.message);

    await respond({
      text: "Failed to fetch weather data. Please check the city name and try again.",
    });
  }
});
app.command("/brokenbot-randomfact", async ({ ack, respond }) => {
  await ack();

  try {
    const response = await axios.get(
      "https://uselessfacts.jsph.pl/api/v2/facts/random",
      {
        params: {
          language: "en",
        },
        headers: {
          Accept: "application/json",
        },
        timeout: 3000,
      }
    );

    await respond({
      text: `Random Fact:\n${response.data.text}`,
    });
  } catch (err) {
    await respond({ text: "Failed to fetch a random fact." });
  }
});
(async () => {
  await app.start();
  console.log("bot is running!");
})();
