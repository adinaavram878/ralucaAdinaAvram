
const countries = [
  { name: "United States", code: "US", lat: 37.0902, lon: -95.7129 },
  { name: "Canada", code: "CA", lat: 56.1304, lon: -106.3468 },
  { name: "United Kingdom", code: "GB", lat: 55.3781, lon: -3.436 },
  { name: "Australia", code: "AU", lat: -25.2744, lon: 133.7751 },
  { name: "Japan", code: "JP", lat: 36.2048, lon: 138.2529 },
];


const map = L.map("map").setView([20, 0], 2);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 18,
}).addTo(map);


const markers = L.markerClusterGroup();
map.addLayer(markers);


async function getUserLocation() {
  try {
    const pos = await new Promise((res, rej) =>
      navigator.geolocation.getCurrentPosition(res, rej)
    );
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    map.setView([lat, lon], 6);

    
    markers.clearLayers();
    L.marker([lat, lon]).addTo(markers).bindPopup("You are here").openPopup();

    await getCountryInfo(lat, lon);
  } catch (error) {
    console.warn("Geolocation error or denied:", error);
    
    await getCountryInfo(37.0902, -95.7129);
  }
}


async function getCountryInfo(lat, lon) {
  
  const apiKey = "b4b47890259a41f5a7c00e98f2b2f15b";
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (!data.results.length) throw new Error("No results");

   
    const components = data.results[0].components;
    const countryName = components.country;
    const countryCode = components.country_code.toUpperCase();

   
    document.getElementById("countryName").textContent = countryName;

   
    const select = document.getElementById("countrySelect");
    select.value = countryCode;

    
    await loadCountryBorder(countryCode);

   
    await getWeather(countryName, lat, lon);
    await getNews(countryName);
    await getWikipedia(countryName);
  } catch (error) {
    console.error("Error getting country info:", error);
  }
}


async function getCountryInfoByCode(countryCode) {
 
  const country = countries.find((c) => c.code === countryCode);
  if (!country) return;

  map.setView([country.lat, country.lon], 5);

  markers.clearLayers();
  L.marker([country.lat, country.lon])
    .addTo(markers)
    .bindPopup(country.name)
    .openPopup();

  document.getElementById("countryName").textContent = country.name;

  await loadCountryBorder(country.code);
  await getWeather(country.name, country.lat, country.lon);
  await getNews(country.name);
  await getWikipedia(country.name);
}


async function loadCountryBorder(countryCode) {
  
  if (window.countryBorderLayer) {
    map.removeLayer(window.countryBorderLayer);
  }

  
  const url = `https://raw.githubusercontent.com/johan/world.geo.json/master/countries/${countryCode}.geo.json`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Border data not found");
    const geojson = await response.json();

    window.countryBorderLayer = L.geoJSON(geojson, {
      style: {
        color: "blue",
        weight: 3,
        fillOpacity: 0.1,
      },
    }).addTo(map);

    map.fitBounds(window.countryBorderLayer.getBounds());
  } catch (error) {
    console.warn("Could not load country border:", error);
  }
}


async function getWeather(countryName, lat, lon) {
  try {
    const apiKey = "60b5e9ec6028dc5a8c9ad0e59fbedea2";
    const url =
      lat && lon
        ? `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
        : `https://api.openweathermap.org/data/2.5/weather?q=${countryName}&units=metric&appid=${apiKey}`;

    const res = await fetch(url);
    const weather = await res.json();

    if (weather.cod !== 200) throw new Error(weather.message);

    showWeatherModal(weather);
  } catch (error) {
    console.error("Weather fetch error:", error);
  }
}


function showWeatherModal(weather) {
  const modal = document.getElementById("weatherModal");
  modal.querySelector(
    ".modal-title"
  ).textContent = `Weather in ${weather.name}`;
  modal.querySelector("#weatherDesc").textContent =
    weather.weather[0].description;
  modal.querySelector("#temp").textContent = `${weather.main.temp} °C`;
  modal.querySelector("#humidity").textContent = `${weather.main.humidity}%`;
  modal.querySelector("#windSpeed").textContent = `${weather.wind.speed} m/s`;


  const bootstrapModal = new bootstrap.Modal(modal);
  bootstrapModal.show();
}


async function getNews(countryName) {
  try {
    const apiKey = "f96a33f40fd740dd91b2e88f8c9864be";
    const url = `https://newsapi.org/v2/top-headlines?q=${encodeURIComponent(
      countryName
    )}&apiKey=${apiKey}&pageSize=5`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "ok") throw new Error("News API error");

    const newsList = document.getElementById("newsList");
    newsList.innerHTML = ""; 

    data.articles.forEach((article) => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="${article.url}" target="_blank">${article.title}</a>`;
      newsList.appendChild(li);
    });
  } catch (error) {
    console.error("News fetch error:", error);
  }
}


async function getWikipedia(countryName) {
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
      countryName
    )}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Wikipedia API error");
    const data = await res.json();

    const modal = document.getElementById("wikiModal");
    modal.querySelector(".modal-title").textContent = data.title;
    modal.querySelector("#wikiExtract").textContent = data.extract;
    modal.querySelector("#wikiLink").href = data.content_urls.desktop.page;

    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
  } catch (error) {
    console.error("Wikipedia fetch error:", error);
  }
}


async function currencyConverter(amount, fromCurrency, toCurrency) {
  try {
    const apiKey = "YOUR_EXCHANGE_RATE_API_KEY";
    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${fromCurrency}/${toCurrency}/${amount}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.result !== "success") throw new Error("Currency API error");

    return data.conversion_result;
  } catch (error) {
    console.error("Currency conversion error:", error);
    return null;
  }
}


document
  .getElementById("countrySelect")
  .addEventListener("change", async (e) => {
    const code = e.target.value;
    await getCountryInfoByCode(code);
  });


function populateCountryDropdown() {
  const select = document.getElementById("countrySelect");
  countries.forEach((c) => {
    const option = document.createElement("option");
    option.value = c.code;
    option.textContent = c.name;
    select.appendChild(option);
  });
}


window.onload = async () => {
  populateCountryDropdown();
  await getUserLocation();
};
