const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const SECRET = process.env.JWT_SECRET || 'default_insecure_secret';

// Derive a 32-byte key from the secret
const getKey = () => crypto.scryptSync(SECRET, 'salt', 32);

const encryptMaster = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  
  // Format: iv:authTag:encryptedData
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
};

const decryptMaster = (text) => {
  const parts = text.split(':');
  if (parts.length !== 3) throw new Error('Invalid encrypted text format');
  
  const [ivHex, authTagHex, encryptedHex] = parts;
  
  const decipher = crypto.createDecipheriv(
    ALGORITHM, 
    getKey(), 
    Buffer.from(ivHex, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

module.exports = {
  encryptMaster,
  decryptMaster
};
