<?php
header('Content-Type: application/json');


$geojsonPath = __DIR__ . '/data/countries.geojson';
$geojsonData = file_get_contents($geojsonPath);

if ($geojsonData === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to load country data']);
    exit;
}

$geojson = json_decode($geojsonData, true);


$countryNames = [];

foreach ($geojson['features'] as $feature) {
    $code = strtolower($feature['properties']['iso_a2'] ?? '');
    $name = $feature['properties']['name'] ?? '';

    if ($code && $name) {
        $countryNames[$code] = $name;
    }
}


$code = strtolower($_POST['code'] ?? '');

if (!isset($countryNames[$code])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid country code']);
    exit;
}

$country = urlencode($countryNames[$code]);


$url = "https://en.wikipedia.org/api/rest_v1/page/summary/$country";


$response = @file_get_contents($url);

if ($response === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch Wikipedia data']);
    exit;
}

$data = json_decode($response, true);

if (isset($data['extract']) && isset($data['content_urls']['desktop']['page'])) {
    echo json_encode([
        'summary' => $data['extract'],
        'url' => $data['content_urls']['desktop']['page']
    ]);
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Wikipedia summary not found']);
}
