<?php
header('Content-Type: application/json');


$code = strtolower($_POST['code'] ?? '');


$currencyFilePath = __DIR__ . '/data/currencies.json';
$currencyJson = file_get_contents($currencyFilePath);

if ($currencyJson === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to load currency data']);
    exit;
}

$currencyData = json_decode($currencyJson, true);

if (!is_array($currencyData)) {
    http_response_code(500);
    echo json_encode(['error' => 'Invalid currency data format']);
    exit;
}


if (array_key_exists($code, $currencyData)) {
    echo json_encode($currencyData[$code]);
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Currency info not found']);
}
