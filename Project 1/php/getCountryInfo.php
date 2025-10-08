<?php
header('Content-Type: application/json; charset=UTF-8');


if (isset($_POST['latitude']) && isset($_POST['longitude'])) {
    $lat = $_POST['latitude'];
    $lon = $_POST['longitude'];

    $apiKey = "Yb4b47890259a41f5a7c00e98f2b2f15b";
    $url = "https://api.opencagedata.com/geocode/v1/json?q=" . urlencode($lat) . "+" . urlencode($lon) . "&key=" . urlencode($apiKey);

    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL, $url);

    $response = curl_exec($ch);

    if ($response === false) {
        echo json_encode([
            'status' => 'error',
            'message' => 'cURL Error: ' . curl_error($ch)
        ]);
        curl_close($ch);
        exit;
    }

    curl_close($ch);
    $data = json_decode($response, true);

    if (
        isset($data['results'][0]['components']) &&
        !empty($data['results'][0]['components'])
    ) {
        $components = $data['results'][0]['components'];
        $country = $components['country'] ?? 'N/A';
        $countryCode = $components['ISO_3166-1_alpha-2'] ?? 'N/A';
        $continent = $components['continent'] ?? 'N/A';
        $timezone = $data['results'][0]['annotations']['timezone']['name'] ?? 'N/A';

        echo json_encode([
            'status' => 'ok',
            'data' => [
                'latitude' => $lat,
                'longitude' => $lon,
                'country' => $country,
                'countryCode' => $countryCode
            ]
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Location data not found or incomplete.'
        ]);
    }

} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'Required POST parameters: latitude and longitude.'
    ]);
}
?>
