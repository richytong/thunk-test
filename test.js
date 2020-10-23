const ThunkTest = require('./thunk-test')
const assert = require('assert')
const rubico = require('rubico')

const { pipe, assign } = rubico

const add = (a, b) => a + b

const tests = [
  ThunkTest('adds two values', add)
    .case(5, 5, 10) // assert.strictEqual(add(5, 5), 10)
    .case('abcde', 'fg', result => { // supply your own callback
      assert.strictEqual(result, 'abcdefg')
    }),

  ThunkTest(
    'pipe: awesome username generator',
    pipe([
      string => string.toUpperCase(),
      string => `x${string}x`,
      string => `X${string}X`,
      string => `x${string}x`,
      string => `_${string}_`,
    ]))
    .case('deimos', '_xXxDEIMOSxXx_') // objects deep equal, otherwise strict equal
    .case('|', result => assert.equal(result, '_xXx|xXx_')) // can supply a callback
    .case('?', async result => assert.equal(result, '_xXx?xXx_')) // async ok
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
    }),

  ThunkTest(
    'assign: parallel async',
    assign({
      squared: ({ number }) => number ** 2,
      asyncCubed: async ({ number }) => number ** 3,
    }))
    .case({ number: 0 }, { number: 0, squared: 0, asyncCubed: 0 })
    .case({ number: 1 }, { number: 1, squared: 1, asyncCubed: 1 })
    .case({ number: 3 }, { number: 3, squared: 9, asyncCubed: 27 }),
]


;(async function main() {
  for (const test of tests) {
    await test()
  }
})()
