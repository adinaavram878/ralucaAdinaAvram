<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
   
    $lat = filter_var($_POST['lat'], FILTER_VALIDATE_FLOAT);
    $lon = filter_var($_POST['lon'], FILTER_VALIDATE_FLOAT);

    if ($lat === false || $lon === false) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid or missing coordinates"]);
        exit;
    }

   
    $configPath = __DIR__ . '/data/config.json';
    $configData = file_get_contents($configPath);

    if ($configData === false) {
        http_response_code(500);
        echo json_encode(["error" => "Failed to load configuration"]);
        exit;
    }

    $config = json_decode($configData, true);
    $apiKey = $config['openWeatherMapApiKey'] ?? null;

    if (!$apiKey) {
        http_response_code(500);
        echo json_encode(["error" => "Missing OpenWeatherMap API key in config"]);
        exit;
    }

 
    $url = "https://api.openweathermap.org/data/2.5/forecast?lat=$lat&lon=$lon&appid=$apiKey&units=metric";

   
    $response = @file_get_contents($url);

    if ($response !== false) {
        echo $response;
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to fetch forecast"]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Invalid request method"]);
}
