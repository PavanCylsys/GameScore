-- Stored procedure: sp_send_otp
-- Send OTP: hardcoded OTP 1234, 1 min expiry. Does NOT return OTP in response.
-- Output: Success (no row) or error via SIGNAL.
DELIMITER //
CREATE PROCEDURE sp_send_otp(IN p_phone VARCHAR(10))
BEGIN
  IF p_phone IS NULL OR TRIM(p_phone) = '' OR LENGTH(TRIM(p_phone)) <> 10 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Valid 10-digit mobile number is required';
  END IF;

  INSERT INTO otp_logs (phone, otp, expires_at)
  VALUES (TRIM(p_phone), '1234', DATE_ADD(NOW(), INTERVAL 1 MINUTE));

  -- Do not return OTP in response
END //
DELIMITER ;
