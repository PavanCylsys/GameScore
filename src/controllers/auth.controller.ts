import { Request, Response } from "express";
import { poolPromise } from "../config/db";
import { generateToken } from "../config/jwt";
import { normalizeDobToIso, validateRegisterBody, validateSendOtpBody } from "../utils/validation";


function getErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object") {
    const e = err as { message?: string; sqlMessage?: string };
    return String(e.sqlMessage ?? e.message ?? fallback);
  }
  return fallback;
}


function isSpSignalError(err: unknown): boolean {
  if (err && typeof err === "object") {
    const e = err as { code?: string; sqlState?: string };
    return e.code === "ER_SIGNAL_EXIT_STATE" || e.sqlState === "45000";
  }
  return false;
}

export const authController = {
  async sendOtp(req: Request, res: Response) {
    const validation = validateSendOtpBody(req.body);
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: validation.message });
    }
    const phone = String(req.body.phone).trim().slice(0, 10);
    try {
      const pool = await poolPromise;
      await pool.execute("CALL sp_send_otp(?)", [phone]);
      return res.json({ success: true, message: "OTP sent" });
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Failed to send OTP");
      const isClientError = isSpSignalError(err);
      return res.status(isClientError ? 400 : 500).json({ success: false, message: msg });
    }
  },

  async register(req: Request, res: Response) {
    const validation = validateRegisterBody(req.body);
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: validation.message });
    }
    const { phone, name, dob, email, otp } = req.body;
    const phoneTrim = String(phone).trim().slice(0, 10);
    const nameStr = String(name).trim();
    const dobStr = String(dob).trim();
    const dobForDb = normalizeDobToIso(dobStr); // YYYY-MM-DD for sp_register_user DATE param
    const emailStr = String(email).trim();
    const otpStr = String(otp).trim();

    try {
      const pool = await poolPromise;
      // sp_validate_otp: SIGNALs on error; on success returns one row (id, phone, created_at) – no OTP in response
      const [otpRows] = await pool.execute("CALL sp_validate_otp(?, ?)", [phoneTrim, otpStr]);
      const otpResult = (Array.isArray(otpRows) ? otpRows : []) as { id?: number }[];
      if (otpResult.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired OTP. Please request a new OTP and try again.",
        });
      }

    
      const [regRows] = await pool.execute("CALL sp_register_user(?, ?, ?, ?)", [
        phoneTrim,
        nameStr,
        dobForDb,
        emailStr,
      ]);

      const regResult = (Array.isArray(regRows) ? regRows : []) as { user_id?: number }[][];
      const resultSet = regResult[0];
      const firstRow = Array.isArray(resultSet) ? resultSet[0] : resultSet;
      console.log(firstRow);
      const userId = firstRow?.user_id;
      if (userId == null) {
        return res.status(400).json({
          success: false,
          message: "Registration failed",
        });
      }
      const token = generateToken(userId);
      return res.json({ success: true, token });
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Registration failed");
      const isClientError = isSpSignalError(err) || /phone number already exists|Invalid OTP|OTP expired|No OTP found|required/i.test(msg);
      return res.status(isClientError ? 400 : 500).json({ success: false, message: msg });
    }
  },
};
