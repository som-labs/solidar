<?php
$token = $_GET['token'] ?? '';
$secret = 'solar2026';  // cambia esto

if ($token !== $secret) {
    http_response_code(403);
    exit('Forbidden');
}

$file = __DIR__ . '/log/PVGIScalls.txt';

if (!file_exists($file)) {
    http_response_code(404);
    exit('Log not found');
}

header('Content-Type: text/plain');
header('Content-Disposition: attachment; filename="PVGIScalls.txt"');
header('Content-Length: ' . filesize($file));
readfile($file);
?>