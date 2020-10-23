const noop = function () {}

const always = value => function getter() { return value }

const isArray = Array.isArray

const objectAssign = Object.assign

const isPromise = value => value != null && typeof value.then == 'function'

const tapSync = func => function tapping(...args) {
  func(...args)
  return args[0]
}

const funcConcat = (
  funcA, funcB,
) => function pipedFunction(...args) {
  const intermediate = funcA(...args)
  return isPromise(intermediate)
    ? intermediate.then(funcB)
    : funcB(intermediate)
}

const thunkifyArgs = (func, args) => function thunk() {
  return func(...args)
}

const thunkify1 = (func, arg0) => function thunk() {
  return func(arg0)
}

const thunkify2 = (func, arg0, arg1) => function thunk() {
  return func(arg0, arg1)
}

const __ = Symbol.for('placeholder')

const curry1 = (func, arg0) => arg0 == __
  ? _arg0 => curry1(func, _arg0)
  : func(arg0)

// argument resolver for curry2
const curry2ResolveArg0 = (
  baseFunc, arg1,
) => function arg0Resolver(arg0) {
  return baseFunc(arg0, arg1)
}

// argument resolver for curry2
const curry2ResolveArg1 = (
  baseFunc, arg0,
) => function arg1Resolver(arg1) {
  return baseFunc(arg0, arg1)
}

const curry2 = function (baseFunc, arg0, arg1) {
  return arg0 == __
    ? curry2ResolveArg0(baseFunc, arg1)
    : curry2ResolveArg1(baseFunc, arg0)
}

const promiseAll = Promise.all.bind(Promise)

const inspect = function (value, depth = 1) {
  const inspectDeeper = item => inspect(item, depth + 1)
  if (Array.isArray(value)) {
    return `[${value.map(inspectDeeper).join(', ')}]`
  }
  if (ArrayBuffer.isView(value)) {
    return `${value.constructor.name} [${value.join(', ')}]`
  }
  if (typeof value == 'string') {
    return depth == 0 ? value : `'${value}'`
  }
  if (value == null) {
    return `${value}`
  }
  if (value.constructor == Set) {
    if (value.size == 0) {
      return 'Set {}'
    }
    let result = `Set { `
    const resultValues = []
    for (const item of value) {
      resultValues.push(inspectDeeper(item))
    }
    result += resultValues.join(', ')
    result += ' }'
    return result
  }
  if (value.constructor == Map) {
    if (value.size == 0) {
      return 'Map {}'
    }
    let result = 'Map { '
    const entries = []
    for (const [key, item] of value) {
      entries.push(`${inspectDeeper(key)} => ${inspectDeeper(item)}`)
    }
    result += entries.join(', ')
    result += ' }'
    return result
  }
  if (value.constructor == Object) {
    if (Object.keys(value).length == 0) {
      return '{}'
    }
    let result = '{ '
    const entries = []
    for (const key in value) {
      entries.push(`${key}: ${inspectDeeper(value[key])}`)
    }
    result += entries.join(', ')
    result += ' }'
    return result
  }
  if (value instanceof Error) {
    return `${value.name}: ${value.message}`
  }
  return `${value}`
}

/**
 * @name log
 *
 * @synopsis
 * ```coffeescript [specscript]
 * log(args ...any) -> ()
 * ```
 */
const log = function (...args) {
  console.log(...args)
}

/**
 * @name AssertionError
 *
 * @synopsis
 * ```coffeescript [specscript]
 * AssertionError(message string) -> error AssertionError
 * ```
 *
 * @note
 * replace removes first stack item
 */
const AssertionError = function (message) {
  const error = Error(message)
  error.name = 'AssertionError'
  error.stack = error.stack.replace(/\n\s+at[\s\S]+?\n/, '\n')
  return error
}

const objectKeysLength = object => {
  let numKeys = 0
  for (const _ in object) {
    numKeys += 1
  }
  return numKeys
}

const symbolIterator = Symbol.iterator

/**
 * @name areIteratorsDeepEqual
 *
 * @synopsis
 * areIteratorsDeepEqual(left Iterator, right Iterator) -> boolean
 */
const areIteratorsDeepEqual = function (leftIterator, rightIterator) {
  let leftIteration = leftIterator.next(),
    rightIteration = rightIterator.next()
  if (leftIteration.done != rightIteration.done) {
    return false
  }
  while (!leftIteration.done) {
    if (!isDeepEqual(leftIteration.value, rightIteration.value)) {
      return false
    }
    leftIteration = leftIterator.next()
    rightIteration = rightIterator.next()
  }
  return rightIteration.done
}

