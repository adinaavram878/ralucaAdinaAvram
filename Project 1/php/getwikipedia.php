<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

$countryName = $_POST['countryName'] ?? '';
error_log("Country name received: " . $countryName);

if (!$countryName) {
    $output['status'] = [
        'code' => '400',
        'name' => 'error',
        'description' => 'No country name provided'
    ];
    echo json_encode($output);
    exit;
}

$username = 'adinaavram';
$url = "http://api.geonames.org/wikipediaSearchJSON?q=" . urlencode($countryName) . "&maxRows=1&username={$username}";

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);
$result = curl_exec($ch);

if ($result === false) {
    $output['status'] = [
        'code' => '500',
        'name' => 'error',
        'description' => 'Failed to fetch data: ' . curl_error($ch)
    ];
    echo json_encode($output);
    curl_close($ch);
    exit;
}

curl_close($ch);
$data = json_decode($result, true);

if (!isset($data['geonames'][0])) {
    $output['status'] = [
        'code' => '404',
        'name' => 'error',
        'description' => 'No Wikipedia entry found'
    ];
    echo json_encode($output);
    exit;
}

$wiki = $data['geonames'][0];

$output = [
    'status' => [
        'code' => '200',
        'name' => 'ok',
        'description' => 'success',
        'returnedIn' => intval((microtime(true) - $executionStartTime) * 1000) . ' ms'
    ],
    'data' => [
        'title' => $wiki['title'] ?? 'No title available',
        'summary' => $wiki['summary'] ?? 'No summary available.',
        'url' => isset($wiki['wikipediaUrl']) ? 'https://' . $wiki['wikipediaUrl'] : null
    ]
];

header('Content-Type: application/json; charset=UTF-8');
echo json_encode($output);
