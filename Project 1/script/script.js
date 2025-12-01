let map;
let userLat, userLng;
let userLocationMarker = null;
let countryList = [];
let countriesGeoJSON = null;
let selectedCountryLayer = null;
let autoShowWeatherModal = false;

function loadGeoJSONData() {
  $.getJSON("data/countryBorders.geo.json", (data) => {
    countriesGeoJSON = data;
  }).fail(() => showToast("Failed to load country borders.", "danger"));
}

function addMarkersToClusters(countryCode) {
  airportCluster.clearLayers();
  cityCluster.clearLayers();

  if (!countryCode) {
    if (map.hasLayer(airportCluster)) map.removeLayer(airportCluster);
    if (map.hasLayer(cityCluster)) map.removeLayer(cityCluster);
    return;
  }

  const iso3to2 = {
    gbr: "gb",
    usa: "us",
    can: "ca",
    aus: "au",
    fra: "fr",
    deu: "de",
    ita: "it",
    esp: "es",
    nld: "nl",
    bel: "be",
    che: "ch",
    aut: "at",
    swe: "se",
    nor: "no",
    dnk: "dk",
    fin: "fi",
    pol: "pl",
    cze: "cz",
    prt: "pt",
    grc: "gr",
    irl: "ie",
    jpn: "jp",
    chn: "cn",
    ind: "in",
    bra: "br",
    mex: "mx",
    arg: "ar",
    rus: "ru",
    kor: "kr",
    zaf: "za",
    egy: "eg",
    tur: "tr",
    sau: "sa",
    are: "ae",
    isr: "il",
    sgp: "sg",
    tha: "th",
    vnm: "vn",
    mys: "my",
    idn: "id",
    phl: "ph",
    pak: "pk",
    nzl: "nz",
  };

  const code =
    iso3to2[countryCode.toLowerCase()] || countryCode.substring(0, 2);
  let completed = 0;

  $.ajax({
    url: "./php/getAirports.php",
    method: "POST",
    data: { countryCode: code.toUpperCase() },
    dataType: "json",
    success: function (data) {
      if (data && data.features) {
        const icon = L.divIcon({
          html: '<i class="fa fa-plane" style="color: #0066cc; font-size: 24px;"></i>',
          className: "custom-marker-icon",
          iconSize: [30, 30],
          iconAnchor: [15, 15],
          popupAnchor: [0, -15],
        });

        data.features.forEach((airport) => {
          const marker = L.marker(
            [airport.geometry.coordinates[1], airport.geometry.coordinates[0]],
            { icon: icon }
          ).bindPopup(`<b>${airport.properties.name}</b><br>Type: Airport`);
          airportCluster.addLayer(marker);
        });

        if (
          airportCluster.getLayers().length > 0 &&
          !map.hasLayer(airportCluster)
        ) {
          map.addLayer(airportCluster);
        }
      }
      checkComplete();
    },
    error: () => checkComplete(),
  });

  $.ajax({
    url: "./php/getCities.php",
    method: "POST",
    data: { countryCode: code.toUpperCase() },
    dataType: "json",
    success: function (data) {
      if (data && data.features) {
        const icon = L.divIcon({
          html: '<i class="fa fa-city" style="color: #cc6600; font-size: 24px;"></i>',
          className: "custom-marker-icon",
          iconSize: [30, 30],
          iconAnchor: [15, 15],
          popupAnchor: [0, -15],
        });

        data.features.forEach((city) => {
          const marker = L.marker(
            [city.geometry.coordinates[1], city.geometry.coordinates[0]],
            { icon: icon }
          ).bindPopup(`<b>${city.properties.name}</b><br>Type: City`);
          cityCluster.addLayer(marker);
        });

        if (cityCluster.getLayers().length > 0 && !map.hasLayer(cityCluster)) {
          map.addLayer(cityCluster);
        }
      }
      checkComplete();
    },
    error: () => checkComplete(),
  });

  function checkComplete() {
    if (++completed === 2) {
      const airports = airportCluster.getLayers().length;
      const cities = cityCluster.getLayers().length;

      if (airports > 0 || cities > 0) {
        const msg = [];
        if (airports > 0)
          msg.push(`${airports} airport${airports > 1 ? "s" : ""}`);
        if (cities > 0) msg.push(`${cities} ${cities > 1 ? "cities" : "city"}`);
        showToast(`✈️ Displaying: ${msg.join(" and ")}`, "success");
      } else {
        showToast("No markers available for this country", "info");
      }
    }
  }
}

