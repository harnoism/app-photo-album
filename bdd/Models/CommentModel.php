<?php
class CommentModel
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }
    public function checkCommentOwner($comment_id, $user_id)
    {
        $stmt = $this->pdo->prepare("SELECT id FROM comments WHERE id = ? AND user_id = ?");
        $stmt->execute([$comment_id, $user_id]);
        return $stmt->fetch() !== false;
    }

    public function checkPhotoAccess($photo_id, $user_id)
    {
        $stmt = $this->pdo->prepare("
        SELECT p.id
        FROM photos p
        JOIN albums a ON a.id = p.album_id
        LEFT JOIN album_permissions ap ON ap.album_id = a.id AND ap.user_id = ?
        WHERE p.id = ?
        AND (
            a.user_id = ?
            OR a.visibility = 'public'
            OR (a.visibility = 'restricted' AND ap.id IS NOT NULL)
        )
    ");
        $stmt->execute([$user_id, $photo_id, $user_id]);
        return $stmt->fetch() !== false;
    }

    public function getCommentsByPhoto($photo_id)
    {
        $stmt = $this->pdo->prepare("
            SELECT c.id, c.photo_id, c.user_id, c.content, c.created_at, c.updated_at, u.name AS username
            FROM comments c
            JOIN users u ON u.id = c.user_id
            WHERE c.photo_id = ?
            ORDER BY c.created_at ASC
        ");
        $stmt->execute([$photo_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function createComment($photo_id, $user_id, $content)
    {
        $stmt = $this->pdo->prepare("
        INSERT INTO comments (photo_id, user_id, content, created_at, updated_at)
        VALUES (?, ?, ?, NOW(), NOW())
        ");
        $stmt->execute([$photo_id, $user_id, $content]);
        return $this->pdo->lastInsertId();
    }

    public function updateComment($comment_id, $content)
    {
        $stmt = $this->pdo->prepare("
        UPDATE comments SET content = ?, updated_at = NOW() WHERE id =?
        ");
        return $stmt->execute([$content, $comment_id]);
    }

    public function deleteComment($comment_id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM comments WHERE id =?");
        return $stmt->execute([$comment_id]);
    }

    public function getAlbumIdByPhoto($photo_id)
    {
        $stmt = $this->pdo->prepare("SELECT album_id FROM photos WHERE id = ?");
        $stmt->execute([$photo_id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? $row['album_id'] : null;
    }

    public function getUserPermission($album_id, $user_id)
    {
        $stmt = $this->pdo->prepare("SELECT id FROM albums WHERE id = ? AND user_id = ?");
        $stmt->execute([$album_id, $user_id]);
        if ($stmt->fetch())
            return 'owner';

        $stmt = $this->pdo->prepare("
        SELECT permission
        FROM album_permissions
        WHERE album_id = ? AND user_id = ?
    ");
        $stmt->execute([$album_id, $user_id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? $row['permission'] : null;
    }
}