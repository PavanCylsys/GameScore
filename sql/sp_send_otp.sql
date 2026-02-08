-- Stored procedure: sp_send_otp
DELIMITER //
CREATE PROCEDURE sp_send_otp(IN p_phone VARCHAR(10))
BEGIN
  INSERT INTO otp_logs (phone, otp, expires_at)
  VALUES (p_phone, '1234', DATE_ADD(NOW(), INTERVAL 1 MINUTE));
END //
DELIMITER ;
