<?php
$token = $_GET['token'] ?? '';
$secret = 'solar2026';  // cambia esto

if ($token !== $secret) {
    http_response_code(403);
    exit('Forbidden');
}

$configFile = dirname(__DIR__) . '/solidar/config.local.php';

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

if (!file_exists($logFile)) {
    http_response_code(404);
    exit('Log not found');
}

header('Content-Type: text/plain');
header('Content-Disposition: attachment; filename="PVGIScalls_test.txt"');
header('Content-Length: ' . filesize($logFile));
readfile($logFile);
?>