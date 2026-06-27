<?php
class PhotoModel
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function checkAlbumAccess($album_id, $user_id)
    {
        $stmt = $this->pdo->prepare("
        SELECT a.id
        FROM albums a
        LEFT JOIN album_permissions ap ON ap.album_id = a.id AND ap.user_id = ?
        WHERE a.id = ?
        AND (
            a.user_id = ?
            OR a.visibility = 'public'
            OR (a.visibility = 'restricted' AND ap.id IS NOT NULL)
        )
    ");
        $stmt->execute([$user_id, $album_id, $user_id]);
        return $stmt->fetch() !== false;
    }

    public function getPhotosByAlbum($album_id)
    {
        $stmt = $this->pdo->prepare("SELECT id, filename, description, tags, uploaded_at FROM photos WHERE album_id = ? ORDER BY uploaded_at ASC");
        $stmt->execute([$album_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function deletePhoto($photo_id, $user_id)
    {
        $stmt = $this->pdo->prepare("
            SELECT p.filename, p.album_id
            FROM photos p
            JOIN albums a ON a.id = p.album_id
            WHERE p.id = ? AND a.user_id = ?
        ");
        $stmt->execute([$photo_id, $user_id]);
        $photo = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$photo)
            return false;

        $filepath = __DIR__ . '/../uploads/' . $photo['album_id'] . '/' . $photo['filename'];
        if (file_exists($filepath)) {
            unlink($filepath);
        }

        $del = $pdo = $this->pdo->prepare("DELETE FROM photos WHERE id = ?");
        return $del->execute([$photo_id]);
    }
    public function insertPhoto($album_id, $filename, $description, $tagsJson)
    {
        $stmt = $this->pdo->prepare("INSERT INTO photos (album_id, filename, description, tags, uploaded_at) VALUES (?, ?, ?, ?, NOW())");
        return $stmt->execute([$album_id, $filename, $description, $tagsJson]);
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

    public function isAlbumOwner($album_id, $user_id)
    {
        $stmt = $this->pdo->prepare("SELECT id FROM albums WHERE id = ? AND user_id = ?");
        $stmt->execute([$album_id, $user_id]);
        return $stmt->fetch() !== false;
    }
    
}