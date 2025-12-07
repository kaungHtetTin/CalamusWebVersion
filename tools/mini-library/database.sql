-- Mini Library Database Structure (Minimal)
-- For storing books/PDFs that users can download

-- Table: library_books
-- Stores book/PDF information
CREATE TABLE IF NOT EXISTS `library_books` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `pdf_file` VARCHAR(500) NOT NULL,
  `cover_image` VARCHAR(500) DEFAULT NULL,
  `category` VARCHAR(100) DEFAULT NULL,
  `major` VARCHAR(50) DEFAULT 'english',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_major` (`major`),
  KEY `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


