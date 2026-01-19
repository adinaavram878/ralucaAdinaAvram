<?php
header('Content-Type: application/json');


$countryCode = strtolower(trim($_POST['code'] ?? ''));

if (!$countryCode) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing country code']);
    exit;
}


$geojsonPath = __DIR__ . '/data/countries.geojson';


$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $geojsonPath);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);


curl_setopt($ch, CURLOPT_PROTOCOLS, CURLPROTO_FILE);

$geojsonContent = curl_exec($ch);

if (curl_errno($ch)) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to load GeoJSON file']);
    curl_close($ch);
    exit;
}

curl_close($ch);


$data = json_decode($geojsonContent, true);

if (!is_array($data) || !isset($data['features'])) {
    http_response_code(500);
    echo json_encode(['error' => 'Invalid GeoJSON structure']);
    exit;
}


foreach ($data['features'] as $feature) {
    $isoCode = strtolower($feature['properties']['ISO_A2'] ?? '');
    if ($isoCode === $countryCode) {
        echo json_encode($feature);
        exit;
    }
}


http_response_code(404);
echo json_encode(['error' => 'Country not found']);

