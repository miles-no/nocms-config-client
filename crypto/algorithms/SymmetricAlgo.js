const crypto = require('crypto');

const decEncoding = 'utf8';
const encEncoding = 'base64';
const keyEncoding = 'base64';

class SymmetricAlgo {
  constructor(algo, ivBytes) {
    this.algo = algo;
    this.ivBytes = ivBytes;
  }

  decrypt(key, secret) {
    const keyEnc = Buffer.isBuffer(key) ? key : new Buffer(key, keyEncoding);
    const ivEnc = Buffer.isBuffer(secret) ? secret : new Buffer(secret, encEncoding);
    const iv = ivEnc.slice(0, this.ivBytes);
    const enc = ivEnc.slice(this.ivBytes);
    const decipher = crypto.createDecipheriv(this.algo, keyEnc, iv);
    const decBuf = Buffer.concat([decipher.update(enc), decipher.final()]);
    return decBuf.toString(decEncoding);
  }

  encrypt(key, secret) {
    const keyEnc = Buffer.isBuffer(key) ? key : new Buffer(key, keyEncoding);
    const iv = crypto.randomBytes(this.ivBytes);
    const cipher = crypto.createCipheriv(this.algo, keyEnc, iv);
    const enc = Buffer.concat([cipher.update(secret), cipher.final()]);
    const ivEnc = Buffer.concat([iv, enc], iv.length + enc.length);
    return ivEnc.toString(encEncoding);
  }
}

module.exports = SymmetricAlgo;
