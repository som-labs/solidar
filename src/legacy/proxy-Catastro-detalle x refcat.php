<?PHP
$urlbase = "http://ovc.catastro.meh.es/OVCServWeb/OVCWcfCallejero/COVCCallejero.svc/json/Consulta_DNPRC?RefCat=";
$t1 = date("Y/m/d H:i:s");
if(isset($_GET['idSesion']))
{
    $idSesion = $_GET['idSesion'];
}

if(isset($_GET['refcat']))
{
	$refcat =  $_GET['refcat'];
}
$url = $urlbase . $refcat;

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

$jsonFincas = json_decode($datoFincas);
//echo json_encode($jsonFincas->consulta_dnprcResult);
$control = $jsonFincas->consulta_dnprcResult->control;
$numeroFincas = $control->cudnp;
if (property_exists($control, 'cucons')) {
	$numeroUnidades = $control->cucons;
} /* else {
	$fincas = $jsonFincas->consulta_dnprcResult->lrcdnp->rcdnp;
} */
$i = 0;
$pref = '';
$datos = '[';
if (property_exists($jsonFincas->consulta_dnprcResult, 'bico')) {
	//echo json_encode($jsonFincas->consulta_dnprcResult->bico->bi->debi);
	$finca = $jsonFincas->consulta_dnprcResult->bico->bi->idbi;
	$refcatLarga = $finca->rc->pc1 . $finca->rc->pc2 . $finca->rc->car . $finca->rc->cc1 . $finca->rc->cc2;
	if ($i > 0) $pref = ',';
	$datos = $datos . $pref . '{"idFinca":"' . $i . '","refcat":"' . $refcatLarga . '"';
	$detalles = $jsonFincas->consulta_dnprcResult->bico->bi->debi;
	$datos = $datos . ',"uso":"' . $detalles->luso . '"';
	$datos = $datos . ',"superficie":"' . $detalles->sfc .'"';

	if (property_exists($detalles, 'cpt')) {
		$datos = $datos . ',"participacion":"' . $detalles->cpt . '"';
	} else {
		$datos = $datos . ',"participacion":"100"';
	};


/* 	$datos = $datos . ',"participacion":"' . $detalles->cpt .'"'; */
	$datos = $datos . ',"tipoConsumo":"Por definir"}';
	$i = $i + 1;

} else if (property_exists($jsonFincas->consulta_dnprcResult, 'lrcdnp')) {

	foreach($jsonFincas->consulta_dnprcResult->lrcdnp->rcdnp as $finca) {
		$refcatLarga = $finca->rc->pc1 . $finca->rc->pc2 . $finca->rc->car . $finca->rc->cc1 . $finca->rc->cc2;
		$url = $urlbase . $refcatLarga;

		if ($i > 0) $pref = ',';
		$datos = $datos . $pref . '{"idFinca":"' . $i . '","refcat":"' . $refcatLarga . '"';
		$ubicacion = $finca->dt->locs->lous->lourb->loint;
		$nombre = "";
		if (property_exists($ubicacion, 'bq')) {
			$datos = $datos . ',"bloque":"' . $ubicacion->bq . '"';
			$nombre = $nombre . 'BL-' . $ubicacion->bq;
		};
		if (property_exists($ubicacion, 'es')) {
			$datos = $datos . ',"escalera":"' . $ubicacion->es . '"';
			$nombre = $nombre . 'ES-' . $ubicacion->es;
		};
		if (property_exists($ubicacion, 'pt')) {
			$datos = $datos . ',"planta":"' . $ubicacion->pt . '"';
			$nombre = $nombre . 'PL-' . $ubicacion->pt;
		};
		if (property_exists($ubicacion, 'pu')) {
			$datos = $datos . ',"puerta":"' . $ubicacion->pu . '"';
			$nombre = $nombre . 'PU-' . $ubicacion->pu;
		};

		$datos = $datos . ',"nombreFinca":"' . $nombre . '"';

	/*     echo "dt: " . json_encode($jsonDetallado->consulta_dnprcResult->bico->bi->debi); */
		$detalles = $finca->debi;
		$datos = $datos . ',"uso":"' . $detalles->luso . '"';
		$datos = $datos . ',"superficie":"' . $detalles->sfc .'"';

		if (property_exists($detalles, 'cpt')) {
			$datos = $datos . ',"participacion":"' . $detalles->cpt . '"}';
		} else {
			$datos = $datos . ',"participacion":"100"}';
		};
		$i = $i + 1;
	}
}
$datos = $datos . ']';
echo $datos;

$t2 = date("Y/m/d H:i:s");
//Log call
$file = fopen("./log/CatastroCalls.txt", "a");
fwrite($file, $idSesion . ";" . $t1 . ";" . $t2 . ";" . $url . PHP_EOL);
fclose($file);

?>