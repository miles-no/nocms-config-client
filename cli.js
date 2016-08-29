const AES256 = require('./crypto/algorithms/aes256');
const operation = process.argv[2];

const operations = {
  encrypt: (secret) => {
    const algo = new AES256();
    const key = process.env.CRYPTEX_KEYSOURCE_PLAINTEXT_KEY;

    console.log(algo.encrypt(key, secret));
  },

  decrypt: (secret) => {
    const algo = new AES256();
    const key = process.env.CRYPTEX_KEYSOURCE_PLAINTEXT_KEY;

    console.log(algo.decrypt(key, secret));
  },
};

if (!operations[operation]) {
  console.log('Missing or invalid argument. Should be one of [decrypt, encrypt]');
  process.exit(9);
}

const operationArgs = process.argv.slice(3);
operations[operation](...operationArgs);
