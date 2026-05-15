<?php
header("Content-Type: application/json");
session_start();

require_once "sql-connect.php";
$connect =new SqlConnect();
$pdo = $connect -> db;

$data = json_decode(file_get_contents("php://input"), true);

$email    = trim($data["email"] ?? "");
$password = $data["password"] ?? "";

if ( !$email || !$password) {
    echo json_encode(["success" => false, "message" => "Champs manquants."]);
    exit;
}

$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt-> fetch(PDO::FETCH_ASSOC);

if (!$user || !password_verify($password, $user["password"])){
    echo json_encode(["success" => false, "message"=> "Email ou mot de passe incorrect. "]);
    exit;
}

$_SESSION["user_id"] =$user["id"];
$_SESSION["user_name"] =$user["name"];

echo json_encode(["success" => true]);