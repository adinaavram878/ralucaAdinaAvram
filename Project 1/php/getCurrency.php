<?php
header('Content-Type: application/json');


$code = strtolower($_POST['code'] ?? '');

if (!$code) {
    http_response_code(400);
    echo json_encode(['error' => 'No country code provided']);
    exit;
}


$countryToCurrency = [
    'us' => 'USD',
    'uk' => 'GBP',
    'jp' => 'JPY',
    'au' => 'AUD',
    'in' => 'INR',
   
];


if (!array_key_exists($code, $countryToCurrency)) {
    http_response_code(404);
    echo json_encode(['error' => 'Currency info not found for selected country']);
    exit;
}

$targetCurrency = $countryToCurrency[$code];


$apiKey = '11a988414c53085eeb82cfb0'; 


$url = "https://openexchangerates.org/api/latest.json?app_id=$apiKey";


$response = file_get_contents($url);

if ($response === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch exchange rates']);
    exit;
}

$data = json_decode($response, true);

if (!isset($data['rates'][$targetCurrency])) {
    http_response_code(500);
    echo json_encode(['error' => 'Target currency not found in exchange rates']);
    exit;
}

$rate = $data['rates'][$targetCurrency];

echo json_encode([
    'currency' => $targetCurrency,
    'rate' => round($rate, 4) 
]);
