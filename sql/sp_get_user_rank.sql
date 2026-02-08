-- Stored procedure: sp_get_user_rank
DELIMITER //
CREATE PROCEDURE sp_get_user_rank(IN p_user_id INT)
BEGIN
  DECLARE user_score INT;

  SELECT total_score INTO user_score
  FROM users
  WHERE id = p_user_id;

  SELECT COUNT(*) + 1 AS user_rank
  FROM users
  WHERE total_score > user_score;
END //
DELIMITER ;
