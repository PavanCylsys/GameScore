// Validation utilities – all fields mandatory and proper format

const PHONE_REGEX = /^[6-9]\d{9}$/; // Indian mobile: 10 digits, starts with 6-9
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_REGEX = /^\d{4}$/; // 4 digits
// Date of Birth: YYYY-MM-DD, DD/MM/YYYY, or DD-MM-YYYY
const DOB_REGEX_ISO = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const DOB_REGEX_DMY = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
const DOB_REGEX_DMY_DASH = /^(0[1-9]|[12]\d|3[01])-(0[1-9]|1[0-2])-\d{4}$/;

function isDmyFormat(dob: string): boolean {
  return DOB_REGEX_DMY.test(dob) || DOB_REGEX_DMY_DASH.test(dob);
}

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

/** Accepted formats: YYYY-MM-DD, DD/MM/YYYY, or DD-MM-YYYY. */
export function isValidDob(dob: string): boolean {
  if (typeof dob !== "string" || !dob.trim()) return false;
  const trimmed = dob.trim();
  const isIso = DOB_REGEX_ISO.test(trimmed);
  const isDmy = isDmyFormat(trimmed);
  if (!isIso && !isDmy) return false;
  const d = isDmy ? parseDDMMYYYY(trimmed) : new Date(trimmed);
  return d !== null && !isNaN(d.getTime()) && d.getTime() <= Date.now();
}

/** Returns an error message when DOB is invalid; otherwise undefined. */
export function getDobValidationError(dob: string): string | undefined {
  if (typeof dob !== "string" || !dob.trim()) return "Date of birth is required";
  const trimmed = dob.trim();
  if (!DOB_REGEX_ISO.test(trimmed) && !isDmyFormat(trimmed)) {
    return "Date of birth must be in format YYYY-MM-DD or DD-MM-YYYY";
  }
  const d = isDmyFormat(trimmed) ? parseDDMMYYYY(trimmed) : new Date(trimmed);
  if (d === null || isNaN(d.getTime())) return "Date of birth is not a valid date";
  if (d.getTime() > Date.now()) return "Date of birth cannot be in the future";
  return undefined;
}

/** Parse DD/MM/YYYY or DD-MM-YYYY to Date. */
function parseDDMMYYYY(s: string): Date | null {
  const [day, month, year] = s.split(/[\/-]/).map(Number);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const d = new Date(year, month - 1, day);
  if (d.getDate() !== day || d.getMonth() !== month - 1 || d.getFullYear() !== year) return null;
  return d;
}

/** Normalize DOB string (YYYY-MM-DD, DD/MM/YYYY, or DD-MM-YYYY) to YYYY-MM-DD for DB. */
export function normalizeDobToIso(dob: string): string {
  const trimmed = String(dob).trim();
  if (isDmyFormat(trimmed)) {
    const [day, month, year] = trimmed.split(/[\/-]/);
    return `${year}-${month}-${day}`;
  }
  return new Date(trimmed).toISOString().slice(0, 10);
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
  const dobError = body.dob ? getDobValidationError(body.dob) : "Date of birth is required";
  if (dobError) return { valid: false, message: dobError };
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
