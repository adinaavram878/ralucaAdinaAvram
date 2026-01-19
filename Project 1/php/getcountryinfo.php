<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);


if (!isset($_POST['country'])) {
    echo json_encode([
        'status' => [
            'code' => "400",
            'name' => "error",
            'description' => "Missing required parameter: country"
        ]
    ]);
    exit;
}


$lang = isset($_POST['lang']) ? $_POST['lang'] : 'en';
$country = $_POST['country'];


$url = 'http://api.geonames.org/countryInfoJSON?formatted=true&lang=' . urlencode($lang) .
       '&country=' . urlencode($country) . '&username=flightltd&style=full';


$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);
curl_close($ch);

if ($result === false) {
    echo json_encode([
        'status' => [
            'code' => "500",
            'name' => "error",
            'description' => "Failed to contact GeoNames API"
        ]
    ]);
    exit;
}

$decode = json_decode($result, true);

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
$output['data'] = $decode['geonames'];

header('Content-Type: application/json; charset=UTF-8');
echo json_encode($output);
?>
