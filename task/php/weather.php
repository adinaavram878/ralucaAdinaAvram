<?php
header('Content-Type: application/json; charset=UTF-8');

if (isset($_POST['stationName'])) {
    $station = $_POST['stationName'];
    $username = 'adinaavram';

    $url = "http://api.geonames.org/weatherIcaoJSON?ICAO=" . urlencode($station) . "&username=" . $username;

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL, $url);

    $data = curl_exec($ch);
    curl_close($ch);

    $weather = json_decode($data, true);

    if (isset($weather['weatherObservation'])) {
        $observation = $weather['weatherObservation'];

        echo json_encode([
            'status' => 'ok',
            'data' => [
                'datetime' => $observation['datetime'] ?? 'N/A',
                'countryCode' => $observation['countryCode'] ?? 'N/A',
                'temperature' => $observation['temperature'] ?? 'N/A',
                'humidity' => $observation['humidity'] ?? 'N/A',
                'weatherCondition' => $observation['weatherCondition'] ?? 'N/A',
                'windSpeed' => $observation['windSpeed'] ?? 'N/A',
                'stationName' => $observation['stationName'] ?? $station
            ]
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'No weather data found for station: ' . $station
        ]);
    }
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'No station name provided'
    ]);
}
?>
