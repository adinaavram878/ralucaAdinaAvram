<?php

error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');

$geojsonPath = '../data/countries.geojson';
if (!file_exists($geojsonPath)) {
    http_response_code(500);
    echo json_encode(['error' => "GeoJSON file not found"]);
    exit;
}

$geojson = file_get_contents($geojsonPath);
if ($geojson === false) {
    http_response_code(500);
    echo json_encode(['error' => "Failed to read GeoJSON file"]);
    exit;
}

$data = json_decode($geojson, true);
if ($data === null) {
    http_response_code(500);
    echo json_encode(['error' => "Failed to decode GeoJSON file"]);
    exit;
}

$countries = [];

foreach ($data['features'] as $feature) {
    $code = strtolower($feature['properties']['ISO_A2'] ?? '');
    $name = $feature['properties']['ADMIN'] ?? '';

    if ($code && $name) {
        $countries[] = [
            'code' => $code,
            'name' => $name
        ];
    }
}

echo json_encode($countries);
?>