function highlightCountryAndMarkers(code, countryName) {
  highlightCountryBorder(code, countryName);
  addMarkersToClusters(code);
}

function get_user_location() {
  $("#loader").show();
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        userLat = pos.coords.latitude;
        userLng = pos.coords.longitude;

        map.setView([userLat, userLng], 6);
        setUserLocationMarker(userLat, userLng);

        const countryFeature = countriesGeoJSON.features.find((f) =>
          turf.booleanPointInPolygon([userLng, userLat], f)
        );

        if (countryFeature) {
          const countryCode = (
            countryFeature.properties.ISO_A3 || ""
          ).toLowerCase();
          const countryName =
            countryFeature.properties.ADMIN ||
            countryFeature.properties.NAME ||
            countryFeature.properties.name ||
            "";
          highlightCountryAndMarkers(countryCode, countryName);
        }

        fetchWeatherAndDisplay(userLat, userLng, autoShowWeatherModal);
        setTimeout(() => $("#loader").hide(), 1000);
      },
      () => fallbackLocation()
    );
  } else {
    fallbackLocation();
  }
}

function fallbackLocation() {
  userLat = 54.5;
  userLng = -4;
  map.setView([userLat, userLng], 6);
  addMarkersToClusters();
  $("#loader").hide();
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

const airportCluster = L.markerClusterGroup({
  iconCreateFunction: function (cluster) {
    return L.divIcon({
      html: "<div><span>" + cluster.getChildCount() + "</span></div>",
      className: "marker-cluster marker-cluster-airport",
      iconSize: L.point(24, 24),
    });
  },
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
  maxClusterRadius: 30,
  disableClusteringAtZoom: 8,
});

const cityCluster = L.markerClusterGroup({
  iconCreateFunction: function (cluster) {
    return L.divIcon({
      html: "<div><span>" + cluster.getChildCount() + "</span></div>",
      className: "marker-cluster marker-cluster-city",
      iconSize: L.point(24, 24),
    });
  },
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
  maxClusterRadius: 30,
  disableClusteringAtZoom: 8,
});

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
        $("#exampleModal .modal-body").html(
          `<table class="table">${tableRows}</table>`
        );
        $("#exampleModal").modal("show");
      }
    },
    error: function () {
      showToast("Failed to fetch weather data.", "danger");
    },
  });
}

function weatherEmoji(condition) {
  const map = {
    Clear: "☀️",
    Clouds: "☁️",
    Rain: "🌧️",
    Drizzle: "🌦️",
    Thunderstorm: "⛈️",
    Snow: "❄️",
    Mist: "🌫️",
    Smoke: "🌫️",
    Haze: "🌫️",
    Fog: "🌫️",
    Dust: "🌫️",
    Sand: "🌫️",
    Ash: "🌫️",
    Squall: "💨",
    Tornado: "🌪️",
  };
  return map[condition] || "🌍";
}

function getForecast(lat, lon) {
  $.ajax({
    url: "./php/getForecast.php",
    method: "POST",
    data: { lat, lon },
    dataType: "json",
    success: function (res) {
      if (!res || !res.list) {
        showToast("Forecast data not available.", "warning");
        return;
      }

      let days = {};
      res.list.forEach((entry) => {
        const date = entry.dt_txt.split(" ")[0];
        if (!days[date]) days[date] = [];
        days[date].push(entry);
      });

      const fiveDays = Object.keys(days).slice(0, 5);

      let html = `<div class='forecast-container'>`;

      fiveDays.forEach((date) => {
        const entries = days[date];

        let entry =
          entries.find((e) => e.dt_txt.includes("12:00")) || entries[0];

        const emoji = weatherEmoji(entry.weather[0].main);

        
        const dateObj = new Date(date);
        const dayName = dateObj.toLocaleDateString("en-US", {
          weekday: "short",
        });
        const monthDay = dateObj.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });

        html += `
          <div class="forecast-day">
            <h6>${dayName}</h6>
            <div style="font-size: 42px; margin: 10px 0;">${emoji}</div>
            <div><strong>${Math.round(entry.main.temp)}°C</strong></div>
            <div class="text-capitalize small" style="margin-top: 8px; font-weight: 500;">${
              entry.weather[0].description
            }</div>
            <div class="small" style="opacity: 0.8; margin-top: 4px;">💨 ${
              entry.wind.speed
            } m/s</div>
            <div class="small" style="opacity: 0.7; margin-top: 8px; font-size: 11px;">${monthDay}</div>
          </div>
        `;
      });

      html += `</div>`;

      showInfoModal("5-Day Weather Forecast", html, true);
    },
    error: function () {
      showToast("Failed to fetch forecast.", "danger");
    },
  });
}

