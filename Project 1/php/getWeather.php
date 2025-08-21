<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $lat = filter_var($_POST['lat'], FILTER_VALIDATE_FLOAT);
    $lon = filter_var($_POST['lon'], FILTER_VALIDATE_FLOAT);

    if ($lat !== false && $lon !== false) {
        $apiKey = "60b5e9ec6028dc5a8c9ad0e59fbedea2";
        $url = "https://api.openweathermap.org/data/2.5/weather?lat={$lat}&lon={$lon}&appid={$apiKey}&units=metric";

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        $response = curl_exec($ch);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            http_response_code(500);
            echo json_encode(["error" => "Curl Error: $error"]);
        } else {
            echo $response;
        }
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Invalid or missing coordinates"]);
    }
} else {
    http_response_code(405); 
    echo json_encode(["error" => "Invalid request method"]);
}
?>
