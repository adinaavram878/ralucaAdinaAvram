<?php
header('Content-Type: application/json');


$code = strtolower($_POST['code'] ?? '');


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


if (array_key_exists($code, $countryData)) {
    echo json_encode($countryData[$code]);
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Country not found']);
}
