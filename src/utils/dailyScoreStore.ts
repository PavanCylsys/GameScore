/**
 * In-memory fallback for "max 3 scores per day per user" when DB has no sp_GetTodayScoreCount.
 */
const key = (userId: number) => `${userId}`;
const today = () => new Date().toISOString().slice(0, 10);

const store = new Map<string, { date: string; count: number }>();

export function getTodayCount(userId: number): number {
  const k = key(userId);
  const entry = store.get(k);
  const todayStr = today();
  if (!entry || entry.date !== todayStr) return 0;
  return entry.count;
}

export function incrementToday(userId: number): void {
  const k = key(userId);
  const todayStr = today();
  const entry = store.get(k);
  if (!entry || entry.date !== todayStr) {
    store.set(k, { date: todayStr, count: 1 });
  } else {
    entry.count += 1;
  }
}
