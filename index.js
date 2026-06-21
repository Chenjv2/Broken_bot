const axios = require("axios");
require("dotenv").config();

const { App } = require("@slack/bolt");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});

app.command("/brokenbot-ping", async ({ command, ack, respond }) => {
  const start = Date.now();
  await ack();
  const latency = Date.now() - start;
  await respond({ text: `Po!\nLatency: ${latency}ms` });
});

(async () => {
  await app.start();
  console.log("bot is running!");
})();

app.command("/brokenbot-help", async ({ ack, respond }) => {
  await ack();
  await respond({
    text: `Available Commands:
/brokenbot-ping - Check bot latency
/brokenbot-catfact - Get a cat fact`,
  });
});
app.command("/brokenbot-catfact", async ({ ack, respond }) => {
  await ack();

  try {
    const response = await axios.get("https://catfact.ninja/fact");
    await respond({ text: `Cat Fact:\n${response.data.fact}` });
  } catch (err) {
    await respond({ text: "Failed to fetch a cat fact." });
  }
});
app.command("/brokenbot-joke", async ({ ack, respond }) => {
  await ack();
  try {
    const response = await axios.get("https://official-joke-api.appspot.com/random_joke");
    await respond({ text: `Here's a joke for you:\n${response.data.setup}\n${response.data.punchline}` });
  } catch (err) {
    await respond({ text: "Failed to fetch a joke." });
  };
});  

app.command("/brokenbot-weather", async ({ ack, respond, command }) => {
  await ack();
  const city = command.text.trim();
  if (!city) {
    await respond({ text: "Please provide a city name. Usage: /brokenbot-weather [city]" });
    return;
  } 
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`);
    const weather = response.data;
    await respond({ text: `Weather in ${weather.name}:\n${weather.weather[0].description}\nTemperature: ${weather.main.temp}°C` });
  } catch (err) {
    await respond({ text: "Failed to fetch weather data. Please check the city name and try again." });
  } 
});