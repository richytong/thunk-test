const Test = require('.')
const assert = require('assert')
const stream = require('stream')
const pipe = require('rubico/pipe')
const assign = require('rubico/assign')

describe('thunk-test', () => {
  describe('Test', () => {

    it('Adds two values', async () => {
      const add = (a, b) => a + b

      const test = new Test('adds two values', add)
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
        })

      test()
    })

    it('pipe: awesome username generator', async () => {
      const test = new Test('pipe: awesome username generator', pipe([
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
        })

      test()
    })

    it('pipe: awesome username generator async', async () => {
      const test = new Test('pipe: awesome username generator async', pipe([
        async string => string.toUpperCase(),
        async string => `x${string}x`,
        async string => `X${string}X`,
        async string => `x${string}x`,
        async string => `_${string}_`,
      ]))

      test.case('deimos', '_xXxDEIMOSxXx_') // objects deep equal, otherwise strict equal
      test.case('|', result => assert.equal(result, '_xXx|xXx_')) // can supply a callback
      test.case('?', async result => assert.equal(result, '_xXx?xXx_')) // async ok

      test.throws(1, new TypeError('string.toUpperCase is not a function'))

      test.throws(null, (err, arg0) => {
        assert.strictEqual(arg0, null)
        assert.strictEqual(err.name, 'TypeError')
        assert.strictEqual(err.message, 'Cannot read properties of null (reading \'toUpperCase\')')
      })

      test.throws(NaN, async (err, arg0) => {
        assert.strictEqual(arg0, NaN)
        assert.strictEqual(err.name, 'TypeError')
        assert.strictEqual(err.message, 'string.toUpperCase is not a function')
      })

      test()
    })

    it('assign', async () => {
      const test = new Test('assign', assign({
        squared: ({ number }) => number ** 2,
        asyncCubed: async ({ number }) => number ** 3,
      }), assign({
        squared: ({ number }) => number ** 2,
        asyncCubed: ({ number }) => number ** 3,
      }))

      test.case({ number: 0 }, { number: 0, squared: 0, asyncCubed: 0 })
      test.case({ number: 1 }, { number: 1, squared: 1, asyncCubed: 1 })
      test.case({ number: 3 }, { number: 3, squared: 9, asyncCubed: 27 })

      test()
    })

    it('no name', async () => {
      const test = Test(value => value).case(1, function nonameTester(result) {
        console.log('-- no name')
        assert.strictEqual(result, 1)
      })

      test()
    })

    it('context', async () => {
      const test = Test('context', function contextTester() {
        this.value = 'hey'
      }).case(function () {
        assert.strictEqual(this.value, 'hey')
      })

      test()
    })

    it('context case args', async () => {
      const test = new Test('context case args', function unaryCall(func, value) {
        return func(value)
      }).case(function setContextIdentity(value) {
        this.value = value
        return value
      }, 1, 1).after(function checker() {
        assert(this.value === 1)
      })

      test()
    })

    it('disposer', async () => {
      const test = new Test('disposer', function range(from, to) {
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
      })

      test()
    })

    it('Test.all 1', async () => {
      const test = Test.all([
        Test(function identity(value) {
          return value
        }).case(1, 1),
        Test(async function identity(value) {
          return value
        }).case(2, 2),
        Test(function identity(value) {
          return value
        }).case(3, 3),
      ])

      test()
    })

    it('Test.all 2', async () => {
      const test = Test.all([
        Test(function identity(value) {
          return value
        }).case(1, 1),
        Test(function identity(value) {
          return value
        }).case(2, 2),
        Test(function identity(value) {
          return value
        }).case(3, 3),
      ])

      test()
    })

    it('repr', async () => {
      assert.equal(Test.repr(1), '1')
      assert.equal(Test.repr(false), 'false')
      assert.equal(Test.repr(true), 'true')
      assert.equal(Test.repr(undefined), 'undefined')
      assert.equal(Test.repr(null), 'null')
      assert.equal(Test.repr('a'), '\'a\'')
      assert.equal(Test.repr([]), '[]')
      assert.equal(Test.repr([1, 2, 3]), '[1, 2, 3]')
      assert.equal(Test.repr(['a', 'b', 'c']), '[\'a\', \'b\', \'c\']')
      assert.equal(Test.repr(new Uint8Array([1, 2, 3])), 'Uint8Array([1, 2, 3])')
      assert.equal(Test.repr(Buffer.from([1, 2, 3])), 'Buffer([1, 2, 3])')
      function identity(value) { return value }
      assert.equal(Test.repr(identity), 'identity')
      assert.equal(Test.repr(
        () => {}
      ), '() => {}')
      assert.equal(Test.repr(() => { const a = 1; return a }), '() => { const a = 1; return a }')
      assert.equal(Test.repr(new Set([1, 2, 3])), 'Set([1, 2, 3])')
      assert.equal(Test.repr(new Set([{ a: 1 }, { b: 2 }, { c: 3 }])), 'Set([{ a: 1 }, { b: 2 }, { c: 3 }])')
      assert.equal(Test.repr(new Set()), 'Set()')
      assert.equal(Test.repr(new Map()), 'Map()')
      assert.equal(Test.repr(new Map([['a', 1]])), 'Map([[\'a\', 1]])')
      assert.equal(Test.repr(new Map([['a', 1], ['b', 2], ['c', 3]])), 'Map([[\'a\', 1], [\'b\', 2], [\'c\', 3]])')
      assert.equal(Test.repr({}), '{}')
      assert.equal(Test.repr({ a: 1, b: 2, c: 3 }), '{ a: 1, b: 2, c: 3 }')
      assert.equal(Test.repr(new Error('test')), 'Error(\'test\')')
      assert.equal(Test.repr(new TypeError('test1')), 'TypeError(\'test1\')')
      assert.equal(
        Test.repr(new AggregateError([new Error('test'), new TypeError('test1')])),
        'AggregateError([Error(\'test\'), TypeError(\'test1\')])'
      )
      assert.equal(Test.repr(stream.Readable.from([1, 2, 3])), 'Readable()')
    })

    it('identity', async () => {
      const identity = value => value
      const test = Test('identity', identity)

      test.case(1, 1)
      test.case(false, false)
      test.case(true, true)
      test.case(undefined, undefined)
      test.case(null, null)
      test.case('a', 'a')
      test.case([], [])
      test.case([1, 2, 3], [1, 2, 3])
      test.case(['a', 'b', 'c'], ['a', 'b', 'c'])
      test.case(new Uint8Array([1, 2, 3]), new Uint8Array([1, 2, 3]))
      test.case(Buffer.from([1, 2, 3]), Buffer.from([1, 2, 3]))
      test.case(new Set([1, 2, 3]), new Set([1, 2, 3]))
      test.case(new Set([{ a: 1 }, { b: 2 }, { c: 3 }]), new Set([{ a: 1 }, { b: 2 }, { c: 3 }]))
      test.case(new Set(), new Set())
      test.case(new Map(), new Map())
      test.case(new Map([['a', 1]]), new Map([['a', 1]]))
      test.case(new Map([['a', 1], ['b', 2], ['c', 3]]), new Map([['a', 1], ['b', 2], ['c', 3]]))
      test.case({}, {})
      test.case({ a: 1, b: 2, c: 3 }, { a: 1, b: 2, c: 3 })
      test.case(new Error('test'), new Error('test'))
      test.case(new TypeError('test1'), new TypeError('test1'))
      test.case(
        new AggregateError([new Error('test'), new TypeError('test1')]),
        new AggregateError([new Error('test'), new TypeError('test1')])
      )
      test.case(stream.Readable.from([1, 2, 3]), () => {})

      test()
    })
  })
})
