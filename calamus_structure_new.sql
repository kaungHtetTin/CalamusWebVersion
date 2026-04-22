-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Apr 21, 2026 at 07:27 PM
-- Server version: 10.4.19-MariaDB
-- PHP Version: 8.0.7

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `calamus_test`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `admin_id` bigint(20) UNSIGNED DEFAULT NULL,
  `method` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `route_name` varchar(190) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip_address` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `request_payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`request_payload`)),
  `status_code` smallint(5) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `access` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `major_scope` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`major_scope`)),
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `link` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `major` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_seen` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `anouncement`
--

CREATE TABLE `anouncement` (
  `id` int(11) NOT NULL,
  `link` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `major` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_seen` text COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `apps`
--

CREATE TABLE `apps` (
  `id` int(11) NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cover` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `click` int(11) NOT NULL,
  `show_on` tinyint(1) NOT NULL,
  `active_course` int(11) NOT NULL,
  `student_learning` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL,
  `major` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `package_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `platform` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'android',
  `latest_version_code` int(11) DEFAULT NULL,
  `latest_version_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `min_version_code` int(11) DEFAULT NULL,
  `update_message` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `force_update` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `artists`
--

CREATE TABLE `artists` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `major` varchar(50) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `blocks`
--

CREATE TABLE `blocks` (
  `id` int(11) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `blocked_user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cards`
--

CREATE TABLE `cards` (
  `id` int(11) NOT NULL,
  `deck_id` int(10) UNSIGNED NOT NULL,
  `language_id` int(10) UNSIGNED NOT NULL,
  `word` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ipa` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pronunciation_audio` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `parts_of_speech` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `burmese_translation` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `example_sentences` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `synonyms` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `antonyms` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `relatived` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `certificates`
--

CREATE TABLE `certificates` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `date` date NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cn_game_words`
--

CREATE TABLE `cn_game_words` (
  `id` int(11) NOT NULL,
  `display_word` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_image` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_audio` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` tinyint(4) NOT NULL,
  `a` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `b` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `c` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ans` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cn_user_datas`
--

CREATE TABLE `cn_user_datas` (
  `id` bigint(20) NOT NULL,
  `phone` bigint(20) NOT NULL,
  `is_vip` tinyint(4) NOT NULL,
  `study_time` time DEFAULT NULL,
  `game_score` int(11) NOT NULL,
  `basic_exam` int(11) NOT NULL,
  `token` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `login_time` int(11) NOT NULL,
  `first_join` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `last_active` timestamp NULL DEFAULT NULL,
  `song` int(11) NOT NULL,
  `discuss_count` int(11) NOT NULL,
  `learn_count` int(11) NOT NULL,
  `auth_token` varchar(225) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cn_word_of_days`
--

CREATE TABLE `cn_word_of_days` (
  `id` int(11) NOT NULL,
  `chinese` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `myanmar` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `speech` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `example` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `thumb` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `comment`
--

CREATE TABLE `comment` (
  `id` bigint(20) NOT NULL,
  `post_id` bigint(20) NOT NULL,
  `target_type` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `target_id` bigint(20) UNSIGNED DEFAULT NULL,
  `writer_id` bigint(20) NOT NULL,
  `body` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `time` bigint(20) NOT NULL,
  `parent` bigint(20) NOT NULL DEFAULT 0,
  `likes` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `comment_likes`
--

CREATE TABLE `comment_likes` (
  `id` bigint(20) NOT NULL,
  `comment_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `communities`
--

CREATE TABLE `communities` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `platform` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `major` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `conversations`
--

CREATE TABLE `conversations` (
  `id` int(10) UNSIGNED NOT NULL,
  `user1_id` bigint(10) UNSIGNED NOT NULL COMMENT 'First user in conversation',
  `user2_id` bigint(10) UNSIGNED NOT NULL COMMENT 'Second user in conversation',
  `last_message_at` timestamp NULL DEFAULT NULL,
  `major` varchar(125) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `costs`
--

CREATE TABLE `costs` (
  `id` int(11) NOT NULL,
  `cost_category_id` int(11) NOT NULL,
  `title` varchar(225) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` int(11) NOT NULL,
  `major` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` date NOT NULL DEFAULT current_timestamp(),
  `transfer_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cost_categories`
--

CREATE TABLE `cost_categories` (
  `id` int(11) NOT NULL,
  `title` varchar(225) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `course_id` smallint(3) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `title` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `certificate_title` varchar(225) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lessons_count` smallint(3) NOT NULL,
  `cover_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `web_cover` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `details` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_vip` tinyint(4) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `duration` tinyint(3) NOT NULL,
  `background_color` varchar(225) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fee` int(10) NOT NULL,
  `enroll` int(11) NOT NULL,
  `rating` float NOT NULL,
  `major` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sorting` int(11) NOT NULL,
  `preview` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `certificate_code` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `course_categories`
--

CREATE TABLE `course_categories` (
  `id` int(11) NOT NULL,
  `title` varchar(225) COLLATE utf8mb4_unicode_ci NOT NULL,
  `project_name` varchar(225) COLLATE utf8mb4_unicode_ci NOT NULL,
  `keyword` varchar(225) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `course_enroll`
--

CREATE TABLE `course_enroll` (
  `id` int(11) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `course_id` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `progress` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `decks`
--

CREATE TABLE `decks` (
  `id` int(10) UNSIGNED NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `language_id` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `deleted_account_purchases`
--

CREATE TABLE `deleted_account_purchases` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `course_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`course_ids`)),
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ee_error_speech`
--

CREATE TABLE `ee_error_speech` (
  `id` int(11) NOT NULL,
  `speech_id` int(11) NOT NULL,
  `phone` bigint(20) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `error_speech` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ee_game_words`
--

CREATE TABLE `ee_game_words` (
  `id` int(11) NOT NULL,
  `display_word` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_image` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_audio` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` tinyint(4) NOT NULL,
  `a` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `b` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `c` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ans` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ee_saturation`
--

CREATE TABLE `ee_saturation` (
  `id` int(11) NOT NULL,
  `saturation_id` bigint(20) NOT NULL,
  `title` varchar(225) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ee_speakingtrainer`
--

CREATE TABLE `ee_speakingtrainer` (
  `id` int(11) NOT NULL,
  `person_a` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `person_a_mm` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `person_b` varchar(10000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `person_b_mm` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `request_count` int(11) NOT NULL DEFAULT 0,
  `saturation_id` bigint(20) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ee_user_datas`
--

CREATE TABLE `ee_user_datas` (
  `id` bigint(20) NOT NULL,
  `phone` bigint(20) NOT NULL,
  `is_vip` tinyint(4) NOT NULL,
  `gold_plan` tinyint(1) NOT NULL,
  `study_time` time DEFAULT NULL,
  `level_test` int(11) NOT NULL,
  `basic_exam` int(11) NOT NULL DEFAULT 0,
  `game_score` int(11) NOT NULL,
  `speaking_level` int(11) NOT NULL DEFAULT 1,
  `token` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `login_time` int(11) NOT NULL,
  `first_join` timestamp NULL DEFAULT '0000-00-00 00:00:00',
  `last_active` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `song` int(11) NOT NULL,
  `General` int(11) NOT NULL,
  `learn_count` int(11) NOT NULL,
  `discuss_count` int(11) NOT NULL,
  `auth_token` varchar(225) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `faqs`
--

CREATE TABLE `faqs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `major` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `question` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `answer` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `financial_costs`
--

CREATE TABLE `financial_costs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `major` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `spent_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `note` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `friends`
--

CREATE TABLE `friends` (
  `id` int(11) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `korea` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `korea_count` int(11) NOT NULL,
  `english` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `english_count` int(11) NOT NULL,
  `chinese` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `chinese_count` int(11) NOT NULL,
  `japanese` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `japanese_count` int(11) NOT NULL,
  `russian` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `russian_count` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `friendships`
--

CREATE TABLE `friendships` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `friend_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `friend_requests`
--

CREATE TABLE `friend_requests` (
  `id` int(11) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `korea` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `korea_count` int(11) NOT NULL,
  `english` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `english_count` int(11) NOT NULL,
  `chinese` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `chinese_count` int(11) NOT NULL,
  `japanese` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `japanese_count` int(11) NOT NULL,
  `russian` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `russian_count` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `friend_request_lists`
--

CREATE TABLE `friend_request_lists` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `sender_id` bigint(20) UNSIGNED NOT NULL,
  `receiver_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `funds`
--

CREATE TABLE `funds` (
  `id` int(11) NOT NULL,
  `title` varchar(225) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` tinyint(1) NOT NULL,
  `amount` int(11) NOT NULL,
  `current_balance` int(11) NOT NULL,
  `date` date NOT NULL DEFAULT current_timestamp(),
  `staff_id` int(11) NOT NULL,
  `transfer_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `game_words`
--

CREATE TABLE `game_words` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `major` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_word` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_image` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `display_audio` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` tinyint(4) NOT NULL DEFAULT 0,
  `a` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `b` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `c` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ans` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hidden_posts`
--

CREATE TABLE `hidden_posts` (
  `id` int(11) NOT NULL,
  `post_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jp_game_words`
--

CREATE TABLE `jp_game_words` (
  `id` int(11) NOT NULL,
  `display_word` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_image` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_audio` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` tinyint(4) NOT NULL,
  `a` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `b` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `c` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ans` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jp_user_datas`
--

CREATE TABLE `jp_user_datas` (
  `id` bigint(20) NOT NULL,
  `phone` bigint(20) NOT NULL,
  `is_vip` tinyint(4) NOT NULL,
  `gold_plan` tinyint(4) NOT NULL,
  `study_time` time DEFAULT NULL,
  `basic_exam` int(11) NOT NULL,
  `game_score` int(11) NOT NULL,
  `token` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `login_time` int(11) NOT NULL,
  `first_join` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `last_active` timestamp NULL DEFAULT NULL,
  `song` int(11) NOT NULL,
  `discuss_count` int(11) NOT NULL,
  `learn_count` int(11) NOT NULL,
  `auth_token` varchar(225) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jp_word_of_days`
--

CREATE TABLE `jp_word_of_days` (
  `id` int(11) NOT NULL,
  `japanese` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `myanmar` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `speech` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `example` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `thumb` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ko_game_words`
--

CREATE TABLE `ko_game_words` (
  `id` int(11) NOT NULL,
  `display_word` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_image` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_audio` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` tinyint(4) NOT NULL,
  `a` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `b` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `c` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ans` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ko_user_datas`
--

CREATE TABLE `ko_user_datas` (
  `id` bigint(20) NOT NULL,
  `phone` bigint(20) NOT NULL,
  `is_vip` tinyint(4) NOT NULL,
  `gold_plan` tinyint(1) NOT NULL,
  `study_time` time DEFAULT NULL,
  `basic_exam` int(11) NOT NULL,
  `levelone_exam` int(11) NOT NULL,
  `game_score` int(11) NOT NULL,
  `token` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `login_time` int(11) NOT NULL,
  `first_join` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `last_active` timestamp NULL DEFAULT NULL,
  `song` int(11) NOT NULL,
  `discuss_count` int(11) NOT NULL,
  `learn_count` int(11) NOT NULL,
  `auth_token` text COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ko_word_of_days`
--

CREATE TABLE `ko_word_of_days` (
  `id` int(11) NOT NULL,
  `korea` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `myanmar` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `speech` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `example` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `thumb` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `languages`
--

CREATE TABLE `languages` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `certificate_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `code` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `module_code` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `primary_color` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `secondary_color` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `seal` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp(),
  `firebase_topic_user` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `firebase_topic_admin` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `learners`
--

CREATE TABLE `learners` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `learner_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `learner_email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `learner_phone` bigint(20) NOT NULL,
  `password` varchar(225) COLLATE utf8mb4_unicode_ci NOT NULL,
  `learner_image` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'https://www.calamuseducation.com/uploads/placeholder.png',
  `cover_image` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `gender` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `bd_day` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0',
  `bd_month` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0',
  `bd_year` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0',
  `work` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `education` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `region` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `bio` text COLLATE utf8mb4_unicode_ci DEFAULT '',
  `otp` int(11) NOT NULL DEFAULT 0,
  `auth_token` varchar(225) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '[]',
  `auth_token_mobile` text COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '[]',
  `email_verified_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `learner_email_verifications`
--

CREATE TABLE `learner_email_verifications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lessons`
--

CREATE TABLE `lessons` (
  `id` int(11) NOT NULL,
  `category_id` int(5) NOT NULL,
  `date` bigint(20) NOT NULL,
  `isVideo` tinyint(4) NOT NULL,
  `isVip` tinyint(4) NOT NULL,
  `isChannel` tinyint(4) NOT NULL,
  `link` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `download_url` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `document_link` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title_mini` varchar(225) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `major` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `thumbnail` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `like_count` int(11) NOT NULL DEFAULT 0,
  `comment_count` int(11) NOT NULL DEFAULT 0,
  `share_count` int(11) NOT NULL DEFAULT 0,
  `view_count` int(11) NOT NULL DEFAULT 0,
  `duration` int(11) NOT NULL DEFAULT 0,
  `notes` text COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lessons_categories`
--

CREATE TABLE `lessons_categories` (
  `id` int(5) NOT NULL,
  `course_id` smallint(3) NOT NULL,
  `category` char(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_title` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` bigint(20) NOT NULL,
  `major` char(32) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lesson_likes`
--

CREATE TABLE `lesson_likes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `lesson_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `library_books`
--

CREATE TABLE `library_books` (
  `id` int(10) UNSIGNED NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pdf_file` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pdf_url` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cover_image` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `major` varchar(225) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'english',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `live_classes`
--

CREATE TABLE `live_classes` (
  `id` int(11) NOT NULL,
  `title` varchar(225) COLLATE utf8mb4_unicode_ci NOT NULL,
  `link` varchar(225) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int(10) UNSIGNED NOT NULL,
  `conversation_id` int(10) UNSIGNED NOT NULL,
  `sender_id` bigint(10) UNSIGNED NOT NULL,
  `message_type` enum('text','voice','image') COLLATE utf8mb4_unicode_ci DEFAULT 'text',
  `message_text` text COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'For text messages',
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'For voice and image messages',
  `file_size` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'File size in bytes',
  `is_read` tinyint(1) DEFAULT 0,
  `major` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mini_programs`
--

CREATE TABLE `mini_programs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(225) COLLATE utf8mb4_unicode_ci NOT NULL,
  `link_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `major` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mylikes`
--

CREATE TABLE `mylikes` (
  `id` bigint(20) NOT NULL,
  `content_id` bigint(20) NOT NULL,
  `likes` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `rowNo` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notifiable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notifiable_id` bigint(20) UNSIGNED NOT NULL,
  `data` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `package_plans`
--

CREATE TABLE `package_plans` (
  `id` int(11) NOT NULL,
  `major` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `courses` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`courses`)),
  `active` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `package_plan_courses`
--

CREATE TABLE `package_plan_courses` (
  `id` int(11) NOT NULL,
  `package_id` int(11) NOT NULL,
  `course_id` smallint(3) NOT NULL,
  `is_required` tinyint(1) DEFAULT 0,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `partners`
--

CREATE TABLE `partners` (
  `id` int(11) NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `company_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `private_code` varchar(125) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_codes_generated` int(11) DEFAULT 0,
  `total_codes_used` int(11) DEFAULT 0,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `profile_image` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `website` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(225) COLLATE utf8mb4_unicode_ci NOT NULL,
  `state` varchar(125) COLLATE utf8mb4_unicode_ci NOT NULL,
  `national_id_card_number` varchar(225) COLLATE utf8mb4_unicode_ci NOT NULL,
  `national_id_card_front_image` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `national_id_card_back_image` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `commission_rate` decimal(5,2) DEFAULT 10.00,
  `status` enum('active','inactive','suspended') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_login` timestamp NULL DEFAULT NULL,
  `email_verified` tinyint(1) DEFAULT 0,
  `account_verified` tinyint(4) NOT NULL,
  `verification_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reset_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reset_token_expires` timestamp NULL DEFAULT NULL,
  `verification_code` text COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `partner_earnings`
--

CREATE TABLE `partner_earnings` (
  `id` int(11) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `partner_id` int(11) NOT NULL,
  `target_course_id` int(11) DEFAULT NULL,
  `target_package_id` int(11) DEFAULT NULL,
  `learner_phone` bigint(20) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `commission_rate` decimal(5,2) NOT NULL,
  `amount_received` decimal(10,2) DEFAULT 0.00,
  `status` enum('pending','paid') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `partner_password_reset_tokens`
--

CREATE TABLE `partner_password_reset_tokens` (
  `id` int(11) NOT NULL,
  `partner_id` int(11) NOT NULL,
  `token` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `used` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `partner_payment_histories`
--

CREATE TABLE `partner_payment_histories` (
  `id` int(11) NOT NULL,
  `partner_id` int(11) NOT NULL,
  `staff_id` int(11) DEFAULT NULL,
  `payment_method` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('pending','received','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `transaction_screenshot` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `partner_payment_methods`
--

CREATE TABLE `partner_payment_methods` (
  `id` int(11) NOT NULL,
  `partner_id` int(11) NOT NULL,
  `payment_method` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `partner_sessions`
--

CREATE TABLE `partner_sessions` (
  `id` int(11) NOT NULL,
  `partner_id` int(11) NOT NULL,
  `session_token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expired_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_resets`
--

CREATE TABLE `password_resets` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `amount` int(11) NOT NULL,
  `major` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `courses` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`courses`)),
  `screenshot` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `approve` tinyint(1) NOT NULL,
  `activated` tinyint(1) NOT NULL DEFAULT 0,
  `meta` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`meta`)),
  `transaction_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` date NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_methods`
--

CREATE TABLE `payment_methods` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `posts`
--

CREATE TABLE `posts` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  `post_id` bigint(20) NOT NULL,
  `learner_id` bigint(20) DEFAULT NULL,
  `body` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `blog_title` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `post_like` int(11) NOT NULL,
  `comments` int(11) NOT NULL,
  `image` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `video_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vimeo` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `has_video` tinyint(4) NOT NULL DEFAULT 0,
  `share` bigint(20) NOT NULL DEFAULT 0,
  `view_count` int(11) NOT NULL DEFAULT 0,
  `share_count` int(11) NOT NULL DEFAULT 0,
  `show_on_blog` int(11) NOT NULL DEFAULT 0,
  `hide` tinyint(1) NOT NULL DEFAULT 0,
  `major` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pricings`
--

CREATE TABLE `pricings` (
  `id` int(11) NOT NULL,
  `app_id` int(11) NOT NULL,
  `pricing` text COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `questions`
--

CREATE TABLE `questions` (
  `id` int(11) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `question` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `answer` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `major` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `time` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ratings`
--

CREATE TABLE `ratings` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `star` int(11) NOT NULL,
  `review` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `time` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `remember_tokens`
--

CREATE TABLE `remember_tokens` (
  `id` int(11) NOT NULL,
  `admin_id` int(11) NOT NULL,
  `token_hash` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `report`
--

CREATE TABLE `report` (
  `id` bigint(20) NOT NULL,
  `post_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `requestedsongs`
--

CREATE TABLE `requestedsongs` (
  `id` int(11) NOT NULL,
  `artist_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `vote` int(11) NOT NULL,
  `is_voted` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `roadmaps`
--

CREATE TABLE `roadmaps` (
  `id` int(10) UNSIGNED NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `major` varchar(225) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checklist` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ru_game_words`
--

CREATE TABLE `ru_game_words` (
  `id` int(11) NOT NULL,
  `display_word` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_image` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_audio` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` tinyint(4) NOT NULL,
  `a` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `b` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `c` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ans` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ru_user_datas`
--

CREATE TABLE `ru_user_datas` (
  `id` bigint(20) NOT NULL,
  `phone` bigint(20) NOT NULL,
  `is_vip` tinyint(4) NOT NULL,
  `gold_plan` tinyint(4) NOT NULL,
  `study_time` time DEFAULT NULL,
  `basic_exam` int(11) NOT NULL,
  `levelone_exam` int(11) NOT NULL,
  `game_score` int(11) NOT NULL,
  `token` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `login_time` int(11) NOT NULL,
  `first_join` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `last_active` timestamp NULL DEFAULT NULL,
  `song` int(11) NOT NULL,
  `discuss_count` int(11) NOT NULL,
  `learn_count` int(11) NOT NULL,
  `auth_token` varchar(225) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ru_word_of_days`
--

CREATE TABLE `ru_word_of_days` (
  `id` int(11) NOT NULL,
  `russian` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `myanmar` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `speech` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `example` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `thumb` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `salaries`
--

CREATE TABLE `salaries` (
  `id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL,
  `amount` int(11) NOT NULL,
  `project` varchar(225) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` date NOT NULL DEFAULT current_timestamp(),
  `transfer_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `save_replies`
--

CREATE TABLE `save_replies` (
  `id` int(11) NOT NULL,
  `title` varchar(225) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `major` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `songs`
--

CREATE TABLE `songs` (
  `id` int(11) NOT NULL,
  `artist_id` bigint(20) UNSIGNED DEFAULT NULL,
  `major` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `asset_slug` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `like_count` int(11) NOT NULL DEFAULT 0,
  `download_count` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `legacy_meta` longtext COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `audio_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `thumbnail_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lyric_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `song_likes`
--

CREATE TABLE `song_likes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `song_id` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `speaking_dialogues`
--

CREATE TABLE `speaking_dialogues` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `major` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `speaking_dialogue_title_id` bigint(20) UNSIGNED NOT NULL,
  `person_a_text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `person_a_translation` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `person_b_text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `person_b_translation` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `speaking_dialogue_titles`
--

CREATE TABLE `speaking_dialogue_titles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `major` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `speaking_error_logs`
--

CREATE TABLE `speaking_error_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `major` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dialogue_id` bigint(20) UNSIGNED NOT NULL,
  `error_text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `staffs`
--

CREATE TABLE `staffs` (
  `id` int(11) NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rank` varchar(225) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ranking` int(11) NOT NULL,
  `project` varchar(11) COLLATE utf8mb4_unicode_ci NOT NULL,
  `present` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `studies`
--

CREATE TABLE `studies` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  `learner_id` bigint(20) DEFAULT NULL,
  `lesson_id` int(11) NOT NULL,
  `frequent` smallint(3) NOT NULL,
  `exercise_mark` smallint(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `study_plan`
--

CREATE TABLE `study_plan` (
  `id` smallint(4) NOT NULL,
  `course_id` smallint(3) NOT NULL,
  `lesson_id` int(11) NOT NULL,
  `day` smallint(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `teachers`
--

CREATE TABLE `teachers` (
  `id` int(11) NOT NULL,
  `name` varchar(225) COLLATE utf8mb4_unicode_ci NOT NULL,
  `profile` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rank` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `facebook` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telegram` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `youtube` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `qualification` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `experience` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_course` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `timer`
--

CREATE TABLE `timer` (
  `id` int(11) NOT NULL,
  `korea` int(11) NOT NULL,
  `english` int(11) NOT NULL,
  `chinese` int(11) NOT NULL,
  `japanese` int(11) NOT NULL,
  `russian` int(11) NOT NULL,
  `day` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_card_states`
--

CREATE TABLE `user_card_states` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `card_id` bigint(20) UNSIGNED NOT NULL,
  `ef` decimal(5,2) NOT NULL DEFAULT 2.50,
  `interval_` int(11) NOT NULL DEFAULT 0,
  `repetitions` int(11) NOT NULL DEFAULT 0,
  `due_at` int(11) DEFAULT NULL,
  `suspended` tinyint(1) NOT NULL DEFAULT 0,
  `paused_until` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_data`
--

CREATE TABLE `user_data` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `major` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_vip` tinyint(4) NOT NULL DEFAULT 0,
  `diamond_plan` tinyint(4) NOT NULL DEFAULT 0,
  `game_score` int(11) NOT NULL DEFAULT 0,
  `speaking_level` int(11) DEFAULT NULL,
  `meta` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`meta`)),
  `token` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT '(DC2Type:json)' CHECK (json_valid(`token`)),
  `login_time` int(11) NOT NULL DEFAULT 0,
  `first_join` timestamp NULL DEFAULT NULL,
  `last_active` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_learning_progress`
--

CREATE TABLE `user_learning_progress` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `language_id` int(10) UNSIGNED NOT NULL,
  `deck_id` int(10) UNSIGNED NOT NULL,
  `current_learning_day` int(11) NOT NULL DEFAULT 1,
  `last_session_date` date NOT NULL,
  `total_learning_days` int(11) NOT NULL DEFAULT 1,
  `streak_count` int(11) NOT NULL DEFAULT 1,
  `longest_streak` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_roadmaps`
--

CREATE TABLE `user_roadmaps` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` bigint(10) UNSIGNED NOT NULL,
  `roadmap_id` int(11) NOT NULL,
  `checklist` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`checklist`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_word_skips`
--

CREATE TABLE `user_word_skips` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `card_id` bigint(20) UNSIGNED NOT NULL,
  `language_id` int(10) UNSIGNED NOT NULL,
  `reason` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `skipped_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `vipusers`
--

CREATE TABLE `vipusers` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `course` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `course_id` int(11) NOT NULL,
  `major` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` date DEFAULT current_timestamp(),
  `deleted_account` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `weeksongs`
--

CREATE TABLE `weeksongs` (
  `id` int(11) NOT NULL,
  `song_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `votes` int(11) NOT NULL,
  `major` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `wordofday`
--

CREATE TABLE `wordofday` (
  `id` int(11) NOT NULL,
  `english` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `myanmar` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `speech` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `example` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `thumb` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `word_of_days`
--

CREATE TABLE `word_of_days` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `major` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `word` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `translation` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `speech` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `example` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `thumb` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `audio` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `activity_logs_admin_id_index` (`admin_id`);

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `admins_email_unique` (`email`);

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `anouncement`
--
ALTER TABLE `anouncement`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `apps`
--
ALTER TABLE `apps`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `artists`
--
ALTER TABLE `artists`
  ADD PRIMARY KEY (`id`),
  ADD KEY `artists_major_index` (`major`),
  ADD KEY `artists_image_url_index` (`image_url`);

--
-- Indexes for table `blocks`
--
ALTER TABLE `blocks`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cards`
--
ALTER TABLE `cards`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_deck_id` (`deck_id`),
  ADD KEY `idx_language_id` (`language_id`),
  ADD KEY `idx_language_deck` (`language_id`,`deck_id`);

--
-- Indexes for table `certificates`
--
ALTER TABLE `certificates`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cn_game_words`
--
ALTER TABLE `cn_game_words`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cn_user_datas`
--
ALTER TABLE `cn_user_datas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `phone` (`phone`);

--
-- Indexes for table `cn_word_of_days`
--
ALTER TABLE `cn_word_of_days`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `comment`
--
ALTER TABLE `comment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `post_id` (`post_id`),
  ADD KEY `writer_id` (`writer_id`),
  ADD KEY `time` (`time`),
  ADD KEY `comment_target_type_target_id_idx` (`target_type`,`target_id`);

--
-- Indexes for table `comment_likes`
--
ALTER TABLE `comment_likes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `communities`
--
ALTER TABLE `communities`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `conversations`
--
ALTER TABLE `conversations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_conversation` (`user1_id`,`user2_id`,`major`) USING BTREE,
  ADD KEY `idx_user1` (`user1_id`),
  ADD KEY `idx_user2` (`user2_id`),
  ADD KEY `idx_last_message` (`last_message_at`);

--
-- Indexes for table `costs`
--
ALTER TABLE `costs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cost_categories`
--
ALTER TABLE `cost_categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`course_id`);

--
-- Indexes for table `course_categories`
--
ALTER TABLE `course_categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `course_enroll`
--
ALTER TABLE `course_enroll`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `decks`
--
ALTER TABLE `decks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_language_id` (`language_id`);

--
-- Indexes for table `deleted_account_purchases`
--
ALTER TABLE `deleted_account_purchases`
  ADD PRIMARY KEY (`id`),
  ADD KEY `deleted_account_purchases_email_index` (`email`);

--
-- Indexes for table `ee_error_speech`
--
ALTER TABLE `ee_error_speech`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ee_game_words`
--
ALTER TABLE `ee_game_words`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ee_saturation`
--
ALTER TABLE `ee_saturation`
  ADD PRIMARY KEY (`id`),
  ADD KEY `saturation_id` (`saturation_id`);

--
-- Indexes for table `ee_speakingtrainer`
--
ALTER TABLE `ee_speakingtrainer`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ee_user_datas`
--
ALTER TABLE `ee_user_datas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `phone` (`phone`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `faqs`
--
ALTER TABLE `faqs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `financial_costs`
--
ALTER TABLE `financial_costs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `financial_costs_major_spent_at_index` (`major`,`spent_at`),
  ADD KEY `financial_costs_major_index` (`major`),
  ADD KEY `financial_costs_spent_at_index` (`spent_at`);

--
-- Indexes for table `friends`
--
ALTER TABLE `friends`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `friendships`
--
ALTER TABLE `friendships`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `friendships_user_id_friend_id_unique` (`user_id`,`friend_id`),
  ADD KEY `friendships_friend_id_foreign` (`friend_id`);

--
-- Indexes for table `friend_requests`
--
ALTER TABLE `friend_requests`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `friend_request_lists`
--
ALTER TABLE `friend_request_lists`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `friend_request_lists_sender_id_receiver_id_unique` (`sender_id`,`receiver_id`),
  ADD KEY `friend_request_lists_receiver_id_foreign` (`receiver_id`);

--
-- Indexes for table `funds`
--
ALTER TABLE `funds`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `game_words`
--
ALTER TABLE `game_words`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `hidden_posts`
--
ALTER TABLE `hidden_posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `post_id` (`post_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `jp_game_words`
--
ALTER TABLE `jp_game_words`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `jp_user_datas`
--
ALTER TABLE `jp_user_datas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `phone` (`phone`);

--
-- Indexes for table `jp_word_of_days`
--
ALTER TABLE `jp_word_of_days`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ko_game_words`
--
ALTER TABLE `ko_game_words`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ko_user_datas`
--
ALTER TABLE `ko_user_datas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `phone` (`phone`);

--
-- Indexes for table `ko_word_of_days`
--
ALTER TABLE `ko_word_of_days`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `languages`
--
ALTER TABLE `languages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `learners`
--
ALTER TABLE `learners`
  ADD PRIMARY KEY (`id`),
  ADD KEY `learner_name` (`learner_name`),
  ADD KEY `learner_phone` (`learner_phone`),
  ADD KEY `learners_user_id_index` (`user_id`);

--
-- Indexes for table `learner_email_verifications`
--
ALTER TABLE `learner_email_verifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `learner_email_verifications_email_index` (`email`),
  ADD KEY `learner_email_verifications_user_id_index` (`user_id`);

--
-- Indexes for table `lessons`
--
ALTER TABLE `lessons`
  ADD PRIMARY KEY (`id`),
  ADD KEY `isVideo` (`isVideo`),
  ADD KEY `isVip` (`isVip`),
  ADD KEY `major` (`major`),
  ADD KEY `lessons_category_id_index` (`category_id`);
ALTER TABLE `lessons` ADD FULLTEXT KEY `title` (`title`);

--
-- Indexes for table `lessons_categories`
--
ALTER TABLE `lessons_categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id` (`id`);

--
-- Indexes for table `lesson_likes`
--
ALTER TABLE `lesson_likes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `lesson_likes_lesson_id_user_id_unique` (`lesson_id`,`user_id`),
  ADD KEY `lesson_likes_user_id_index` (`user_id`);

--
-- Indexes for table `library_books`
--
ALTER TABLE `library_books`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `live_classes`
--
ALTER TABLE `live_classes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_conversation` (`conversation_id`),
  ADD KEY `idx_sender` (`sender_id`),
  ADD KEY `idx_created` (`created_at`),
  ADD KEY `idx_read` (`is_read`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `mini_programs`
--
ALTER TABLE `mini_programs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `mylikes`
--
ALTER TABLE `mylikes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_notifiable_type_notifiable_id_index` (`notifiable_type`,`notifiable_id`),
  ADD KEY `notifications_notifiable_type_notifiable_id_read_at_index` (`notifiable_type`,`notifiable_id`,`read_at`),
  ADD KEY `notifications_created_at_index` (`created_at`);

--
-- Indexes for table `package_plans`
--
ALTER TABLE `package_plans`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_category_id` (`major`);

--
-- Indexes for table `package_plan_courses`
--
ALTER TABLE `package_plan_courses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_package_course` (`package_id`,`course_id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `partners`
--
ALTER TABLE `partners`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `partner_earnings`
--
ALTER TABLE `partner_earnings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_promotion_codes_partner` (`partner_id`),
  ADD KEY `idx_promotion_codes_status` (`status`),
  ADD KEY `partner_earnings_user_id_index` (`user_id`);

--
-- Indexes for table `partner_password_reset_tokens`
--
ALTER TABLE `partner_password_reset_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `partner_id` (`partner_id`);

--
-- Indexes for table `partner_payment_histories`
--
ALTER TABLE `partner_payment_histories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_partner_payment_histories_partner_id` (`partner_id`),
  ADD KEY `idx_partner_payment_histories_status` (`status`),
  ADD KEY `idx_partner_payment_histories_created_at` (`created_at`),
  ADD KEY `idx_partner_payment_histories_partner_status` (`partner_id`,`status`);

--
-- Indexes for table `partner_payment_methods`
--
ALTER TABLE `partner_payment_methods`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_partner_payment_methods_partner_id` (`partner_id`),
  ADD KEY `idx_partner_payment_methods_payment_method` (`payment_method`);

--
-- Indexes for table `partner_sessions`
--
ALTER TABLE `partner_sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `session_token` (`session_token`),
  ADD KEY `partner_id` (`partner_id`);

--
-- Indexes for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD KEY `password_resets_email_index` (`email`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `payment_methods`
--
ALTER TABLE `payment_methods`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permissions_name_unique` (`name`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`);

--
-- Indexes for table `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `post_id` (`post_id`),
  ADD KEY `learner_id` (`learner_id`),
  ADD KEY `post_like` (`post_like`),
  ADD KEY `comments` (`comments`),
  ADD KEY `has_image` (`has_video`),
  ADD KEY `major` (`major`);

--
-- Indexes for table `pricings`
--
ALTER TABLE `pricings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `questions`
--
ALTER TABLE `questions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ratings`
--
ALTER TABLE `ratings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `remember_tokens`
--
ALTER TABLE `remember_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_token` (`token_hash`),
  ADD KEY `idx_admin` (`admin_id`),
  ADD KEY `idx_expires` (`expires_at`);

--
-- Indexes for table `report`
--
ALTER TABLE `report`
  ADD PRIMARY KEY (`id`),
  ADD KEY `post_id` (`post_id`);

--
-- Indexes for table `requestedsongs`
--
ALTER TABLE `requestedsongs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `artist_id` (`artist_id`);

--
-- Indexes for table `roadmaps`
--
ALTER TABLE `roadmaps`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ru_game_words`
--
ALTER TABLE `ru_game_words`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ru_user_datas`
--
ALTER TABLE `ru_user_datas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `phone` (`phone`);

--
-- Indexes for table `ru_word_of_days`
--
ALTER TABLE `ru_word_of_days`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `salaries`
--
ALTER TABLE `salaries`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `save_replies`
--
ALTER TABLE `save_replies`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `songs`
--
ALTER TABLE `songs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `title` (`title`),
  ADD KEY `like_count` (`like_count`),
  ADD KEY `download_count` (`download_count`),
  ADD KEY `songs_major_index` (`major`),
  ADD KEY `songs_asset_slug_index` (`asset_slug`),
  ADD KEY `songs_artist_id_index` (`artist_id`),
  ADD KEY `songs_audio_url_index` (`audio_url`),
  ADD KEY `songs_image_url_index` (`image_url`),
  ADD KEY `songs_thumbnail_url_index` (`thumbnail_url`),
  ADD KEY `songs_lyric_url_index` (`lyric_url`);

--
-- Indexes for table `song_likes`
--
ALTER TABLE `song_likes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `song_likes_user_id_song_id_unique` (`user_id`,`song_id`),
  ADD KEY `song_likes_user_id_index` (`user_id`);

--
-- Indexes for table `speaking_dialogues`
--
ALTER TABLE `speaking_dialogues`
  ADD PRIMARY KEY (`id`),
  ADD KEY `speaking_dialogues_major_index` (`major`),
  ADD KEY `speaking_dialogues_speaking_dialogue_title_id_foreign` (`speaking_dialogue_title_id`);

--
-- Indexes for table `speaking_dialogue_titles`
--
ALTER TABLE `speaking_dialogue_titles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `speaking_dialogue_titles_major_index` (`major`);

--
-- Indexes for table `speaking_error_logs`
--
ALTER TABLE `speaking_error_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `speaking_error_logs_user_id_major_index` (`user_id`,`major`),
  ADD KEY `speaking_error_logs_dialogue_id_foreign` (`dialogue_id`);

--
-- Indexes for table `staffs`
--
ALTER TABLE `staffs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `studies`
--
ALTER TABLE `studies`
  ADD PRIMARY KEY (`id`),
  ADD KEY `learner_id` (`learner_id`),
  ADD KEY `lesson_id` (`lesson_id`),
  ADD KEY `studies_user_id_index` (`user_id`),
  ADD KEY `studies_lesson_id_index` (`lesson_id`);

--
-- Indexes for table `study_plan`
--
ALTER TABLE `study_plan`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `teachers`
--
ALTER TABLE `teachers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `timer`
--
ALTER TABLE `timer`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- Indexes for table `user_card_states`
--
ALTER TABLE `user_card_states`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_card` (`user_id`,`card_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_card_id` (`card_id`),
  ADD KEY `idx_due_at` (`due_at`),
  ADD KEY `idx_paused_until` (`paused_until`);

--
-- Indexes for table `user_data`
--
ALTER TABLE `user_data`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_data_user_id_major_unique` (`user_id`,`major`);

--
-- Indexes for table `user_learning_progress`
--
ALTER TABLE `user_learning_progress`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user_word_skips`
--
ALTER TABLE `user_word_skips`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_card_id` (`card_id`),
  ADD KEY `idx_language_id` (`language_id`),
  ADD KEY `idx_user_language` (`user_id`,`language_id`);

--
-- Indexes for table `vipusers`
--
ALTER TABLE `vipusers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course` (`course`),
  ADD KEY `phone` (`phone`),
  ADD KEY `major` (`major`);

--
-- Indexes for table `weeksongs`
--
ALTER TABLE `weeksongs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `wordofday`
--
ALTER TABLE `wordofday`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `word_of_days`
--
ALTER TABLE `word_of_days`
  ADD PRIMARY KEY (`id`),
  ADD KEY `word_of_days_major_index` (`major`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `anouncement`
--
ALTER TABLE `anouncement`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `apps`
--
ALTER TABLE `apps`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `artists`
--
ALTER TABLE `artists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `blocks`
--
ALTER TABLE `blocks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cards`
--
ALTER TABLE `cards`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `certificates`
--
ALTER TABLE `certificates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cn_game_words`
--
ALTER TABLE `cn_game_words`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cn_user_datas`
--
ALTER TABLE `cn_user_datas`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cn_word_of_days`
--
ALTER TABLE `cn_word_of_days`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `comment`
--
ALTER TABLE `comment`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `comment_likes`
--
ALTER TABLE `comment_likes`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `communities`
--
ALTER TABLE `communities`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `conversations`
--
ALTER TABLE `conversations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `costs`
--
ALTER TABLE `costs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cost_categories`
--
ALTER TABLE `cost_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `course_id` smallint(3) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `course_categories`
--
ALTER TABLE `course_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `course_enroll`
--
ALTER TABLE `course_enroll`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `decks`
--
ALTER TABLE `decks`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `deleted_account_purchases`
--
ALTER TABLE `deleted_account_purchases`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ee_error_speech`
--
ALTER TABLE `ee_error_speech`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ee_game_words`
--
ALTER TABLE `ee_game_words`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ee_saturation`
--
ALTER TABLE `ee_saturation`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ee_speakingtrainer`
--
ALTER TABLE `ee_speakingtrainer`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ee_user_datas`
--
ALTER TABLE `ee_user_datas`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `faqs`
--
ALTER TABLE `faqs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `financial_costs`
--
ALTER TABLE `financial_costs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `friends`
--
ALTER TABLE `friends`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `friendships`
--
ALTER TABLE `friendships`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `friend_requests`
--
ALTER TABLE `friend_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `friend_request_lists`
--
ALTER TABLE `friend_request_lists`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `funds`
--
ALTER TABLE `funds`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `game_words`
--
ALTER TABLE `game_words`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hidden_posts`
--
ALTER TABLE `hidden_posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jp_game_words`
--
ALTER TABLE `jp_game_words`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jp_user_datas`
--
ALTER TABLE `jp_user_datas`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jp_word_of_days`
--
ALTER TABLE `jp_word_of_days`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ko_game_words`
--
ALTER TABLE `ko_game_words`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ko_user_datas`
--
ALTER TABLE `ko_user_datas`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ko_word_of_days`
--
ALTER TABLE `ko_word_of_days`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `languages`
--
ALTER TABLE `languages`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `learners`
--
ALTER TABLE `learners`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `learner_email_verifications`
--
ALTER TABLE `learner_email_verifications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lessons`
--
ALTER TABLE `lessons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lessons_categories`
--
ALTER TABLE `lessons_categories`
  MODIFY `id` int(5) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lesson_likes`
--
ALTER TABLE `lesson_likes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `library_books`
--
ALTER TABLE `library_books`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `live_classes`
--
ALTER TABLE `live_classes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `mini_programs`
--
ALTER TABLE `mini_programs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `mylikes`
--
ALTER TABLE `mylikes`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `package_plans`
--
ALTER TABLE `package_plans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `package_plan_courses`
--
ALTER TABLE `package_plan_courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `partners`
--
ALTER TABLE `partners`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `partner_earnings`
--
ALTER TABLE `partner_earnings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `partner_password_reset_tokens`
--
ALTER TABLE `partner_password_reset_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `partner_payment_histories`
--
ALTER TABLE `partner_payment_histories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `partner_payment_methods`
--
ALTER TABLE `partner_payment_methods`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `partner_sessions`
--
ALTER TABLE `partner_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payment_methods`
--
ALTER TABLE `payment_methods`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `posts`
--
ALTER TABLE `posts`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pricings`
--
ALTER TABLE `pricings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `questions`
--
ALTER TABLE `questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ratings`
--
ALTER TABLE `ratings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `remember_tokens`
--
ALTER TABLE `remember_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `report`
--
ALTER TABLE `report`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `requestedsongs`
--
ALTER TABLE `requestedsongs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roadmaps`
--
ALTER TABLE `roadmaps`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ru_game_words`
--
ALTER TABLE `ru_game_words`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ru_user_datas`
--
ALTER TABLE `ru_user_datas`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ru_word_of_days`
--
ALTER TABLE `ru_word_of_days`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `salaries`
--
ALTER TABLE `salaries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `save_replies`
--
ALTER TABLE `save_replies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `songs`
--
ALTER TABLE `songs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `song_likes`
--
ALTER TABLE `song_likes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `speaking_dialogues`
--
ALTER TABLE `speaking_dialogues`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `speaking_dialogue_titles`
--
ALTER TABLE `speaking_dialogue_titles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `speaking_error_logs`
--
ALTER TABLE `speaking_error_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `staffs`
--
ALTER TABLE `staffs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `studies`
--
ALTER TABLE `studies`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `study_plan`
--
ALTER TABLE `study_plan`
  MODIFY `id` smallint(4) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `teachers`
--
ALTER TABLE `teachers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_card_states`
--
ALTER TABLE `user_card_states`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_data`
--
ALTER TABLE `user_data`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_learning_progress`
--
ALTER TABLE `user_learning_progress`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_word_skips`
--
ALTER TABLE `user_word_skips`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `vipusers`
--
ALTER TABLE `vipusers`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `weeksongs`
--
ALTER TABLE `weeksongs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `wordofday`
--
ALTER TABLE `wordofday`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `word_of_days`
--
ALTER TABLE `word_of_days`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `comment`
--
ALTER TABLE `comment`
  ADD CONSTRAINT `comment_ibfk_1` FOREIGN KEY (`writer_id`) REFERENCES `learners` (`learner_phone`),
  ADD CONSTRAINT `comment_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `posts` (`post_id`);

--
-- Constraints for table `comment_likes`
--
ALTER TABLE `comment_likes`
  ADD CONSTRAINT `comment_likes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `learners` (`learner_phone`);

--
-- Constraints for table `ee_user_datas`
--
ALTER TABLE `ee_user_datas`
  ADD CONSTRAINT `ee_user_datas_ibfk_1` FOREIGN KEY (`phone`) REFERENCES `learners` (`learner_phone`);

--
-- Constraints for table `friendships`
--
ALTER TABLE `friendships`
  ADD CONSTRAINT `friendships_friend_id_foreign` FOREIGN KEY (`friend_id`) REFERENCES `learners` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `friendships_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `learners` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `friend_request_lists`
--
ALTER TABLE `friend_request_lists`
  ADD CONSTRAINT `friend_request_lists_receiver_id_foreign` FOREIGN KEY (`receiver_id`) REFERENCES `learners` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `friend_request_lists_sender_id_foreign` FOREIGN KEY (`sender_id`) REFERENCES `learners` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `fk_messages_conversation` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `package_plan_courses`
--
ALTER TABLE `package_plan_courses`
  ADD CONSTRAINT `package_plan_courses_ibfk_1` FOREIGN KEY (`package_id`) REFERENCES `package_plans` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `package_plan_courses_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`) ON DELETE CASCADE;

--
-- Constraints for table `partner_earnings`
--
ALTER TABLE `partner_earnings`
  ADD CONSTRAINT `partner_earnings_ibfk_1` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `partner_password_reset_tokens`
--
ALTER TABLE `partner_password_reset_tokens`
  ADD CONSTRAINT `partner_password_reset_tokens_ibfk_1` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`);

--
-- Constraints for table `partner_payment_histories`
--
ALTER TABLE `partner_payment_histories`
  ADD CONSTRAINT `partner_payment_histories_ibfk_1` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `partner_payment_methods`
--
ALTER TABLE `partner_payment_methods`
  ADD CONSTRAINT `partner_payment_methods_ibfk_1` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `partner_sessions`
--
ALTER TABLE `partner_sessions`
  ADD CONSTRAINT `partner_sessions_ibfk_1` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `report`
--
ALTER TABLE `report`
  ADD CONSTRAINT `report_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`post_id`);

--
-- Constraints for table `requestedsongs`
--
ALTER TABLE `requestedsongs`
  ADD CONSTRAINT `requestedsongs_ibfk_1` FOREIGN KEY (`artist_id`) REFERENCES `artists` (`id`);

--
-- Constraints for table `speaking_dialogues`
--
ALTER TABLE `speaking_dialogues`
  ADD CONSTRAINT `speaking_dialogues_speaking_dialogue_title_id_foreign` FOREIGN KEY (`speaking_dialogue_title_id`) REFERENCES `speaking_dialogue_titles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `speaking_error_logs`
--
ALTER TABLE `speaking_error_logs`
  ADD CONSTRAINT `speaking_error_logs_dialogue_id_foreign` FOREIGN KEY (`dialogue_id`) REFERENCES `speaking_dialogues` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
