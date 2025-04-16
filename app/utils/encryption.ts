import crypto from 'crypto';

// Secret key for encryption (should be a strong, random value)
const ENCRYPTION_KEY = process.env.NEXTAUTH_SECRET || 'your-super-secret-key-here';
// IV length for AES encryption
const IV_LENGTH = 16;

/**
 * Encrypt a string using AES-256-CBC
 */
export function encrypt(text: string): string {
  // Create a random initialization vector
  const iv = crypto.randomBytes(IV_LENGTH);
  
  // Create a cipher using the encryption key and IV
  const cipher = crypto.createCipheriv(
    'aes-256-cbc', 
    // Ensure key is 32 bytes (256 bits) by hashing it
    crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest(), 
    iv
  );
  
  // Encrypt the data
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  // Combine the IV and encrypted data
  return `${iv.toString('base64')}:${encrypted}`;
}

/**
 * Decrypt a string that was encrypted with AES-256-CBC
 */
export function decrypt(text: string): string {
  // Split the input into IV and encrypted data
  const parts = text.split(':');
  if (parts.length !== 2) {
    throw new Error('Invalid encrypted text format');
  }
  
  const iv = Buffer.from(parts[0], 'base64');
  const encryptedText = parts[1];
  
  // Create a decipher using the encryption key and IV
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc', 
    // Use the same key derivation as in encrypt
    crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest(), 
    iv
  );
  
  // Decrypt the data
  let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
} 