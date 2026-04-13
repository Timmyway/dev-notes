<?php
require_once __DIR__ . '/../src/core.php';

// ── CORS CONFIG ────────────────────────────────────────
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Autorise localhost (tous ports) + ton domaine
if (
    preg_match('#^http://localhost:\d+$#', $origin) ||
    preg_match('#^http://127\.0\.0\.1:\d+$#', $origin) ||
    preg_match('#^https://(.*\.)?timtest.kontikimedia\.com$#', $origin)
) {
    header("Access-Control-Allow-Origin: $origin");
}

header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// ── PRELIGHT (IMPORTANT) ───────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
// ───────────────────────────────────────────────────────


// ── ROUTING SETUP ──────────────────────────────────────
$basePath = '/tools/devnotes/api';
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = str_replace($basePath, '', $requestUri);
$method = $_SERVER['REQUEST_METHOD'];


// ── INIT DB ────────────────────────────────────────────
$db = initDatabase();


// ── AUTH (AFTER OPTIONS) ───────────────────────────────
verifyToken($db);


// ── ROUTES ─────────────────────────────────────────────
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