<?php

    ini_set('display_errors', 'On');
    error_reporting(E_ALL);

    $executionStartTime = microtime(true);

    if (!isset($_REQUEST['country'])) {
        $output['status']['code'] = "400";
        $output['status']['name'] = "error";
        $output['status']['description'] = "Missing required parameter: country";
        echo json_encode($output, JSON_PRETTY_PRINT);
        exit;
    }

    $countryParam = trim($_REQUEST['country']);

   
    $isCode = strlen($countryParam) <= 3;

 
    if ($isCode) {
        $url = 'https://restcountries.com/v3.1/alpha/' . urlencode($countryParam);
    } else {
        $url = 'https://restcountries.com/v3.1/name/' . urlencode($countryParam) . '?fullText=true';
    }

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL, $url);

    $result = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $output = [];
    $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";

    $countryData = null;

    if ($httpCode === 200) {
        $decode = json_decode($result, true);

       
        if (is_array($decode) && !empty($decode)) {
            $country = $decode[0];

            $code3 = $country['cca3'] ?? '';
            $code2 = $country['cca2'] ?? '';

            $countryData = [
                'countryName' => $country['name']['common'] ?? 'Unknown',
                'officialName' => $country['name']['official'] ?? '',
                'countryCode' => strtoupper($code3 ?: $code2),
                'capital' => isset($country['capital'][0]) ? $country['capital'][0] : 'N/A',
                'region' => $country['region'] ?? 'N/A',
                'subregion' => $country['subregion'] ?? 'N/A',
                'population' => $country['population'] ?? 0,
                'area' => $country['area'] ?? 0,
                'languages' => isset($country['languages']) ? implode(', ', $country['languages']) : 'N/A',
                'flag' => $country['flags']['png'] ?? $country['flags']['svg'] ?? ''
            ];
        }
    }

    if ($countryData) {
        $output['status']['code'] = "200";
        $output['status']['name'] = "ok";
        $output['status']['description'] = "success";
        $output['data'] = $countryData;
    } else {
        $output['status']['code'] = "404";
        $output['status']['name'] = "not found";
        $output['status']['description'] = "No matching country found for: " . $countryParam;
        $output['data'] = null;
    }

    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode($output, JSON_PRETTY_PRINT);

?>
