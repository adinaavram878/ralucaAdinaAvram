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


$url = "https://api.openweathermap.org/data/2.5/forecast?lat=$lat&lon=$lon&appid=$apiKey&units=metric";


$response = file_get_contents($url);

if ($response === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch forecast data.']);
    exit;
}

$data = json_decode($response, true);


if (!isset($data['list'])) {
    http_response_code(500);
    echo json_encode(['error' => 'Unexpected API response.']);
    exit;
}


echo json_encode($data);
