const test = require('tape');
const sut = require('../');

const configApiHost = 'http://dev:3222/';

test('Should get config from config api', (t) => {
  t.plan(1);
  const localConfig = {};
  sut.init('i18n_api', configApiHost).then((config) => {
    console.log('conf', config);
    sut.stopRefresh();
    t.pass('Config loaded');
  }, (err) => {
    console.log('err', err);
    sut.stopRefresh();
    t.fail('Couldn\'t get config');
  });
});
