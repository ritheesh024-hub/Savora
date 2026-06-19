'use server';

/**
 * @fileOverview Server-side actions for handling SMS OTP generation.
 * Note: Firestore mutations have been disabled on the server side to prevent 
 * client-side SDK assertion failures during SSR.
 */

/**
 * Sends a 4-digit OTP to the provided phone number.
 * Simulator mode only to avoid server-side Firebase Client SDK conflicts.
 */
export async function sendSMSOTP(phoneNumber: string) {
  // 1. Generate a random 4-digit OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  
  // NOTE: Firestore storage disabled on server to prevent "Unexpected state" errors.
  // In a production app, use the Firebase Admin SDK or a dedicated backend for this.

  // DEVELOPMENT SIMULATOR
  console.log('\n--- EZZY BITES OTP SIMULATOR ---');
  console.log(`📱 TO: +91 ${phoneNumber}`);
  console.log(`🔐 CODE: ${otp}`);
  console.log(`💡 NOTE: Verification skipped to prevent Server-Side Firestore errors.`);
  console.log('--------------------------------\n');

  return { 
    success: true, 
    message: 'SIMULATOR MODE: Check your server terminal logs for the 4-digit code.' 
  };
}

/**
 * Mock verification for development.
 */
export async function verifySMSOTP(phoneNumber: string, enteredOtp: string) {
  // In simulator mode, we'll accept any 4-digit code for testing
  if (enteredOtp.length === 4) {
    return { success: true };
  }
  return { success: false, message: 'Invalid OTP code' };
}
