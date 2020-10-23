# ThunkTest
Modular testing for JavaScript

```javascript
const add = (a, b) => a + b

const thunkTestForAdd = ThunkTest('adds two values', add)
  .case(5, 5, 10) // assert.strictEqual(add(5, 5), 10)
  .case('abcde', 'fg', result => { // supply your own callback
    assert.strictEqual(result, 'abcdefg')
  })

thunkTestForAdd()
// adds two values
//  ✓ (5, 5) -> 10
//  ✓ (abcde, fg) -> callback(...)
```
