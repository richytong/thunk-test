const Test = require('./thunk-test')
const assert = require('assert')
const rubico = require('rubico')

const { pipe, assign } = rubico

const add = (a, b) => a + b

const tests = [
  Test('adds two values', add)
    .after(function () {
      assert.strictEqual(this.hey, 'ho')
    })
    .after(async function () {
      assert.strictEqual(this.hello, 'world')
      console.log('I should be at the end')
      assert.strictEqual(this.microPreCount, 2)
      assert.strictEqual(this.microPostCount, 2)
    })
    .before(function () {
      this.hello = 'world'
      console.log('I should be at the beginning')
    })
    .before(async function () {
      assert.strictEqual(this.hello, 'world')
      console.log('I should be second at the beginning')
      this.microPreCount = 0
      this.microPostCount = 0
    })
    .beforeEach(function () {
      this.microPreCount += 1
    })
    .afterEach(function () {
      this.microPostCount += 1
    })
    .case(5, 5, 10) // assert.strictEqual(add(5, 5), 10)
    .case('abcde', 'fg', function (result) { // supply your own callback
      assert.strictEqual(result, 'abcdefg')
      this.hey = 'ho'
    }),

  Test('pipe: awesome username generator', pipe([
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

  Test('assign',
    assign({
      squared: ({ number }) => number ** 2,
      asyncCubed: async ({ number }) => number ** 3,
    }),
    assign({
      squared: ({ number }) => number ** 2,
      asyncCubed: ({ number }) => number ** 3,
    }))
    .case({ number: 0 }, { number: 0, squared: 0, asyncCubed: 0 })
    .case({ number: 1 }, { number: 1, squared: 1, asyncCubed: 1 })
    .case({ number: 3 }, { number: 3, squared: 9, asyncCubed: 27 }),

  Test(value => value).case(1, function nonameTester(result) {
    console.log('-- no name test')
    assert.strictEqual(result, 1)
  }),

  Test('context test', function contextTester() {
    this.value = 'hey'
  }).case(function () {
    assert.strictEqual(this.value, 'hey')
  }),
]


;(async function main() {
  for (const test of tests) {
    await test()
  }
})()
