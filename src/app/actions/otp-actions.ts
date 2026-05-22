'use server';

/**
 * @fileOverview Server-side actions for handling SMS OTP generation and verification.
 * Supports Fast2SMS out of the box. 
 * Sign up at https://www.fast2sms.com to get an API Key.
 */

import { initializeFirebase } from '@/firebase';
import { doc, setDoc, getDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Sends a 4-digit OTP to the provided phone number.
 * If FAST2SMS_API_KEY is missing, it logs to the console (Development Mode).
 */
export async function sendSMSOTP(phoneNumber: string) {
  const { db } = initializeFirebase();
  
  // 1. Generate a random 4-digit OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

  try {
    // 2. Store the OTP in Firestore for verification
    const otpRef = doc(db, 'otp_codes', phoneNumber);
    await setDoc(otpRef, {
      otp,
      expiresAt,
      createdAt: serverTimestamp(),
    });

    // 3. SMS Provider Logic
    const API_KEY = process.env.FAST2SMS_API_KEY;

    if (!API_KEY || API_KEY === 'YOUR_API_KEY') {
      // DEVELOPMENT MODE: Log to terminal
      console.log('------------------------------------------');
      console.log('🚀 DEVELOPMENT MODE: OTP GENERATED');
      console.log(`📱 Phone: +91${phoneNumber}`);
      console.log(`🔐 OTP Code: ${otp}`);
      console.log('💡 To send real SMS, add FAST2SMS_API_KEY to your .env');
      console.log('------------------------------------------');
      
      return { 
        success: true, 
        message: 'OTP generated! Check your server console/terminal to see the code.' 
      };
    }

    // PRODUCTION MODE: Call Fast2SMS API
    // Using their BulkV2 OTP Route
    const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${API_KEY}&route=otp&variables_values=${otp}&numbers=${phoneNumber}`;
    
    const response = await fetch(url, { method: 'GET' });
    const result = await response.json();

    if (!result.return) {
      throw new Error(result.message || 'SMS Provider rejected the request');
    }

    return { success: true, message: 'OTP sent successfully via SMS' };
  } catch (error: any) {
    console.error('Failed to send OTP:', error);
    return { success: false, message: error.message || 'Failed to send OTP' };
  }
}

/**
 * Verifies the 4-digit OTP for the provided phone number.
 */
export async function verifySMSOTP(phoneNumber: string, enteredOtp: string) {
  const { db } = initializeFirebase();
  const otpRef = doc(db, 'otp_codes', phoneNumber);

  try {
    const otpSnap = await getDoc(otpRef);

    if (!otpSnap.exists()) {
      return { success: false, message: 'OTP expired or not requested' };
    }

    const { otp, expiresAt } = otpSnap.data();

    // Check if expired
    if (Date.now() > expiresAt) {
      await deleteDoc(otpRef);
      return { success: false, message: 'OTP has expired' };
    }

    // Check if matches
    if (otp !== enteredOtp) {
      return { success: false, message: 'Invalid OTP code' };
    }

    // Success! Delete the used OTP
    await deleteDoc(otpRef);
    return { success: true };
  } catch (error: any) {
    console.error('Failed to verify OTP:', error);
    return { success: false, message: 'Verification failed' };
  }
}
