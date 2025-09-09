
<?php

header('Content-Type: application/json');


ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/logs/debug.log'); 
error_reporting(E_ALL); 


function log_debug($message) {
    error_log("[DEBUG] " . $message);
}


if (!isset($_POST['code'])) {
    error_log("Missing country code in POST data.");
    echo json_encode(['error' => 'Missing country code']);
    exit;
}

$code = strtoupper(trim($_POST['code']));
log_debug("Received code: $code");


$restCountriesUrl = "https://restcountries.com/v3.1/all";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $restCountriesUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);

if (curl_errno($ch)) {
    $error = curl_error($ch);
    error_log("cURL error when fetching countries: $error");
    echo json_encode(['error' => 'Failed to fetch country data']);
    curl_close($ch);
    exit;
}
curl_close($ch);


$countries = json_decode($response, true);
if ($countries === null) {
    error_log("Failed to decode country data: " . json_last_error_msg());
    echo json_encode(['error' => 'Invalid country data']);
    exit;
}

$currencyCode = null;
foreach ($countries as $country) {
    if (isset($country['cca3']) && strtoupper($country['cca3']) === $code) {
        if (isset($country['currencies']) && is_array($country['currencies'])) {
            $currencyKeys = array_keys($country['currencies']);
            $currencyCode = $currencyKeys[0];
            log_debug("Found currency code: $currencyCode for country code: $code");
        }
        break;
    }
}

if (!$currencyCode) {
    error_log("Currency not found for country code: $code");
    echo json_encode(['error' => 'Currency not found for country code']);
    exit;
}


$exchangeUrl = "https://api.exchangerate.host/latest?base=USD&symbols={$currencyCode}";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $exchangeUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$exchangeResponse = curl_exec($ch);

if (curl_errno($ch)) {
    $error = curl_error($ch);
    error_log("cURL error when fetching exchange rate: $error");
    echo json_encode(['error' => 'Failed to fetch exchange rate']);
    curl_close($ch);
    exit;
}
curl_close($ch);


$exchangeData = json_decode($exchangeResponse, true);
if (!isset($exchangeData['rates'][$currencyCode])) {
    error_log("Exchange rate not found for currency: $currencyCode");
    echo json_encode(['error' => 'Exchange rate not found']);
    exit;
}




$rate = $exchangeData['rates'][$currencyCode];
log_debug("Exchange rate for $currencyCode: $rate");

echo json_encode([
    'currency' => $currencyCode,
    'rate' => $rate
]);

log_debug("Checking country: " . ($country['cca3'] ?? 'N/A'));

if (isset($country['cca3']) && strtoupper($country['cca3']) === $code) {
    log_debug("Matched country: " . $country['name']['common']);

    if (isset($country['currencies']) && is_array($country['currencies'])) {
        log_debug("Currencies found: " . json_encode($country['currencies']));
        $currencyKeys = array_keys($country['currencies']);
        $currencyCode = $currencyKeys[0];
        log_debug("Selected currency: $currencyCode");
    } else {
        log_debug("No currencies field found for country: " . $country['name']['common']);
    }
    break;
}
