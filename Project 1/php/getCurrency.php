<?php
header('Content-Type: application/json; charset=UTF-8');

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);


$input = json_decode(file_get_contents('php://input'), true);
$targetCurrency = $input['code'] ?? 'USD';

$apiKey = '3c864c951e2a21a7fa71b6c2b2beb61a';
$url = "http://data.fixer.io/api/latest?access_key=$apiKey&symbols=USD,$targetCurrency";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);


if (!$data || !isset($data['rates']['USD']) || !isset($data['rates'][$targetCurrency])) {
    echo json_encode([
        'error' => 'Invalid response from Fixer API',
    ]);
    exit;
}

$eurToUsd = $data['rates']['USD'];
$eurToTarget = $data['rates'][$targetCurrency];


$usdToTarget = $eurToTarget / $eurToUsd;

echo json_encode([
    'currency' => $targetCurrency,
    'rate' => $usdToTarget
]);

