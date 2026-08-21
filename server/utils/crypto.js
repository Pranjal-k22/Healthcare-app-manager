const crypto = require('crypto');

/**
 * Derive a strictly validated 32-byte Buffer key for AES-256-GCM
 * Supports 64-char hex strings directly, or uses scryptSync key derivation
 * @returns {Buffer} - Exactly 32 bytes
 */
const getEncryptionKey = () => {
  const secret =
    process.env.TOKEN_ENCRYPTION_KEY ||
    '2e0f1ac01662063b65ed3d552ae04248a25dd7dd741ba97622e827cf2bf5a479';

  // If provided as a 64-char hex string (32 bytes), parse directly
  if (typeof secret === 'string' && /^[0-9a-fA-F]{64}$/.test(secret.trim())) {
    return Buffer.from(secret.trim(), 'hex');
  }

  // Otherwise, use scrypt to derive an exact 32-byte key
  return crypto.scryptSync(String(secret), 'healthpulse_aes_gcm_salt_2026', 32);
};

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 16-byte initialization vector

/**
 * Encrypt a plaintext OAuth token using AES-256-GCM
 * @param {string} text - Plaintext token
 * @returns {string} - Formatted as ivHex:authTagHex:encryptedHex
 */
const encryptToken = (text) => {
  if (!text || typeof text !== 'string') {
    return text || '';
  }

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
};

/**
 * Decrypt an AES-256-GCM encrypted token
 * @param {string} encryptedText - Formatted as ivHex:authTagHex:encryptedHex
 * @returns {string} - Decrypted plaintext token
 */
const decryptToken = (encryptedText) => {
  if (!encryptedText || typeof encryptedText !== 'string') {
    return encryptedText || '';
  }

  const parts = encryptedText.split(':');
  if (parts.length !== 3) {
    return encryptedText; // Unencrypted legacy fallback
  }

  try {
    const [ivHex, authTagHex, encryptedHex] = parts;
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (err) {
    console.error('[Crypto] Token decryption error:', err.message);
    return '';
  }
};

module.exports = {
  getEncryptionKey,
  encryptToken,
  decryptToken,
};
