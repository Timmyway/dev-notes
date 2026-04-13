<?php
// src/core.php

// DB is now one level up from public
define('DB_PATH', dirname(__DIR__) . '/devnotes.db');

if (!function_exists('getallheaders')) {
    function getallheaders()
    {
        $headers = [];
        foreach ($_SERVER as $name => $value) {
            if (substr($name, 0, 5) == 'HTTP_') {
                $headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))))] = $value;
            }
        }
        return $headers;
    }
}

function initDatabase()
{
    $db = new SQLite3(DB_PATH);
    $db->exec('CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY, title TEXT NOT NULL, content TEXT, mode TEXT DEFAULT "markdown", created_at TEXT NOT NULL, updated_at TEXT NOT NULL)');
    $db->exec('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE NOT NULL, password TEXT NOT NULL, api_token TEXT UNIQUE)');
    return $db;
}

function jsonResponse($data, $statusCode = 200)
{
    http_response_code($statusCode);
    echo json_encode($data);
    exit();
}

function errorResponse($message, $statusCode = 400)
{
    jsonResponse(['error' => $message], $statusCode);
}

function verifyToken($db)
{
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

    if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        errorResponse('Unauthorized', 401);
    }

    $token = $matches[1];
    $stmt = $db->prepare('SELECT id FROM users WHERE api_token = :token');
    $stmt->bindValue(':token', $token, SQLITE3_TEXT);
    $user = $stmt->execute()->fetchArray(SQLITE3_ASSOC);

    if (!$user) {
        errorResponse('Invalid token', 401);
    }
    return $user;
}

// --- Action Handlers ---

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

function saveAllNotes($db)
{
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['notes'])) errorResponse('Invalid format');

    $db->exec('BEGIN TRANSACTION');
    try {
        $db->exec('DELETE FROM notes');
        $stmt = $db->prepare('INSERT INTO notes (id, title, content, mode, created_at, updated_at) VALUES (:id, :title, :content, :mode, :created_at, :updated_at)');

        foreach ($data['notes'] as $note) {
            $stmt->bindValue(':id', $note['id'], SQLITE3_INTEGER);
            $stmt->bindValue(':title', $note['title'], SQLITE3_TEXT);
            $stmt->bindValue(':content', $note['content'] ?? '', SQLITE3_TEXT);
            $stmt->bindValue(':mode', $note['mode'] ?? 'markdown', SQLITE3_TEXT);
            $stmt->bindValue(':created_at', $note['createdAt'], SQLITE3_TEXT);
            $stmt->bindValue(':updated_at', $note['updatedAt'], SQLITE3_TEXT);
            $stmt->execute();
        }
        $db->exec('COMMIT');
        jsonResponse(['success' => true]);
    } catch (Exception $e) {
        $db->exec('ROLLBACK');
        errorResponse($e->getMessage(), 500);
    }
}
