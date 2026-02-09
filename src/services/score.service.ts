import { poolPromise } from "../config/db";

export const scoreService = {
  async saveScore(userId: number, score: number): Promise<void> {
    const pool = await poolPromise;
    await pool.execute("CALL sp_save_score(?, ?)", [userId, score]);
  },

  async getUserRankTotalAndName(userId: number): Promise<{
    rank: number;
    totalScore: number;
    userName: string;
  }> {
    try {
      const pool = await poolPromise;
      const [userRows] = await pool.execute(
        "SELECT name, COALESCE(total_score, 0) AS total_score FROM users WHERE id = ?",
        [userId]
      );
      const userResult = (Array.isArray(userRows) ? userRows : []) as { name?: string; total_score?: number }[];
      const user = userResult[0];
      const totalScore = user?.total_score ?? 0;
      const userName = user?.name ?? "User";

      // Rank = 1 + count of users with strictly higher total_score (same score = same rank)
      const [rankRows] = await pool.execute(
        "SELECT 1 + COUNT(*) AS user_rank FROM users WHERE COALESCE(total_score, 0) > ?",
        [totalScore]
      );
      const rankList = (Array.isArray(rankRows) ? rankRows : [rankRows]) as { user_rank?: number }[];
      const rank = rankList[0]?.user_rank ?? 1;

      return {
        rank,
        totalScore,
        userName,
      };
    } catch {
      return { rank: 1, totalScore: 0, userName: "User" };
    }
  },

  async getWeeklyScores(userId: number): Promise<{ weekNo: number; rank: number; totalScore: number }[]> {
    const pool = await poolPromise;
    const [rows] = await pool.execute("CALL sp_get_weekly_scores(?)", [userId]);
    const resultSet = (Array.isArray(rows) ? rows : []) as { weekNo?: number; rank?: number | null; totalScore?: number }[][];
    const weeks = Array.isArray(resultSet[0]) ? resultSet[0] : [];
    return weeks.map((row) => {
      const totalScore = Number(row.totalScore ?? 0);
      // Rank 0 when user has not played; otherwise use DB rank (SP returns 0 for zero score)
      const rank = totalScore > 0 ? Number(row.rank ?? 0) : 0;
      return {
        weekNo: Number(row.weekNo ?? 0),
        rank,
        totalScore,
      };
    });
  },
};
