<?php
header('Content-Type: application/json');

$code = strtolower($_POST['code'] ?? '');

if (!$code) {
    http_response_code(400);
    echo json_encode(['error' => 'No country code provided']);
    exit;
}


$apiUrl = "https://restcountries.com/v3.1/alpha/" . urlencode($code);
$response = file_get_contents($apiUrl);

if ($response === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch country data from REST Countries API']);
    exit;
}

$data = json_decode($response, true);

if (!is_array($data) || empty($data[0])) {
    http_response_code(404);
    echo json_encode(['error' => 'Country not found']);
    exit;
}

$country = $data[0];


echo json_encode([
    'name'       => $country['name']['common'] ?? 'Unknown',
    'capital'    => $country['capital'][0] ?? 'N/A',
    'region'     => $country['region'] ?? 'N/A',
    'subregion'  => $country['subregion'] ?? 'N/A',
    'population' => $country['population'] ?? null,
    'area'       => $country['area'] ?? null,
    'languages'  => isset($country['languages']) ? array_values($country['languages']) : [],
    'flag'       => $country['flags']['png'] ?? null
]);
