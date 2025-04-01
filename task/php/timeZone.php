<?php

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $userCountryName = $_POST['countryName'];

    
    $lat = 47.01;
    $lng = 10.2;
    $username = 'adinaavram';

    
    $url = "http://api.geonames.org/timezoneJSON?lat=$lat&lng=$lng&username=$username";

   
    $ch = curl_init();

    
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    
    $response = curl_exec($ch);
    curl_close($ch);

   
    $data = json_decode($response, true);

    
    if (isset($data['countryName'])) {
       
        if (strtolower($userCountryName) == strtolower($data['countryName'])) {
            
            echo "<h3>Information for " . $data['countryName'] . ":</h3>";
            echo "<p>Timezone ID: " . $data['timezoneId'] . "</p>";
            echo "<p>Time: " . $data['time'] . "</p>";
            echo "<p>Country Code: " . $data['countryCode'] . "</p>";
        } else {
            echo "<p>No matching country found. Please check your input.</p>";
        }
    } else {
        echo "<p>Error fetching data from GeoNames API.</p>";
    }
}
?>
