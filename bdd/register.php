<?php
header("Content-Type: application/json");

require_once "sql-connect.php";

$connect = new SqlConnect();
$pdo = $connect->db;

$data = json_decode(file_get_contents("php://input"), true);

$name     = trim($data["name"] ?? "");
$email    = trim($data["email"] ?? "");
$password = $data["password"] ?? "";

if (!$name || !$email || !$password) {
    echo json_encode(["success" => false, "message" => "Champs manquants."]);
    exit;
}

$check = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$check->execute([$email]);
if ($check->fetch()) {
    echo json_encode(["success" => false, "message" => "Cet email est déjà utilisé."]);
    exit;
}

$hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $pdo->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
$stmt->execute([$name, $email, $hash]);

echo json_encode(["success" => true]);