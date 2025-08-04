
const weatherAPIKey = '60b5e9ec6028dc5a8c9ad0e59fbedea2';
let countryData = {}, borderLayer;

const map = L.map('map').setView([20, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);
borderLayer = L.geoJSON(null, { style: { color: 'black', weight: 2, fillOpacity: 0 } }).addTo(map);

const clusters = {
  asia: [{ code: 'IN', name: 'India' }, { code: 'JP', name: 'Japan' }],
  europe: [{ code: 'DE', name: 'Germany' }, { code: 'GB', name: 'England' }],
  americas: [{ code: 'CA', name: 'Canada' }, { code: 'BR', name: 'Brazil' }]
};

function showLoader() { $('#loader').show(); }
function hideLoader() { $('#loader').hide(); }

function populateCountries(cluster) {
  const $countrySelect = $('#countrySelect').empty();
  if (cluster === 'all') Object.values(clusters).flat().forEach(c => $countrySelect.append(`<option value="${c.code}">${c.name}</option>`));
  else clusters[cluster]?.forEach(c => $countrySelect.append(`<option value="${c.code}">${c.name}</option>`));
  if ($countrySelect.val()) loadCountry($countrySelect.val());
}

async function loadCountry(code) {
  showLoader();
  try {
    const response = await fetch(`https://restcountries.com/v3.1/alpha/${code}`);
    const rest = (await response.json())[0];
    const cur = rest.currencies ? Object.values(rest.currencies)[0] : {};
    countryData = {
      name: rest.name.common,
      capital: rest.capital?.[0] || 'N/A',
      population: rest.population,
      currencyName: cur.name,
      currencyCode: cur.code || Object.keys(rest.currencies || {})[0],
      lat: rest.latlng[0], lon: rest.latlng[1]
    };
    const rateResp = await fetch(`https://api.exchangerate.host/latest?base=${countryData.currencyCode}&symbols=USD`);
    countryData.exchangeRate = (await rateResp.json()).rates?.USD || null;
    const nomResp = await fetch(`https://nominatim.openstreetmap.org/search?country=${encodeURIComponent(rest.name.common)}&polygon_geojson=1&format=geojson`);
    const nom = await nomResp.json();
    if (nom.features?.[0]) {
      borderLayer.clearLayers();
      borderLayer.addData(nom.features[0].geometry);
      map.flyToBounds(borderLayer.getBounds().pad(0.5));
    }
  } catch (e) {
    alert('Failed to load country data');
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

    let curIcon = cur.weather[0].icon;
    let html = `
      <p>
        Current: <strong>${cur.weather[0].description}</strong>, ${cur.main.temp}°C
        <img src="https://openweathermap.org/img/wn/${curIcon}@2x.png" alt="${cur.weather[0].description}" />
      </p>
      <hr>
      <h6>Next Forecasts:</h6>
      <table class="table">
        <tr><th>Date</th><th>Temp</th><th>Weather</th><th>Icon</th></tr>
    `;

    fc.list.slice(0, 6).forEach(o => {
      let icon = o.weather[0].icon;
      html += `
        <tr>
          <td>${o.dt_txt}</td>
          <td>${o.main.temp}°C</td>
          <td>${o.weather[0].description}</td>
          <td><img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${o.weather[0].description}" /></td>
        </tr>`;
    });

    html += '</table>';
    $('#bodyWeather').html(html);
    new bootstrap.Modal(document.getElementById('modalWeather')).show();
  } catch (e) {
    alert('Failed to load weather data');
  } finally {
    hideLoader();
  }
}

$('#btnLocalWeather').click(function () {
  if (!navigator.geolocation) return alert('Geolocation is not supported by your browser');
  showLoader();
  navigator.geolocation.getCurrentPosition(function (pos) {
    $.getJSON('./php/weather.php', { lat: pos.coords.latitude, lon: pos.coords.longitude }, function (data) {
      const cur = data.current, fc = data.forecast;
      let html = `
        <p>
          <strong>Your Current Weather:</strong> ${cur.weather[0].description}, ${cur.main.temp}°C
          <img src="https://openweathermap.org/img/wn/${cur.weather[0].icon}@2x.png" alt="${cur.weather[0].description}" />
        </p>
        <hr><h6>Forecast:</h6>
        <table class="table"><tr><th>Date</th><th>Temp</th><th>Weather</th><th>Icon</th></tr>`;
      fc.list.slice(0, 6).forEach(f => {
        html += `<tr>
          <td>${f.dt_txt}</td>
          <td>${f.main.temp}°C</td>
          <td>${f.weather[0].description}</td>
          <td><img src="https://openweathermap.org/img/wn/${f.weather[0].icon}@2x.png" alt="${f.weather[0].description}" /></td>
        </tr>`;
      });
      html += '</table>';
      $('#bodyWeather').html(html);
      new bootstrap.Modal(document.getElementById('modalWeather')).show();
    }).fail(() => alert('Unable to fetch weather.')).always(hideLoader);
  }, function () {
    hideLoader();
    alert('Unable to retrieve your location.');
  });
});

$(function () {
  populateCountries('all');
  $('#clusterSelect').on('change', function () { populateCountries(this.value); });
  $('#countrySelect').on('change', function () { loadCountry(this.value); });

  $('#btnName').click(() => {
    $('#bodyName').html(`<strong>${countryData.name}</strong><br>Capital: ${countryData.capital}`);
    new bootstrap.Modal(document.getElementById('modalName')).show();
  });
  $('#btnPop').click(() => {
    $('#bodyPop').text(`Population: ${countryData.population.toLocaleString()}`);
    new bootstrap.Modal(document.getElementById('modalPop')).show();
  });
  $('#btnCurrency').click(() => {
    $('#bodyCurrency').html(`Currency: ${countryData.currencyName} (${countryData.currencyCode})<br>1 ${countryData.currencyCode} ≈ ${countryData.exchangeRate?.toFixed(4) || 'N/A'} USD`);
    new bootstrap.Modal(document.getElementById('modalCurrency')).show();
  });
  $('#btnWeather').click(showWeather);
  $('#btnWiki').click(() => {
    const u = `https://en.wikipedia.org/wiki/${encodeURIComponent(countryData.name)}`;
    $('#bodyWiki').html(`<a href="${u}" target="_blank">${countryData.name} on Wikipedia</a>`);
    new bootstrap.Modal(document.getElementById('modalWiki')).show();
  });
});
