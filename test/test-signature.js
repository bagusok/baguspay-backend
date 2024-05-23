const crypto = require('crypto');

const encryptSignature = (data) => {
  const key = crypto
    .createHash('sha256')
    .update('APAajanJAnkJNINNUNNNNN')
    .digest();

  const cipher = crypto.createCipheriv('aes-256-cbc', key, Buffer.alloc(16, 0));
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return encrypted;
};
const decryptSignature = (data) => {
  const key = crypto
    .createHash('sha256')
    .update('APAajanJAnkJNINNUNNNNN')
    .digest();

  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    key,
    Buffer.alloc(16, 0),
  );
  let decrypted = decipher.update(data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};

(async () => {
  console.log(
    encryptSignature(
      'BagusPay:1725921:' + crypto.randomBytes(8).toString('hex'),
    ),
  );

  console.log(
    decryptSignature(
      'c55132aa3415c630e7ac31bd5d351ff6c76b713487d9569e8b0669550804835cd2ae98899fcf5903a0dba3e22c2b0185',
    ),
  );
})();
