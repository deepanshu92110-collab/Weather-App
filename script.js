let isCelsius = true;

function toggleTheme() {
  document.body.classList.toggle('light');
}

function toggleUnit() {
  isCelsius = !isCelsius;
  const location = document.getElementById('locationInput').value;
  if (location) getWeather(location);
}

function saveSearch(location) {
  let searches = JSON.parse(localStorage.getItem('searches')) || [];
  if (!searches.includes(location)) {
    searches.unshift(location);
    if (searches.length > 5) searches.pop();
    localStorage.setItem('searches', JSON.stringify(searches));
  }
  displayRecentSearches();
}

function displayRecentSearches() {
  let searches = JSON.parse(localStorage.getItem('searches')) || [];
  const recentDiv = document.getElementById('recent');
  recentDiv.innerHTML = "<strong>Recent Searches:</strong><br>";
  searches.forEach(loc => {
    const btn = document.createElement('button');
    btn.textContent = loc;
    btn.onclick = () => {
      document.getElementById('locationInput').value = loc;
      getWeather(loc);
    };
    recentDiv.appendChild(btn);
  });
}

function getConditionClass(condition) {
  condition = condition.toLowerCase();
  if (condition.includes("sunny") || condition.includes("clear")) return "sunny";
  if (condition.includes("rain")) return "rainy";
  if (condition.includes("snow")) return "snowy";
  return "cloudy";
}

async function getWeather(locationInput) {
  const location = locationInput || document.getElementById('locationInput').value;
  if (!location) {
    alert("Please enter a location");
    return;
  }

  const apiKey = "6025b6cc5b9b413aa29133504251009";
  const url = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}&days=3&aqi=yes&alerts=no`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      document.getElementById('weather').innerHTML = `<p style='color:red;'>${data.error.message}</p>`;
      document.getElementById('forecast').innerHTML = "";
    } else {
      saveSearch(data.location.name);
      const temp = isCelsius ? `${data.current.temp_c}°C` : `${data.current.temp_f}°F`;
      document.getElementById('weather').innerHTML = `
        <p><strong>${data.location.name}, ${data.location.country}</strong></p>
        <p class="temp">${temp}</p>
        <p>${data.current.condition.text}</p>
        <img src="${data.current.condition.icon}" alt="weather icon">
        <p>🌅 Sunrise: ${data.forecast.forecastday[0].astro.sunrise}</p>
        <p>🌇 Sunset: ${data.forecast.forecastday[0].astro.sunset}</p>
      `;

      let forecastHTML = "<h3>3-Day Forecast</h3>";
      data.forecast.forecastday.forEach(day => {
        const fTemp = isCelsius ? `${day.day.avgtemp_c}°C` : `${day.day.avgtemp_f}°F`;
        const conditionClass = getConditionClass(day.day.condition.text);
        forecastHTML += `
          <div class="forecast-day ${conditionClass}">
            <p><strong>${day.date}</strong></p>
            <p>${fTemp}</p>
            <p>${day.day.condition.text}</p>
            <img src="${day.day.condition.icon}" alt="icon">
          </div>
        `;
      });
      document.getElementById('forecast').innerHTML = forecastHTML;
    }
  } catch (error) {
    document.getElementById('weather').innerHTML = `<p style='color:red;'>Unable to fetch weather data.</p>`;
    document.getElementById('forecast').innerHTML = "";
  }
}


displayRecentSearches();
