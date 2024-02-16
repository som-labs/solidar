<?PHP
//$url = 'https://apinergia.somenergia.coop/tariff?type=[2.0TD o 3.0TD]';
// Allow from any origin
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

$urlBase = 'https://apinergia.somenergia.coop/tariff?';
if(isset($_GET['nombre']))
{
	$nombre = $_GET['nombre'];
}

    $url = $urlBase . 'type=' . $nombre;
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
    $tarifa = json_decode($serviceData);
    $tmp = $tarifa->data[0]->prices->current->autoconsumo->P1->value . ",";
    foreach($tarifa->data as $unidad) {
        foreach($unidad->prices->current->activeEnergy as $clave=>$valor) {
            $tmp = $tmp . $valor->value . ",";
        }
        echo substr($tmp, 0, -1);
    }
?>
