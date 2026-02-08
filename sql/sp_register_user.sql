-- Stored procedure: sp_register_user
DELIMITER //
CREATE PROCEDURE sp_register_user(
  IN p_phone VARCHAR(10),
  IN p_name VARCHAR(100),
  IN p_dob DATE,
  IN p_email VARCHAR(100)
)
BEGIN
  IF EXISTS (SELECT 1 FROM users WHERE phone = p_phone) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Phone number already exists';
  END IF;

  INSERT INTO users (phone, name, dob, email)
  VALUES (p_phone, p_name, p_dob, p_email);

  SELECT LAST_INSERT_ID() AS user_id;
END //
DELIMITER ;
