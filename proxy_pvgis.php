// test line
// proxy_pvgis.php?idSesion=1781766025043&lat=40.4505&lon=-3.6995&angle=20&aspect=-87&loss=20&pvtechchoice=crystSi

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

$url = 'https://re.jrc.ec.europa.eu/api/v5_3/seriescalc?&pvcalculation=1&peakpower=1&outputformat=json&startyear=2015'; //&startyear=2016
$t1=date("Y/m/d H:i:s");
if(isset($_GET['idSesion']))
{
	$idSesion = $_GET['idSesion'];
}
if(isset($_GET['pvtechchoice']))
{
	$pvtechchoice =  $_GET['pvtechchoice'];
}
if(isset($_GET['lat']))
{
	$lat =  $_GET['lat'];
}
if(isset($_GET['lon']))
{
	$lon =  $_GET['lon'];
}
if(isset($_GET['loss']))
{
    $loss = $_GET['loss'];
} else {
	$loss = "14";
}
if(isset($_GET['angle']))
{
    $angle = "angle=" . $_GET['angle'];
	$angleNoPresent = false;
} else {
	$angle = "optimalinclination=1";
	$angleNoPresent = true;
}
if(isset($_GET['aspect']))
{
    $aspect = "aspect=" . $_GET['aspect'];
	$aspectNoPresent = false;
} else {
	$aspect = "aspect=0";
	$aspectNoPresent = true;
}

if ($aspectNoPresent && $angleNoPresent) 
{
	$url = $url . '&lat=' . $lat . '&lon=' . $lon . '&loss=' . $loss . '&optimalangles=1' . '&pvtechchoice=' . $pvtechchoice;
} else {
	$url = $url . '&lat=' . $lat . '&lon=' . $lon . '&loss=' . $loss . '&' . $angle . '&' . $aspect . '&pvtechchoice=' . $pvtechchoice;
}

//Initialize cURL.
$ch = curl_init();

//Set the URL that you want to GET by using the CURLOPT_URL option.
curl_setopt($ch, CURLOPT_URL, $url);

//Set CURLOPT_RETURNTRANSFER so that the content is returned as a variable.
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

//Set CURLOPT_FOLLOWLOCATION to true to follow redirects.
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

//Execute the request.
$data = curl_exec($ch);

//Close the cURL handle.
curl_close($ch);

//Print the data out onto the page.
echo $data;

// Buscar config.local.php en el directorio padre de dist/
// El contenido del fichero config.local.php debe ser algo como:

// <?php para Windows
// define('PVGIS_LOG_PATH', __DIR__ . '/.log/PVGIScalls.txt');
// <?php entorno test
// define('PVGIS_LOG_PATH', '/var/log/solidar/PVGIScalls_test.txt');
// <?php entorno debug
// define('PVGIS_LOG_PATH', '/var/log/solidar/PVGIScalls_debug.txt');

//dependiendo del entorno. Si no existe, por ejemplo producción será /var/log/solidar/PVGIScalls.txt

$configFile = dirname(__DIR__) . '/solidar/config.local.php';
// echo dirname(__DIR__) . "\n";
// echo $configFile . "\n";

if (file_exists($configFile)) {
    // echo "Existe\n";
    require_once $configFile;
}

if (!defined('PVGIS_LOG_PATH')) {
    // echo "No esta definido PVGIS_LOG_PATH\n";
    define('PVGIS_LOG_PATH', '/var/log/solidar/PVGIScalls.txt');
}

// echo PVGIS_LOG_PATH;
$logFile = PVGIS_LOG_PATH;

$t2=date("Y/m/d H:i:s");
//Log call
$file = fopen($logFile, "a"); // development

fwrite($file, $idSesion . ";" . $t1 . ";" . $t2 . ";" . $url . PHP_EOL);
fclose($file);

?>