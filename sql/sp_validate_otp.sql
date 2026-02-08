-- Stored procedure: sp_validate_otp
-- Validates OTP for registration. Returns error message via SIGNAL if invalid/expired.
-- If OTP expired: user can hit send OTP again and retry registration.
-- On success: returns id, phone (does NOT return OTP).
DELIMITER //
CREATE PROCEDURE sp_validate_otp(
  IN p_phone VARCHAR(10),
  IN p_otp VARCHAR(4)
)
BEGIN
  DECLARE v_id INT DEFAULT NULL;
  DECLARE v_otp VARCHAR(4) DEFAULT NULL;
  DECLARE v_expires_at DATETIME DEFAULT NULL;

  SELECT id, otp, expires_at
  INTO v_id, v_otp, v_expires_at
  FROM otp_logs
  WHERE phone = p_phone
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_id IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No OTP found for this phone. Please request OTP first.';
  END IF;

  IF v_expires_at < NOW() THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'OTP expired. Please request a new OTP and try again.';
  END IF;

  IF v_otp <> p_otp THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid OTP.';
  END IF;


  SELECT id, phone, created_at
  FROM otp_logs
  WHERE id = v_id;
END //
DELIMITER ;
