<?php
header('Content-Type: application/json; charset=UTF-8');

if (isset($_POST['lat']) && isset($_POST['lng'])) {
    $lat = $_POST['lat'];
    $lng = $_POST['lng'];
    $username = "adinaavram";

    $url = "http://api.geonames.org/timezoneJSON?lat=" . urlencode($lat) . "&lng=" . urlencode($lng) . "&username=" . urlencode($username);

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL, $url);

    $response = curl_exec($ch);
    curl_close($ch);

    if ($response === false) {
        echo json_encode([
            'status' => 'error',
            'message' => 'cURL Error: ' . curl_error($ch)
        ]);
        exit;
    }

    $data = json_decode($response, true);

    if (isset($data['timezoneId'])) {
        echo json_encode([
            'status' => 'ok',
            'data' => [
                'timezoneId' => $data['timezoneId'] ?? 'N/A',
                'countryName' => $data['countryName'] ?? 'N/A',
                'time' => $data['time'] ?? 'N/A',
                'sunrise' => $data['sunrise'] ?? 'N/A',
                'sunset' => $data['sunset'] ?? 'N/A'
            ]
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Invalid coordinates or missing data.'
        ]);
    }
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'Latitude and Longitude are required.'
    ]);
}
?>


