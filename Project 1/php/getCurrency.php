<?php

header('Content-Type: application/json');

$currency = $_GET['currency'] ?? 'USD';
$apiKey = '3c864c951e2a21a7fa71b6c2b2beb61a';

$url = "http://data.fixer.io/api/latest?access_key=$apiKey&symbols=$currency";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);

if (!$data || !$data['success'] || !isset($data['rates'][$currency])) {
    echo json_encode(['error' => 'Failed to retrieve exchange rate']);
    exit;
}

echo json_encode([
    'currency' => $currency,
    'rate' => $data['rates'][$currency]
]);
