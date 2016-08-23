const test = require('tape');
const sut = require('../');

const config = {
  configApiHost: 'http://dev:3222/',
};

const adapter = function adapter(config) {
  return {
    value: config.TEST_VALUE,
    pass: config.TEST_PASSWORD,
    pass2: config.TEST_PASSWORD2,
  };
};

test('Should get config from config api', (t) => {
  t.plan(1);
  const localConfig = {};
  sut.getConfig({
    clientName: 'test',
    configAdapter: adapter,
    localConfig: localConfig,
    configApiHost: config.configApiHost,
  }).then(() => {
    console.log('conf', localConfig);
    sut.stopRefresh();
    t.pass('Config loaded');
  }, (err) => {
    console.log('err', err);
    sut.stopRefresh();
    t.fail('Couldn\'t get config');
  });
});
