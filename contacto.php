<?php
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

// Access the JSON data sent from the frontend
$receivedData = file_get_contents('php://input');

// Decode the received JSON data
$decodedData = json_decode($receivedData, true);

// // $email_to = "soporte@solidarenergia.es";
$email_to = "joseluis@garciagruben.org";
$email_subject = "Contacto desde SOM Simulador";

$email_from = $decodedData['email'];

$email_message = "Detalles del formulario de contacto:" . "<br>";
$email_message .= "Nombre: " . $decodedData['nombre'] . "<br>";
$email_message .= "Email: " . $decodedData['email'] . "<br>";
$email_message .= "Teléfono: " . $decodedData['telefono'] . "<br>";
$email_message .= "Mensaje: " . $decodedData['mensaje'] ."<br>";

if(isset($decodedData['mantenerContacto'])) $email_message .= "Requiere respuesta" . "<br>";
$email_message .= "Informa: " . $decodedData['gridRadios'] . "<br>";

$headers = 'From: '.$email_from."\r\n".
'Reply-To: '.$email_from."\r\n" .
'Content-Type: text/html; charset=UTF-8;' .
'X-Mailer: PHP/' . phpversion();

if (mail($email_to, $email_subject, $email_message, $headers)) {
    echo "¡El formulario se ha enviado con éxito!";
} else {
    $errorMessage = "Error enviando mensaje" . "<br>" .error_get_last()['message'];
    echo $errorMessage;
}
?>