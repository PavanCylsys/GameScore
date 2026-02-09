-- Stored procedure: sp_get_weekly_scores
-- Returns week-wise scores and rank for a user. Week = Friday to Thursday.
-- Week 1 = 6th to 12th Feb (Friday-Thursday). Reference: 2025-02-06 = first Friday.
-- Input: p_user_id INT (logged-in user id from JWT/decrypted)
-- Output: Result set with weekNo, rank, totalScore

DELIMITER //
CREATE PROCEDURE sp_get_weekly_scores(IN p_user_id INT)
BEGIN
  WITH RECURSIVE
  week_nums(week_no) AS (
    SELECT 1
    UNION ALL
    SELECT week_no + 1
    FROM week_nums
    WHERE week_no < LEAST(500, (
      SELECT GREATEST(1, FLOOR(DATEDIFF(
        CURDATE() - INTERVAL (DAYOFWEEK(CURDATE()) + 1) % 7 DAY,
        '2025-02-06'
      ) / 7) + 1)
    ))
  ),
  score_weeks AS (
    SELECT
      user_id,
      score,
      FLOOR(DATEDIFF(
        DATE(created_at) - INTERVAL (DAYOFWEEK(DATE(created_at)) + 1) % 7 DAY,
        '2025-02-06'
      ) / 7) + 1 AS week_no
    FROM scores
    WHERE DATE(created_at) >= '2025-02-06'
  ),
  user_week_totals AS (
    SELECT user_id, week_no, SUM(score) AS total_score
    FROM score_weeks
    GROUP BY user_id, week_no
  ),
  user_weekly AS (
    SELECT
      wn.week_no,
      COALESCE(uw.total_score, 0) AS total_score
    FROM week_nums wn
    LEFT JOIN user_week_totals uw ON uw.week_no = wn.week_no AND uw.user_id = p_user_id
  ),
  ranked AS (
    SELECT
      uw.week_no AS weekNo,
      COALESCE(uw.total_score, 0) AS totalScore,
      CASE
        WHEN COALESCE(uw.total_score, 0) = 0 THEN NULL
        ELSE 1 + (SELECT COUNT(DISTINCT r.user_id)
                  FROM user_week_totals r
                  WHERE r.week_no = uw.week_no AND r.total_score > uw.total_score)
      END AS rnk
    FROM user_weekly uw
  )
  SELECT weekNo AS weekNo, rnk AS `rank`, totalScore AS totalScore
  FROM ranked
  ORDER BY weekNo;
END //
DELIMITER ;
