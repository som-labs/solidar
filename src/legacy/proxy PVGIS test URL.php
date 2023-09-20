<?PHP
$url = 'https://re.jrc.ec.europa.eu/api/v5_2/seriescalc?&pvcalculation=1&peakpower=1&outputformat=json'; //&startyear=2016
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

echo $url;


?>