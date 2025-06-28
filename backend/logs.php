<?php

include_once 'includes/Logger.php';
$Logger =  new Logger();
$ajax = isset($_POST["ajax"]) ? true : false;
$logs = $Logger->readLogs();
if ($ajax) {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if (isset($_POST['type']) && $_POST['type'] === 'clear-log') {
            $Logger->clearLogs();
            echo json_encode([
                'status' => 'ok'
            ]);
            exit;
        }
    }
}
