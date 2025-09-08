let map;
let userLat, userLng;
let userLocationMarker = null;
let countryList = [];
let countriesGeoJSON = null;
let selectedCountryLayer = null;

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
        alert("Weather data not available.");
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
      alert("Failed to fetch weather data.");
    },
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

function populateCountryDropdown() {
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
        return name && code && code !== "-99"
          ? { name, code: code.toLowerCase() }
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
  }).fail(() => alert("Failed to load countries.geojson."));
}

function highlightCountryBorder(code) {
  if (!countriesGeoJSON) return;

  const feature = countriesGeoJSON.features.find((f) => {
    const isoCode = f.properties.ISO_A3 || f.properties.iso_a3;
    return isoCode && isoCode.toLowerCase() === code.toLowerCase();
  });

  if (!feature || !feature.geometry) {
    alert("No coordinates found for this country.");
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
      alert("User location not found.");
    }
  }).addTo(map);

 
  L.easyButton("fa-users", () => {
    const selected = $("#countrySelect").val();
    const populations = {
      gbr: "67 million",
      usa: "331 million",
      jpn: "125 million",
      aus: "25 million",
      ind: "1.4 billion",
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
    if (selected) {
      $.post(
        "./php/getCurrency.php",
        { code: selected.toUpperCase() },
        function (data) {
          console.log("Currency response:", data); 

          if (data && data.currency && data.rate) {
            showInfoModal(
              "Currency Info",
              `<div class="table-responsive mb-3">
             <table class="table table-bordered table-sm">
               <tbody>
                 <tr><th>Currency</th><td>${data.currency}</td></tr>
                 <tr><th>Exchange Rate</th><td>1 USD = ${data.rate} ${data.currency}</td></tr>
               </tbody>
             </table>
           </div>
           <div class="form-group">
             <label for="usdInput"><strong>Amount in USD:</strong></label>
             <input type="number" id="usdInput" class="form-control form-control-sm" placeholder="Enter USD amount" />
           </div>
           <div class="mt-3">
             <strong>Converted Amount:</strong> <span id="convertedAmount">—</span>
           </div>`
            );

            $("#usdInput").on("input", function () {
              const usd = parseFloat($(this).val());
              if (!isNaN(usd)) {
                const converted = usd * data.rate;
                $("#convertedAmount").text(
                  `${converted.toFixed(2)} ${data.currency}`
                );
              } else {
                $("#convertedAmount").text("—");
              }
            });
          } else {
            alert("Currency data not available.");
          }
        },
        "json"
      ).fail((xhr, status, error) => {
        console.error("Currency AJAX error:", status, error, xhr.responseText); // 👈 Debug line
        alert("Failed to load currency info.");
      });
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


  L.easyButton('<i class="fa-solid fa-location-crosshairs"></i>', () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          userLat = pos.coords.latitude;
          userLng = pos.coords.longitude;
          map.setView([userLat, userLng], 12);
          setUserLocationMarker(userLat, userLng);
        },
        () => alert("Unable to retrieve your location.")
      );
    } else {
      alert("Geolocation is not supported by your browser.");
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
  }

  
  $("#countrySelect").change(function () {
    const selected = $(this).val();
    if (selected) {
      highlightCountryBorder(selected);
    }
  });
});
