
let countriesGeoJSON = null;
let selectedCountryLayer = null;
let countryList = [];
let userLat, userLng;


let userLocationMarker = null;

function setUserLocationMarker(lat, lng) {
  if (userLocationMarker) {
    userLocationMarker.setLatLng([lat, lng]);
  } else {
    userLocationMarker = L.marker([lat, lng], {
      icon: L.icon({
        iconUrl: "path/to/user-location-icon.png", 
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      }),
      title: "Your Location",
    }).addTo(map);
  }
}


function fetchWeatherAndDisplay(lat, lng, showPopup) {
  console.log(
    `fetchWeatherAndDisplay called with lat=${lat}, lng=${lng}, showPopup=${showPopup}`
  );
 
}

function fetchWeatherForecast(lat, lng) {
 
  const modalBody = $("#exampleModal .modal-body table");
  modalBody.html(
    `<tr><td colspan="3" class="text-center">Loading forecast...</td></tr>`
  );

  
  const modal = new bootstrap.Modal(document.getElementById("exampleModal"));
  modal.show();

  
  $.post("php/getWeather.php", { lat, lon: lng }, function (data) {
    if (!data || !data.list || data.list.length === 0) {
      modalBody.html(
        `<tr><td colspan="3" class="text-center text-danger">No forecast data available.</td></tr>`
      );
      return;
    }

    
    const rows = data.list
      .filter((_, i) => i % 8 === 0)
      .slice(0, 5)
      .map((entry) => {
        const date = new Date(entry.dt * 1000).toLocaleDateString();
        const temp = `${Math.round(entry.main.temp)}°C`;
        const icon = `<img src="https://openweathermap.org/img/wn/${entry.weather[0].icon}@2x.png" alt="${entry.weather[0].main}" width="50">`;
        return `<tr><td>${date}</td><td>${temp}</td><td>${icon}</td></tr>`;
      });

    
    modalBody.html(`
      <thead>
        <tr><th>Date</th><th>Temperature</th><th>Icon</th></tr>
      </thead>
      <tbody>
        ${rows.join("")}
      </tbody>
    `);
  }).fail(function () {
    modalBody.html(
      `<tr><td colspan="3" class="text-center text-danger">Failed to fetch weather data.</td></tr>`
    );
  });
}


function fetchCountryInfo(code) {
  
  $("#infoModalTitle").text("Country Information");
  $("#infoModalBody").html(
    '<div class="text-center">Loading country information...</div>'
  );


  const infoModal = new bootstrap.Modal(document.getElementById("infoModal"));
  infoModal.show();


  $.post("php/getCountryInfo.php", { code }, function (data) {
    if (!data || Object.keys(data).length === 0) {
      $("#infoModalBody").html(
        '<div class="text-danger text-center">No country information found.</div>'
      );
      return;
    }


    const html = `
      <h5>${data.name || "Unknown Country"}</h5>
      <p><strong>Capital:</strong> ${data.capital || "N/A"}</p>
      <p><strong>Region:</strong> ${data.region || "N/A"}</p>
      <p><strong>Subregion:</strong> ${data.subregion || "N/A"}</p>
      <p><strong>Population:</strong> ${
        data.population?.toLocaleString() || "N/A"
      }</p>
      <p><strong>Area:</strong> ${
        data.area ? `${data.area.toLocaleString()} km²` : "N/A"
      }</p>
      <p><strong>Languages:</strong> ${
        Array.isArray(data.languages) ? data.languages.join(", ") : "N/A"
      }</p>
    `;

    $("#infoModalBody").html(html);
  }).fail(function () {
    $("#infoModalBody").html(
      '<div class="text-danger text-center">Failed to load country information.</div>'
    );
  });
}


function fetchCurrencyInfo(code) {
  $("#infoModalTitle").text("Currency Converter");
  $("#infoModalBody").html(
    '<div class="text-center">Loading currency info...</div>'
  );

  const infoModal = new bootstrap.Modal(document.getElementById("infoModal"));
  infoModal.show();

  $.post("php/getCurrency.php", { code }, function (data) {
    if (!data || !data.currency || !data.rate) {
      $("#infoModalBody").html(
        '<div class="text-danger text-center">Currency information not found.</div>'
      );
      return;
    }

    const html = `
      <div class="mb-2">
        <p><strong>Currency:</strong> ${data.currency}</p>
        <p><strong>Exchange Rate:</strong> 1 USD = ${data.rate} ${data.currency}</p>
      </div>
      <div class="form-group">
        <label for="usdInput">Amount in USD:</label>
        <input type="number" id="usdInput" class="form-control form-control-sm" placeholder="Enter USD amount" />
      </div>
      <div class="mt-2">
        <strong>Converted Amount:</strong> <span id="convertedAmount">—</span>
      </div>
    `;

    $("#infoModalBody").html(html);

    
    $("#usdInput").on("input", function () {
      const usd = parseFloat($(this).val());
      if (!isNaN(usd)) {
        const converted = usd * data.rate;
        $("#convertedAmount").text(`${converted.toFixed(2)} ${data.currency}`);
      } else {
        $("#convertedAmount").text("—");
      }
    });
  }).fail(function () {
    $("#infoModalBody").html(
      '<div class="text-danger text-center">Failed to load currency info.</div>'
    );
  });
}


