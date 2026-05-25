<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header("Content-Type: application/json");
session_start();
require 'sql-connect.php';

$connect = new SqlConnect();
$pdo = $connect->db;

error_log("METHOD: " . $_SERVER['REQUEST_METHOD']);
error_log("POST: " . print_r($_POST, true));
error_log("SESSION: " . print_r($_SESSION, true));

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Méthode non autorisée - reçu: ' . $_SERVER['REQUEST_METHOD']]);
    exit;
}

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'Non connecté - session vide']);
    exit;
}

$title = trim($_POST['nom'] ?? '');
$description = trim($_POST['description'] ?? '');
$user_id = $_SESSION['user_id'];

if (!$title) {
    echo json_encode(['success' => false, 'error' => 'Nom manquant']);
    exit;
}

$stmt = $pdo->prepare("INSERT INTO albums (user_id, title, description) VALUES (?, ?, ?)");
$stmt->execute([$user_id, $title, $description]);
$album_id = $pdo->lastInsertId();

if (!empty($_FILES['photos']['name'][0])) {
    $uploadDir = '../uploads/' . $album_id . '/';
    if (!is_dir($uploadDir))
        mkdir($uploadDir, 0777, true);

    foreach ($_FILES['photos']['tmp_name'] as $key => $tmp) {
        $ext = pathinfo($_FILES['photos']['name'][$key], PATHINFO_EXTENSION);
        $allowed = ['jpg', 'jpeg', 'png'];

        if (in_array(strtolower($ext), $allowed) && $_FILES['photos']['size'][$key] < 5000000) {
            $filename = uniqid() . '.' . $ext;

            if (move_uploaded_file($tmp, $uploadDir . $filename)) {
                $stmt2 = $pdo->prepare("INSERT INTO photos (album_id, filename) VALUES (?, ?)");
                $stmt2->execute([$album_id, $filename]);
            }
        }
    }
}

echo json_encode(['success' => true, 'album_id' => $album_id]);
exit;
?>