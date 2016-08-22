const test = require('tape');
const sut = require('../');

const config = {
  configApiHost: 'http://dev:3222/',
};

test('Should get config from config api', (t) => {
  t.plan(1);
  sut('test', config.configApiHost)
    .then((conf) => {
      console.log('conf', conf);
      t.pass('Config loaded');
    }, (err) => {
      console.log('err', err);
      t.fail('Couldn\'t get config');
    });
});
