-- Stored procedure: sp_get_user_rank
-- Rank = 1 + count of users with strictly higher total_score (same score = same rank; different score = different rank).
-- COALESCE so NULL total_score is treated as 0.
DELIMITER //
CREATE PROCEDURE sp_get_user_rank(IN p_user_id INT)
BEGIN
  DECLARE user_score INT DEFAULT 0;

  SELECT COALESCE(total_score, 0)
  INTO user_score
  FROM users
  WHERE id = p_user_id;

  SELECT COUNT(DISTINCT total_score) + 1 AS user_rank
  FROM users
  WHERE COALESCE(total_score, 0) > user_score;
END //
DELIMITER ;