function fetchWikipediaInfo(code) {
  $("#infoModalTitle").text("Wikipedia Summary");
  $("#infoModalBody").html('<div class="text-center">Loading summary...</div>');

  const infoModal = new bootstrap.Modal(document.getElementById("infoModal"));
  infoModal.show();

  $.post("php/getWikipedia.php", { code }, function (data) {
    if (data.error) {
      $("#infoModalBody").html(
        `<div class="text-danger text-center">${data.error}</div>`
      );
      return;
    }

    const html = `
      <p>${data.summary}</p>
      <a href="${data.url}" target="_blank" class="btn btn-sm btn-primary">
        <i class="fa-brands fa-wikipedia-w"></i> Read Full Article
      </a>
    `;

    $("#infoModalBody").html(html);
  }).fail(function () {
    $("#infoModalBody").html(
      '<div class="text-danger text-center">Failed to fetch Wikipedia summary.</div>'
    );
  });
}


function fetchNewsHeadlines(code) {
  $("#newsModalBody").html('<div class="text-center">Loading news...</div>');
  const newsModal = new bootstrap.Modal(document.getElementById("newsModal"));
  newsModal.show();

  $.post("php/getNews.php", { code }, function (data) {
    if (data.error || !data.articles || data.articles.length === 0) {
      $("#newsModalBody").html(
        '<div class="text-center text-danger">No news available for this country.</div>'
      );
      return;
    }

    const headlines = data.articles
      .slice(0, 5)
      .map((article) => {
        const image = article.urlToImage
          ? `<img src="${article.urlToImage}" alt="News image" class="img-fluid mb-2" style="max-height:150px;">`
          : "";
        return `
        <div class="mb-4">
          ${image}
          <h6><a href="${
            article.url
          }" target="_blank" class="text-decoration-none">${
          article.title
        }</a></h6>
          <p class="small text-muted">${
            article.source.name || "Source Unknown"
          }</p>
        </div>
        <hr/>
      `;
      })
      .join("");

    $("#newsModalBody").html(headlines);
  }).fail(() => {
    $("#newsModalBody").html(
      '<div class="text-danger text-center">Failed to load news data.</div>'
    );
  });
}


function addMarkersToClusters() {
  console.log("addMarkersToClusters called");
  
}

function showInfoModal(title, content) {
  alert(`${title}\n\n${content}`);
  
}


const weatherStationsCluster = L.layerGroup();
const pointsOfInterestCluster = L.layerGroup();


function populateCountryDropdown() {
  $.getJSON("data/countries.geojson", function (data) {
    countriesGeoJSON = data;

    const $select = $("#countrySelect");
    $select.empty();
    $select.append('<option value="">Select a country</option>');

    const countries = data.features
      .map((feature) => {
        const name = feature.properties.ADMIN || feature.properties.name;
        const code = feature.properties.ISO_A2 || feature.properties.iso_a2;
        return name && code && code !== "-99"
          ? { name, code: code.toLowerCase() }
          : null;
      })
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name));

    countries.forEach((country) => {
      $select.append(
        `<option value="${country.code}">${country.name}</option>`
      );
      countryList.push(country);
    });
  }).fail(function () {
    alert("Failed to load countries.geojson.");
  });
}


function highlightCountryBorder(code) {
  if (!countriesGeoJSON) return;

  const feature = countriesGeoJSON.features.find((f) => {
    const isoCode = f.properties.ISO_A2 || f.properties.iso_a2;
    return isoCode && isoCode.toLowerCase() === code.toLowerCase();
  });

  if (!feature) {
    alert("Selected country not found in GeoJSON.");
    return;
  }

  if (selectedCountryLayer) {
    map.removeLayer(selectedCountryLayer);
  }

  selectedCountryLayer = L.geoJSON(feature, {
    style: {
      color: "#ff7800",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.1,
    },
  }).addTo(map);

  map.fitBounds(selectedCountryLayer.getBounds());

  selectedCountryLayer
    .bindTooltip(feature.properties.ADMIN || "Country", {
      permanent: true,
      direction: "center",
      className: "country-label",
    })
    .openTooltip();
}


const countryCoordinates = {
  uk: { lat: 55.3781, lon: -3.436 },
  us: { lat: 37.0902, lon: -95.7129 },
  jp: { lat: 36.2048, lon: 138.2529 },
  au: { lat: -25.2744, lon: 133.7751 },
  in: { lat: 20.5937, lon: 78.9629 },
};