/**
 * @name areObjectsDeepEqual
 *
 * @synopsis
 * areObjectsDeepEqual(left Object, right Object) -> boolean
 */
const areObjectsDeepEqual = function (leftObject, rightObject) {
  const leftKeysLength = objectKeysLength(leftObject),
    rightKeysLength = objectKeysLength(rightObject)
  if (leftKeysLength != rightKeysLength) {
    return false
  }
  for (const key in leftObject) {
    if (!isDeepEqual(leftObject[key], rightObject[key])) {
      return false
    }
  }
  return true
}

/**
 * @name areArraysDeepEqual
 *
 * @synopsis
 * areArraysDeepEqual(left Array, right Array) -> boolean
 */
const areArraysDeepEqual = function (leftArray, rightArray) {
  const length = leftArray.length
  if (rightArray.length != length) {
    return false
  }
  let index = -1
  while (++index < length) {
    if (!isDeepEqual(leftArray[index], rightArray[index])) {
      return false
    }
  }
  return true
}

/**
 * @name isDeepEqual
 *
 * @synopsis
 * ```coffeescript [specscript]
 * Nested<T> = Array<Array<T>|Object<T>|Iterable<T>|T>|Object<Array<T>|Object<T>|Iterable<T>|T>
 *
 * var left Nested,
 *   right Nested
 *
 * isDeepEqual(left, right) -> boolean
 * ```
 *
 * @description
 * Check two values for deep strict equality.
 *
 * ```javascript [node]
 * console.log(
 *   isDeepEqual({ a: 1, b: 2, c: [3] }, { a: 1, b: 2, c: [3] }),
 * ) // true
 *
 * console.log(
 *   isDeepEqual({ a: 1, b: 2, c: [3] }, { a: 1, b: 2, c: [5] }),
 * ) // false
 * ```
 */
const isDeepEqual = function (leftItem, rightItem) {
  if (isArray(leftItem) && isArray(rightItem)) {
    return areArraysDeepEqual(leftItem, rightItem)
  } else if (
    typeof leftItem == 'object' && typeof rightItem == 'object'
      && leftItem.constructor == rightItem.constructor
      && typeof leftItem[symbolIterator] == 'function'
      && typeof rightItem[symbolIterator] == 'function'
  ) {
    return areIteratorsDeepEqual(
      leftItem[symbolIterator](), rightItem[symbolIterator]())
  } else if (leftItem == null || rightItem == null) {
    return leftItem === rightItem
  } else if (
    leftItem.constructor == Object && rightItem.constructor == Object
  ) {
    return areObjectsDeepEqual(leftItem, rightItem)
  }
  return leftItem === rightItem
}

/**
 * @name assertEqual
 *
 * @synopsis
 * ```coffeescript [specscript]
 * assertEqual(expected any, actual any) -> boolean
 * ```
 */
const assertEqual = function (expected, actual) {
  if (typeof expected == 'object' && typeof actual == 'object') {
    if (!isDeepEqual(expected, actual)) {
      log('expected', expected)
      log('actual', actual)
      throw AssertionError('not deep equal')
    }
  } else if (expected !== actual) {
    log('expected', expected)
    log('actual', actual)
    throw AssertionError('not strict equal')
  }
  return undefined
}

/**
 * @name argsInspect
 *
 * @synopsis
 * ```coffeescript [specscript]
 * argsInspect(args Array) -> argsRepresentation string
 * ```
 */
const argsInspect = args => `${args.map(curry1(inspect, __)).join(', ')}`

/**
 * @name funcInspect
 *
 * @synopsis
 * ```coffeescript [specscript]
 * funcInspect(args Array) -> funcRepresentation string
 * ```
 */
const funcInspect = func => func.toString()

/**
 * @name funcSignature
 *
 * @synopsis
 * ```coffeescript [specscript]
 * funcSignature(func function, args Array) -> funcRepresentation string
 * ```
 */
const funcSignature = (func, args) => `${func.name || 'anonymous'}(${argsInspect(args)})`

/**
 * @name errorAssertEqual
 *
 * @synopsis
 * ```coffeescript [specscript]
 * Error = { name: string, message: string }
 *
 * errorAssertEqual(expected Error, actual Error)
 * ```
 */