function getWikipedia(countryName) {
  if (!countryName) {
    $("#wikiInfoText").text("No country selected.");
    $("#wikiLink").addClass("d-none");
    return;
  }

  $("#wikiInfoText").html("<em>Loading Wikipedia summary...</em>");
  $("#wikiLink").addClass("d-none");

  $.ajax({
    type: "POST",
    url: "./php/getWikipedia.php",
    data: { countryName: countryName },
    dataType: "json",
    success: function (response) {
      console.log("Wikipedia Response:", response);

      if (response.status && response.status.name === "ok" && response.data) {
        const { summary, url } = response.data;

        $("#wikiInfoText").html(`
          <p>${summary || "No summary available."}</p>
          <p><a href="${url}" target="_blank" class="btn btn-sm btn-outline-primary">
            🌐 Read full article on Wikipedia
          </a></p>
        `);
      } else {
        $("#wikiInfoText").text("No Wikipedia info available.");
      }
    },
  });
}

$("#wikiModal").on("show.bs.modal", function () {
  const selectedCode = $("#countrySelect").val();
  const country = countryList.find(
    (c) => c.code.toLowerCase() === selectedCode?.toLowerCase()
  );

  if (country) {
    $("#wikiModalLabel").text(`Wikipedia: ${country.name}`);
    getWikipedia(country.name);
  } else {
    $("#wikiInfoText").text("Please select a country first.");
  }
});

function getPopulation(countryCodeOrName) {
  console.log("Requesting population for:", countryCodeOrName);
  $.ajax({
    type: "POST",
    url: "./php/getPopulation.php",
    data: { country: countryCodeOrName },
    dataType: "json",
    success: function (response) {
      console.log("Population Response:", response);
      console.log("Status:", response.status);
      if (response.status.name === "ok" && response.data) {
        const data = response.data;

        let flagImg = "";
        if (data.flag) {
          flagImg = `<img src="${data.flag}" alt="${data.countryName} flag" style="width: 60px; height: auto; margin-bottom: 15px; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">`;
        }

        $("#populationInfo").html(`
          <div style="text-align: center;">
            ${flagImg}
            <h5 style="margin-bottom: 20px; color: #333;">${
              data.countryName
            }</h5>
          </div>
          <table class="table table-sm">
            <tbody>
              <tr>
                <th scope="row"><i class="fa fa-flag"></i> Official Name</th>
                <td>${data.officialName}</td>
              </tr>
              <tr>
                <th scope="row"><i class="fa fa-map-marker"></i> Capital</th>
                <td>${data.capital}</td>
              </tr>
              <tr>
                <th scope="row"><i class="fa fa-users"></i> Population</th>
                <td><strong>${data.population.toLocaleString()}</strong></td>
              </tr>
              <tr>
                <th scope="row"><i class="fa fa-globe"></i> Area</th>
                <td>${data.area.toLocaleString()} km²</td>
              </tr>
              <tr>
                <th scope="row"><i class="fa fa-map"></i> Region</th>
                <td>${data.region}</td>
              </tr>
              <tr>
                <th scope="row"><i class="fa fa-map-pin"></i> Subregion</th>
                <td>${data.subregion}</td>
              </tr>
              <tr>
                <th scope="row"><i class="fa fa-language"></i> Languages</th>
                <td>${data.languages}</td>
              </tr>
            </tbody>
          </table>
        `);
      } else {
        $("#populationInfo").html(`
          <div class="alert alert-warning" role="alert">
            <i class="fa fa-exclamation-triangle"></i> No population data available for this country.
          </div>
        `);
      }
    },
    error: function (xhr, status, error) {
      console.error("AJAX error (Population):", error);
      $("#populationInfo").html(`
        <div class="alert alert-danger" role="alert">
          <i class="fa fa-times-circle"></i> Failed to load population data. Please try again.
        </div>
      `);
    },
  });
}

