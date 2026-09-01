import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
// Ensure the key is exactly 32 bytes. We provide a fallback just in case for development.
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012'; 
const IV_LENGTH = 16; 

export function encryptString(text: string): string {
  if (!text) return text;
  if (text.startsWith('ENC:')) return text;
  
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return 'ENC:' + iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decryptString(text: string): string {
  if (!text) return text;
  if (!text.startsWith('ENC:')) return text;
  
  try {
    const textParts = text.replace('ENC:', '').split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error('Decryption error:', error);
    return 'DECRYPTION_ERROR';
  }
}
