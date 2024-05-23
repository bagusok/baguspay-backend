import * as crypto from 'crypto';

export function isUUID(uuid: string): boolean {
  const regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
}

const hashKey = crypto
  .createHash('sha256')
  .update(process.env.SIGNATURE_SECRET)
  .digest();

export const encryptSignature = (data: string): string => {
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    hashKey,
    Buffer.alloc(16, 0),
  );
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return encrypted;
};

export const decryptSignature = (data: string): string => {
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    hashKey,
    Buffer.alloc(16, 0),
  );
  let decrypted = decipher.update(data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};
