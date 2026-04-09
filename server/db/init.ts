import mysql from 'mysql2/promise';
import { dbConfig } from './index.js';

export async function initDB() {
  // Connect without database selected to create it if it doesn't exist
  const connection = await mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    port: dbConfig.port
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
  await connection.query(`USE \`${dbConfig.database}\`;`);

  // Create Users table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      phone_number VARCHAR(20),
      email_alerts BOOLEAN DEFAULT TRUE,
      sms_alerts BOOLEAN DEFAULT FALSE,
      plan ENUM('free', 'pro', 'business') DEFAULT 'free',
      stripe_customer_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `);

  try {
    await connection.query(`ALTER TABLE users ADD COLUMN phone_number VARCHAR(20)`);
    await connection.query(`ALTER TABLE users ADD COLUMN email_alerts BOOLEAN DEFAULT TRUE`);
    await connection.query(`ALTER TABLE users ADD COLUMN sms_alerts BOOLEAN DEFAULT FALSE`);
  } catch (e) {
    // Columns might already exist, ignore error
  }

  // Create Monitors table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS monitors (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      url VARCHAR(2048) NOT NULL,
      interval_minutes INT DEFAULT 5,
      status ENUM('up', 'down', 'paused') DEFAULT 'paused',
      last_checked TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Create Pings table (History)
  await connection.query(`
    CREATE TABLE IF NOT EXISTS pings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      monitor_id INT NOT NULL,
      status ENUM('up', 'down') NOT NULL,
      response_time_ms INT,
      status_code INT,
      checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (monitor_id) REFERENCES monitors(id) ON DELETE CASCADE
    );
  `);

  // Create Alerts table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS alerts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      monitor_id INT NOT NULL,
      type ENUM('email', 'webhook') NOT NULL,
      destination VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (monitor_id) REFERENCES monitors(id) ON DELETE CASCADE
    );
  `);

  try {
    await connection.query(`ALTER TABLE alerts ADD COLUMN destination VARCHAR(255) NOT NULL DEFAULT ''`);
  } catch (e) {
    // Column might already exist, ignore error
  }

  await connection.end();
}
