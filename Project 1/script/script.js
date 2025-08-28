let map;
let userLat, userLng;
let userLocationMarker = null;
let countryList = [];

const countryCoordinates = {
  uk: { lat: 54.5, lon: -4 },
  us: { lat: 39.8, lon: -98.6 },
  jp: { lat: 36.2, lon: 138.3 },
  au: { lat: -25.3, lon: 133.8 },
  in: { lat: 20.6, lon: 78.9 },
};

const streets = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
  { attribution: "Tiles &copy; Esri" }
);

const satellite = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  { attribution: "Tiles &copy; Esri" }
);

const basemaps = { Streets: streets, Satellite: satellite };

const weatherStationsCluster = L.markerClusterGroup();
const pointsOfInterestCluster = L.markerClusterGroup();

const borderLayer = L.geoJSON(null, {
  style: {
    color: "#ff7800",
    weight: 3,
    fillColor: "#ffd580",
    fillOpacity: 0.25,
  },
});

async function highlightCountryBorder(countryCode) {
  try {
    const res = await fetch("./php/getCountryBorder.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `code=${encodeURIComponent(countryCode)}`,
    });

    if (!res.ok) {
      throw new Error("Country not found");
    }

    const feature = await res.json();
    borderLayer.clearLayers();
    borderLayer.addData(feature);
    if (map && !map.hasLayer(borderLayer)) {
      map.addLayer(borderLayer);
    }
    map.fitBounds(borderLayer.getBounds().pad(0.5));
  } catch (err) {
    console.error("Failed to load border:", err);
    alert("Failed to load border data.");
  }
}

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
          $(".modal-body").html(`<table class="table">${tableRows}</table>`);
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
  $.ajax({
    url: "./php/getCountryList.php",
    method: "GET",
    dataType: "json",
    success: function (countries) {
      countryList = countries;
      const $select = $("#countrySelect");

      $select.empty();
      $select.append(
        '<option value="" disabled selected>-- Select a country --</option>'
      );

      countries.sort((a, b) => a.name.localeCompare(b.name));

      countries.forEach((country) => {
        $select.append(
          $("<option>", {
            value: country.code.toLowerCase(),
            text: country.name,
          })
        );
      });
    },
    error: function () {
      alert("Failed to load country list.");
    },
  });
}

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

  $("#countrySelect").change(function () {
    const selected = $(this).val();
    if (selected) {
      highlightCountryBorder(selected);
    }
  });
});
