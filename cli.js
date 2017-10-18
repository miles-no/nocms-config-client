const AES256 = require('./crypto/algorithms/aes256');

const operation = process.argv[2];

const key = process.argv.length === 5 ? process.argv[3] : process.env.CRYPTEX_KEYSOURCE_PLAINTEXT_KEY;

const operations = {
  encrypt: (secret) => {
    const algo = new AES256();

    console.log(algo.encrypt(key, secret));
  },

  decrypt: (secret) => {
    const algo = new AES256();

    console.log(algo.decrypt(key, secret));
  },
};

if (!operations[operation]) {
  console.log('Missing or invalid argument. Should be one of [decrypt, encrypt]');
  process.exit(9);
}

operations[operation](process.argv[process.argv.length - 1]);
