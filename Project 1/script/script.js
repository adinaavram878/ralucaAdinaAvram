
const weatherAPIKey = "60b5e9ec6028dc5a8c9ad0e59fbedea2";
let countryData = {}, borderLayer;

const map = L.map("map", { center: [20, 0], zoom: 2, layers: [] });

const streets = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
  attribution: "Tiles © Esri",
});
const satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
  attribution: "Tiles © Esri Imagery",
});
streets.addTo(map);
L.control.layers({ Streets: streets, Satellite: satellite }).addTo(map);

borderLayer = L.geoJSON(null, { style: { color: "black", weight: 2, fillOpacity: 0 } }).addTo(map);

const clusters = {
  asia: [{ code: "IN", name: "India" }, { code: "JP", name: "Japan" }],
  europe: [{ code: "DE", name: "Germany" }, { code: "GB", name: "England" }],
  americas: [{ code: "CA", name: "Canada" }, { code: "BR", name: "Brazil" }],
};

function showLoader() { $("#loader").show(); }
function hideLoader() { $("#loader").hide(); }

function populateCountries(cluster) {
  const $countrySelect = $("#countrySelect").empty();
  const all = Object.values(clusters).flat();
  const list = cluster === "all" ? all : clusters[cluster] || [];
  list.forEach(c => $countrySelect.append(`<option value="${c.code}">${c.name}</option>`));
  if ($countrySelect.val()) loadCountry($countrySelect.val());
}

async function loadCountry(code) {
  showLoader();
  try {
    const res = await fetch(`https://restcountries.com/v3.1/alpha/${code}`);
    const data = (await res.json())[0];
    const cur = data.currencies ? Object.values(data.currencies)[0] : {};
    countryData = {
      name: data.name.common,
      capital: data.capital?.[0] || "N/A",
      population: data.population,
      currencyName: cur.name,
      currencyCode: cur.code || Object.keys(data.currencies || {})[0],
      lat: data.latlng[0],
      lon: data.latlng[1],
    };

    const rate = await fetch(`https://api.exchangerate.host/latest?base=${countryData.currencyCode}&symbols=USD`);
    countryData.exchangeRate = (await rate.json()).rates?.USD || null;

    const borderRes = await fetch(`https://nominatim.openstreetmap.org/search?country=${encodeURIComponent(data.name.common)}&polygon_geojson=1&format=geojson`);
    const border = await borderRes.json();
    if (border.features?.[0]) {
      borderLayer.clearLayers();
      borderLayer.addData(border.features[0].geometry);
      map.flyToBounds(borderLayer.getBounds().pad(0.5));
    }
  } catch (e) {
    alert("Failed to load country data");
  } finally {
    hideLoader();
  }
}

async function showWeather() {
  showLoader();
  try {
    const [cur, fc] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${countryData.lat}&lon=${countryData.lon}&units=metric&appid=${weatherAPIKey}`).then(r => r.json()),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${countryData.lat}&lon=${countryData.lon}&units=metric&appid=${weatherAPIKey}`).then(r => r.json())
    ]);

    let html = `
      <p>Current: <strong>${cur.weather[0].description}</strong>, ${cur.main.temp}°C
      <img src="https://openweathermap.org/img/wn/${cur.weather[0].icon}@2x.png" /></p>
      <hr><h6>Next Forecasts:</h6><table class="table">
      <tr><th>Date</th><th>Temp</th><th>Weather</th><th>Icon</th></tr>`;
    fc.list.slice(0, 6).forEach(o => {
      html += `<tr><td>${o.dt_txt}</td><td>${o.main.temp}°C</td><td>${o.weather[0].description}</td>
      <td><img src="https://openweathermap.org/img/wn/${o.weather[0].icon}@2x.png" /></td></tr>`;
    });
    html += "</table>";
    $("#bodyWeather").html(html);
    new bootstrap.Modal(document.getElementById("modalWeather")).show();
  } catch (e) {
    alert("Failed to load weather");
  } finally {
    hideLoader();
  }
}

$("#btnLocalWeather").click(() => {
  if (!navigator.geolocation) return alert("Geolocation not supported");
  showLoader();
  navigator.geolocation.getCurrentPosition(
    pos => {
      $.getJSON("./php/weather.php", {
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
      }, data => {
        let html = `
          <p><strong>Your Current Weather:</strong> ${data.current.weather[0].description}, ${data.current.main.temp}°C
          <img src="https://openweathermap.org/img/wn/${data.current.weather[0].icon}@2x.png" /></p>
          <hr><h6>Forecast:</h6><table class="table"><tr><th>Date</th><th>Temp</th><th>Weather</th><th>Icon</th></tr>`;
        data.forecast.list.slice(0, 6).forEach(f => {
          html += `<tr><td>${f.dt_txt}</td><td>${f.main.temp}°C</td><td>${f.weather[0].description}</td>
          <td><img src="https://openweathermap.org/img/wn/${f.weather[0].icon}@2x.png" /></td></tr>`;
        });
        html += "</table>";
        $("#bodyWeather").html(html);
        new bootstrap.Modal(document.getElementById("modalWeather")).show();
      }).fail(() => alert("Unable to fetch weather.")).always(hideLoader);
    },
    () => {
      hideLoader();
      alert("Unable to retrieve your location.");
    }
  );
});

$(function () {
  populateCountries("all");
  $("#clusterSelect").on("change", function () { populateCountries(this.value); });
  $("#countrySelect").on("change", function () { loadCountry(this.value); });
  $("#btnName").click(() => {
    $("#bodyName").html(`<strong>${countryData.name}</strong><br>Capital: ${countryData.capital}`);
    new bootstrap.Modal(document.getElementById("modalName")).show();
  });
  $("#btnPop").click(() => {
    $("#bodyPop").text(`Population: ${countryData.population.toLocaleString()}`);
    new bootstrap.Modal(document.getElementById("modalPop")).show();
  });
  $("#btnCurrency").click(() => {
    $("#bodyCurrency").html(`Currency: ${countryData.currencyName} (${countryData.currencyCode})<br>1 ${countryData.currencyCode} ≈ ${countryData.exchangeRate?.toFixed(4) || "N/A"} USD`);
    new bootstrap.Modal(document.getElementById("modalCurrency")).show();
  });
  $("#btnWeather").click(showWeather);
  $("#btnWiki").click(() => {
    const u = `https://en.wikipedia.org/wiki/${encodeURIComponent(countryData.name)}`;
    $("#bodyWiki").html(`<a href="${u}" target="_blank">${countryData.name} on Wikipedia</a>`);
    new bootstrap.Modal(document.getElementById("modalWiki")).show();
  });
});
