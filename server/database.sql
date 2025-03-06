
-- Create database
CREATE DATABASE IF NOT EXISTS customer_management;
USE customer_management;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  dob DATE,
  phone VARCHAR(20),
  email VARCHAR(100),
  occupation VARCHAR(100),
  location VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Custom fields table
CREATE TABLE IF NOT EXISTS custom_fields (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type ENUM('text', 'number', 'date', 'select') NOT NULL,
  options JSON, -- For select fields
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Customer field values table
CREATE TABLE IF NOT EXISTS customer_field_values (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  field_id INT NOT NULL,
  value TEXT,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (field_id) REFERENCES custom_fields(id) ON DELETE CASCADE
);

-- Insert default admin user
INSERT INTO users (name, email, password, role)
VALUES ('Admin', 'admin@example.com', '$2b$10$1RQs1Z8u4.L/yw.NyDtjKOGrwS/WwIRYdtQWEDJ4odxvXA/hVWH22', 'admin');
-- Password is 'password'

-- Insert default custom fields
INSERT INTO custom_fields (name, type, options)
VALUES 
  ('Notes', 'text', NULL),
  ('Customer Type', 'select', '["Regular", "VIP", "Corporate"]'),
  ('Annual Revenue', 'number', NULL);
