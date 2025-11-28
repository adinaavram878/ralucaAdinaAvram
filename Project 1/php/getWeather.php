<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

$lat = $_POST['lat'] ?? null;
$lon = $_POST['lon'] ?? null;

if (!$lat || !$lon) {
    http_response_code(400);
    echo json_encode(['error' => 'Latitude and longitude are required.']);
    exit;
}

$apiKey = '60b5e9ec6028dc5a8c9ad0e59fbedea2'; 

$apiUrl = "https://api.openweathermap.org/data/2.5/weather?lat=$lat&lon=$lon&units=metric&appid=$apiKey";

$response = file_get_contents($apiUrl);

if ($response === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch weather data.']);
    exit;
}

$data = json_decode($response, true);


if (!isset($data['main'])) {
    http_response_code(500);
    echo json_encode(['error' => 'Unexpected API response.']);
    exit;
}

echo json_encode($data);
