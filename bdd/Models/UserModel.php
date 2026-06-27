<?php
class UserModel
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function findByEmail($email)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function emailExists($email)
    {
        $stmt = $this->pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        return $stmt->fetch() !== false;
    }

    public function createUser($name, $email, $password)
    {
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $this->pdo->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
        $stmt->execute([$name, $email, $hash]);
        return $this->pdo->lastInsertId();
    }

    public function searchUsers($query, $exclude_user_id)
    {
        $stmt = $this->pdo->prepare("
        SELECT id, name, email
        FROM users
        WHERE (name LIKE ? OR email LIKE ?)
        AND id != ?
        LIMIT 10
    ");
        $like = '%' . $query . '%';
        $stmt->execute([$like, $like, $exclude_user_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}