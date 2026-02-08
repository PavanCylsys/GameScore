-- Stored procedure: sp_register_user
-- Registration: phone (unique), name, dob, email. Returns error message via SIGNAL.
DELIMITER //
CREATE PROCEDURE sp_register_user(
  IN p_phone VARCHAR(10),
  IN p_name VARCHAR(100),
  IN p_dob DATE,
  IN p_email VARCHAR(100)
)
BEGIN
  IF p_phone IS NULL OR TRIM(p_phone) = '' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Phone number is required';
  END IF;

  IF p_name IS NULL OR TRIM(p_name) = '' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Name is required';
  END IF;

  IF p_dob IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Date of birth is required';
  END IF;

  IF p_email IS NULL OR TRIM(p_email) = '' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Email is required';
  END IF;

  IF EXISTS (SELECT 1 FROM users WHERE phone = TRIM(p_phone)) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Phone number already exists';
  END IF;

  INSERT INTO users (phone, name, dob, email)
  VALUES (TRIM(p_phone), TRIM(p_name), p_dob, TRIM(p_email));

  SELECT LAST_INSERT_ID() AS user_id;
END //
DELIMITER ;
