<?php
require_once 'Models/AlbumModel.php';

class AlbumController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new AlbumModel($pdo);
    }

    private function sendJSON($data, $statusCode = 200)
    {
        ob_clean(); 
        http_response_code($statusCode);
        header("Content-Type: application/json");
        echo json_encode($data);
        exit;
    }

    public function list($user_id)
    {
        $rows = $this->model->getUserAlbums($user_id);
        $albums = [];

        foreach ($rows as $row) {
            $photos = $this->model->getAlbumPreviewPhotos($row['id']);

            $covers = array_map(function ($filename) use ($row) {
                return '/Projet_fullstack/Projet_1/app-photo-album/frontend/uploads/' . $row['id'] . '/' . $filename;
            }, $photos);

            $albums[] = [
                'id' => $row['id'],
                'title' => $row['title'],
                'description' => $row['description'],
                'photo_count' => (int) $row['photo_count'],
                'covers' => $covers,
                'tags' => $row['tags'] ? json_decode($row['tags']) : [],
                'visibility' => $row['visibility'] ?? 'private',
            ];
        }

        $this->sendJSON(['success' => true, 'albums' => $albums]);
    }

    public function create($user_id, $postData)
    {
        $title = trim($postData['nom'] ?? '');
        $description = trim($postData['description'] ?? '');
        $tags = $postData['tags'] ?? [];
        $visibility = in_array($postData['visibility'] ?? '', ['public', 'restricted', 'private'])
            ? $postData['visibility']
            : 'private';

        $tagsJson = !empty($tags)
            ? json_encode(array_map('htmlspecialchars', $tags))
            : null;

        if (!$title) {
            $this->sendJSON(['success' => false, 'error' => 'Nom manquant'], 400);
        }

        $album_id = $this->model->createAlbum($user_id, $title, $description, $tagsJson, $visibility);
        $this->sendJSON(['success' => true, 'album_id' => $album_id]);
    }

    public function delete($user_id, $album_id)
    {
        if (!$album_id) {
            $this->sendJSON(['success' => false, 'error' => 'album_id manquant'], 400);
        }

        if (!$this->model->isAlbumOwner($album_id, $user_id)) {
            $this->sendJSON(['success' => false, 'error' => 'Accès refusé'], 403);
        }

        $this->model->deleteAlbum($album_id);
        $this->sendJSON(['success' => true]);
    }

    public function searchPhotos($user_id, $tags, $albumTitle, $date)
    {
        $rows = $this->model->searchPhotos($user_id, $tags, $albumTitle, $date);

        $results = array_map(function ($row) {
            return [
                'id' => $row['id'],
                'url' => '/Projet_fullstack/Projet_1/app-photo-album/frontend/uploads/'
                    . $row['album_id'] . '/' . $row['filename'],
                'album_id' => $row['album_id'],
                'album_title' => $row['album_title'],
                'tags' => $row['tags'] ? json_decode($row['tags']) : [],
            ];
        }, $rows);

        $this->sendJSON(['success' => true, 'photos' => $results]);
    }

    public function updateVisibility($user_id, $album_id, $visibility)
    {
        if (!$album_id) {
            $this->sendJSON(['success' => false, 'error' => 'album_id manquant'], 400);
        }
        if (!in_array($visibility, ['public', 'restricted', 'private'])) {
            $this->sendJSON(['success' => false, 'error' => 'Visibilité invalide'], 400);
        }
        if (!$this->model->checkAlbumAccess($album_id, $user_id)) {
            $this->sendJSON(['success' => false, 'error' => 'Accès refusé'], 403);
        }
        $this->model->updateAlbumVisibility($album_id, $visibility);
        $this->sendJSON(['success' => true]);
    }

    public function listPublic($user_id)
    {
        $rows = $this->model->getPublicAlbums($user_id);
        $albums = [];

        foreach ($rows as $row) {
            $photos = $this->model->getAlbumPreviewPhotos($row['id']);
            $covers = array_map(function ($filename) use ($row) {
                return '/Projet_fullstack/Projet_1/app-photo-album/frontend/uploads/' . $row['id'] . '/' . $filename;
            }, $photos);

            $albums[] = [
                'id' => $row['id'],
                'title' => $row['title'],
                'description' => $row['description'],
                'visibility' => $row['visibility'],
                'owner_name' => $row['owner_name'],
                'photo_count' => (int) $row['photo_count'],
                'covers' => $covers,
                'tags' => $row['tags'] ? json_decode($row['tags']) : [],
            ];
        }

        $this->sendJSON(['success' => true, 'albums' => $albums]);
    }

    public function savePermission($user_id, $data)
    {
        $album_id = intval($data['album_id'] ?? 0);
        $target_uid = intval($data['user_id'] ?? 0);
        $permission = in_array($data['role'] ?? '', ['view', 'comment', 'edit'])
            ? $data['role']
            : 'view';

        if (!$album_id || !$target_uid) {
            $this->sendJSON(['success' => false, 'error' => 'Données manquantes'], 400);
        }
        if (!$this->model->checkAlbumAccess($album_id, $user_id)) {
            $this->sendJSON(['success' => false, 'error' => 'Accès refusé'], 403);
        }

        $this->model->upsertPermission($album_id, $target_uid, $permission);
        $this->sendJSON(['success' => true]);
    }

    public function listPermissions($user_id, $album_id)
    {
        if (!$album_id) {
            $this->sendJSON(['success' => false, 'error' => 'album_id manquant'], 400);
        }
        if (!$this->model->checkAlbumAccess($album_id, $user_id)) {
            $this->sendJSON(['success' => false, 'error' => 'Accès refusé'], 403);
        }
        $permissions = $this->model->getPermissions($album_id);
        $this->sendJSON(['success' => true, 'permissions' => $permissions]);
    }

    public function removePermission($user_id, $data)
    {
        $album_id = intval($data['album_id'] ?? 0);
        $target_uid = intval($data['user_id'] ?? 0);

        if (!$album_id || !$target_uid) {
            $this->sendJSON(['success' => false, 'error' => 'Données manquantes'], 400);
        }
        if (!$this->model->checkAlbumAccess($album_id, $user_id)) {
            $this->sendJSON(['success' => false, 'error' => 'Accès refusé'], 403);
        }

        $this->model->deletePermission($album_id, $target_uid);
        $this->sendJSON(['success' => true]);
    }


}