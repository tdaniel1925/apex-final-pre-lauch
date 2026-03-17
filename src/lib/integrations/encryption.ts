// =============================================
// Integration Credential Encryption
// Encrypt/decrypt API keys and secrets
// =============================================

import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';

// IMPORTANT: In production, this should be an environment variable
// For now, using a derived key from SUPABASE_SERVICE_ROLE_KEY
const getEncryptionKey = (): Buffer => {
  const envKey = process.env.ENCRYPTION_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!envKey) {
    throw new Error('ENCRYPTION_KEY or SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  }

  // Create a 32-byte key from the environment variable
  return createHash('sha256').update(envKey).digest();
};

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // For AES, this is always 16
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypt a string (API key, secret, etc.)
 * Returns: iv:authTag:encrypted (all base64)
 */
export function encrypt(text: string): string {
  if (!text) return '';

  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  const authTag = cipher.getAuthTag();

  // Return format: iv:authTag:encrypted (all base64)
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
}

/**
 * Decrypt an encrypted string
 * Input format: iv:authTag:encrypted (all base64)
 */
export function decrypt(encryptedData: string): string {
  if (!encryptedData) return '';

  const key = getEncryptionKey();

  // Split the encrypted data
  const parts = encryptedData.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format');
  }

  const iv = Buffer.from(parts[0], 'base64');
  const authTag = Buffer.from(parts[1], 'base64');
  const encrypted = parts[2];

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Mask a credential for display (show first/last 4 chars)
 */
export function maskCredential(credential: string): string {
  if (!credential) return '';
  if (credential.length <= 8) return '••••••••';

  const first = credential.slice(0, 4);
  const last = credential.slice(-4);
  const masked = '•'.repeat(Math.min(credential.length - 8, 20));

  return `${first}${masked}${last}`;
}

/**
 * Encrypt credentials before saving to database
 */
export interface IntegrationCredentials {
  api_key?: string;
  api_secret?: string;
  webhook_secret?: string;
  [key: string]: string | undefined;
}

export function encryptCredentials(
  credentials: IntegrationCredentials
): Record<string, string> {
  const encrypted: Record<string, string> = {};

  for (const [key, value] of Object.entries(credentials)) {
    if (value) {
      encrypted[`${key}_encrypted`] = encrypt(value);
    }
  }

  return encrypted;
}

/**
 * Decrypt credentials from database
 */
export function decryptCredentials(
  encryptedData: Record<string, string | null>
): IntegrationCredentials {
  const decrypted: IntegrationCredentials = {};

  for (const [key, value] of Object.entries(encryptedData)) {
    if (key.endsWith('_encrypted') && value) {
      try {
        const originalKey = key.replace('_encrypted', '');
        decrypted[originalKey] = decrypt(value);
      } catch (error) {
        console.error(`Failed to decrypt ${key}:`, error);
        // Continue with other fields
      }
    }
  }

  return decrypted;
}
