# ThunkTest
Modular testing for JavaScript. Set up tests as thunks, then execute them with a call. Run with `node`.

```javascript
const add = (a, b) => a + b

ThunkTest('adds two values', add)
  .case(5, 5, 10)
  .case('abcde', 'fg', result => {
    assert.strictEqual(result, 'abcdefg')
  })()
// adds two values
//  ✓ (5, 5) -> 10
//  ✓ ('abcde', 'fg') -> callback(...)
```
