
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
  console.log(`fetchWeatherForecast called with lat=${lat}, lng=${lng}`);
 
}

function fetchCountryInfo(code) {
  console.log(`fetchCountryInfo called with code=${code}`);

}

function fetchCurrencyInfo(code) {
  console.log(`fetchCurrencyInfo called with code=${code}`);

}

function fetchWikipediaInfo(code) {
  console.log(`fetchWikipediaInfo called with code=${code}`);
 
}

function fetchNewsHeadlines(code) {
  console.log(`fetchNewsHeadlines called with code=${code}`);
 
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