function getWeather(countryName) {
  const country = countryList.find(
    (c) => c.name.toLowerCase() === countryName.toLowerCase()
  );

  if (!country) {
    showToast("Country not found for weather lookup.", "warning");
    return;
  }

  if (countriesGeoJSON) {
    const feature = countriesGeoJSON.features.find((f) => {
      const isoCode = f.properties.ISO_A3 || f.properties.iso_a3;
      return isoCode && isoCode.toLowerCase() === country.code.toLowerCase();
    });

    if (feature && feature.geometry) {
      const bounds = L.geoJSON(feature).getBounds();
      const center = bounds.getCenter();

      fetchWeatherAndDisplay(center.lat, center.lng, false);
    } else {
      showToast("Could not find country coordinates.", "warning");
    }
  } else {
    showToast("Country data not loaded yet.", "warning");
  }
}



function showInfoModal(title, content, isWide = false) {
  $("#exampleModal .modal-title").text(title);
  $("#exampleModal .modal-body").html(content);

  
  if (isWide) {
    $("#exampleModal .modal-dialog").addClass("modal-xl-custom");
  } else {
    $("#exampleModal .modal-dialog").removeClass("modal-xl-custom");
  }

  $("#exampleModal").modal("show");
}

function populateCountryDropdown() {
  $.getJSON("data/countries.geojson", function (data) {
    const $select = $("#countrySelect");
    $select.empty();
    $select.append(
      '<option value="" disabled selected>-- Select a country --</option>'
    );
    countryList = [];
    data.features.forEach((feature) => {
      const name = feature.properties.ADMIN;
      const code = feature.properties.ISO_A3;
      const currency = feature.properties.currency;

      if (name && code) {
        const countryCode = code.toLowerCase();
        $select.append(`<option value="${countryCode}">${name}</option>`);
        countryList.push({ name, code: countryCode, currency });
      }
    });
  }).fail(() => {
    showToast("Failed to load countries data.", "danger");
  });
}

function highlightCountryBorder(code, countryNameFromDropdown) {
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
    style: { color: "#ff7800", weight: 3, opacity: 1, fillOpacity: 0.05 },
  }).addTo(map);

  map.fitBounds(selectedCountryLayer.getBounds(), { padding: [50, 50] });

 
  const bounds = selectedCountryLayer.getBounds();
  const center = bounds.getCenter();

  
  if (window.countryLabelMarker) {
    map.removeLayer(window.countryLabelMarker);
  }

  
  const countryName =
    countryNameFromDropdown ||
    feature.properties.ADMIN ||
    feature.properties.NAME ||
    feature.properties.name ||
    feature.properties.admin ||
    feature.properties.NAME_LONG ||
    "Country";

  window.countryLabelMarker = L.marker(center, {
    icon: L.divIcon({
      className: "country-label-marker",
      html: `<div class="country-label country-label-visible">${countryName}</div>`,
      iconSize: null, 
      iconAnchor: null, 
    }),
    interactive: false, 
  }).addTo(map);

  console.log("Country selected:", countryName, "Code:", code);

 
  if (window.countryLabelTimeout) {
    clearTimeout(window.countryLabelTimeout);
  }

 
  window.countryLabelTimeout = setTimeout(() => {
    if (window.countryLabelMarker) {

      const labelElement = document.querySelector(".country-label-visible");
      if (labelElement) {
        labelElement.classList.add("country-label-fadeout");

       
        setTimeout(() => {
          if (window.countryLabelMarker) {
            map.removeLayer(window.countryLabelMarker);
            window.countryLabelMarker = null;
          }
        }, 1000);
      }
    }
  }, 5000);
}

