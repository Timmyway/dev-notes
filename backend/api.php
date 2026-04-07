<?php

/**
 * DevNotes API - Simple PHP REST API with SQLite
 * 
 * Endpoints:
 * GET    /api.php?action=getAllNotes
 * POST   /api.php?action=saveAllNotes
 * POST   /api.php?action=exportData
 * POST   /api.php?action=importData
 */

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database configuration
define('DB_PATH', __DIR__ . '/devnotes.db');

// Initialize database
function initDatabase()
{
    $db = new SQLite3(DB_PATH);

    // Create notes table if it doesn't exist
    $db->exec('
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT,
            mode TEXT DEFAULT "markdown",
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    ');    

    // Create users table if it doesn't exist
    $db->exec('
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,  -- hashed password
            api_token TEXT UNIQUE    -- random token for API access
        )
    ');    

    return $db;
}

function createUser($db, $username, $password) {    
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    $apiToken = bin2hex(random_bytes(16)); // 32-char random token

    $stmt = $db->prepare('INSERT INTO users (username, password, api_token) VALUES (:username, :password, :api_token)');
    $stmt->bindValue(':username', $username, SQLITE3_TEXT);
    $stmt->bindValue(':password', $hashedPassword, SQLITE3_TEXT);
    $stmt->bindValue(':api_token', $apiToken, SQLITE3_TEXT);
    $stmt->execute();

    return $apiToken;
}

// Response helper
function jsonResponse($data, $statusCode = 200)
{
    http_response_code($statusCode);
    echo json_encode($data);
    exit();
}

// Error handler
function errorResponse($message, $statusCode = 400)
{
    jsonResponse(['error' => $message], $statusCode);
}

// Get action from request
$action = $_GET['action'] ?? $_POST['action'] ?? null;

if (!$action) {
    errorResponse('No action specified');
}

// Initialize database
$db = initDatabase();

// ----------------------
// AUTHENTICATION START
// ----------------------
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? '';

if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    errorResponse('Unauthorized', 401);
}

$token = $matches[1];

// Verify token in database
$userCheck = $db->prepare('SELECT * FROM users WHERE api_token = :token');
$userCheck->bindValue(':token', $token, SQLITE3_TEXT);
$result = $userCheck->execute()->fetchArray(SQLITE3_ASSOC);

if (!$result) {
    errorResponse('Invalid token', 401);
}

// Route actions
switch ($action) {
    case 'getAllNotes':
        getAllNotes($db);
        break;

    case 'saveAllNotes':
        saveAllNotes($db);
        break;

    case 'exportData':
        exportData($db);
        break;

    case 'importData':
        importData($db);
        break;

    default:
        errorResponse('Invalid action');
}

/**
 * Get all notes
 */
function getAllNotes($db)
{
    $result = $db->query('SELECT * FROM notes ORDER BY updated_at DESC');

    $notes = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $notes[] = [
            'id' => (int)$row['id'],
            'title' => $row['title'],
            'content' => $row['content'],
            'mode' => $row['mode'],
            'createdAt' => $row['created_at'],
            'updatedAt' => $row['updated_at']
        ];
    }

    jsonResponse($notes);
}

/**
 * Save all notes (replace entire dataset)
 */
function saveAllNotes($db)
{
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!isset($data['notes']) || !is_array($data['notes'])) {
        errorResponse('Invalid data format. Expected {notes: [...]}');
    }

    $notes = $data['notes'];

    // Start transaction
    $db->exec('BEGIN TRANSACTION');

    try {
        // Clear existing notes
        $db->exec('DELETE FROM notes');

        // Insert new notes
        $stmt = $db->prepare('
            INSERT INTO notes (id, title, content, mode, created_at, updated_at)
            VALUES (:id, :title, :content, :mode, :created_at, :updated_at)
        ');

        foreach ($notes as $note) {
            $stmt->bindValue(':id', $note['id'], SQLITE3_INTEGER);
            $stmt->bindValue(':title', $note['title'], SQLITE3_TEXT);
            $stmt->bindValue(':content', $note['content'] ?? '', SQLITE3_TEXT);
            $stmt->bindValue(':mode', $note['mode'] ?? 'markdown', SQLITE3_TEXT);
            $stmt->bindValue(':created_at', $note['createdAt'], SQLITE3_TEXT);
            $stmt->bindValue(':updated_at', $note['updatedAt'], SQLITE3_TEXT);
            $stmt->execute();
        }

        $db->exec('COMMIT');
        jsonResponse(['success' => true, 'count' => count($notes)]);
    } catch (Exception $e) {
        $db->exec('ROLLBACK');
        errorResponse('Save failed: ' . $e->getMessage(), 500);
    }
}

/**
 * Export all notes as JSON
 */
function exportData($db)
{
    $result = $db->query('SELECT * FROM notes ORDER BY updated_at DESC');

    $notes = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $notes[] = [
            'id' => (int)$row['id'],
            'title' => $row['title'],
            'content' => $row['content'],
            'mode' => $row['mode'],
            'createdAt' => $row['created_at'],
            'updatedAt' => $row['updated_at']
        ];
    }

    jsonResponse($notes);
}

/**
 * Import notes from JSON
 */
function importData($db)
{
    $input = file_get_contents('php://input');
    $notes = json_decode($input, true);

    if (!is_array($notes)) {
        errorResponse('Invalid JSON format');
    }

    // Start transaction
    $db->exec('BEGIN TRANSACTION');

    try {
        // Clear existing notes
        $db->exec('DELETE FROM notes');

        // Insert imported notes
        $stmt = $db->prepare('
            INSERT INTO notes (id, title, content, mode, created_at, updated_at)
            VALUES (:id, :title, :content, :mode, :created_at, :updated_at)
        ');

        foreach ($notes as $note) {
            $stmt->bindValue(':id', $note['id'], SQLITE3_INTEGER);
            $stmt->bindValue(':title', $note['title'], SQLITE3_TEXT);
            $stmt->bindValue(':content', $note['content'] ?? '', SQLITE3_TEXT);
            $stmt->bindValue(':mode', $note['mode'] ?? 'markdown', SQLITE3_TEXT);
            $stmt->bindValue(':created_at', $note['createdAt'], SQLITE3_TEXT);
            $stmt->bindValue(':updated_at', $note['updatedAt'], SQLITE3_TEXT);
            $stmt->execute();
        }

        $db->exec('COMMIT');
        jsonResponse(['success' => true, 'imported' => count($notes)]);
    } catch (Exception $e) {
        $db->exec('ROLLBACK');
        errorResponse('Import failed: ' . $e->getMessage(), 500);
    }
}

$db->close();
