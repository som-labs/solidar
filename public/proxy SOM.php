<?PHP
//$url = 'https://apinergia.somenergia.coop/tariff?type=[2.0TD o 3.0TD]';
// Allow from any origin

    header('Content-Type: application/json');

if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');    // cache for 1 day
}

// Access-Control headers are received during OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");

    exit(0);
}

$url = 'https://apinergia.somenergia.coop/tariff';

    //Initialize cURL.
    $ch = curl_init();
    //Set the URL that you want to GET by using the CURLOPT_URL option.
    curl_setopt($ch, CURLOPT_URL, $url);
    //Set CURLOPT_RETURNTRANSFER so that the content is returned as a variable.
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    //Set CURLOPT_FOLLOWLOCATION to true to follow redirects.
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    //Execute the request.
    $serviceData = curl_exec($ch);
    //Close the cURL handle.
    curl_close($ch);
    //Print the data out onto the page.
    $tarifas = json_decode($serviceData);

    $data = [];

    $tmp = "{";
    if ($tarifas->count > 0) {
        foreach($tarifas->data as $tarifa) {
            if ($tarifa->tariffPriceId == 43) { $nombre = "2.0TD"; } 
            else if ($tarifa->tariffPriceId == 44) { $nombre = "3.0TD";}
            else {$nombre = "";};
            if ($nombre != "") {
                $data[$nombre] = [];
                $data[$nombre][] = $tarifa->prices->current->autoconsumo->P1->value;
                $tmp = $tmp . "'" . $nombre . "':["  . $tarifa->prices->current->autoconsumo->P1->value;
                foreach($tarifa->prices->current->activeEnergy as $clave=>$valor) {
                    $data[$nombre][] = $valor->value;
                    $tmp = $tmp . "," . $valor->value;
                }
                $tmp = $tmp . "],";
            }
        }
        echo json_encode($data);
        //echo json_encode(substr($tmp, 0, -1) . "}");
    } else {
        echo json_encode("{'error':'" . $serviceData . "'}");
    }
?>
