-- Stored procedure: sp_get_weekly_scores
-- Returns week-wise scores and rank for a user. Week = Friday to Thursday.
-- Week 1 = 6th to 12th Feb (Friday-Thursday). Reference: 2025-02-06 = first Friday.
-- Input: p_user_id INT (logged-in user id from JWT/decrypted)
-- Output: Result set with weekNo, rank, totalScore

DELIMITER //
CREATE PROCEDURE sp_get_weekly_scores(IN p_user_id INT)
BEGIN
  -- Current week number (week containing today, Friday-based)
  -- week_friday for a date: date - (DAYOFWEEK(date)+1)%7 days. Fri=6 -> 0, Sat=7 -> 1, Thu=5 -> 6.
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
  -- Each score row assigned to a week (Fri-Thu). Week 1 start = 2025-02-06.
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
  -- For each week in week_nums, get this user's total (0 if none) and rank among all users that week
  user_weekly AS (
    SELECT
      wn.week_no,
      COALESCE(uw.total_score, 0) AS total_score
    FROM week_nums wn
    LEFT JOIN user_week_totals uw ON uw.week_no = wn.week_no AND uw.user_id = p_user_id
  ),
  -- Rank = 1 + count of users (for that week) who have strictly higher total than this user
  ranked AS (
    SELECT
      uw.week_no AS weekNo,
      COALESCE(uw.total_score, 0) AS totalScore,
      1 + (SELECT COUNT(DISTINCT r.user_id)
           FROM user_week_totals r
           WHERE r.week_no = uw.week_no AND r.total_score > uw.total_score) AS rnk
    FROM user_weekly uw
  )
  SELECT weekNo AS weekNo, rnk AS `rank`, totalScore AS totalScore
  FROM ranked
  ORDER BY weekNo;
END //
DELIMITER ;
