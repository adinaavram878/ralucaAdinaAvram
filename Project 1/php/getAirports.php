
<?php
header('Content-Type: application/json; charset=UTF-8');
ini_set('display_errors', 'On');
error_reporting(E_ALL);

if (!isset($_POST['countryCode'])) {
    echo json_encode([
        'status' => [
            'code' => '400',
            'name' => 'error',
            'description' => 'Missing country code parameter'
        ]
    ]);
    exit;
}

$countryCode = strtoupper(trim($_POST['countryCode']));
$username = 'adinaavram'; 


$url = "http://api.geonames.org/searchJSON?country={$countryCode}&featureCode=AIRP&maxRows=100&username={$username}";


$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 30);


$result = curl_exec($ch);

if (curl_errno($ch)) {
    curl_close($ch);
    echo json_encode([
        'status' => [
            'code' => '500',
            'name' => 'error',
            'description' => 'Failed to fetch airports from GeoNames API'
        ]
    ]);
    exit;
}

curl_close($ch);

$data = json_decode($result, true);

if (!isset($data['geonames']) || !is_array($data['geonames'])) {
    echo json_encode([
        'type' => 'FeatureCollection',
        'features' => []
    ]);
    exit;
}


$features = [];
foreach ($data['geonames'] as $airport) {
    $features[] = [
        'type' => 'Feature',
        'properties' => [
            'name' => $airport['name'] ?? 'Airport',
            'countryCode' => strtolower($countryCode),
            'ISO_A2' => $countryCode,
            'type' => 'airport'
        ],
        'geometry' => [
            'type' => 'Point',
            'coordinates' => [
                floatval($airport['lng'] ?? 0),
                floatval($airport['lat'] ?? 0)
            ]
        ]
    ];
}

$geojson = [
    'type' => 'FeatureCollection',
    'features' => $features
];

echo json_encode($geojson);
?>

