<?php
class AlbumModel
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

    public function isAlbumOwner($album_id, $user_id)
    {
        $stmt = $this->pdo->prepare("SELECT id FROM albums WHERE id = ? AND user_id = ?");
        $stmt->execute([$album_id, $user_id]);
        return $stmt->fetch() !== false;
    }

    public function getUserAlbums($user_id)
    {
        $stmt = $this->pdo->prepare("
            SELECT a.id, a.title, a.description, a.tags, a.visibility,
                COUNT(p.id) AS photo_count
            FROM albums a
            LEFT JOIN photos p ON p.album_id = a.id
            WHERE a.user_id = ?
            GROUP BY a.id
            ORDER BY a.created_at DESC
        ");
        $stmt->execute([$user_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function updateAlbumVisibility($album_id, $visibility)
    {
        $stmt = $this->pdo->prepare("UPDATE albums SET visibility = ? WHERE id = ?");
        return $stmt->execute([$visibility, $album_id]);
    }

    public function searchPhotos($user_id, $tags = [], $albumTitle = '', $date = '')
    {
        $conditions = ['a.user_id = ?'];
        $params = [$user_id];

        foreach ($tags as $tag) {
            $conditions[] = "p.tags LIKE ?";
            $params[] = '%"' . $tag . '"%';
        }

        if (!empty($albumTitle)) {
            $conditions[] = "a.title LIKE ?";
            $params[] = '%' . $albumTitle . '%';
        }

        if (!empty($date)) {
            $conditions[] = "DATE(p.uploaded_at) = ?";
            $params[] = $date;
        }

        $where = implode(' AND ', $conditions);

        $stmt = $this->pdo->prepare("
        SELECT p.id, p.filename, p.album_id, p.tags, a.title AS album_title
        FROM photos p
        JOIN albums a ON a.id = p.album_id
        WHERE $where
        ORDER BY p.uploaded_at DESC
    ");
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    public function getAlbumPreviewPhotos($album_id)
    {
        $stmt = $this->pdo->prepare("
            SELECT filename FROM photos
            WHERE album_id = ?
            ORDER BY uploaded_at ASC
            LIMIT 4
        ");
        $stmt->execute([$album_id]);
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }

    public function createAlbum($user_id, $title, $description, $tagsJson, $visibility = 'private')
    {
        $stmt = $this->pdo->prepare("
        INSERT INTO albums (user_id, title, description, tags, visibility, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
    ");
        $stmt->execute([$user_id, $title, $description, $tagsJson, $visibility]);
        return $this->pdo->lastInsertId();
    }

    public function deleteAlbum($album_id)
    {
        $stmt = $this->pdo->prepare("SELECT filename FROM photos WHERE album_id = ?");
        $stmt->execute([$album_id]);
        $filenames = $stmt->fetchAll(PDO::FETCH_COLUMN);

        foreach ($filenames as $filename) {
            $path = __DIR__ . '/../../frontend/uploads/' . $album_id . '/' . $filename;
            if (file_exists($path)) {
                unlink($path);
            }
        }

        $dir = __DIR__ . '/../../frontend/uploads/' . $album_id . '/';
        if (is_dir($dir)) {
            rmdir($dir);
        }

        $pdoDelPhotos = $this->pdo->prepare("DELETE FROM photos WHERE album_id = ?");
        $pdoDelPhotos->execute([$album_id]);

        $pdoDelAlbum = $this->pdo->prepare("DELETE FROM albums WHERE id = ?");
        return $pdoDelAlbum->execute([$album_id]);
    }

    public function getPublicAlbums($user_id)
    {
        $stmt = $this->pdo->prepare("
        SELECT a.id, a.title, a.description, a.visibility, a.tags, u.name AS owner_name, 
        COUNT(DISTINCT p.id) AS photo_count
        FROM albums a
        JOIN users u ON u.id = a.user_id
        LEFT JOIN photos p ON p.album_id = a.id
        LEFT JOIN album_permissions ap ON ap.album_id = a.id AND ap.user_id = ?
        WHERE a.user_id != ?
        AND (
            a.visibility = 'public' OR (a.visibility = 'restricted' AND ap.id IS NOT NULL)
        )
        GROUP BY a.id
        ORDER BY a.created_at DESC
    ");
        $stmt->execute([$user_id, $user_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getPermissions($album_id)
    {
        $stmt = $this->pdo->prepare("
        SELECT ap.user_id, ap.permission, u.name AS username, u.email
        FROM album_permissions ap
        JOIN users u ON u.id = ap.user_id
        WHERE ap.album_id = ?
        ORDER BY ap.id ASC
    ");
        $stmt->execute([$album_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function upsertPermission($album_id, $user_id, $permission)
    {
        $stmt = $this->pdo->prepare("
        INSERT INTO album_permissions (album_id, user_id, permission)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE permission = VALUES(permission)
    ");
        return $stmt->execute([$album_id, $user_id, $permission]);
    }

    public function deletePermission($album_id, $user_id)
    {
        $stmt = $this->pdo->prepare("
        DELETE FROM album_permissions WHERE album_id = ? AND user_id = ?
    ");
        return $stmt->execute([$album_id, $user_id]);
    }
}