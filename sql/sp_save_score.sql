-- Stored procedure: sp_save_score
DELIMITER //
CREATE PROCEDURE sp_save_score(
  IN p_user_id INT,
  IN p_score INT
)
BEGIN
  DECLARE score_count INT;

  IF p_score < 50 OR p_score > 500 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Score must be between 50 and 500';
  END IF;

  SELECT COUNT(*) INTO score_count
  FROM scores
  WHERE user_id = p_user_id
    AND DATE(created_at) = CURDATE();

  IF score_count >= 3 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Daily score limit exceeded';
  END IF;

  INSERT INTO scores (user_id, score)
  VALUES (p_user_id, p_score);

  UPDATE users
  SET total_score = total_score + p_score
  WHERE id = p_user_id;
END //
DELIMITER ;
