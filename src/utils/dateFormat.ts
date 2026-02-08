/** Format date as "22nd April 25" */
export function formatScoreCardDate(date: Date): string {
  const d = date.getDate();
  const ord =
    d === 1 || d === 21 || d === 31
      ? "st"
      : d === 2 || d === 22
        ? "nd"
        : d === 3 || d === 23
          ? "rd"
          : "th";
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const month = months[date.getMonth()];
  const year = String(date.getFullYear()).slice(-2);
  return `${d}${ord} ${month} ${year}`;
}
