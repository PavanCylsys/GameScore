// Validation utilities – all fields mandatory and proper format

const PHONE_REGEX = /^[6-9]\d{9}$/; // Indian mobile: 10 digits, starts with 6-9
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_REGEX = /^\d{4}$/; // 4 digits

export function isValidPhone(phone: string): boolean {
  return typeof phone === "string" && PHONE_REGEX.test(phone.trim());
}

export function isValidEmail(email: string): boolean {
  return typeof email === "string" && EMAIL_REGEX.test(email.trim());
}

export function isValidOtp(otp: string): boolean {
  return typeof otp === "string" && OTP_REGEX.test(otp.trim());
}

export function isValidName(name: string): boolean {
  return typeof name === "string" && name.trim().length >= 1;
}

export function isValidDob(dob: string): boolean {
  if (typeof dob !== "string" || !dob.trim()) return false;
  const d = new Date(dob);
  return !isNaN(d.getTime()) && d.getTime() <= Date.now();
}

export function validateRegisterBody(body: {
  phone?: string;
  name?: string;
  dob?: string;
  email?: string;
  otp?: string;
}): { valid: boolean; message?: string } {
  if (!body.phone || !isValidPhone(body.phone))
    return { valid: false, message: "Valid phone number (10 digits) is required" };
  if (!body.name || !isValidName(body.name))
    return { valid: false, message: "Name is required" };
  if (!body.dob || !isValidDob(body.dob))
    return { valid: false, message: "Valid date of birth is required" };
  if (!body.email || !isValidEmail(body.email))
    return { valid: false, message: "Valid email is required" };
  if (!body.otp || !isValidOtp(body.otp))
    return { valid: false, message: "Valid OTP (4 digits) is required" };
  return { valid: true };
}

export function validateSendOtpBody(body: { phone?: string }): { valid: boolean; message?: string } {
  if (!body.phone || !isValidPhone(body.phone))
    return { valid: false, message: "Valid phone number (10 digits) is required" };
  return { valid: true };
}

export function validateScore(score: unknown): { valid: boolean; message?: string } {
  const n = Number(score);
  if (!Number.isInteger(n) || n < 50 || n > 500)
    return { valid: false, message: "Score must be an integer between 50 and 500" };
  return { valid: true };
}
