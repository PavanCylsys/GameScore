// OTP service - generate and verify OTPs
export const otpService = {
  generate(): string {
    // Implement OTP generation
    return '000000';
  },

  verify(otp: string, storedOtp: string): boolean {
    // Implement OTP verification
    return otp === storedOtp;
  },
};
