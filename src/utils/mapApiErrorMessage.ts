/**
 * Maps thrown API/axios errors to user-facing copy. Network and timeout failures
 * are indistinguishable to users from a down backend, so we use one message.
 */
const UNAVAILABLE = 'Service temporarily unavailable. Please try again.';

const isOfflineOrNetwork = (message: string): boolean => {
  const m = message.toLowerCase();
  return (
    m.includes('timeout') ||
    m.includes('network error') ||
    m.includes('econnrefused') ||
    m.includes('err_connection') ||
    m.includes('failed to fetch') ||
    m.includes('load failed') ||
    m === 'network error'
  );
};

export const mapApiErrorMessage = (err: unknown, fallback: string = UNAVAILABLE): string => {
  if (err instanceof Error) {
    const msg = err.message.trim();
    if (!msg) return fallback;
    return isOfflineOrNetwork(msg) ? fallback : msg;
  }
  if (typeof err === 'string') {
    const msg = err.trim();
    return msg && !isOfflineOrNetwork(msg.toLowerCase()) ? msg : fallback;
  }
  return fallback;
};

/** Registration: duplicate email / account messages from typical backends. */
/** Value thrown by RTK `unwrap()` when a thunk rejects via `rejectWithValue`. */
export const resolveThunkRejectMessage = (err: unknown): string => {
  if (typeof err === 'string' && err.trim()) return err;
  if (err instanceof Error) return mapApiErrorMessage(err);
  return mapApiErrorMessage(null);
};

export const mapEmailAlreadyRegisteredMessage = (message: string): string => {
  const lower = message.toLowerCase();
  const looksDuplicate =
    (lower.includes('email') || lower.includes('user')) &&
    (lower.includes('already') ||
      lower.includes('exist') ||
      lower.includes('registered') ||
      lower.includes('taken') ||
      lower.includes('duplicate') ||
      lower.includes('in use'));
  if (looksDuplicate) return 'This email is already in use. Try logging in instead.';
  return message;
};
