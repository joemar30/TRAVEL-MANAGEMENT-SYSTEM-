-- Wayfarer MySQL Database Schema
-- Import this using phpMyAdmin

CREATE DATABASE IF NOT EXISTS wayfarer;
USE wayfarer;

-- Users table (Authentication)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL, -- Hashed with bcrypt
  role ENUM('client', 'admin') DEFAULT 'client',
  avatar VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trips Table (Itineraries)
CREATE TABLE IF NOT EXISTS trips (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  nights INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Bookings Table (Active reservations)
CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  trip_id VARCHAR(36),
  type ENUM('flight', 'hotel', 'car') NOT NULL,
  name VARCHAR(255),
  route VARCHAR(255),
  property VARCHAR(255),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'in-review', 'confirmed', 'cancelled') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL
);

-- Insert Demo Admin (bcrypt hash for 'admin')
REPLACE INTO users (id, full_name, email, password, role) 
VALUES ('admin-01', 'TMS Administrator', 'admin@tms.com', '$2b$10$s7rNylmusHMT1qVuYfSmH.ZEO2T6a0Qf7lPfVoe6N9Z2QAKotY4cq', 'admin');

-- Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  trip_id VARCHAR(36),
  category VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL
);

-- Travelers Table
CREATE TABLE IF NOT EXISTS travelers (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  passport_number VARCHAR(50),
  seat_preference VARCHAR(20),
  loyalty_numbers JSON, -- Stores key-value pairs of loyalty programs
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User Settings Table
CREATE TABLE IF NOT EXISTS user_settings (
  user_id VARCHAR(36) PRIMARY KEY,
  company_name VARCHAR(100) DEFAULT 'Acme Travel Inc.',
  currency VARCHAR(20) DEFAULT 'USD ($)',
  budget_threshold DECIMAL(10, 2) DEFAULT 10000.00,
  notifications JSON, -- Stores boolean settings as JSON
  theme ENUM('light', 'dark') DEFAULT 'light',
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
