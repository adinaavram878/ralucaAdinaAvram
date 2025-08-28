<?php
header('Content-Type: application/json');

$countryCode = strtolower($_POST['code'] ?? '');

$geojson = file_get_contents('../data/countries.geojson');
$data = json_decode($geojson, true);

foreach ($data['features'] as $feature) {
    if (strtolower($feature['properties']['ISO_A2']) === $countryCode) {
        echo json_encode($feature);
        exit;
    }
}

http_response_code(404);
echo json_encode(['error' => 'Country not found']);
?>

