<?php

$url = "http://api.geonames.org/earthquakesJSON?formatted=true&north=44.1&south=-9.9&east=-22.4&west=55.2&username=adinaavram";


$ch = curl_init();


curl_setopt($ch, CURLOPT_URL, $url);            
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); 


$resp = curl_exec($ch);


if ($e = curl_error($ch)) {
    echo "Error: " . $e;  
} else {
    
    $decoded = json_decode($resp, true);

    
    if (isset($decoded['earthquakes']) && is_array($decoded['earthquakes'])) {
        
        $userMagnitude = isset($_POST['magnitude']) ? floatval($_POST['magnitude']) : null;

        if ($userMagnitude !== null) {
            $resultsFound = false;

            
            foreach ($decoded['earthquakes'] as $earthquake) {
                $magnitude = isset($earthquake['magnitude']) ? $earthquake['magnitude'] : 'No data';

                
                if ($magnitude == $userMagnitude) {
                    $datetime = isset($earthquake['datetime']) ? $earthquake['datetime'] : 'No data';
                    $depth = isset($earthquake['depth']) ? $earthquake['depth'] : 'No data';
                    $lng = isset($earthquake['lng']) ? $earthquake['lng'] : 'No data';
                    $src = isset($earthquake['src']) ? $earthquake['src'] : 'No data';
                    $eqid = isset($earthquake['eqid']) ? $earthquake['eqid'] : 'No data';
                    $lat = isset($earthquake['lat']) ? $earthquake['lat'] : 'No data';

                    
                    echo "<div class='earthquake-item'>
                            <h3>Earthquake Details</h3>
                            <p><strong>Datetime:</strong> " . $datetime . "</p>
                            <p><strong>Depth (km):</strong> " . $depth . "</p>
                            <p><strong>Longitude:</strong> " . $lng . "</p>
                            <p><strong>Source:</strong> " . $src . "</p>
                            <p><strong>EQID:</strong> " . $eqid . "</p>
                            <p><strong>Magnitude:</strong> " . $magnitude . "</p>
                            <p><strong>Latitude:</strong> " . $lat . "</p>
                          </div>";

                    $resultsFound = true;
                }
            }

           
            if (!$resultsFound) {
                echo "<p>No earthquakes found with the specified magnitude: " . $userMagnitude . "</p>";
            }
        } else {
            echo "<p>Please enter a magnitude value in the form.</p>";
        }
    } else {
        echo "<p>No earthquake data found.</p>";
    }
}


curl_close($ch);
?>
