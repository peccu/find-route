export function hhmmToMinutes(hhmm: string): number | null {
  const m = hhmm.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const hh = Number(m[1]);
  const mm = Number(m[2]);
  return hh * 60 + mm;
}

export function minutesToHHMM(mins: number): string {
  const days = Math.floor(mins / (24 * 60));
  const m = mins % (24 * 60);
  const hh = Math.floor(m / 60);
  const mm = m % 60;
  const prefix = days > 0 ? `${days}d ` : '';
  return `${prefix}${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

export function parseTimetableString(s: string): number[] {
  // カンマ区切りの hh:mm の列をパース -> minutes
  return s
    .split(',')
    .map(part => part.trim())
    .map(p => hhmmToMinutes(p))
    .filter((v): v is number => typeof v === 'number')
    .sort((a, b) => a - b);
}

export function uid(prefix = ''): string {
  return prefix + Math.random().toString(36).slice(2, 9);
}

export function getSpecifiedTime(now: Date): string {
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function getCurrentTime(): string {
  return getSpecifiedTime(new Date());
}

export function getFormattedDateTime() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // 月は0から始まるため+1
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}