const errorAssertEqual = function (expected, actual) {
  if (actual.name != expected.name) {
    log()
    log('-- expect:', expected.name)
    log('-- actual:', actual.name)
    throw AssertionError('error names are different')
  } else if (actual.message != expected.message) {
    log()
    log('-- expect:', expected.message)
    log('-- actual:', actual.message)
    throw AssertionError('error messages are different')
  }
}

/**
 * @name throwAssertionError
 *
 * @synopsis
 * ```coffeescript [specscript]
 * throwAssertionError(message string) -> ()
 * ```
 */
const throwAssertionError = message => {
  throw AssertionError(message)
}

/**
 * @name assertThrows
 *
 * @synopsis
 * ```coffeescript [specscript]
 * assertThrows(func ()=>any, expectedError Error) -> ()
 * ```
 */
const assertThrows = function (func, expectedError) {
  try {
    const execution = func()
    if (isPromise(execution)) {
      return execution.then(funcConcat(
        thunkify1(throwAssertionError, 'did not throw'),
        curry2(errorAssertEqual, expectedError, __)))
    }
  } catch (error) {
    errorAssertEqual(expectedError, error)
    return undefined
  }
  throw AssertionError('did not throw')
}

/**
 * @name assertThrowsCallback
 *
 * @synopsis
 * ```coffeescript [specscript]
 * assertThrowsCallback(func ()=>Promise|any, args Array, callback (Error, ...any)=>())
 * ```
 */
const assertThrowsCallback = function (func, args, callback) {
  try {
    const execution = func(...args)
    if (isPromise(execution)) {
      return execution.then(thunkify1(throwAssertionError, 'did not throw'))
    }
  } catch (error) {
    const execution = callback(error, ...args)
    if (isPromise(execution)) {
      return execution.then(funcConcat(
      tapSync(thunkify1(log, ` ✓ ${argsInspect(args)} throws ...`)),
        noop))
    }
    log(` ✓ ${argsInspect(args)} throws ...`)
    return undefined
  }
  throw AssertionError('did not throw')
}

/**
 * @name ThunkTest
 *
 * @synopsis
 * ```coffeescript [specscript]
 * var story string,
 *   func function,
 *   args ...any,
 *   expectedResult any,
 *   expectedError Error|any
 *
 * ThunkTest(story, func) -> thunkTest ThunkTest {
 *   case: (...args, expectedResult)=>this,
 *   throws: (...args, expectedError)=>this,
 * }
 * ```
 *
 * @description
 * Modular testing for JavaScript.
 */

const ThunkTest = function (name, func) {
  const operations = []
  return objectAssign(function thunkTest() {
    log(name)
    const operationsLength = operations.length,
      promises = []
    let operationsIndex = -1
    while (++operationsIndex < operationsLength) {
      const execution = operations[operationsIndex]()
      if (isPromise(execution)) {
        promises.push(execution)
      }
    }
    return promises.length == 0 ? this : promiseAll(promises).then(always(this))
  }, {

    case(...args) {
      const expected = args.pop()
      if (typeof expected == 'function') {
        operations.push([
          thunkifyArgs(func, args),
          expected,
          tapSync(thunkify1(log, ` ✓ ${funcSignature(func, args)} -> ${funcInspect(expected)}`)),
        ].reduce(funcConcat))
      } else {
        operations.push([
          thunkifyArgs(func, args),
          curry2(assertEqual, expected, __),
          tapSync(thunkify1(log, ` ✓ ${funcSignature(func, args)} -> ${inspect(expected)}`)),
        ].reduce(funcConcat))
      }
      return this
    },

    throws(...args) {
      const expected = args.pop()
      if (typeof expected == 'function') {
        operations.push(function tryCatching() {
          try {
            const execution = func(...args)
            if (isPromise(execution)) {
              return execution.then(thunkify1(throwAssertionError, 'did not throw'))
            }
          } catch (error) {
            const execution = expected(error, ...args)
            if (isPromise(execution)) {
              return execution.then(funcConcat(
                tapSync(thunkify1(log, ` ✓ ${funcSignature(func, args)} throws; ${funcInspect(expected)}`)),
                noop))
            }
            log(` ✓ ${funcSignature(func, args)} throws; ${funcInspect(expected)}`)
            return undefined
          }
          throw AssertionError('did not throw')
        })
      } else {
        operations.push(funcConcat(
          thunkify2(assertThrows, thunkifyArgs(func, args), expected),
          tapSync(thunkify1(log, ` ✓ ${argsInspect(args)} throws ${expected}`)),
        ))
      }
      return this
    },
  })
}

module.exports = ThunkTest
