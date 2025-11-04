const express = require("express");
const https = require("https");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.post("/", (req, res) => {
  const query = req.body.CityName.trim();
  const apiKey = "43bd9fc3e7d6e0b58dc6b31499d58bfb";
  const units = "metric";
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${apiKey}&units=${units}`;

  https.get(url, (response) => {
    let rawData = "";
    response.on("data", (chunk) => (rawData += chunk));

    response.on("end", () => {
      const weatherData = JSON.parse(rawData);

      if (weatherData.cod != 200) {
        return res.send(`
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <link rel="stylesheet" href="/styles.css" />
              <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
              <title>Error - Weather App</title>
            </head>
            <body>
              <div class="weather-background">
                <div class="clouds">
                  <div class="cloud cloud-1"></div>
                  <div class="cloud cloud-2"></div>
                  <div class="cloud cloud-3"></div>
                </div>
              </div>
              <div class="container error-container">
                <div class="error-icon">⚠️</div>
                <h2 class="error-message">City Not Found</h2>
                <p class="error-detail">${weatherData.message || 'Please check the city name and try again.'}</p>
                <a href="/" class="back-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                  Search Again
                </a>
              </div>
            </body>
          </html>
        `);
      }

      const { temp, humidity, feels_like, pressure } = weatherData.main;
      const { description, icon } = weatherData.weather[0];
      const { speed } = weatherData.wind;
      const cityName = weatherData.name;
      const country = weatherData.sys.country;

      res.send(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <link rel="stylesheet" href="/styles.css" />
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
            <title>${cityName} Weather</title>
          </head>
          <body>
            <div class="weather-background">
              <div class="clouds">
                <div class="cloud cloud-1"></div>
                <div class="cloud cloud-2"></div>
                <div class="cloud cloud-3"></div>
              </div>
            </div>
            <div class="container weather-result">
              <h1 class="city-name">${cityName}, ${country}</h1>
              <img class="weather-icon-display" src="https://openweathermap.org/img/wn/${icon}@4x.png" alt="${description}" />
              <div class="temperature">${Math.round(temp)}°C</div>
              <p class="description">${description}</p>
              
              <div class="weather-details">
                <div class="detail-card">
                  <div class="detail-icon">🌡️</div>
                  <div class="detail-label">Feels Like</div>
                  <div class="detail-value">${Math.round(feels_like)}°C</div>
                </div>
                <div class="detail-card">
                  <div class="detail-icon">💧</div>
                  <div class="detail-label">Humidity</div>
                  <div class="detail-value">${humidity}%</div>
                </div>
                <div class="detail-card">
                  <div class="detail-icon">🌬️</div>
                  <div class="detail-label">Wind Speed</div>
                  <div class="detail-value">${speed} m/s</div>
                </div>
                <div class="detail-card">
                  <div class="detail-icon">🔽</div>
                  <div class="detail-label">Pressure</div>
                  <div class="detail-value">${pressure} hPa</div>
                </div>
              </div>
              
              <a href="/" class="back-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Search Again
              </a>
            </div>
          </body>
        </html>
      `);
    });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
