const co = require('co');
const request = require('superagent');
const cryptex = require('cryptex');

const retryIntervall = 2000; // In ms
const defaultRefreshIntervall = 600000; // In ms
const maxRetries = 10;
const defaultHost = 'http://config_api:3000';
let intervalHandle;

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

const getConfig = co.wrap(function* getConfig({ clientName, localConfig, configAdapter, onConfigRefresh, configApiHost = defaultHost }) {
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
  let config = yield decryptSecrets(data);

  if (typeof configAdapter === 'function') {
    config = configAdapter(config);
  }

  console.info('Updating config');
  Object.assign(localConfig, config);

  if (typeof onConfigRefresh === 'function') {
    onConfigRefresh(localConfig);
  }
});

module.exports = {
  getConfig: ({ clientName, localConfig, configAdapter, onConfigRefresh, configApiHost = defaultHost, refreshIntervall = defaultRefreshIntervall }) => {
    intervalHandle = setInterval(() => {
      getConfig({ clientName, localConfig, configAdapter, configApiHost });
    }, refreshIntervall);

    return getConfig({ clientName, localConfig, configAdapter, onConfigRefresh, configApiHost });
  },

  stopRefresh: () => {
    if (intervalHandle) {
      clearInterval(intervalHandle);

      intervalHandle = null;
    }
  }
};
