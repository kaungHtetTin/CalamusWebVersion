<?php
$request = $_SERVER['REQUEST_URI'];

$path = parse_url($request, PHP_URL_PATH);

// Remove /calamus from path
$path = str_replace('/calamus', '', $path);

// If file exists → serve normally
if ($path !== '/' && file_exists(__DIR__ . $path)) {
    return false;
}

// Otherwise → load React
readfile(__DIR__ . '/index.html');
