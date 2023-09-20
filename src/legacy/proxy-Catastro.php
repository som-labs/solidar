<?PHP
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

$url = "http://ovc.catastro.meh.es/OVCServWeb/OVCWcfCallejero/COVCCallejero.svc/json/Consulta_DNPRC?RefCat=";

$jsonRC = json_decode($datoRC);
$RCobj = $jsonRC->Consulta_RCCOORResult->coordenadas->coord[0];
$RC = $RCobj->pc->pc1 . $RCobj->pc->pc2;
$url = $url . $RC;

//Initialize cURL.
$ch = curl_init();

//Set the URL that you want to GET by using the CURLOPT_URL option.
curl_setopt($ch, CURLOPT_URL, $url);

//Set CURLOPT_RETURNTRANSFER so that the content is returned as a variable.
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

//Set CURLOPT_FOLLOWLOCATION to true to follow redirects.
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

//Execute the request.
$datoFincas = curl_exec($ch);

//Close the cURL handle.
curl_close($ch);

//Print the data out onto the page.
//echo $data;
$jsonFincas = json_decode($datoFincas);
//echo json_encode($jsonFincas->consulta_dnprcResult);
$numeroFincas = $jsonFincas->consulta_dnprcResult->control->cudnp;
$fincas = $jsonFincas->consulta_dnprcResult->lrcdnp->rcdnp;
$datos = '{"fincas":{"numero":' . $numeroFincas . '},';
$i = 0;
$pref = '';
$datos = $datos . '"detalles":[';
foreach($jsonFincas->consulta_dnprcResult->lrcdnp->rcdnp as $finca) {
	if ($i > 0) $pref = ',';
	$datos = $datos . $pref . '{"refcat":"' . $finca->rc->pc1 . $finca->rc->pc2 . $finca->rc->car . $finca->rc->cc1 . $finca->rc->cc2 . '"';
	$ubicacion = $finca->dt->locs->lous->lourb->loint;
	if (property_exists($ubicacion, 'bq')) $datos = $datos . ',"bloque":"' . $ubicacion->bq . '"';
	if (property_exists($ubicacion, 'es')) $datos = $datos . ',"escalera":"' . $ubicacion->es . '"';
	if (property_exists($ubicacion, 'pt')) $datos = $datos . ',"planta":"' . $ubicacion->pt . '"';
	if (property_exists($ubicacion, 'pu')) $datos = $datos . ',"puerta":"' . $ubicacion->pu . '"';
	$datos = $datos . '}';
	$i = $i + 1;
}
$datos = $datos . ']}';
echo $datos;

?>