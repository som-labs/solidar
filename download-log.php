<?php
$token = $_GET['token'] ?? '';
$secret = 'solar2026';  // cambia esto

if ($token !== $secret) {
    http_response_code(403);
    exit('Forbidden');
}

$file = '/var/log/solidar/PVGIScalls_test.txt';

if (!file_exists($file)) {
    http_response_code(404);
    exit('Log not found');
}

header('Content-Type: text/plain');
header('Content-Disposition: attachment; filename="PVGIScalls_test.txt"');
header('Content-Length: ' . filesize($file));
readfile($file);
?>