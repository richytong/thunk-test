const ThunkTest = require('./thunk-test')
const assert = require('assert')
const rubico = require('rubico')

const { pipe } = rubico

ThunkTest(
  'pipe: awesome username generator',
  pipe([
    (arg0, arg1) => arg1 == null ? arg0 : arg0 + arg1,
    string => string.toUpperCase(),
    string => `x${string}x`,
    string => `X${string}X`,
    string => `x${string}x`,
  ]))
  .case('deimos', 'xXxDEIMOSxXx') // default strictEqual; last argument is expected result
  .case('aa', 'bb', 'xXxAABBxXx') // multiple arguments
  .case('|', result => assert.equal(result, 'xXx|xXx')) // can supply a callback
  .case('?', async result => assert.equal(result, 'xXx?xXx')) // async ok
  .throws(1, new TypeError('string.toUpperCase is not a function'))
  .throws(null, (err, arg0) => {
    assert.strictEqual(arg0, null)
    assert.strictEqual(err.name, 'TypeError')
    assert.strictEqual(err.message, 'Cannot read property \'toUpperCase\' of null')
  })
  .throws(NaN, async (err, arg0) => {
    assert.strictEqual(arg0, NaN)
    assert.strictEqual(err.name, 'TypeError')
    assert.strictEqual(err.message, 'string.toUpperCase is not a function')
  })()

// ThunkTest('fork: parallel async')
