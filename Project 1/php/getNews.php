<?php
header('Content-Type: application/json');


$configPath = __DIR__ . '/data/config.json';
$configData = file_get_contents($configPath);

if ($configData === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to load configuration']);
    exit;
}

$config = json_decode($configData, true);
$apiKey = $config['newsApiKey'] ?? null;

if (!$apiKey) {
    http_response_code(500);
    echo json_encode(['error' => 'Missing News API key in config']);
    exit;
}


$geojsonPath = __DIR__ . '/data/countries.geojson';
$geojsonData = file_get_contents($geojsonPath);

if ($geojsonData === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to load country data']);
    exit;
}

$geojson = json_decode($geojsonData, true);


$supportedNewsCountries = [
    'ae', 'ar', 'at', 'au', 'be', 'bg', 'br', 'ca', 'ch', 'cn', 'co', 'cu',
    'cz', 'de', 'eg', 'fr', 'gb', 'gr', 'hk', 'hu', 'id', 'ie', 'il', 'in',
    'it', 'jp', 'kr', 'lt', 'lv', 'ma', 'mx', 'my', 'ng', 'nl', 'no', 'nz',
    'ph', 'pl', 'pt', 'ro', 'rs', 'ru', 'sa', 'se', 'sg', 'si', 'sk', 'th',
    'tr', 'tw', 'ua', 'us', 've', 'za'
];


$countryMap = [];

foreach ($geojson['features'] as $feature) {
    $iso_a2 = strtolower($feature['properties']['iso_a2'] ?? '');
    $inputCode = strtolower(substr($feature['properties']['name'] ?? '', 0, 2)); // crude input key

    if ($iso_a2 && in_array($iso_a2, $supportedNewsCountries)) {
        $countryMap[$inputCode] = $iso_a2;
    }
}


$code = strtolower($_POST['code'] ?? '');

if (!isset($countryMap[$code])) {
    http_response_code(400);
    echo json_encode(['error' => 'Unsupported or invalid country code']);
    exit;
}

$country = $countryMap[$code];


$url = "https://newsapi.org/v2/top-headlines?country=$country&apiKey=$apiKey";


$response = @file_get_contents($url);

if ($response === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch news data']);
    exit;
}

$data = json_decode($response, true);

if (isset($data['status']) && $data['status'] === 'ok') {
    echo json_encode($data);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'News API returned an error']);
}
