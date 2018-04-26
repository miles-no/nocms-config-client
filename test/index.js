const test = require('tape');
const sut = require('../');

const configApiHost = 'http://localhost:4101/';

const tearDown = () => {
  sut.stopRefresh();
};

test('should return local config if LOCAL_CONFIG_FILE env variable is set', (t) => {
  process.env.LOCAL_CONFIG_FILE = './config.json';
  sut.init('page', configApiHost)
    .then(() => {
      t.pass(`loaded local config file at ${process.env.LOCAL_CONFIG_FILE}`);
      t.end();
    }).catch((err) => {
      t.fail(err);
    });
});

test('Should get config from config api', (t) => {
  sut.init('i18n_api', configApiHost).then(() => {
    t.pass('Config loaded');
    t.end();
  })
    .catch((err) => {
      console.log('err', err);
      t.fail('Couldn\'t get config');
      t.end();
    });
});

test('teardown', (t) => {
  tearDown();
  t.pass();
  t.end();
});
