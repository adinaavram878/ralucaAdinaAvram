<?php

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $north = $_POST['north'] ?? '';
    $south = $_POST['south'] ?? '';
    $east = $_POST['east'] ?? '';
    $west = $_POST['west'] ?? '';

   
    if ($north == 44.1 && $south == 9.9 && $east == 22.48 && $west == 55.2) {

        $url = "http://api.geonames.org/earthquakesJSON?formatted=true&north=$north&south=$south&east=$east&west=$west&username=adinaavram";

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($ch);

        if (curl_errno($ch)) {
            echo "<p>Error: " . curl_error($ch) . "</p>";
        } else {
            $data = json_decode($response, true);
            if (!empty($data['earthquakes'])) {
                foreach ($data['earthquakes'] as $quake) {
                    echo "<p>Datetime: " . $quake['datetime'] . "</p>";
                    echo "<p>Depth: " . $quake['depth'] . "</p>";
                    echo "<p>Longitude: " . $quake['lng'] . "</p>";
                    echo "<p>Latitude: " . $quake['lat'] . "</p>";
                    echo "<p>Magnitude: " . $quake['magnitude'] . "</p>";
                    echo "<p>Source: " . $quake['src'] . "</p>";
                    echo "<br>";
                }
            } else {
                echo "<p>No earthquake data found.</p>";
            }
        }

        curl_close($ch);
    } else {
        echo "<p>Please enter exactly:<br>North = 44.1<br>South = 9.9<br>East = 22.48<br>West = 55.2</p>";
    }
}
?>
