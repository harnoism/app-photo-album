<?php

error_reporting(E_ALL);
ini_set('display_errors', 0);      
ini_set('display_startup_errors', 0);
ini_set('log_errors', 1);         
ob_start(); 

session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => false,
    'httponly' => true,
    'samesite' => 'Lax'
]);
session_start();

header("Content-Type: application/json; charset=UTF-8");

if (
    !file_exists('sql-connect.php')
    || !file_exists('Controllers/PhotoController.php')
    || !file_exists('Controllers/AlbumController.php')
    || !file_exists('Controllers/CommentController.php')
    || !file_exists('Controllers/UserController.php')
) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Fichier manquant']);
    exit;
}

require_once 'sql-connect.php';
require_once 'Controllers/PhotoController.php';
require_once 'Controllers/AlbumController.php';
require_once 'Controllers/CommentController.php';
require_once 'Controllers/UserController.php';

$method = $_SERVER['REQUEST_METHOD'];
$type = $_GET['t'] ?? '';

if ($type === 'login' || $type === 'register') {
    try {
        $connect = new SqlConnect();
        $pdo = $connect->db;
        $userController = new UserController($pdo);
        $data = json_decode(file_get_contents("php://input"), true);

        if ($type === 'login' && $method === 'POST') {
            $userController->login($data);
        } elseif ($type === 'register' && $method === 'POST') {
            $userController->register($data);
        } else {
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Méthode non autorisée']);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Erreur serveur : ' . $e->getMessage()]);
    }
    exit;
}

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Non connecté']);
    exit;
}

$user_id = $_SESSION['user_id'];

try {
    $connect = new SqlConnect();
    $pdo = $connect->db;

    if ($type === 'albums') {
        $albumController = new AlbumController($pdo);

        if ($method === 'GET') {
            $albumController->list($user_id);
        } elseif ($method === 'POST') {
            $albumController->create($user_id, $_POST);
        } elseif ($method === 'DELETE') {
            $data = json_decode(file_get_contents("php://input"), true);
            $album_id = intval($data['album_id'] ?? 0);
            $albumController->delete($user_id, $album_id);
        } elseif ($method === 'PATCH') {
            $data = json_decode(file_get_contents("php://input"), true);
            $album_id = intval($data['album_id'] ?? 0);
            $visibility = $data['visibility'] ?? 'private';
            $albumController->updateVisibility($user_id, $album_id, $visibility);
        } else {
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Méthode non autorisée pour les albums']);
        }
    } else if ($type === 'public_albums') {
        $albumController = new AlbumController($pdo);
        if ($method === 'GET') {
            $albumController->listPublic($user_id);
        } else {
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Méthode non autorisée']);
        }
    } else if ($type === 'whoami') {
        $userController = new UserController($pdo);
        if ($method === 'GET') {
            $userController->whoami($user_id);
        } else {
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Méthode non autorisée']);
        }
    } else if ($type === 'logout') {
        $userController = new UserController($pdo);
        if ($method === 'POST') {
            $userController->logout();
        } else {
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Méthode non autorisée']);
        }
    } else if ($type === 'search_photos') {
        $albumController = new AlbumController($pdo);
        if ($method === 'GET') {
            $tags = isset($_GET['tags']) ? explode(',', $_GET['tags']) : [];
            $albumTitle = $_GET['album_title'] ?? '';
            $date = $_GET['date'] ?? '';
            $albumController->searchPhotos($user_id, $tags, $albumTitle, $date);
        } else {
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Méthode non autorisée pour la recherche']);
        }
    } else if ($type === 'photos') {
        $photoController = new PhotoController($pdo);
        if ($method === 'GET') {
            $album_id = intval($_GET['album_id'] ?? 0);
            $photoController->list($album_id, $user_id);
        } elseif ($method === 'POST') {
            $photoController->upload($user_id, $_POST, $_FILES);
        } elseif ($method === 'DELETE') {
            $data = json_decode(file_get_contents("php://input"), true);
            $photo_id = intval($data['photo_id'] ?? 0);
            $photoController->delete($photo_id, $user_id);
        } else {
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Méthode non autorisée pour les photos']);
        }
    } else if ($type === 'comments') {
        $commentController = new CommentController($pdo);
        if ($method === 'GET') {
            $photo_id = intval($_GET['photo_id'] ?? 0);
            $commentController->list($photo_id, $user_id);
        } elseif ($method === 'POST') {
            $data = json_decode(file_get_contents("php://input"), true);
            $commentController->create($user_id, $data);
        } elseif ($method === 'PUT') {
            $data = json_decode(file_get_contents("php://input"), true);
            $commentController->update($user_id, $data);
        } elseif ($method === 'DELETE') {
            $data = json_decode(file_get_contents("php://input"), true);
            $comment_id = intval($data['comment_id'] ?? 0);
            $commentController->delete($user_id, $comment_id);
        } else {
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Méthode non autorisée pour les commentaires']);
        }
    } else if ($type === 'search_users') {
        $userController = new UserController($pdo);
        if ($method === 'GET') {
            $q = $_GET['q'] ?? '';
            $userController->search($user_id, $q);
        } else {
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Méthode non autorisée']);
        }

    } else if ($type === 'permissions') {
        $albumController = new AlbumController($pdo);
        if ($method === 'GET') {
            $album_id = intval($_GET['album_id'] ?? 0);
            $albumController->listPermissions($user_id, $album_id);
        } elseif ($method === 'POST') {
            $data = json_decode(file_get_contents("php://input"), true);
            $albumController->savePermission($user_id, $data);
        } elseif ($method === 'DELETE') {
            $data = json_decode(file_get_contents("php://input"), true);
            $albumController->removePermission($user_id, $data);
        } else {
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Méthode non autorisée']);
        }

    } else if ($type === 'profile') {
        $userController = new UserController($pdo);
        if ($method === 'GET') {
            $userController->getProfile($user_id);
        } elseif ($method === 'POST') {
            $userController->updateProfile($user_id, $_POST, $_FILES);
        }
    } else if ($type === 'likes') {
        $userController = new UserController($pdo);
        if ($method === 'POST') {
            $data = json_decode(file_get_contents("php://input"), true);
            $userController->toggleLike($user_id, intval($data['photo_id'] ?? 0));
        } elseif ($method === 'GET') {
            $userController->getFavorites($user_id);
        }
    } else if ($type === 'follow') {
        $userController = new UserController($pdo);
        $data = json_decode(file_get_contents("php://input"), true);
        if ($method === 'POST') {
            $userController->follow($user_id, intval($data['target_id'] ?? 0));
        } elseif ($method === 'DELETE') {
            $userController->unfollow($user_id, intval($data['target_id'] ?? 0));

        }
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Ressource demandée inconnue']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Erreur serveur : ' . $e->getMessage()]);
}
exit;