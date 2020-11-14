# ThunkTest

![Node.js CI](https://github.com/richytong/thunk-test/workflows/Node.js%20CI/badge.svg?branch=master)
[![npm version](https://img.shields.io/npm/v/thunk-test.svg?style=flat)](https://www.npmjs.com/package/thunk-test)

Modular testing for JavaScript. Declare tests as thunks, then execute them with a call.

```javascript
const Test = require('thunk-test')

const identity = value => value

describe('identity', () => {
  it('returns whatever was passed to it',
    Test(identity)
      .case(+0, -0)
      .case('hey', 'hey')
      .case(NaN, result => {
        assert(isNaN(result))
      }))
})
//   identity
//  ✓ identity(1) -> 1
//  ✓ identity('hey') -> 'hey'
//  ✓ identity(NaN) |> result => assert(isNaN(result))
//     ✓ returns whatever was passed to it
```

thunk Tests are composed of a string descriptor, a function to test, and test cases denoted by `.case` and `.throws`. Any test cases may be asynchronous - either by returning a Promise explicitly or using the `async` keyword. Both `.case` and `.throws` accept a variadic number of arguments - the same as those provided to the function - with the exception of the last argument:

 * not a function - compare the return value directly by [SameValueZero](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * an asserter function - pass the return value to the asserter function and let the asserter handle all the assertions. Note that if this value is a Promise, it is resolved before calling this function

```coffeescript
Test(testname string, tester function)
  .case(...args, expectedResult any)
  .case(...args, asserter (result any)=>Promise|(disposer function)|null)
  .throws(...args, expectedError Error)
  .throws(...args, errorAsserter (error Error, result any)=>Promise|(disposer function)|null)
```

Concisely test many different cases with a declarative, idiomatic API.

```javascript
Test(
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
  })()
// -- pipe: awesome username generator
//  ✓ pipeline('deimos') -> '_xXxDEIMOSxXx_'
//  ✓ pipeline('|') -> result => assert.equal(result, '_xXx|xXx_')
//  ✓ pipeline(1) throws TypeError: string.toUpperCase is not a function
//  ✓ pipeline(null) throws; (err, arg0) => {
//       assert.strictEqual(arg0, null)
//       assert.strictEqual(err.name, 'TypeError')
//       assert.strictEqual(err.message, 'Cannot read property \'toUpperCase\' of null')
//     }
//  ✓ pipeline('?') -> async result => assert.equal(result, '_xXx?xXx_')
//  ✓ pipeline(NaN) throws; async (err, arg0) => {
//       assert.strictEqual(arg0, NaN)
//       assert.strictEqual(err.name, 'TypeError')
//       assert.strictEqual(err.message, 'string.toUpperCase is not a function')
//     }
```

Preprocessing and postprocessing are available with callbacks supplied to `.before` and `.after`.

Note: since all callbacks are run with the same context, you can get and set values in the execution context (`this`) of a thunk Test from any provided callback.

```javascript
Test('square', function square(number) {
  return number ** 2
}).before(function () {
    this.hello = 'world'
  })
  .case(3, function (squared) {
    assert(squared == 9)
    assert(this.hello == 'world')
  })
  .after(function () {
    assert(this.hello == 'world')
  })()
// -- square
// ✓ square(3) |> function (squared) {
//    assert(squared == 9)
//    assert(this.hello == 'world')
//  }
```

### Syntax
```coffeescript
ThunkTest = ()=>() {
  before: function=>this,
  after: function=>this,
  beforeEach: function=>this,
  afterEach: function=>this,
  case: (...args, expectedResult|function=>(disposer ()=>Promise<>|())|())=>this,
  throws: (...args, expectedError|function=>(disposer ()=>Promise<>|())|())=>this,
}

Test(story string, func function) -> ThunkTest

Test(func function) -> ThunkTest
```

# Installation
with `npm`
```bash
npm i thunk-test
```

browser script, global `Test`
```html
<script src="https://unpkg.com/thunk-test"></script>
```

browser module
```javascript
import Test from 'https://unpkg.com/thunk-test/es.js'
```
