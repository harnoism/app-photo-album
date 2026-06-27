<?php
require_once 'Models/PhotoModel.php';

class PhotoController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new PhotoModel($pdo);
    }

    private function sendJSON($data, $statusCode = 200)
    {
        ob_clean(); 
        http_response_code($statusCode);
        header("Content-Type: application/json");
        echo json_encode($data);
        exit;
    }

    public function list($album_id, $user_id)
    {
        if (!$album_id) {
            $this->sendJSON(['success' => false, 'error' => 'album_id manquant'], 400);
        }

        if (!$this->model->checkAlbumAccess($album_id, $user_id)) {
            $this->sendJSON(['success' => false, 'error' => 'Accès refusé'], 403);
        }

        $rows = $this->model->getPhotosByAlbum($album_id);
        $base = '/Projet_fullstack/Projet_1/app-photo-album/frontend/uploads/' . $album_id . '/';

        $photos = array_map(function ($p) use ($base) {
            return [
                'id' => $p['id'],
                'url' => $base . $p['filename'],
                'description' => $p['description'],
                'tags' => $p['tags'] ? json_decode($p['tags']) : [],
                'uploaded_at' => $p['uploaded_at'],
            ];
        }, $rows);

        $isOwner = $this->model->isAlbumOwner($album_id, $user_id);
        $permission = $this->model->getUserPermission($album_id, $user_id);

        $this->sendJSON([
            'success' => true,
            'photos' => $photos,
            'is_owner' => $isOwner,
            'permission' => $permission
        ]);
    }

    public function delete($photo_id, $user_id)
    {
        if (!$photo_id) {
            $this->sendJSON(['success' => false, 'error' => 'photo_id manquant'], 400);
        }

        $success = $this->model->deletePhoto($photo_id, $user_id);

        if ($success) {
            $this->sendJSON(['success' => true]);
        } else {
            $this->sendJSON(['success' => false, 'error' => 'Photo introuvable ou accès refusé'], 403);
        }
    }
    public function upload($user_id, $postData, $filesData)
    {
        $album_id = intval($postData['album_id'] ?? 0);
        $description = trim($postData['description'] ?? '');
        $tagsJson = !empty($postData['tags']) ? $postData['tags'] : '[]';

        if (!$album_id) {
            $this->sendJSON(['success' => false, 'error' => 'album_id manquant'], 400);
        }

        $permission = $this->model->getUserPermission($album_id, $user_id);
        if (!$permission || !in_array($permission, ['owner', 'edit'])) {
            $this->sendJSON(['success' => false, 'error' => 'Permission insuffisante pour ajouter des photos'], 403);
        }

        if (empty($filesData['photos']['name'][0])) {
            $this->sendJSON(['success' => false, 'error' => 'Aucun fichier reçu'], 400);
        }

        $uploadDir = __DIR__ . '/../../frontend/uploads/' . $album_id . '/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $uploadedCount = 0;
        $files = $filesData['photos'];

        for ($i = 0; $i < count($files['name']); $i++) {
            if ($files['error'][$i] !== UPLOAD_ERR_OK) {
                continue;
            }

            $tmpName = $files['tmp_name'][$i];
            $originalName = basename($files['name'][$i]);
            $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));

            $newFilename = uniqid('img_', true) . '.' . $extension;
            $targetPath = $uploadDir . $newFilename;

            if (move_uploaded_file($tmpName, $targetPath)) {
                if ($this->model->insertPhoto($album_id, $newFilename, $description, $tagsJson)) {
                    $uploadedCount++;
                }
            }
        }

        if ($uploadedCount > 0) {
            $this->sendJSON(['success' => true, 'message' => "$uploadedCount photo(s) enregistrée(s)"]);
        } else {
            $this->sendJSON(['success' => false, 'error' => "Échec du transfert des fichiers physique"]);
        }
    }


}