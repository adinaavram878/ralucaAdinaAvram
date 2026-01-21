<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

$lat = $_POST['lat'] ?? null;
$lng = $_POST['lng'] ?? null;

if (!$lat || !$lng) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Latitude and longitude are required.'
    ]);
    exit;
}

$username = 'adinaavram';

$url = "http://api.geonames.org/countryCodeJSON?lat=$lat&lng=$lng&username=$username";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$response = curl_exec($ch);

if (curl_errno($ch)) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'cURL error: ' . curl_error($ch)
    ]);
    curl_close($ch);
    exit;
}

curl_close($ch);

$data = json_decode($response, true);

if (!isset($data['countryCode'])) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Unexpected API response'
    ]);
    exit;
}

echo json_encode([
    'status' => 'ok',
    'countryCode' => strtolower($data['countryCode'])
]);
