const Test = require('.')
const assert = require('assert')
const rubico = require('rubico')
const stream = require('stream')

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
      assert.strictEqual(err.message, 'Cannot read properties of null (reading \'toUpperCase\')')
    })
    .throws(NaN, async (err, arg0) => {
      assert.strictEqual(arg0, NaN)
      assert.strictEqual(err.name, 'TypeError')
      assert.strictEqual(err.message, 'string.toUpperCase is not a function')
    }),

  Test('pipe: awesome username generator async', pipe([
    async string => string.toUpperCase(),
    async string => `x${string}x`,
    async string => `X${string}X`,
    async string => `x${string}x`,
    async string => `_${string}_`,
  ]))
    .case('deimos', '_xXxDEIMOSxXx_') // objects deep equal, otherwise strict equal
    .case('|', result => assert.equal(result, '_xXx|xXx_')) // can supply a callback
    .case('?', async result => assert.equal(result, '_xXx?xXx_')) // async ok
    .throws(1, new TypeError('string.toUpperCase is not a function'))
    .throws(null, (err, arg0) => {
      assert.strictEqual(arg0, null)
      assert.strictEqual(err.name, 'TypeError')
      assert.strictEqual(err.message, 'Cannot read properties of null (reading \'toUpperCase\')')
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

  Test('context case args test', function unaryCall(func, value) {
    return func(value)
  }).case(function setContextIdentity(value) {
    this.value = value
    return value
  }, 1, 1).after(function checker() {
    assert(this.value === 1)
  }),

  Test('disposer test', function range(from, to) {
    const result = []
    for (let i = from; i < to; i++) {
      result.push(i)
    }
    return result
  })
  .case(1, 6, function (numbers) {
    assert.deepEqual(numbers, [1, 2, 3, 4, 5])
    return () => {
      this.hey = 'ho'
    }
  })
  .case(0, 0, function (empty) {
    assert(Array.isArray(empty))
    assert(empty.length == 0)
    return async () => {
      this.heyy = 'hoo'
    }
  })
  .after(function () {
    assert.strictEqual(this.hey, 'ho')
    assert.strictEqual(this.heyy, 'hoo')
  }),

  Test.all([
    Test(function identity(value) {
      return value
    }).case(1, 1),
    Test(async function identity(value) {
      return value
    }).case(2, 2),
    Test(function identity(value) {
      return value
    }).case(3, 3),
  ]),

  Test.all([
    Test(function identity(value) {
      return value
    }).case(1, 1),
    Test(function identity(value) {
      return value
    }).case(2, 2),
    Test(function identity(value) {
      return value
    }).case(3, 3),
  ]),

  Test('repr', function identity(value) { return value })
    .case(1, 1)
    .case(false, false)
    .case(true, true)
    .case(undefined, undefined)
    .case(null, null)
    .case('a', 'a')
    .case([], [])
    .case([1, 2, 3], [1, 2, 3])
    .case(['a', 'b', 'c'], ['a', 'b', 'c'])
    .case(new Uint8Array([1, 2, 3]), new Uint8Array([1, 2, 3]))
    .case(Buffer.from([1, 2, 3]), Buffer.from([1, 2, 3]))
    .case(new Set([1, 2, 3]), new Set([1, 2, 3]))
    .case(new Set([{ a: 1 }, { b: 2 }, { c: 3 }]), new Set([{ a: 1 }, { b: 2 }, { c: 3 }]))
    .case(new Set(), new Set())
    .case(new Map(), new Map())
    .case(new Map([['a', 1]]), new Map([['a', 1]]))
    .case(new Map([['a', 1], ['b', 2], ['c', 3]]), new Map([['a', 1], ['b', 2], ['c', 3]]))
    .case({}, {})
    .case({ a: 1, b: 2, c: 3 }, { a: 1, b: 2, c: 3 })
    .case(new Error('test'), new Error('test'))
    .case(new TypeError('test1'), new TypeError('test1'))
    .case(stream.Readable.from([1, 2, 3]), () => {})
]


;(async function main() {
  for (const test of tests) {
    await test()
  }
})()
