<?PHP
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
  $url = "http://ovc.catastro.meh.es/OVCServWeb/OVCWcfCallejero/COVCCoordenadas.svc/json/Consulta_RCCOOR?SRS=epsg:4326";

if(isset($_GET['coorX']))
{
	$coorX =  $_GET['coorX'];
}
if(isset($_GET['coorY']))
{
	$coorY =  $_GET['coorY'];
}
$url = $url . '&coorX=' . $coorX . '&coorY=' . $coorY;

//Initialize cURL.
$ch = curl_init();

//Set the URL that you want to GET by using the CURLOPT_URL option.
curl_setopt($ch, CURLOPT_URL, $url);

//Set CURLOPT_RETURNTRANSFER so that the content is returned as a variable.
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

//Set CURLOPT_FOLLOWLOCATION to true to follow redirects.
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

//Execute the request.
$datoRC = curl_exec($ch);
//Close the cURL handle.
curl_close($ch);
try {
    $jsonRC = json_decode($datoRC);
    if (isset($jsonRC)){
        $control = $jsonRC->Consulta_RCCOORResult;
        if(isset($control->lerr)) {
            $response = array('codigo' => $control->lerr[0]->cod, 'descripcion' => $control->lerr[0]->des);
        } else if (isset($jsonRC->Consulta_RCCOORResult->coordenadas)) {
            $parcela = $jsonRC->Consulta_RCCOORResult->coordenadas->coord[0];
            $RC = $parcela->pc->pc1 . $parcela->pc->pc2;
            $direccion = $parcela->ldt;
            
            $response = array('codigo' => 0, 'refcat' => $RC, 'direccion' => $direccion);
        } else {
            $response = array('codigo' => -1, 'descripcion' => $jsonRC);
        }
    } else {
        $response = array('codigo' => -3, 'descripcion' => $datoRC);
    }
}
catch(Exception $e) {
    $response = array('codigo' => -2, 'descripcion' => $e->getMessage . "\n" . $jsonRC);
}
echo json_encode($response);

?>