$(document).ready(function () {
  map = L.map("map", { layers: [streets] }).setView([54.5, -4], 6);
  loadGeoJSONData();
  populateCountryDropdown();
  get_user_location();

  L.easyButton({
    states: [
      {
        icon: "fa-cloud-sun",
        title: "Country Weather",
        onClick: () => {
          const selectedCode = $("#countrySelect").val();
          const selectedCountry = countryList.find(
            (c) => c.code.toLowerCase() === selectedCode?.toLowerCase()
          );

          if (selectedCountry) {
            if (countriesGeoJSON) {
              const feature = countriesGeoJSON.features.find((f) => {
                const isoCode = f.properties.ISO_A3 || f.properties.iso_a3;
                return (
                  isoCode &&
                  isoCode.toLowerCase() === selectedCountry.code.toLowerCase()
                );
              });

              if (feature && feature.geometry) {
                const bounds = L.geoJSON(feature).getBounds();
                const center = bounds.getCenter();

                fetchWeatherAndDisplay(center.lat, center.lng, true);
              } else {
                showToast("Could not find country coordinates.", "warning");
              }
            } else {
              showToast("Country data not loaded yet.", "warning");
            }
          } else {
            showToast("Select a country first to view weather.", "info");
          }
        },
      },
    ],
  }).addTo(map);
 
  L.easyButton({
    states: [
      {
        icon: "fa-solid fa-cloud-sun-rain",
        title: "5-Day Forecast",
        onClick: () => {
          console.log("5-Day Forecast button clicked");
          const selectedCode = $("#countrySelect").val();
          console.log("Selected code from dropdown:", selectedCode);
          console.log("Country list length:", countryList.length);
          console.log("First 3 countries:", countryList.slice(0, 3));

          if (!selectedCode) {
            showToast("Please select a country first.", "info");
            return;
          }

          const selectedCountry = countryList.find(
            (c) => c.code.toLowerCase() === selectedCode?.toLowerCase()
          );
          console.log("Found country:", selectedCountry);

          if (!selectedCountry) {
            showToast(
              "Country not found. Selected: " + selectedCode,
              "warning"
            );
            return;
          }

          if (!countriesGeoJSON) {
            showToast("Map data still loading, please try again.", "warning");
            return;
          }

          console.log("Looking for country code:", selectedCountry.code);
          console.log(
            "GeoJSON features count:",
            countriesGeoJSON.features.length
          );

          const feature = countriesGeoJSON.features.find((f) => {
            const iso = (
              f.properties.ISO_A3 || f.properties.iso_a3
            )?.toLowerCase();
            return iso === selectedCountry.code;
          });

          console.log("Found feature:", feature ? "YES" : "NO");
          if (feature) {
            console.log("Feature properties:", feature.properties);
          } else {
            
            const sampleCodes = countriesGeoJSON.features
              .slice(0, 5)
              .map((f) => f.properties.ISO_A3);
            console.log("Sample ISO codes in GeoJSON:", sampleCodes);
          }

          if (feature) {
            const bounds = L.geoJSON(feature).getBounds();
            const center = bounds.getCenter();
            console.log("Fetching forecast for:", selectedCountry.name, center);
            getForecast(center.lat, center.lng);
          } else {
            showToast(
              "Could not find country location for: " + selectedCountry.code,
              "warning"
            );
          }
        },
      },
    ],
  }).addTo(map);
  console.log("5-Day Forecast button added to map");

  L.easyButton({
    states: [
      {
        icon: "fa-users",
        title: "Population Data",
        onClick: () => {
          const selectedCode = $("#countrySelect").val();
          const selectedCountry = countryList.find(
            (c) => c.code.toLowerCase() === selectedCode?.toLowerCase()
          );

          if (selectedCountry) {
            getPopulation(selectedCountry.code);
            $("#populationModal").modal("show");
          } else {
            showToast("Select a country first to view population.", "info");
          }
        },
      },
    ],
  }).addTo(map);

  L.easyButton({
    states: [
      {
        icon: "fa-map-marker-alt",
        title: "Toggle Markers (Airports & Cities)",
        onClick: function () {
          const hasAirports = map.hasLayer(airportCluster);
          const hasCities = map.hasLayer(cityCluster);

          if (hasAirports || hasCities) {
            if (hasAirports) map.removeLayer(airportCluster);
            if (hasCities) map.removeLayer(cityCluster);
            showToast("Markers hidden", "info");
          } else {
            const selectedCode = $("#countrySelect").val();
            if (selectedCode) {
              addMarkersToClusters(selectedCode);
              showToast("Markers displayed", "success");
            } else {
              showToast("Select a country first to show markers.", "info");
            }
          }
        },
      },
    ],
  }).addTo(map);

  L.easyButton({
    states: [
      {
        icon: "fa-money-bill-wave",
        title: "Currency Converter",
        onClick: () => {
          
          const selectedMainCountry = $("#countrySelect").val();

          showInfoModal(
            "Currency Converter",
            `
    <div class="form-group mt-2">
      <label for="countryCurrencySelect"><strong>Select Country:</strong></label>
      <select id="countryCurrencySelect" class="form-control form-control-sm">
        <option value="" disabled>Select a country</option>
        ${countryList
          .map(
            (c) =>
              `<option value="${c.code}" ${
                selectedMainCountry &&
                c.code.toLowerCase() === selectedMainCountry.toLowerCase()
                  ? "selected"
                  : ""
              }>${c.name}</option>`
          )
          .join("")}
      </select>
    </div>
    <div class="form-group mt-2">
      <label for="currencySelect"><strong>Currency:</strong></label>
      <select id="currencySelect" class="form-control form-control-sm" disabled>
        <option value="">Select a country first</option>
      </select>
    </div>
    <div class="form-group mt-2">
      <label for="usdInput"><strong>Amount:</strong></label>
      <input type="number" id="usdInput" class="form-control form-control-sm" placeholder="Enter amount" min="0" step="any" />
    </div>
    <div class="form-group mt-2">
      <button id="Convert" class="btn btn-primary btn-sm" disabled>Convert to EUR</button>
    </div>
    <div class="mt-3">
      <strong>Converted Amount:</strong> <span id="convertedAmount">—</span>
    </div>
    `
          );

          
          if (selectedMainCountry) {
            setTimeout(() => {
              $("#countryCurrencySelect").trigger("change");
            }, 100);
          }
        },
      },
    ],
  }).addTo(map);

  $("#countrySelect").on("change", function () {
    const selectedCode = $(this).val();
    if (!selectedCode) return;

    const selectedCountry = countryList.find(
      (c) => c.code.toLowerCase() === selectedCode.toLowerCase()
    );

    if (!selectedCountry) return;

    const countryName = selectedCountry.name;
    const countryCode = selectedCountry.code;

    highlightCountryBorder(countryCode, countryName); 
    addMarkersToClusters(countryCode);
    getWeather(countryName);
    getPopulation(countryCode);
  });

  
  $(document).on("change", "#countryCurrencySelect", function () {
    const selectedCountryCode = $(this).val();
    const currencySelectEl = $("#currencySelect");
    const convertBtn = $("#Convert");

    if (!selectedCountryCode) {
      currencySelectEl
        .html('<option value="">Select a country first</option>')
        .prop("disabled", true);
      convertBtn.prop("disabled", true);
      return;
    }

   
    currencySelectEl
      .html('<option value="">Loading...</option>')
      .prop("disabled", true);
    convertBtn.prop("disabled", true);

    $.post(
      "./php/getCurrency.php",
      { countryCode: selectedCountryCode },
      function (data) {
        if (data && data.currency && !data.error) {
          currencySelectEl.html(
            `<option value="${data.currency}" selected>${data.currency}</option>`
          );
          currencySelectEl.prop("disabled", false);
          convertBtn.prop("disabled", false);
        } else {
          currencySelectEl.html(
            '<option value="">Currency not available</option>'
          );
          currencySelectEl.prop("disabled", true);
          convertBtn.prop("disabled", true);
          showToast(
            data.error || "Currency not available for this country",
            "warning"
          );
        }
      },
      "json"
    ).fail(() => {
      showToast("Failed to load currency data", "danger");
      currencySelectEl.html('<option value="">Error loading currency</option>');
      currencySelectEl.prop("disabled", true);
      convertBtn.prop("disabled", true);
    });
  });

  $(document).on("click", "#Convert", function () {
    const usdAmount = parseFloat($("#usdInput").val());
    const selectedCurrency = $("#currencySelect").val();
    const selectedCountryCode = $("#countryCurrencySelect").val();
    const resultEl = $("#convertedAmount");

    if (!selectedCurrency || !selectedCountryCode) {
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
      { countryCode: selectedCountryCode },
      function (data) {
        if (data && data.currency && data.rate && data.rate > 0) {
          const converted = usdAmount * data.rate;
          resultEl.html(
            `${usdAmount.toFixed(2)} ${data.currency} = ${converted.toFixed(
              2
            )} EUR`
          );
        } else {
          resultEl.text(data.error || "Currency data not available.");
        }
      },
      "json"
    ).fail(() => {
      resultEl.text("Failed to fetch exchange rate.");
    });
  });

  L.easyButton({
    states: [
      {
        icon: "fa-book-open",
        title: "Wikipedia Information",
        onClick: () => {
          const selected = $("#countrySelect").val();
          if (selected) {
            $("#wikiModal").modal("show");
          } else {
            showToast("Select a country first.", "info");
          }
        },
      },
    ],
  }).addTo(map);

  L.easyButton({
    states: [
      {
        icon: '<i class="fa-solid fa-location-crosshairs"></i>',
        title: "My Location",
        onClick: () => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                userLat = pos.coords.latitude;
                userLng = pos.coords.longitude;
                map.setView([userLat, userLng], 12);
                setUserLocationMarker(userLat, userLng);
                showToast("Location updated", "success");
              },
              () => showToast("Unable to retrieve your location.", "warning")
            );
          } else {
            showToast(
              "Geolocation is not supported by your browser.",
              "danger"
            );
          }
        },
      },
    ],
  }).addTo(map);

  
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
  }
});
