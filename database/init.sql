-- University Asset Management System
-- MySQL initialization script
--
-- Usage (recommended): run against an existing database name that matches DB_NAME
--   mysql -u root -p your_database < database/init.sql
--
-- Notes:
-- - This script creates the tables expected by the Next.js API routes under src/app/api/*.
-- - It does NOT seed any default/test passwords. Create your first HOD user via POST /api/register.

SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('hod', 'employee') DEFAULT 'employee',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed one initial HOD user (change password after first login)
-- Email: hod@example.com
-- Password: ChangeMe123!
INSERT INTO users (name, email, password_hash, role)
VALUES (
  'HOD',
  'hod@example.com',
  '$2b$10$IOUo2GjxYfLYr4Yqg/dZX.KChuBlvW0ZLhKcyVkH3eZ8cdcAvj9X.',
  'hod'
)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  role = VALUES(role);

CREATE TABLE IF NOT EXISTS assets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  year_of_purchase INT NULL,
  item_name VARCHAR(255) NULL,
  quantity INT NULL,
  inventory_number VARCHAR(255) NULL,
  room_number VARCHAR(100) NULL,
  floor_number VARCHAR(100) NULL,
  building_block VARCHAR(255) NULL,
  remarks TEXT NULL,
  department_origin ENUM('own', 'other') DEFAULT 'own',
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_assets_item_name ON assets (item_name);
CREATE INDEX idx_assets_inventory_number ON assets (inventory_number);

CREATE TABLE IF NOT EXISTS login_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  login_time DATETIME NOT NULL,
  logout_time DATETIME NULL,
  duration_minutes INT NULL,
  CONSTRAINT fk_login_logs_user_id
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_login_logs_user_id ON login_logs (user_id);
CREATE INDEX idx_login_logs_login_time ON login_logs (login_time);
