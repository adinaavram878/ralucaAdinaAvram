<?php
header('Content-Type: application/json; charset=UTF-8');

$currencyMap = [
    'afg' => 'AFN', 'alb' => 'ALL', 'dza' => 'DZD', 'and' => 'EUR', 'ago' => 'AOA',
    'atg' => 'XCD', 'arg' => 'ARS', 'arm' => 'AMD', 'aus' => 'AUD', 'aut' => 'EUR',
    'aze' => 'AZN', 'bhs' => 'BSD', 'bhr' => 'BHD', 'bgd' => 'BDT', 'brb' => 'BBD',
    'blr' => 'BYN', 'bel' => 'EUR', 'blz' => 'BZD', 'ben' => 'XOF', 'btn' => 'INR',
    'bol' => 'BOB', 'bih' => 'BAM', 'bwa' => 'BWP', 'bra' => 'BRL', 'brn' => 'BND',
    'bgr' => 'BGN', 'bfa' => 'XOF', 'bdi' => 'BIF', 'cpv' => 'CVE', 'khm' => 'KHR',
    'cmr' => 'XAF', 'can' => 'CAD', 'caf' => 'XAF', 'tcd' => 'XAF', 'chl' => 'CLP',
    'chn' => 'CNY', 'col' => 'COP', 'com' => 'KMF', 'cog' => 'XAF', 'cod' => 'CDF',
    'cri' => 'CRC', 'hrv' => 'HRK', 'cub' => 'CUP', 'cyp' => 'EUR', 'cze' => 'CZK',
    'dnk' => 'DKK', 'dji' => 'DJF', 'dma' => 'XCD', 'dom' => 'DOP', 'ecu' => 'USD',
    'egy' => 'EGP', 'slv' => 'USD', 'gnq' => 'XAF', 'eri' => 'ERN', 'est' => 'EUR',
    'swz' => 'SZL', 'eth' => 'ETB', 'fji' => 'FJD', 'fin' => 'EUR', 'fra' => 'EUR',
    'gab' => 'XAF', 'gmb' => 'GMD', 'geo' => 'GEL', 'deu' => 'EUR', 'gha' => 'GHS',
    'grc' => 'EUR', 'grd' => 'XCD', 'gtm' => 'GTQ', 'gin' => 'GNF', 'gnb' => 'XOF',
    'guy' => 'GYD', 'hti' => 'HTG', 'hnd' => 'HNL', 'hun' => 'HUF', 'isl' => 'ISK',
    'ind' => 'INR', 'idn' => 'IDR', 'irn' => 'IRR', 'irq' => 'IQD', 'irl' => 'EUR',
    'isr' => 'ILS', 'ita' => 'EUR', 'jam' => 'JMD', 'jpn' => 'JPY', 'jor' => 'JOD',
    'kaz' => 'KZT', 'ken' => 'KES', 'kir' => 'AUD', 'prk' => 'KPW', 'kor' => 'KRW',
    'kwt' => 'KWD', 'kgz' => 'KGS', 'lao' => 'LAK', 'lva' => 'EUR', 'lbn' => 'LBP',
    'lso' => 'LSL', 'lbr' => 'LRD', 'lby' => 'LYD', 'lie' => 'CHF', 'ltu' => 'EUR',
    'lux' => 'EUR', 'mdg' => 'MGA', 'mwi' => 'MWK', 'mys' => 'MYR', 'mdv' => 'MVR',
    'mli' => 'XOF', 'mlt' => 'EUR', 'mhl' => 'USD', 'mrt' => 'MRU', 'mus' => 'MUR',
    'mex' => 'MXN', 'fsm' => 'USD', 'mda' => 'MDL', 'mco' => 'EUR', 'mng' => 'MNT',
    'mne' => 'EUR', 'mar' => 'MAD', 'moz' => 'MZN', 'mmr' => 'MMK', 'nam' => 'NAD',
    'nru' => 'AUD', 'npl' => 'NPR', 'nld' => 'EUR', 'nzl' => 'NZD', 'nic' => 'NIO',
    'ner' => 'XOF', 'nga' => 'NGN', 'nor' => 'NOK', 'omn' => 'OMR', 'pak' => 'PKR',
    'plw' => 'USD', 'pan' => 'PAB', 'png' => 'PGK', 'pry' => 'PYG', 'per' => 'PEN',
    'phl' => 'PHP', 'pol' => 'PLN', 'prt' => 'EUR', 'qat' => 'QAR', 'rou' => 'RON',
    'rus' => 'RUB', 'rwa' => 'RWF', 'kna' => 'XCD', 'lca' => 'XCD', 'vct' => 'XCD',
    'ws' => 'WST', 'smr' => 'EUR', 'stp' => 'STN', 'sau' => 'SAR', 'sen' => 'XOF',
    'srb' => 'RSD', 'syc' => 'SCR', 'sle' => 'SLL', 'sgp' => 'SGD', 'svk' => 'EUR',
    'svn' => 'EUR', 'slb' => 'SBD', 'som' => 'SOS', 'zaf' => 'ZAR', 'ssd' => 'SSP',
    'esp' => 'EUR', 'lka' => 'LKR', 'sdn' => 'SDG', 'sur' => 'SRD', 'swe' => 'SEK',
    'che' => 'CHF', 'syr' => 'SYP', 'tjk' => 'TJS', 'tza' => 'TZS', 'tha' => 'THB',
    'tls' => 'USD', 'tgo' => 'XOF', 'ton' => 'TOP', 'tto' => 'TTD', 'tun' => 'TND',
    'tur' => 'TRY', 'tkm' => 'TMT', 'tuv' => 'AUD', 'uga' => 'UGX', 'ukr' => 'UAH',
    'are' => 'AED', 'gbr' => 'GBP', 'usa' => 'USD', 'ury' => 'UYU', 'uzb' => 'UZS',
    'vut' => 'VUV', 'vat' => 'EUR', 'ven' => 'VES', 'vnm' => 'VND', 'yem' => 'YER',
    'zmb' => 'ZMW', 'zwe' => 'ZWL'
];

$code = '';
if (!empty($_POST['countryCode'])) {
    $code = strtolower(trim($_POST['countryCode']));
} elseif (!empty($_POST['code'])) {
    $code = strtolower(trim($_POST['code']));
} else {
    $input = json_decode(file_get_contents('php://input'), true);
    $code = isset($input['code']) ? strtolower(trim($input['code'])) : '';
}

if (empty($code)) {
    echo json_encode(['error' => 'No country code provided']);
    exit;
}

if (!isset($currencyMap[$code])) {
    echo json_encode(['error' => 'Currency not found for country: ' . $code]);
    exit;
}

$currency = $currencyMap[$code];
$apiKey = '3c864c951e2a21a7fa71b6c2b2beb61a';
$url = "http://data.fixer.io/api/latest?access_key=$apiKey&symbols=$currency";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);

if (!$data || !isset($data['rates'][$currency])) {
    echo json_encode(['error' => 'Failed to fetch exchange rate', 'currency' => $currency]);
    exit;
}

$rate = 1 / $data['rates'][$currency];

echo json_encode([
    'currency' => $currency,
    'rate' => round($rate, 4)
]);
?>
