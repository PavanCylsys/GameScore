/**
 * In-memory OTP store. Hardcoded OTP: 1234, expiry: 1 minute.
 * Do not return OTP in API response.
 */
const OTP_CODE = "1234";
const OTP_EXPIRY_MS = 60 * 1000; // 1 minute

const store = new Map<
  string,
  { otp: string; expiresAt: number }
>();

export function setOtp(phone: string): void {
  store.set(phone, {
    otp: OTP_CODE,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
  });
}

export function validateOtp(phone: string, otp: string): boolean {
  const entry = store.get(phone);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    store.delete(phone);
    return false;
  }
  const valid = entry.otp === otp;
  if (valid) store.delete(phone); // one-time use
  return valid;
}
