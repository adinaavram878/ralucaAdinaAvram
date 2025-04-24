<?php
header('Content-Type: application/json; charset=UTF-8');

$username = 'adinaavram';


$requiredFields = ['north', 'south', 'east', 'west'];
foreach ($requiredFields as $field) {
    if (empty($_POST[$field])) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Missing required field: ' . $field
        ]);
        exit;
    }
}


$north = $_POST['north'];
$south = $_POST['south'];
$east = $_POST['east'];
$west = $_POST['west'];


$url = "http://api.geonames.org/earthquakesJSON?" . http_build_query([
    'formatted' => 'true',
    'north' => $north,
    'south' => $south,
    'east' => $east,
    'west' => $west,
    'username' => $username
]);


$ch = curl_init();
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);
$response = curl_exec($ch);
curl_close($ch);

if ($response === false) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Error fetching data from GeoNames.'
    ]);
    exit;
}

$data = json_decode($response, true);


if (isset($data['earthquakes']) && is_array($data['earthquakes']) && count($data['earthquakes']) > 0) {
    $formatted = array_map(function ($quake) {
        return [
            'datetime' => $quake['datetime'] ?? 'N/A',
            'depth' => $quake['depth'] ?? 'N/A',
            'lat' => $quake['lat'] ?? 'N/A',
            'lng' => $quake['lng'] ?? 'N/A',
            'magnitude' => $quake['magnitude'] ?? 'N/A',
            'src' => $quake['src'] ?? 'N/A'
        ];
    }, $data['earthquakes']);

    echo json_encode([
        'status' => 'ok',
        'data' => $formatted
    ]);
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'No earthquake data found for the provided coordinates.'
    ]);
}
?>
