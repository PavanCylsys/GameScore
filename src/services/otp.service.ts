
export const otpService = {
  generate(): string {
    return '000000';
  },

  verify(otp: string, storedOtp: string): boolean {
    return otp === storedOtp;
  },
};
