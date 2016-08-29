const test = require('tape');
const sut = require('../');

const configApiHost = 'http://dev:3222/';

const tearDown = () => {
  sut.stopRefresh();
};

test('Should get config from config api', (t) => {
  t.plan(1);
  sut.init('i18n_api', configApiHost).then((config) => {
    console.log('param', config);
    console.log('get', sut.get());
    t.pass('Config loaded');
  }, (err) => {
    console.log('err', err);
    t.fail('Couldn\'t get config');
  });
});

test('teardown', (t) => {
  tearDown();
  t.end();
});
