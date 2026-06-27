<?php
require_once 'Models/CommentModel.php';

class CommentController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new CommentModel($pdo);
    }

    private function sendJSON($data, $statusCode = 200)
    {
        ob_clean(); 
        http_response_code($statusCode);
        header("Content-Type: application/json");
        echo json_encode($data);
        exit;
    }

    public function list($photo_id, $user_id)
    {
        if (!$photo_id) {
            $this->sendJSON(['success' => false, 'error' => 'photo_id manquant'], 400);
        }
        if (!$this->model->checkPhotoAccess($photo_id, $user_id)) {
            $this->sendJSON(['success' => false, 'error' => 'Accès refusé'], 403);
        }

        $comments = $this->model->getCommentsByPhoto($photo_id);
        $this->sendJSON(['success' => true, 'comments' => $comments]);
    }

    public function create($user_id, $data)
    {
        $photo_id = intval($data['photo_id'] ?? 0);
        $content = trim($data['content'] ?? '');

        if (!$photo_id || !$content) {
            $this->sendJSON(['success' => false, 'error' => 'Données manquantes'], 400);
        }

        $album_id = $this->model->getAlbumIdByPhoto($photo_id);
        if (!$album_id) {
            $this->sendJSON(['success' => false, 'error' => 'Photo introuvable'], 404);
        }

        $permission = $this->model->getUserPermission($album_id, $user_id);
        if (!$permission || $permission === 'view') {
            $this->sendJSON(['success' => false, 'error' => 'Permission insuffisante pour commenter'], 403);
        }

        $content = htmlspecialchars($content, ENT_QUOTES, 'UTF-8');
        $comment_id = $this->model->createComment($photo_id, $user_id, $content);
        $this->sendJSON(['success' => true, 'comment_id' => $comment_id]);
    }

    public function update($user_id, $data)
    {
        $comment_id = intval($data['comment_id'] ?? 0);
        $content = trim($data['content'] ?? '');

        if (!$comment_id || !$content) {
            $this->sendJSON(['success' => false, 'error' => 'Accès refusé : tu n\'es pas l\'auteur'], 403);
        }

        if (!$this->model->checkCommentOwner($comment_id, $user_id)) {
            $this->sendJSON(['success' => false, 'error' => 'Accès refusé : tu n\'es pas l\'auteur'], 403);
        }

        $content = htmlspecialchars($content, ENT_QUOTES, 'UTF-8');
        $this->model->updateComment($comment_id, $content);

        $this->sendJSON(['success' => true]);
    }

    public function delete($user_id, $comment_id)
    {
        if (!$comment_id) {
            $this->sendJSON(['success' => false, 'error' => 'comment_id manquant'], 400);
        }
        if (!$this->model->checkCommentOwner($comment_id, $user_id)) {
            $this->sendJSON(['success' => false, 'error' => 'Accès refusé : tu n\'es pas l\'auteur'], 403);
        }
        $this->model->deleteComment($comment_id);
        $this->sendJSON(['success' => true]);
    }

}