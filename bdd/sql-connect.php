<?php

class SqlConnect
{
    public object $db;
    private string $host;
    private string $port;
    private string $dbname;
    private string $password;
    private string $user;
    public function __construct()
    {

        // configuration mysql
        $this->host = '127.0.0.1';
        $this->port = '3306';

        $this->dbname = 'app_photo_album';

        $this->user = 'root';
        $this->password = 'root';

        try {

            // CONNEXION PDO
            $this->db = new PDO(
                'mysql:host=' . $this->host .
                ';port=' . $this->port .
                ';dbname=' . $this->dbname .
                ';charset=utf8',

                $this->user,
                $this->password
            );

            // gestion des erreurs
            $this->db->setAttribute(
                PDO::ATTR_ERRMODE,
                PDO::ERRMODE_EXCEPTION
            );

            // désactive les connexion persistantes
            $this->db->setAttribute(
                PDO::ATTR_PERSISTENT,
                false
            );

        } catch (PDOException $e) {

            die('Erreur connexion BDD : ' . $e->getMessage());
        }
    }

    // transforme les données pr pdo
    public function transformDataInDot($data)
    {

        $dataFormated = [];

        foreach ($data as $key => $value) {

            $dataFormated[':' . $key] = $value;
        }

        return $dataFormated;
    }
}
?>