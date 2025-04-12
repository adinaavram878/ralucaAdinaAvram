<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $north = $_POST['north'] ?? '';
    $south = $_POST['south'] ?? '';
    $east = $_POST['east'] ?? '';
    $west = $_POST['west'] ?? '';

    if ($north && $south && $east && $west) {
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
                echo "<h3>Earthquake Results:</h3>";
                foreach ($data['earthquakes'] as $quake) {
                    echo "<p><strong>Datetime:</strong> " . htmlspecialchars($quake['datetime']) . "</p>";
                    echo "<p><strong>Depth:</strong> " . htmlspecialchars($quake['depth']) . " km</p>";
                    echo "<p><strong>Latitude:</strong> " . htmlspecialchars($quake['lat']) . "</p>";
                    echo "<p><strong>Longitude:</strong> " . htmlspecialchars($quake['lng']) . "</p>";
                    echo "<p><strong>Magnitude:</strong> " . htmlspecialchars($quake['magnitude']) . "</p>";
                    echo "<p><strong>Source:</strong> " . htmlspecialchars($quake['src']) . "</p>";
                    echo "<hr>";
                }
            } else {
                echo "<p>No earthquake data found for these coordinates.</p>";
            }
        }

        curl_close($ch);
    } else {
        echo "<p>Please fill in all fields.</p>";
    }
} else {
    echo "<p>Invalid request method.</p>";
}
?>