$(document).ready(function () {
  populateCountryDropdown();

 
  const streets = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
    }
  );

  const topographic = L.tileLayer(
    "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 17,
      attribution:
        'Map data: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> contributors',
    }
  );

  const basemaps = {
    "Street Map": streets,
    Topographic: topographic,
  };

 
  map = L.map("map", {
    center: [54.5, -4],
    zoom: 6,
    layers: [streets, weatherStationsCluster, pointsOfInterestCluster],
  });

  
  L.control
    .layers(basemaps, {
      "Weather Stations": weatherStationsCluster,
      "Points of Interest": pointsOfInterestCluster,
    })
    .addTo(map);


  L.easyButton("fa-info fa-xl", function () {
    if (userLat && userLng) {
      fetchWeatherAndDisplay(userLat, userLng, true);
    } else {
      alert("User location not found.");
    }
  }).addTo(map);

  L.easyButton("fa-users", () => {
    const selected = $("#countrySelect").val();
    const populations = {
      uk: "67 million",
      us: "331 million",
      jp: "125 million",
      au: "25 million",
      in: "1.4 billion",
    };
    if (selected && populations[selected]) {
      showInfoModal(
        "Population Info",
        `<p><strong>${selected.toUpperCase()}</strong> has a population of <b>${
          populations[selected]
        }</b>.</p>`
      );
    } else {
      alert("Select a country first.");
    }
  }).addTo(map);

  L.easyButton("fa-money-bill-wave", () => {
    const selected = $("#countrySelect").val();
    const currencies = {
      uk: "British Pound (GBP)",
      us: "US Dollar (USD)",
      jp: "Japanese Yen (JPY)",
      au: "Australian Dollar (AUD)",
      in: "Indian Rupee (INR)",
    };
    if (selected && currencies[selected]) {
      showInfoModal(
        "Currency Info",
        `<p><strong>${selected.toUpperCase()}</strong> uses the <b>${
          currencies[selected]
        }</b>.</p>`
      );
    } else {
      alert("Select a country first.");
    }
  }).addTo(map);

  L.easyButton("fa-book-open", () => {
    const selected = $("#countrySelect").val();
    if (selected) {
      const country = countryList.find(
        (c) => c.code.toLowerCase() === selected.toLowerCase()
      );

      if (country) {
        showInfoModal(
          "Wikipedia Info",
          `<p>Read more about <strong>${country.name}</strong> on Wikipedia:</p>
           <a href="https://en.wikipedia.org/wiki/${encodeURIComponent(
             country.name
           )}" target="_blank" class="btn btn-sm btn-primary">
             <i class="fa-brands fa-wikipedia-w"></i> Open Wikipedia
           </a>`
        );
      } else {
        alert("Country data not found.");
      }
    } else {
      alert("Select a country first.");
    }
  }).addTo(map);

  L.easyButton("fa-newspaper", () => {
    const selected = $("#countrySelect").val();
     if (selected) {
        fetchNewsHeadlines(selected);
      } else {
            alert("Please select a country first.");
    }
  }).addTo(map);


  L.easyButton('<i class="fa-solid fa-location-crosshairs"></i>', () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          userLat = pos.coords.latitude;
          userLng = pos.coords.longitude;
          map.setView([userLat, userLng], 12);
          setUserLocationMarker(userLat, userLng);
        },
        () => {
          alert("Unable to retrieve your location.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  }).addTo(map);

  L.easyButton("fa-cloud-sun-rain", () => {
    if (userLat && userLng) {
      fetchWeatherForecast(userLat, userLng);
    } else {
      alert("User location not found.");
    }
  }).addTo(map);

  
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        userLat = pos.coords.latitude;
        userLng = pos.coords.longitude;
        map.setView([userLat, userLng], 10);
        setUserLocationMarker(userLat, userLng);
        fetchWeatherAndDisplay(userLat, userLng, true);
        addMarkersToClusters();
        $("#loader").hide();
      },
      () => {
        userLat = 54.5;
        userLng = -4;
        addMarkersToClusters();
        $("#loader").hide();
      }
    );
  } else {
    userLat = 54.5;
    userLng = -4;
    addMarkersToClusters();
    $("#loader").hide();
  }

  
  $("#countrySelect").change(async function () {
    const code = $(this).val();
    if (!code) return;

    highlightCountryBorder(code);

    const coords = countryCoordinates[code];

    if (!coords) {
      alert("No coordinates found for this country.");
      return;
    }

    fetchWeatherForecast(coords.lat, coords.lon);
    fetchCountryInfo(code);
    fetchCurrencyInfo(code);
    fetchWikipediaInfo(code);
    fetchNewsHeadlines(code);
  });
});
