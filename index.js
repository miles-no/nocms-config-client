const co = require('co');
const request = require('superagent');
const cryptex = require('cryptex');

let cachedConfig = null;
const retryIntervall = 2000;
const maxRetries = 10;
const defaultHost = 'http://config_api:3000';

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
  // TODO
  const { config, encrypted } = response.body;

  return Promise.resolve({ config, encrypted });
};

const decryptSecrets = co.wrap(function* decryptSecrets({ config, encrypted }) {
  for (const key of encrypted) {
    config[key] = yield cryptex.decrypt(config[key]);
  }

  return config;
});

const getConfig = co.wrap(function* getConfig(clientName, configApiHost = defaultHost) {
  if (cachedConfig !== null) {
    return cachedConfig;
  }

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

  const data = yield handleResponse(response);
  const config = yield decryptSecrets(data);

  cachedConfig = config;

  return config;
});

module.exports = getConfig;
