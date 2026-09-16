const USER_ID_STORAGE_KEY = 'racingUserId';

export function getRacingUserId(): number | undefined {
  const raw = localStorage.getItem(USER_ID_STORAGE_KEY) || import.meta.env.VITE_APP_USER_ID;
  if (!raw) return undefined;
  const userId = Number(raw);
  return Number.isInteger(userId) && userId > 0 ? userId : undefined;
}

export function setRacingUserId(userId: number) {
  if (!Number.isInteger(userId) || userId <= 0) throw new Error('userId must be a positive integer');
  localStorage.setItem(USER_ID_STORAGE_KEY, String(userId));
}
