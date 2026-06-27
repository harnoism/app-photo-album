-- phpMyAdmin SQL Dump
-- version 5.1.2
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost:3306
-- Généré le : sam. 27 juin 2026 à 19:56
-- Version du serveur : 5.7.24
-- Version de PHP : 8.3.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `app_photo_album`
--
CREATE DATABASE IF NOT EXISTS `app_photo_album` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `app_photo_album`;

-- --------------------------------------------------------

--
-- Structure de la table `albums`
--

CREATE TABLE `albums` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `description` text,
  `visibility` enum('private','public','restricted') DEFAULT 'private',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `tags` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `albums`
--

INSERT INTO `albums` (`id`, `user_id`, `title`, `description`, `visibility`, `created_at`, `tags`) VALUES
(45, 3, 'Test', '', 'public', '2026-06-27 15:58:46', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `album_permissions`
--

CREATE TABLE `album_permissions` (
  `id` int(11) NOT NULL,
  `album_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `permission` enum('view','comment','edit') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Structure de la table `comments`
--

CREATE TABLE `comments` (
  `id` int(11) NOT NULL,
  `photo_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Structure de la table `follows`
--

CREATE TABLE `follows` (
  `id` int(11) NOT NULL,
  `follower_id` int(11) NOT NULL,
  `followed_id` int(11) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Structure de la table `photos`
--

CREATE TABLE `photos` (
  `id` int(11) NOT NULL,
  `album_id` int(11) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `description` text,
  `uploaded_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `tags` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `photos`
--

INSERT INTO `photos` (`id`, `album_id`, `filename`, `description`, `uploaded_at`, `tags`) VALUES
(48, 45, 'img_6a3ff346c49354.33113976.jpg', '', '2026-06-27 15:59:02', '[]'),
(49, 45, 'img_6a3ff346c55f63.55656481.jpg', '', '2026-06-27 15:59:02', '[]');

-- --------------------------------------------------------

--
-- Structure de la table `photo_likes`
--

CREATE TABLE `photo_likes` (
  `id` int(11) NOT NULL,
  `photo_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `bio` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `avatar`, `bio`, `created_at`) VALUES
(3, 'admin', 'admin@gmail.com', '$2y$10$N1iTmKx73OR/uVFxJ/Qt8eoLDMwUP5yoYf/KPLeAVh97yt6u6MAuC', 'avatar_3.jpg', 'admin', '2026-05-15 14:03:03'),
(4, 'adminUser_Test', 'adminUserTest@gmail.com', '$2y$10$tCUq485HxzTexRpweGG/bOcQ9J6g4BOirL9sulEkHJ7e2qAGqX8oa', NULL, NULL, '2026-06-22 11:19:57'),
(5, 'admin2', 'admin2@gmail.com', '$2y$10$PEOmwA1ynOyhEepxt7/aee0vxIn8xvFg9E9mfMNF9XmmZPNnQOZa6', NULL, NULL, '2026-06-22 11:44:06'),
(6, 'admin3@gmail.com', 'admin3@gmail.com', '$2y$10$dpg9k12rv2GD3612hXVBZeM4YbWFRKuqHloCQoWKPw4IF9XyiIp6W', NULL, NULL, '2026-06-27 11:25:26');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `albums`
--
ALTER TABLE `albums`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_album_user` (`user_id`);

--
-- Index pour la table `album_permissions`
--
ALTER TABLE `album_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_album_user` (`album_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Index pour la table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_comment_photo` (`photo_id`);

--
-- Index pour la table `follows`
--
ALTER TABLE `follows`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_follow` (`follower_id`,`followed_id`),
  ADD KEY `followed_id` (`followed_id`);

--
-- Index pour la table `photos`
--
ALTER TABLE `photos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_photo_album` (`album_id`);

--
-- Index pour la table `photo_likes`
--
ALTER TABLE `photo_likes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_like` (`photo_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `albums`
--
ALTER TABLE `albums`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT pour la table `album_permissions`
--
ALTER TABLE `album_permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT pour la table `comments`
--
ALTER TABLE `comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT pour la table `follows`
--
ALTER TABLE `follows`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `photos`
--
ALTER TABLE `photos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT pour la table `photo_likes`
--
ALTER TABLE `photo_likes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `albums`
--
ALTER TABLE `albums`
  ADD CONSTRAINT `albums_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `album_permissions`
--
ALTER TABLE `album_permissions`
  ADD CONSTRAINT `album_permissions_ibfk_1` FOREIGN KEY (`album_id`) REFERENCES `albums` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `album_permissions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`photo_id`) REFERENCES `photos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `follows`
--
ALTER TABLE `follows`
  ADD CONSTRAINT `follows_ibfk_1` FOREIGN KEY (`follower_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `follows_ibfk_2` FOREIGN KEY (`followed_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `photos`
--
ALTER TABLE `photos`
  ADD CONSTRAINT `photos_ibfk_1` FOREIGN KEY (`album_id`) REFERENCES `albums` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `photo_likes`
--
ALTER TABLE `photo_likes`
  ADD CONSTRAINT `photo_likes_ibfk_1` FOREIGN KEY (`photo_id`) REFERENCES `photos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `photo_likes_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
