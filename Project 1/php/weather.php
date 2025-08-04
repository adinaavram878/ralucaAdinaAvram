<?php
if (!isset($_GET['lat']) || !isset($_GET['lon'])) {
  http_response_code(400);
  echo json_encode(['error' => 'Missing coordinates']);
  exit;
}

$lat = $_GET['lat'];
$lon = $_GET['lon'];
$apikey = '60b5e9ec6028dc5a8c9ad0e59fbedea2';

function getJson($url) {
  $opts = ["http" => ["method" => "GET", "header" => "User-Agent: PHP"]];
  return json_decode(file_get_contents($url, false, stream_context_create($opts)), true);
}

$currentUrl = "https://api.openweathermap.org/data/2.5/weather?lat=$lat&lon=$lon&units=metric&appid=$apikey";
$forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?lat=$lat&lon=$lon&units=metric&appid=$apikey";

header('Content-Type: application/json');
echo json_encode([
  'current' => getJson($currentUrl),
  'forecast' => getJson($forecastUrl)
]);
