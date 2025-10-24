let map;
let userLat, userLng;
let userLocationMarker = null;
let countryList = [];
let countriesGeoJSON = null;
let selectedCountryLayer = null;
let autoShowWeatherModal = false;



/*
const countryList = [
  { name: "United Kingdom", code: "gb", currency: "GBP" },
  { name: "United States", code: "us", currency: "USD" },
  { name: "Canada", code: "ca", currency: "CAD" },
  { name: "Germany", code: "de", currency: "EUR" },
  { name: "Japan", code: "jp", currency: "JPY" },
];
*/


function get_user_location() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        userLat = pos.coords.latitude;
        userLng = pos.coords.longitude;

        map.setView([userLat, userLng], 10);
        setUserLocationMarker(userLat, userLng);

          get_country_info(userLat, userLng);
     fetchWeatherAndDisplay(userLat, userLng, autoShowWeatherModal);

         

        

        addMarkersToClusters();
        $("#loader").hide();
      },
      () => {
        userLat = 54.5;
        userLng = -4;
        map.setView([userLat, userLng], 6);
        addMarkersToClusters();
        $("#loader").hide();
      }
    );
  } else {
    userLat = 54.5;
    userLng = -4;
    map.setView([userLat, userLng], 6);
    addMarkersToClusters();
    $("#loader").hide();
  }
}

function showToast(message, type = "info") {
  const toastId = `toast-${Date.now()}`;
  const iconMap = {
    info: "fa-info-circle",
    success: "fa-check-circle",
    warning: "fa-exclamation-triangle",
    danger: "fa-times-circle",
  };
  const icon = iconMap[type] || iconMap.info;

  const toastHTML = `
    <div id="${toastId}" class="toast align-items-center text-bg-${type} border-0 mb-2 show" role="alert">
      <div class="d-flex">
        <div class="toast-body">
          <i class="fa ${icon} me-2"></i>${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `;

  $("#toast-container").append(toastHTML);

  setTimeout(() => {
    $(`#${toastId}`).remove();
  }, 5000);
}

const streets = L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  { attribution: "© OpenStreetMap contributors" }
);

const satellite = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  { attribution: "Tiles © Esri" }
);

const basemaps = { Streets: streets, Satellite: satellite };

const weatherStationsCluster = L.markerClusterGroup();
const pointsOfInterestCluster = L.markerClusterGroup();

function setUserLocationMarker(lat, lng) {
  if (userLocationMarker) {
    userLocationMarker.setLatLng([lat, lng]);
  } else {
    userLocationMarker = L.marker([lat, lng])
      .addTo(map)
      .bindPopup("You are here");
  }
  userLocationMarker.openPopup();
}

function fetchWeatherAndDisplay(lat, lon, showInModal = false) {
  $.ajax({
    url: "./php/getWeather.php",
    method: "POST",
    data: { lat, lon },
    dataType: "json",
    success: function (weather) {
      if (!weather || !weather.main) {
        showToast("Weather data not available.", "warning");
        return;
      }

      const popupContent = `
        <b>Weather Info</b><br>
        🌡 Temp: ${weather.main.temp} °C<br>
        💨 Wind: ${weather.wind.speed} m/s<br>
        ☁ ${weather.weather[0].description}
      `;
      L.popup().setLatLng([lat, lon]).setContent(popupContent).openOn(map);

      if (showInModal) {
        const tableRows = `
          <tr>
            <td class="text-center"><i class="fa-solid fa-temperature-half fa-xl text-success"></i></td>
            <td>Temperature</td>
            <td class="text-end">${weather.main.temp} °C</td>
          </tr>
          <tr>
            <td class="text-center"><i class="fa-solid fa-wind fa-xl text-success"></i></td>
            <td>Wind Speed</td>
            <td class="text-end">${weather.wind.speed} m/s</td>
          </tr>
          <tr>
            <td class="text-center"><i class="fa-solid fa-cloud fa-xl text-success"></i></td>
            <td>Condition</td>
            <td class="text-end text-capitalize">${weather.weather[0].description}</td>
          </tr>
        `;
        $(".modal-body").html(`<table class="table">${tableRows}</table>`);
        $("#exampleModal").modal("show");
      }
    },
    error: function () {
      showToast("Failed to fetch weather data.", "danger");
    },
  });
}


/*function get_country_info(lat, lon) {
  const apiKey = "Yb4b47890259a41f5a7c00e98f2b2f15b"; 

  const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${apiKey}`;

  $.getJSON(url, function (data) {
    if (
      data &&
      data.results &&
      data.results.length > 0 &&
      data.results[0].components
    ) {
      const components = data.results[0].components;
      const country = components.country;
      const countryCode = components["ISO_3166-1_alpha-2"];

      console.log("Country:", country);
      console.log("Country Code:", countryCode);

      getWeather(lat, lon);
      getNews(countryCode);
      getWikipedia(country);
    }
   
  }).fail(() => {
   
  });
}

*/

  $("#countrySelect").on("change", function () {
    const selectedCountryCode = $(this).val();

   
    if (selectedCountryCode) {
      get_country_info_by_code(selectedCountryCode);
    }
  });


