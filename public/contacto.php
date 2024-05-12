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

// Set error reporting to display all errors
error_reporting(E_ALL);

// $email_to = "soporte@solidarenergia.es";
$email_to = "joseluis@garciagruben.org";

$email_subject = "Contacto desde SOM Simulador";
$email_from = $_GET['email'];

$email_message = "Detalles del formulario de contacto:" . "<br>";
$email_message .= "Nombre: " . $_GET['nombre'] . "<br>";
$email_message .= "Email: " . $_GET['email'] . "<br>";
$email_message .= "Teléfono: " . $_GET['telefono'] . "<br>";
$email_message .= "Mensaje: " . $_GET['mensaje'] ."<br>";

if(isset($_GET['mantenerContacto'])) $email_message .= "Requiere respuesta" . "<br>";
if(isset($_GET['gridRadios'])) $email_message .= "Informa: " . $_GET['gridRadios'] . "<br>";

$headers = 'From: '.$email_from."\r\n".
'Reply-To: '.$email_from."\r\n" .
'Content-Type: text/html; charset=UTF-8;' .
'X-Mailer: PHP/' . phpversion();



if (mail($email_to, $email_subject, $email_message, $headers)) {
    echo "¡El formulario se ha enviado con éxito!";
} else {
    echo "¡Error enviando el email!";
}

//REVISAR: error al enviar el email en modo desarrollo
// if (mail($email_to, $email_subject, $email_message, $headers)) {
//     echo "¡El formulario se ha enviado con éxito!";
// } else {
//     $errorMessage = error_get_last()['message'] ?? 'Error desconocido';
//     echo "Error envio de correo: " . $errorMessage;
// }
?>