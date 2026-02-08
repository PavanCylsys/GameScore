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
      const [rankRows] = await pool.execute("CALL sp_get_user_rank(?)", [userId]);
      const rankResult = (Array.isArray(rankRows) ? rankRows : []) as { user_rank?: number }[];
      const rank = rankResult[0]?.user_rank ?? 1;

      const [userRows] = await pool.execute(
        "SELECT name, COALESCE(total_score, 0) AS total_score FROM users WHERE id = ?",
        [userId]
      );
      const userResult = (Array.isArray(userRows) ? userRows : []) as { name?: string; total_score?: number }[];
      const user = userResult[0];
      return {
        rank,
        totalScore: user?.total_score ?? 0,
        userName: user?.name ?? "User",
      };
    } catch {
      return { rank: 1, totalScore: 0, userName: "User" };
    }
  },
};
