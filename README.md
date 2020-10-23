# ThunkTest
Modular testing for JavaScript. Set up tests as thunks, then execute them with a call.

```javascript
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

`ThunkTest` is a function-first testing library.

### Syntax
```coffeescript
ThunkTest(story string, func function) -> thunkTest ()=>() {
  case: (...args, expectedResult)=>this,
  throws: (...args, expectedError)=>this,
}
```

# Installation
with `npm`
```bash
npm i thunk-test
```

browser script, global `ThunkTest`
```html
<script src="https://unpkg.com/thunk-test"></script>
```

browser module
```javascript
import ThunkTest from 'https://unpkg.com/thunk-test/es.js'
```
