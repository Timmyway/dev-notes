<?php
// public/index.php
require_once __DIR__ . '/../src/core.php';

// 1. Headers
header("Access-Control-Allow-Origin: http://localhost:5178");
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

$basePath = '/tools/devnotes/api';
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = str_replace($basePath, '', $requestUri);
$method = $_SERVER['REQUEST_METHOD'];

// ── Init DB first ──────────────────────────────────────
$db = initDatabase();
// ───────────────────────────────────────────────────────

verifyToken($db);

switch ($path) {
    case '/notes':
        if ($method === 'GET')  getAllNotes($db);
        if ($method === 'POST') saveAllNotes($db);
        break;

    case '/export':
        if ($method === 'POST') getAllNotes($db);
        break;

    case '/import':
        if ($method === 'POST') saveAllNotes($db);
        break;

    default:
        errorResponse('Route not found: ' . $path, 404);
        break;
}

$db->close();