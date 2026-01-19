<?php
header('Content-Type: application/json; charset=UTF-8');


$currencies = [
    'ARS' => 'Argentine Peso',
    'AUD' => 'Australian Dollar',
    'BHD' => 'Bahraini Dinar',
    'BWP' => 'Botswana Pula',
    'BRL' => 'Brazilian Real',
    'BND' => 'Bruneian Dollar',
    'BGN' => 'Bulgarian Lev',
    'CAD' => 'Canadian Dollar',
    'CLP' => 'Chilean Peso',
    'CNY' => 'Chinese Yuan Renminbi',
    'COP' => 'Colombian Peso',
    'CZK' => 'Czech Koruna',
    'DKK' => 'Danish Krone',
    'AED' => 'Emirati Dirham',
    'EUR' => 'Euro',
    'HKD' => 'Hong Kong Dollar',
    'HUF' => 'Hungarian Forint',
    'ISK' => 'Icelandic Krona',
    'INR' => 'Indian Rupee',
    'IDR' => 'Indonesian Rupiah',
    'IRR' => 'Iranian Rial',
    'ILS' => 'Israeli Shekel',
    'JPY' => 'Japanese Yen',
    'KZT' => 'Kazakhstani Tenge',
    'KWD' => 'Kuwaiti Dinar',
    'LYD' => 'Libyan Dinar',
    'MYR' => 'Malaysian Ringgit',
    'MUR' => 'Mauritian Rupee',
    'MXN' => 'Mexican Peso',
    'NPR' => 'Nepalese Rupee',
    'NZD' => 'New Zealand Dollar',
    'NOK' => 'Norwegian Krone',
    'OMR' => 'Omani Rial',
    'PKR' => 'Pakistani Rupee',
    'PHP' => 'Philippine Peso',
    'PLN' => 'Polish Zloty',
    'QAR' => 'Qatari Riyal',
    'RON' => 'Romanian New Leu',
    'RUB' => 'Russian Ruble',
    'SAR' => 'Saudi Arabian Riyal',
    'SGD' => 'Singapore Dollar',
    'ZAR' => 'South African Rand',
    'KRW' => 'South Korean Won',
    'LKR' => 'Sri Lankan Rupee',
    'SEK' => 'Swedish Krona',
    'CHF' => 'Swiss Franc',
    'TWD' => 'Taiwan New Dollar',
    'THB' => 'Thai Baht',
    'TTD' => 'Trinidadian Dollar',
    'TRY' => 'Turkish Lira',
    'GBP' => 'British Pound',
    'USD' => 'US Dollar'
];


$apiKey = '3c864c951e2a21a7fa71b6c2b2beb61a';
$symbols = implode(',', array_keys($currencies));
$url = "http://data.fixer.io/api/latest?access_key=$apiKey&symbols=$symbols";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200 || !$response) {
    echo json_encode(['error' => 'Failed to fetch exchange rates from API']);
    exit;
}

$data = json_decode($response, true);

if (!$data || !isset($data['rates']) || !$data['success']) {
    echo json_encode(['error' => 'Invalid response from exchange rate API']);
    exit;
}


$result = [];
foreach ($currencies as $code => $name) {
    if (isset($data['rates'][$code])) {
        $result[] = [
            'code' => $code,
            'name' => $name,
            'rate' => $data['rates'][$code]
        ];
    }
}

echo json_encode([
    'success' => true,
    'base' => $data['base'], 
    'currencies' => $result
]);
?>