function get_country_info(countryCode) {
  $.ajax({
    type: "POST",
    url: "./php/getCountryInfo.php",
    data: { countryCode: countryCode },
    dataType: "json",
    success: function (response) {
      console.log("Response:", response);

      if (response.status === "ok" && response.data) {
        const { country, countryCode, latitude, longitude } = response.data;

        $("#modalCountry").text(country);
        $("#modalCountryCode").text(countryCode);
        $("#modalLat").text(latitude);
        $("#modalLon").text(longitude);
        $("#countryModal").show();
      }
    },
    error: function (xhr, status, error) {
      console.error("AJAX error:", error);
    },
  });
}




 /*function get_country_info(lat, lon) {

  $.ajax({
    type: "POST",
    url: "./php/getCountryInfo.php",
    data: {
      latitude: lat,
      longitude: lon,
    },
    dataType: "json",
    success: function (response) {
      console.log("Response:", response); 

      
      $("#statusMessage").text("");

      if (response.status === "ok" && response.data) {
        const { country, countryCode, latitude, longitude } = response.data;

        
        $("#modalCountry").text(country);
        $("#modalCountryCode").text(countryCode);
        $("#modalLat").text(latitude);
        $("#modalLon").text(longitude);
        $("#countryModal").show();
      } else {
        $("#statusMessage").text(
          "⚠️ " + (response.message || "Unable to retrieve country info.")
        );
      }
    },
    error: function (xhr, status, error) {
      console.error("AJAX error:", error);
      $("#statusMessage").text("❌ Request failed: " + error);
    },
  });

 }

 */




function getWikipedia(countryName) {
  const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
    countryName
  )}`;

  $.getJSON(wikiUrl, function (data) {
    if (data && data.extract) {
      console.log("Wikipedia Summary:", data.extract);
    } else {
  
    }
  }).fail(() => {
    
  });
}


function getNews(countryCode) {
  const apiKey = "f96a33f40fd740dd91b2e88f8c9864be";
  const url = `https://newsapi.org/v2/top-headlines?country=${countryCode.toLowerCase()}&apiKey=${apiKey}`;

  $.getJSON(url, function (data) {
    if (data && data.articles) {
      console.log("News Articles:", data.articles);
    } else {
    }
  }).fail(() => {
  });
}





function addMarkersToClusters() {
  if (!userLat || !userLng) return;

  weatherStationsCluster.clearLayers();
  pointsOfInterestCluster.clearLayers();

  const weatherStations = [
    { lat: userLat + 0.1, lon: userLng + 0.1, label: "Station A" },
    { lat: userLat - 0.1, lon: userLng - 0.1, label: "Station B" },
    { lat: userLat + 0.2, lon: userLng - 0.2, label: "Station C" },
  ];

  const pointsOfInterest = [
    { lat: userLat + 0.15, lon: userLng + 0.05, label: "Museum" },
    { lat: userLat - 0.05, lon: userLng + 0.1, label: "Park" },
  ];

  weatherStations.forEach((station) => {
    const marker = L.marker([station.lat, station.lon]).bindPopup(
      `<b>${station.label}</b><br>Weather Station`
    );
    weatherStationsCluster.addLayer(marker);
  });

  pointsOfInterest.forEach((poi) => {
    const marker = L.marker([poi.lat, poi.lon]).bindPopup(
      `<b>${poi.label}</b><br>Point of Interest`
    );
    pointsOfInterestCluster.addLayer(marker);
  });

  if (map && !map.hasLayer(weatherStationsCluster)) {
    map.addLayer(weatherStationsCluster);
  }
  if (map && !map.hasLayer(pointsOfInterestCluster)) {
    map.addLayer(pointsOfInterestCluster);
  }
}

function showInfoModal(title, content) {
  $("#infoModalTitle").text(title);
  $("#infoModalBody").html(content);
  $("#infoModal").modal("show");
}

/*function populateCountryDropdown() {
  $.getJSON("data/countries.geojson", function (data) {
    countriesGeoJSON = data;
    const $select = $("#countrySelect");

    $select.empty();
    $select.append(
      '<option value="" disabled selected>-- Select a country --</option>'
    );

    const countries = data.features
      .map((feature) => {
        const name = feature.properties.ADMIN || feature.properties.name;
        const code = feature.properties.ISO_A3 || feature.properties.iso_a3;
        const currency = feature.properties.currency;
        return name && code && code !== "-99"
          ? { name, code: code.toLowerCase(), currency }
          : null;
      })
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name));

    countries.forEach((country) => {
      $select.append(
        $("<option>", { value: country.code, text: country.name })
      );
      countryList.push(country);
    });
  }).fail(() => showToast("Failed to load countries.geojson.", "danger"));
}

*/


function populateCountryDropdown() {
  $.getJSON("data/countries.geojson", function (data) {
    const $select = $("#countrySelect");
    $select.empty();
    $select.append(
      '<option value="" disabled selected>-- Select a country --</option>'
    );

    data.features.forEach((feature) => {
      const name = feature.properties.ADMIN;
      const code = feature.properties.ISO_A3;
      const currency = feature.properties.currency;

      if (name && code) {
        $select.append(
          `<option value="${code.toLowerCase()}">${name}</option>`
        );
      }
    });
  }).fail(() => {
   
  });
}






