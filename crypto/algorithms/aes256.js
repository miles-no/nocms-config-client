const SymmetricAlgo = require('./SymmetricAlgo');

class AES256 extends SymmetricAlgo {
  constructor() {
    super('aes256', 16);
  }
}

module.exports = AES256;
