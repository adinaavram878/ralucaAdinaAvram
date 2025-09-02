<?php
header('Content-Type: application/json');

$code = strtolower($_POST['code'] ?? '');

if (!$code) {
    http_response_code(400);
    echo json_encode(['error' => 'No country code provided']);
    exit;
}


$countryFilePath = __DIR__ . '/data/countries.json';
$countryJson = file_get_contents($countryFilePath);

if ($countryJson === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to load country data']);
    exit;
}

$countryData = json_decode($countryJson, true);

if (!is_array($countryData)) {
    http_response_code(500);
    echo json_encode(['error' => 'Invalid country data format']);
    exit;
}


$apiKey = 'b4b47890259a41f5a7c00e98f2b2f15b ';


$apiUrl = "https://api.opencagedata.com/geocode/v1/json?q=" . urlencode($code) . "&key={$apiKey}&countrycode={$code}&limit=1&no_annotations=1";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
$response = curl_exec($ch);

if ($response === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch data from OpenCage']);
    exit;
}

curl_close($ch);

$data = json_decode($response, true);

if (!isset($data['results'][0])) {
    
    if (array_key_exists($code, $countryData)) {
        echo json_encode($countryData[$code]);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Country not found']);
    }
    exit;
}

$components = $data['results'][0]['components'];


$openCageInfo = [
    'name' => $components['country'] ?? null,
    'country_code' => $components['country_code'] ?? $code,
    'state' => $components['state'] ?? null,
    'region' => $components['region'] ?? null,
    'city' => $components['city'] ?? null,
    'continent' => $components['continent'] ?? null,
    'postcode' => $components['postcode'] ?? null,
];


$localData = $countryData[$code] ?? [];


$result = array_merge($openCageInfo, $localData);

echo json_encode($result);
