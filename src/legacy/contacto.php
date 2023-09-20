<?php

$email_to = "soporte@solidarenergia.es";
$email_subject = "Contacto desde SOM Simulador";

$email_from = $_POST['email'];

$email_message = "Detalles del formulario de contacto:" . "<br>";
$email_message .= "Nombre: " . $_POST['nombre'] . "<br>";
$email_message .= "Email: " . $_POST['email'] . "<br>";
$email_message .= "Teléfono: " . $_POST['telefono'] . "<br>";
$email_message .= "Mensaje: " . $_POST['mensaje'] ."<br>";

if(isset($_POST['mantenerContacto'])) $email_message .= "Requiere respuesta" . "<br>";
if(isset($_POST['gridRadios'])) $email_message .= "Informa: " . $_POST['gridRadios'] . "<br>";

$headers = 'From: '.$email_from."\r\n".
'Reply-To: '.$email_from."\r\n" .
'Content-Type: text/html; charset=UTF-8;' .
'X-Mailer: PHP/' . phpversion();

if (mail($email_to, $email_subject, $email_message, $headers)) {
    echo '<script language="javascript">
        alert("¡El formulario se ha enviado con éxito!");

        </script>'; 
} else {
    echo '<script language="javascript">
        alert("Error envio de correo. Verifica tu email");
        window.location.href="index.html";
        </script>';
}
?>