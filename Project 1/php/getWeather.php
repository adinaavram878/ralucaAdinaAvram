<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $lat = filter_var($_POST['lat'], FILTER_VALIDATE_FLOAT);
    $lon = filter_var($_POST['lon'], FILTER_VALIDATE_FLOAT);

    if ($lat !== false && $lon !== false) {
        
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
            echo json_encode(["error" => "Missing API key in config"]);
            exit;
        }

        
        $url = "https://api.openweathermap.org/data/2.5/forecast?lat={$lat}&lon={$lon}&appid={$apiKey}&units=metric";

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        $response = curl_exec($ch);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            http_response_code(500);
            echo json_encode(["error" => "Curl Error: $error"]);
        } else {
            echo $response;
        }
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Invalid or missing coordinates"]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Invalid request method"]);
}
