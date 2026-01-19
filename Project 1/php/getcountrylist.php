<?php
header('Content-Type: application/json');


ini_set('display_errors', 0);
error_reporting(E_ALL);


$geojsonPath = __DIR__ . '/../data/countryBorders.geo.json';


if (!file_exists($geojsonPath)) {
    http_response_code(500);
    echo json_encode(['error' => 'GeoJSON file not found']);
    exit;
}


$geojson = file_get_contents($geojsonPath);
if ($geojson === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to read GeoJSON file']);
    exit;
}


$data = json_decode($geojson, true);
if (!is_array($data) || !isset($data['features'])) {
    http_response_code(500);
    echo json_encode(['error' => 'Invalid GeoJSON format']);
    exit;
}


$countries = [];
foreach ($data['features'] as $feature) {
    $props = $feature['properties'] ?? [];

   
    $code = $props['iso_a2'] ?? $props['iso_a3'] ?? $props['ISO_A2'] ?? $props['ISO_A3'] ?? '';
    $code = strtolower($code);

    
    $name = $props['name'] ?? $props['ADMIN'] ?? $props['NAME'] ?? '';


    if ($code && $name && $code !== '-99') {
        $countries[] = [
            'code' => $code,
            'name' => $name
        ];
    }
}


usort($countries, function ($a, $b) {
    return strcmp($a['name'], $b['name']);
});



echo json_encode($countries);
