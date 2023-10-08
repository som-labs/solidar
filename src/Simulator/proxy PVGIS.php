<?PHP
$url = 'https://re.jrc.ec.europa.eu/api/v5_2/seriescalc?&pvcalculation=1&peakpower=1&outputformat=json&startyear=2015'; //&startyear=2016
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

$t2=date("Y/m/d H:i:s");
//Log call
$file = fopen("./log/PVGIScalls.txt", "a");
fwrite($file, $idSesion . ";" . $t1 . ";" . $t2 . ";" . $url . PHP_EOL);
fclose($file);

?>