function highlightCountryBorder(code) {
  if (!countriesGeoJSON) return;

  const feature = countriesGeoJSON.features.find((f) => {
    const isoCode = f.properties.ISO_A3 || f.properties.iso_a3;
    return isoCode && isoCode.toLowerCase() === code.toLowerCase();
  });

  if (!feature || !feature.geometry) {
    showToast("No coordinates found for this country.", "warning");
    return;
  }

  if (selectedCountryLayer) {
    map.removeLayer(selectedCountryLayer);
  }

  selectedCountryLayer = L.geoJSON(feature, {
    style: { color: "#ff7800", weight: 2, opacity: 1, fillOpacity: 0.1 },
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

$(document).ready(function () {
  populateCountryDropdown();

  map = L.map("map", { layers: [streets] }).setView([54.5, -4], 6);

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
      showToast("User location not found.", "warning");
    }
  }).addTo(map);

  L.easyButton("fa-users", () => {
    $("#populationModal").modal("show");
  }).addTo(map);

  L.easyButton("fa-money-bill-wave", () => {
    showInfoModal(
      "Currency Converter",
      `
    <div class="form-group">
      <label for="usdInput"><strong>Amount in USD:</strong></label>
      <input type="number" id="usdInput" class="form-control form-control-sm" placeholder="Enter USD amount" min="0" step="any" />
    </div>
    <div class="form-group mt-2">
      <label for="countryCurrencySelect"><strong>Select Country:</strong></label>
      <select id="countryCurrencySelect" class="form-control form-control-sm">
        <option value="" selected disabled>Select a country</option>
        ${countryList
          .map((c) => `<option value="${c.code}">${c.name}</option>`)
          .join("")}
      </select>
    </div>
    <div class="form-group mt-2">
      <label for="currencySelect"><strong>Currency:</strong></label>
      <select id="currencySelect" class="form-control form-control-sm" disabled>
        <option value="">Currency will appear here</option>
      </select>
    </div>
    <div class="form-group mt-2">
      <button id="Convert" class="btn btn-primary btn-sm" disabled>Convert</button>
    </div>
    <div class="mt-3">
      <strong>Converted Amount:</strong> <span id="convertedAmount">—</span>
    </div>
    `
    );
  }).addTo(map);

$("#countrySelect").on("change", function () {
  const selectedCode = $(this).val(); 
  const selectedCountry = countryList.find(
    (c) => c.code.toLowerCase() === selectedCode.toLowerCase()
  );

  if (!selectedCountry) {
    return;
  }

  const countryName = selectedCountry.name;
  const countryCode = selectedCountry.code;

  get_country_info(countryCode);
  getWeather(countryName);
  getNews(countryCode);
  getWikipedia(countryName);
});




  $(document).on("click", "#Convert", function () {
    const usdAmount = parseFloat($("#usdInput").val());
    const selectedCurrency = $("#currencySelect").val();
    const resultEl = $("#convertedAmount");

    if (!selectedCurrency) {
      resultEl.text("Please select a country with a supported currency.");
      return;
    }
    if (isNaN(usdAmount) || usdAmount <= 0) {
      resultEl.text("Please enter a valid amount greater than zero.");
      return;
    }

    resultEl.text("Converting...");

    $.post(
      "./php/getCurrency.php",
      { code: selectedCurrency.toUpperCase() },
      function (data) {
        if (data && data.currency && data.rate && data.rate > 0) {
          const converted = usdAmount / data.rate;
          resultEl.html(
            `${usdAmount.toFixed(2)} USD = ${converted.toFixed(2)} ${
              data.currency
            }`
          );
        } else {
          resultEl.text("Currency data not available.");
        }
      },
      "json"
    ).fail(() => {
      resultEl.text("Failed to fetch exchange rate.");
    });
  });

  L.easyButton("fa-book-open", () => {
    const selected = $("#countrySelect").val();
    if (selected) {
      $("#wikiModal").modal("show");
    } else {
      showToast("Select a country first.", "info");
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
        () => showToast("Unable to retrieve your location.", "warning")
      );
    } else {
      showToast("Geolocation is not supported by your browser.", "danger");
    }
  }).addTo(map);

  get_user_location();

  $("#countrySelect").change(function () {
    const selected = $(this).val();
    if (selected) {
      highlightCountryBorder(selected);
    }
  });
});
$("#wikiModal").on("show.bs.modal", function () {
  const selected = $("#countrySelect").val();
  const country = countryList.find(
    (c) => c.code.toLowerCase() === selected.toLowerCase()
  );

  if (country) {
    const wikiUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(
      country.name
    )}`;
    $("#wikiInfoText").html(
      `Read more about <strong>${country.name}</strong> on Wikipedia:`
    );
    $("#wikiLink").attr("href", wikiUrl).removeClass("d-none");
  } else {
    $("#wikiInfoText").text("Country data not found.");
    $("#wikiLink").addClass("d-none");
  }
});
