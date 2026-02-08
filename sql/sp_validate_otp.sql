-- Stored procedure: sp_validate_otp
DELIMITER //
CREATE PROCEDURE sp_validate_otp(
  IN p_phone VARCHAR(10),
  IN p_otp VARCHAR(4)
)
BEGIN
  SELECT *
  FROM otp_logs
  WHERE phone = p_phone
    AND otp = p_otp
    AND expires_at > NOW()
  ORDER BY created_at DESC
  LIMIT 1;
END //
DELIMITER ;
