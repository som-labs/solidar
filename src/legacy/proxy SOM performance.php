<?PHP
//$url = 'https://apinergia.somenergia.coop/tariff?type=[2.0TD o 3.0TD]';


$urlBase = 'https://apinergia.somenergia.coop/tariff?';
if(isset($_GET['nombre']))
{
	$nombre = $_GET['nombre'];
}

for ($x = 0; $x <= 1; $x++) {

    $starttime = microtime(true);
    $t1=date("Y/m/d H:i:s");
    echo "Entrada: " . $t1 . "<br>";

    if ($nombre[0] == "2") {
        $nombre[0] = "3";
    } else { 
        $nombre[0] = "2";
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

    /* echo $serviceData . "\r\n";
    echo "<br>"; */
    $tarifa = json_decode($serviceData);

    $tmp = $tarifa->data[0]->prices->current->autoconsumo->P1->value . ",";
    foreach($tarifa->data as $unidad) {
        foreach($unidad->prices->current->activeEnergy as $clave=>$valor) {
    /*         echo $clave . "-->" . $valor->value . "<br>"; */
            $tmp = $tmp . $valor->value . ",";
        }
//        $tmp = $tmp . $unidad->prices->current->autoconsumo->P1->value;
        echo "Tarifa: " . $nombre .  " : " . $tmp . "<br>";
    /*     echo "P1: " . $unidad->prices->current->activeEnergy->P1->value . "--" . $unidad->prices->current->autoconsumo->P1->value . "<br>";
        echo "P2: " . $unidad->prices->current->activeEnergy->P2->value . "--" . $unidad->prices->current->autoconsumo->P2->value . "<br>";
        echo "P3: " . $unidad->prices->current->activeEnergy->P3->value . "--" . $unidad->prices->current->autoconsumo->P3->value . "<br>"; */
    }

    $endtime = microtime(true);
    $timediff = $endtime - $starttime;
    $t2=date("Y/m/d H:i:s");
    echo "Salida: " . $t2 . "<br>";
    echo "Tarda: " . $timediff . " seg.<br>";
    sleep (5);

}
?>
