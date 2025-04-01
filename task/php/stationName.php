<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $userInput = trim($_POST['stationName']);

    $url = "http://api.geonames.org/weatherIcaoJSON?ICAO=LSZH&username=adinaavram";
    
  
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    $weatherData = json_decode($response, true);

    if (isset($weatherData['weatherObservation'])) {
        $stationName = $weatherData['weatherObservation']['stationName'];
        $dateTime = $weatherData['weatherObservation']['datetime'];
        $countryCode = $weatherData['weatherObservation']['countryCode'];
        $temperature = $weatherData['weatherObservation']['temperature'];
        $humidity = $weatherData['weatherObservation']['humidity'];
        $weatherCondition = $weatherData['weatherObservation']['weatherCondition'];
        $windSpeed = $weatherData['weatherObservation']['windSpeed'];

  
        echo "<p><strong>Station Name:</strong> " . htmlspecialchars($stationName) . "</p>";

        if (strcasecmp($userInput, $stationName) == 0) {
            echo "<p><strong>Date & Time:</strong> " . htmlspecialchars($dateTime) . "</p>";
            echo "<p><strong>Country Code:</strong> " . htmlspecialchars($countryCode) . "</p>";
            echo "<p><strong>Temperature:</strong> " . htmlspecialchars($temperature) . "°C</p>";
            echo "<p><strong>Humidity:</strong> " . htmlspecialchars($humidity) . "%</p>";
            echo "<p><strong>Weather Condition:</strong> " . htmlspecialchars($weatherCondition) . "</p>";
            echo "<p><strong>Wind Speed:</strong> " . htmlspecialchars($windSpeed) . " km/h</p>";
        } else {
            echo "<p>No match found for your input.</p>";
        }
    } else {
        echo "<p>Unable to fetch weather data.</p>";
    }
}
?>
