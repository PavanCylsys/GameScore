-- Table scripts for ScoreCard application

-- 1) Users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  phone VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  dob DATE NOT NULL,
  email VARCHAR(100) NOT NULL,
  total_score INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2) OTP logs table
CREATE TABLE otp_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  phone VARCHAR(10) NOT NULL,
  otp VARCHAR(4) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3) Scores table
CREATE TABLE scores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  score INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
