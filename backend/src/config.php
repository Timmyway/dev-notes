<?php

return [
    'db_path' => getenv('DB_PATH') ?: dirname(__DIR__) . '/devnotes.db',
];