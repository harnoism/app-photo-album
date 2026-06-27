<?php
require_once 'Models/UserModel.php';

class UserController
{
    private $model;
    private $pdo;
    public function __construct($pdo)
    {
        $this->pdo = $pdo;
        $this->model = new UserModel($pdo);
    }

    private function sendJSON($data, $statusCode = 200)
    {
        ob_clean();
        http_response_code($statusCode);
        header("Content-Type: application/json");
        echo json_encode($data);
        exit;
    }

    public function login($data)
    {
        $email = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';

        if (!$email || !$password) {
            $this->sendJSON(['success' => false, 'message' => 'Champs manquants.'], 400);
        }

        $user = $this->model->findByEmail($email);

        if (!$user || !password_verify($password, $user['password'])) {
            $this->sendJSON(['success' => false, 'message' => 'Email ou mot de passe incorrect.'], 401);
        }

        session_regenerate_id(true);
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_name'] = $user['name'];

        $this->sendJSON(['success' => true]);
    }

    public function register($data)
    {
        $name = trim($data['name'] ?? '');
        $email = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';

        if (!$name || !$email || !$password) {
            $this->sendJSON(['success' => false, 'message' => 'Champs manquants.'], 400);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->sendJSON(['success' => false, 'message' => 'Email invalide.'], 400);
        }

        if (strlen($password) < 8) {
            $this->sendJSON(['success' => false, 'message' => 'Mot de passe trop court (8 caractères min).'], 400);
        }

        if ($this->model->emailExists($email)) {
            $this->sendJSON(['success' => false, 'message' => 'Cet email est déjà utilisé.'], 409);
        }

        $this->model->createUser($name, $email, $password);
        $this->sendJSON(['success' => true]);
    }

    public function logout()
    {
        session_destroy();
        $this->sendJSON(['success' => true]);
    }

    public function whoami($user_id)
    {
        $this->sendJSON(['success' => true, 'user_id' => $user_id]);
    }

    public function search($current_user_id, $query)
    {
        $query = trim($query);
        if (strlen($query) < 2) {
            $this->sendJSON(['success' => false, 'message' => 'Requête trop courte'], 400);
        }
        $users = $this->model->searchUsers($query, $current_user_id);
        $results = array_map(fn($u) => [
            'id' => $u['id'],
            'username' => $u['name'],
            'email' => $u['email'],
        ], $users);
        $this->sendJSON(['success' => true, 'users' => $results]);
    }

    public function getProfile($current_user_id)
    {
        $target_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : $current_user_id;

        $stmt = $this->pdo->prepare("
        SELECT id, name, email, avatar, bio,
               (SELECT COUNT(*) FROM follows WHERE followed_id = u.id) AS followers,
               (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) AS following
        FROM users u WHERE id = ?
    ");
        $stmt->execute([$target_id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$user) {
            $this->sendJSON(['success' => false, 'error' => 'Introuvable'], 404);
        }
        if ($user['avatar']) {
            $user['avatar_url'] = '/Projet_fullstack/Projet_1/app-photo-album/frontend/uploads/avatars/' . $user['avatar'];
        }
        $stmt2 = $this->pdo->prepare("SELECT id FROM follows WHERE follower_id = ? AND followed_id = ?");
        $stmt2->execute([$current_user_id, $target_id]);
        $user['is_following'] = $stmt2->fetch() !== false;
        $user['is_own_profile'] = ($target_id === $current_user_id);

        $this->sendJSON(['success' => true, 'user' => $user]);
    }

    public function updateProfile($user_id, $post, $files)
    {
        $bio = trim($post['bio'] ?? '');
        $name = trim($post['name'] ?? '');

        $avatarFilename = null;
        if (!empty($files['avatar']['tmp_name'])) {
            $uploadDir = __DIR__ . '/../../frontend/uploads/avatars/';
            if (!is_dir($uploadDir))
                mkdir($uploadDir, 0777, true);
            $ext = strtolower(pathinfo($files['avatar']['name'], PATHINFO_EXTENSION));
            $avatarFilename = 'avatar_' . $user_id . '.' . $ext;
            move_uploaded_file($files['avatar']['tmp_name'], $uploadDir . $avatarFilename);
        }

        if ($avatarFilename) {
            $stmt = $this->pdo->prepare("UPDATE users SET name=?, bio=?, avatar=? WHERE id=?");
            $stmt->execute([$name ?: null, $bio ?: null, $avatarFilename, $user_id]);
        } else {
            $stmt = $this->pdo->prepare("UPDATE users SET name=?, bio=? WHERE id=?");
            $stmt->execute([$name ?: null, $bio ?: null, $user_id]);
        }
        $this->sendJSON(['success' => true]);
    }

    public function toggleLike($user_id, $photo_id)
    {
        if (!$photo_id) {
            $this->sendJSON(['success' => false, 'error' => 'photo_id manquant'], 400);
        }
        // Vérifie si déjà liké
        $stmt = $this->pdo->prepare("SELECT id FROM photo_likes WHERE photo_id=? AND user_id=?");
        $stmt->execute([$photo_id, $user_id]);
        if ($stmt->fetch()) {
            $this->pdo->prepare("DELETE FROM photo_likes WHERE photo_id=? AND user_id=?")->execute([$photo_id, $user_id]);
            $this->sendJSON(['success' => true, 'liked' => false]);
        } else {
            $this->pdo->prepare("INSERT INTO photo_likes (photo_id, user_id) VALUES (?,?)")->execute([$photo_id, $user_id]);
            $this->sendJSON(['success' => true, 'liked' => true]);
        }
    }

    public function getFavorites($user_id)
    {
        $stmt = $this->pdo->prepare("
        SELECT p.id, p.filename, p.album_id, p.description, pl.created_at AS liked_at
        FROM photo_likes pl
        JOIN photos p ON p.id = pl.photo_id
        WHERE pl.user_id = ?
        ORDER BY pl.created_at DESC
    ");
        $stmt->execute([$user_id]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $photos = array_map(fn($r) => [
            'id' => $r['id'],
            'url' => '/Projet_fullstack/Projet_1/app-photo-album/frontend/uploads/' . $r['album_id'] . '/' . $r['filename'],
            'album_id' => $r['album_id'],
            'liked_at' => $r['liked_at']
        ], $rows);
        $this->sendJSON(['success' => true, 'photos' => $photos]);
    }

    public function follow($user_id, $target_id)
    {
        if ($user_id === $target_id) {
            $this->sendJSON(['success' => false, 'error' => 'Impossible de se suivre soi-même'], 400);
        }
        $stmt = $this->pdo->prepare("INSERT IGNORE INTO follows (follower_id, followed_id) VALUES (?,?)");
        $stmt->execute([$user_id, $target_id]);
        $this->sendJSON(['success' => true]);
    }

    public function unfollow($user_id, $target_id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM follows WHERE follower_id=? AND followed_id=?");
        $stmt->execute([$user_id, $target_id]);
        $this->sendJSON(['success' => true]);
    }
}