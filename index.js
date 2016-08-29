const co = require('co');
const request = require('superagent');
const AES256 = require('./crypto/algorithms/aes256');
const crypto = new AES256();
const cryptoKey = process.env.CRYPTEX_KEYSOURCE_PLAINTEXT_KEY;

const retryIntervall = 2000; // In ms
const maxRetries = 100;
const defaultRefreshInterval = 600000; // In ms
const defaultHost = process.env.CONFIG_API_HOST || 'http://config_api:3000';

let intervalHandle;
let configCache = null;

const loadConfig = function loadConfig(configApiHost, clientName) {
  return new Promise((resolve) => {
    request
      .get(configApiHost)
      .query({ client: clientName })
      .end((err, res) => {
        if (err) {
          console.warn(`Couldn't connect to config API. Error: ${err.message}`);
          setTimeout(() => {
            resolve(null);
          }, retryIntervall);
          return;
        }
        resolve(res);
      });
  });
};

const handleResponse = function handleResponse(response) {
  const { config, encrypted } = response.body;
  return { config, encrypted };
};

const decryptSecrets = function decryptSecrets({ config, encrypted }) {
  for (const key of encrypted) {
    const objPath = key.split('.');
    const obj = objPath.reduce((o, i) => (typeof o[i] === 'string' ? o : o[i]), config);

    obj[objPath[objPath.length - 1]] = crypto.decrypt(cryptoKey, obj[objPath[objPath.length - 1]]);
  }

  return config;
};

const getConfig = co.wrap(function* getConfig(clientName, configApiHost) {
  let retries = maxRetries;
  let response = null;

  while (response == null && retries-- > 0) {
    console.info(`Connecting to ${configApiHost}... (${retries} attempts left)`);
    response = yield loadConfig(configApiHost, clientName);
  }

  if (response == null) {
    console.error(`Couldn't connect to config API after ${maxRetries} attempts`);
    throw Error('Could not connect to config API');
  }

  const data = handleResponse(response);

  return decryptSecrets(data);
});

module.exports = {
  init: function init(clientName, configApiHost = defaultHost, refreshInterval = defaultRefreshInterval) {
    intervalHandle = setInterval(() => {
      configCache = getConfig(clientName, configApiHost);
    }, refreshInterval);

    return getConfig(clientName, configApiHost).then((config) => {
      configCache = config;

      return configCache;
    });
  },
  get: (configKey) => {
    if (configCache === null) {
      throw new Error('You must run init before getting config values');
    }

    return configCache[configKey];
  },

  stopRefresh: () => {
    if (intervalHandle) {
      clearInterval(intervalHandle);

      intervalHandle = null;
    }
  },
};
