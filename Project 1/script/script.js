var map;
var userLat, userLng;

const countryCoordinates = {
  uk: { lat: 54.5, lon: -4 },
  us: { lat: 39.8, lon: -98.6 },
  jp: { lat: 36.2, lon: 138.3 },
  au: { lat: -25.3, lon: 133.8 },
  in: { lat: 20.6, lon: 78.9 },
};

var streets = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
  { attribution: "Tiles &copy; Esri" }
);

var satellite = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  { attribution: "Tiles &copy; Esri" }
);

var basemaps = { Streets: streets, Satellite: satellite };

var weatherStationsCluster = L.markerClusterGroup();
var pointsOfInterestCluster = L.markerClusterGroup();

// Border Layer
var borderLayer = L.geoJSON(null, {
  style: {
    color: "#ff7800",
    weight: 3,
    fillColor: "#ffd580",
    fillOpacity: 0.25,
  },
});

function fetchWeatherAndDisplay(lat, lon, showInModal = false) {
  $.ajax({
    url: "./php/getWeather.php",
    method: "POST",
    data: { lat, lon },
    success: function (response) {
      try {
        const weather = JSON.parse(response);
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
          $(".modal-body table").html(tableRows);
          $("#exampleModal").modal("show");
        }
      } catch {
        alert("Failed to parse weather data.");
      }
    },
    error: function () {
      alert("Failed to fetch weather data.");
    },
  });
}

function addMarkersToClusters() {
  if (!userLat || !userLng) return;

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

  map.addLayer(weatherStationsCluster);
  map.addLayer(pointsOfInterestCluster);
}

function showInfoModal(title, content) {
  $("#infoModalTitle").text(title);
  $("#infoModalBody").html(content);
  $("#infoModal").modal("show");
}

async function highlightCountryBorder(countryCode) {
  try {
    const names = {
      uk: "United Kingdom",
      us: "United States",
      jp: "Japan",
      au: "Australia",
      in: "India",
    };
    const countryName = names[countryCode];
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?country=${encodeURIComponent(
        countryName
      )}&polygon_geojson=1&format=geojson`
    );
    const geo = await res.json();
    if (geo.features && geo.features[0]) {
      borderLayer.clearLayers();
      borderLayer.addData(geo.features[0].geometry);
      map.addLayer(borderLayer);
      map.fitBounds(borderLayer.getBounds().pad(0.5));
    }
  } catch (err) {
    console.error("Failed to load border:", err);
  }
}

$(document).ready(function () {
  map = L.map("map", { layers: [streets] }).setView([54.5, -4], 6);

  L.control
    .layers(basemaps, {
      "Weather Stations": weatherStationsCluster,
      "Points of Interest": pointsOfInterestCluster,
    })
    .addTo(map);

  L.easyButton("fa-cloud-sun", () => {
    if (userLat && userLng) fetchWeatherAndDisplay(userLat, userLng, true);
    else alert("User location not found.");
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
      showInfoModal(
        "Wikipedia Info",
        `<p>Read more about <strong>${selected.toUpperCase()}</strong> on Wikipedia:</p>
        <a href="https://en.wikipedia.org/wiki/${selected.toUpperCase()}" target="_blank" class="btn btn-sm btn-primary">
          <i class="fa-brands fa-wikipedia-w"></i> Open Wikipedia
        </a>`
      );
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
          L.marker([userLat, userLng])
            .addTo(map)
            .bindPopup("You are here")
            .openPopup();
        },
        () => {
          alert("Unable to retrieve your location.");
        }
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
        L.marker([userLat, userLng])
          .addTo(map)
          .bindPopup("You are here")
          .openPopup();
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
    if (selected && countryCoordinates[selected]) {
      const coords = countryCoordinates[selected];
      map.setView([coords.lat, coords.lon], 6);
      highlightCountryBorder(selected);
    }
  });
});
