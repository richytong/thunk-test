/**
 * thunk-test v1.3.8
 * https://github.com/richytong/thunk-test
 * (c) 2025 Richard Tong
 * thunk-test may be freely distributed under the MIT license.
 */

const noop = function () {}

const always = value => function getter() { return value }

const isArray = Array.isArray

const objectAssign = Object.assign

const isPromise = value => value != null && typeof value.then == 'function'

const callPropUnary = (value, property, arg0) => value[property](arg0)

const callPropBinary = (value, property, arg0, arg1) => value[property](arg0, arg1)

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

const thunkify3 = (func, arg0, arg1, arg2) => function thunk() {
  return func(arg0, arg1, arg2)
}

const thunkify4 = (func, arg0, arg1, arg2, arg3) => function thunk() {
  return func(arg0, arg1, arg2, arg3)
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

// argument resolver for curry3
const curry3ResolveArg0 = (
  baseFunc, arg1, arg2,
) => function arg0Resolver(arg0) {
  return baseFunc(arg0, arg1, arg2)
}

// argument resolver for curry3
const curry3ResolveArg1 = (
  baseFunc, arg0, arg2,
) => function arg1Resolver(arg1) {
  return baseFunc(arg0, arg1, arg2)
}

// argument resolver for curry3
const curry3ResolveArg2 = (
  baseFunc, arg0, arg1,
) => function arg2Resolver(arg2) {
  return baseFunc(arg0, arg1, arg2)
}

const curry3 = function (baseFunc, arg0, arg1, arg2) {
  if (arg0 == __) {
    return curry3ResolveArg0(baseFunc, arg1, arg2)
  }
  if (arg1 == __) {
    return curry3ResolveArg1(baseFunc, arg0, arg2)
  }
  return curry3ResolveArg2(baseFunc, arg0, arg1)
}

// argument resolver for curry4
const curry4ResolveArg0 = (
  baseFunc, arg1, arg2, arg3,
) => function arg0Resolver(arg0) {
  return baseFunc(arg0, arg1, arg2, arg3)
}

// argument resolver for curry4
const curry4ResolveArg1 = (
  baseFunc, arg0, arg2, arg3,
) => function arg1Resolver(arg1) {
  return baseFunc(arg0, arg1, arg2, arg3)
}

// argument resolver for curry4
const curry4ResolveArg2 = (
  baseFunc, arg0, arg1, arg3,
) => function arg2Resolver(arg2) {
  return baseFunc(arg0, arg1, arg2, arg3)
}

// argument resolver for curry4
const curry4ResolveArg3 = (
  baseFunc, arg0, arg1, arg2,
) => function arg3Resolver(arg3) {
  return baseFunc(arg0, arg1, arg2, arg3)
}

const curry4 = function (baseFunc, arg0, arg1, arg2, arg3) {
  if (arg0 == __) {
    return curry4ResolveArg0(baseFunc, arg1, arg2, arg3)
  }
  if (arg1 == __) {
    return curry4ResolveArg1(baseFunc, arg0, arg2, arg3)
  }
  if (arg2 == __) {
    return curry4ResolveArg2(baseFunc, arg0, arg1, arg3)
  }
  return curry4ResolveArg3(baseFunc, arg0, arg1, arg2)
}

const promiseAll = Promise.all.bind(Promise)

const repr = function (value, depth = 1, args = false) {
  const reprDeep = item => repr(item, depth + 1, args)
  if (typeof value == 'number') {
    return `${value}`
  }
  if (typeof value == 'boolean') {
    return `${value}`
  }
  if (Array.isArray(value)) {
    return `[${value.map(reprDeep).join(', ')}]`
  }
  if (ArrayBuffer.isView(value)) {
    return `${value.constructor.name}([${value.join(', ')}])`
  }
  if (typeof value == 'function') {
    return value.toString()
  }
  if (typeof value == 'string') {
    return depth == 0 ? value : `'${value}'`
  }
  if (value === null) {
    return 'null'
  }
  if (value === undefined) {
    return args ? 'undefined' : '()'
  }
  if (value.constructor == Set) {
    if (value.size == 0) {
      return 'Set()'
    }
    let result = 'Set(['
    const resultValues = []
    for (const item of value) {
      resultValues.push(reprDeep(item))
    }
    result += resultValues.join(', ')
    result += '])'
    return result
  }
  if (value.constructor == Map) {
    if (value.size == 0) {
      return 'Map()'
    }
    let result = 'Map(['
    const entries = []
    for (const [key, item] of value) {
      entries.push(`[${reprDeep(key)}, ${reprDeep(item)}]`)
    }
    result += entries.join(', ')
    result += '])'
    return result
  }
  if (value.constructor == Object) {
    if (Object.keys(value).length == 0) {
      return '{}'
    }
    let result = '{ '
    const entries = []
    for (const key in value) {
      entries.push(`${key}: ${reprDeep(value[key])}`)
    }
    result += entries.join(', ')
    result += ' }'
    return result
  }
  if (value instanceof Error) {
    return `${value.name}('${value.message}')`
  }
  if (typeof value.constructor == 'function') {
    return `${value.constructor.name}()`
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

const sameValueZero = function (left, right) {
  return left === right || (left !== left && right !== right);
}

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

const isDeepEqual = function (left, right) {
  const isLeftArray = isArray(left),
    isRightArray = isArray(right)
  if (isLeftArray || isRightArray) {
    return isLeftArray && isRightArray
      && areArraysDeepEqual(left, right)
  }
  if (left == null || right == null) {
    return sameValueZero(left, right)
  }

  const isLeftString = typeof left == 'string' || left.constructor == String,
    isRightString = typeof right == 'string' || right.constructor == String
  if (isLeftString || isRightString) {
    return sameValueZero(left, right)
  }
  const isLeftIterable = typeof left[symbolIterator] == 'function',
    isRightIterable = typeof right[symbolIterator] == 'function'
  if (isLeftIterable || isRightIterable) {
    return isLeftIterable && isRightIterable
      && areIteratorsDeepEqual(left[symbolIterator](), right[symbolIterator]())
  }

  const isLeftObject = left.constructor == Object,
    isRightObject = right.constructor == Object
  if (isLeftObject || isRightObject) {
    return isLeftObject && isRightObject
      && areObjectsDeepEqual(left, right)
  }
  return sameValueZero(left, right)
}

/**
 * @name assertEqual
 *
 * @synopsis
 * ```coffeescript [specscript]
 * assertEqual(expect any, actual any) -> boolean
 * ```
 */
const assertEqual = function (expect, actual) {
  if (expect instanceof Error) {
    assertEqual(expect.name, actual.name)
    assertEqual(expect.message, actual.message)
  }
  else if (!isDeepEqual(expect, actual)) {
    log('expect', repr(expect))
    log('actual', repr(actual))
    throw AssertionError('not equal')
  }
}

/**
 * @name argsRepr
 *
 * @synopsis
 * ```coffeescript [specscript]
 * argsRepr(args Array) -> argsRepresentation string
 * ```
 */
const argsRepr = args => `${args.map(curry3(repr, __, 1, true)).join(', ')}`

/**
 * @name funcRepr
 *
 * @synopsis
 * ```coffeescript [specscript]
 * funcRepr(args Array) -> funcRepresentation string
 * ```
 */
const funcRepr = func => func.name === '' ? func.toString() : func.name

/**
 * @name funcSignature
 *
 * @synopsis
 * ```coffeescript [specscript]
 * funcSignature(func function, args Array) -> funcRepresentation string
 * ```
 */
const funcSignature = (func, args) => func.name === ''
  ? `(${argsRepr(args)}) |> ${func.toString()}`
  : `${func.name}(${argsRepr(args)})`

/**
 * @name errorRepr
 *
 * @synopsis
 * ```coffeescript [specscript]
 * Error = { name: string, message: string }
 *
 * errorRepr(error Error) -> funcRepresentation string
 * ```
 */
const errorRepr = error => `${error.name}('${error.message}')`

/**
 * @name errorAssertEqual
 *
 * @synopsis
 * ```coffeescript [specscript]
 * Error = { name: string, message: string }
 *
 * errorAssertEqual(expect Error, actual Error)
 * ```
 */
const errorAssertEqual = function (expect, actual) {
  if (actual.name != expect.name) {
    log()
    log('-- expect:', expect.name)
    log('-- actual:', actual.name)
    throw AssertionError('error names are different')
  } else if (actual.message != expect.message) {
    log()
    log('-- expect:', expect.message)
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
      return execution
        .then(funcConcat(
          thunkify1(throwAssertionError, 'did not throw'),
          curry2(errorAssertEqual, expectedError, __)
        ))
        .catch(curry2(errorAssertEqual, expectedError, __))
    }
  } catch (error) {
    errorAssertEqual(expectedError, error)
    return undefined
  }
  throw AssertionError('did not throw')
}

/**
 * @name thunkTestExecAsync
 *
 * @synopsis
 * ```coffeescript [specscript]
 * Thunk = ()=>any
 *
 * thunkTestExecAsync(operations Array<Thunk>, operationsIndex number) -> Promise<void>
 * ```
 */
const thunkTestExecAsync = async function (
  operations, operationsIndex,
) {
  const operationsLength = operations.length
  while (++operationsIndex < operationsLength) {
    let execution = operations[operationsIndex]()
    if (isPromise(execution)) {
      execution = await execution
    }
    if (typeof execution == 'function') {
      const cleanup = execution()
      if (isPromise(cleanup)) {
        await cleanup
      }
    }
  }
}

/**
 * @name thunkTestExec
 *
 * @synopsis
 * ```coffeescript [specscript]
 * Thunk = ()=>any
 *
 * thunkTestExecAsync(operations Array<Thunk>, operationsIndex number) -> ()|Promise<void>
 * ```
 */
const thunkTestExec = function (operations) {
  const operationsLength = operations.length
  let operationsIndex = -1
  while (++operationsIndex < operationsLength) {
    const execution = operations[operationsIndex]()
    if (isPromise(execution)) {
      return execution.then(funcConcat(
        tapSync(res => typeof res == 'function' && res()),
        thunkify2(thunkTestExecAsync, operations, operationsIndex),
      ))
    } else if (typeof execution == 'function') {
      const cleanup = execution()
      if (isPromise(cleanup)) {
        return cleanup.then(
          thunkify2(thunkTestExecAsync, operations, operationsIndex),
        )
      }
    }
  }
  return undefined
}

/**
 * @name Test
 *
 * @synopsis
 * ```coffeescript [specscript]
 * test = ()=>() {
 *   before: function=>this,
 *   after: function=>this,
 *   beforeEach: function=>this,
 *   afterEach: function=>this,
 *   case: (...args, expectedResult|function=>(disposer ()=>())|())=>this,
 *   throws: (...args, expectedError|function=>(disposer ()=>())|())=>this,
 * }
 *
 * Test(story string, func function) -> test
 *
 * Test(func function) -> test
 * ```
 *
 * @description
 * Modular testing for JavaScript.
 */

const arrayFlatMap = function (array, flatMapper) {
  const arrayLength = array.length,
    result = []
  let arrayIndex = -1
  while (++arrayIndex < arrayLength) {
    result.push(...flatMapper(array[arrayIndex]))
  }
  return result
}

const Test = function (...funcs) {
  if (this == null || this.constructor != Test) {
    return new Test(...funcs)
  }
  let story = null
  if (typeof funcs[0] == 'string') {
    story = funcs.shift()
  }
  const operations = [],
    preprocessing = [],
    postprocessing = [],
    microPreprocessing = [],
    microPostprocessing = []
  return objectAssign(function thunkTest() {
    if (story != null) {
      log('--', story)
    }
    let cursor = null
    cursor = thunkTestExec(preprocessing)
    if (isPromise(cursor)) {
      return cursor.then(funcConcat(
        thunkify1(thunkTestExec, arrayFlatMap(
          operations,
          operation => [...microPreprocessing, operation, ...microPostprocessing])),
        thunkify1(thunkTestExec, postprocessing),
      ))
    }

    cursor = thunkTestExec(arrayFlatMap(
      operations,
      operation => [...microPreprocessing, operation, ...microPostprocessing]))
    if (isPromise(cursor)) {
      return cursor.then(thunkify1(thunkTestExec, postprocessing))
    }
    cursor = thunkTestExec(postprocessing)
    if (isPromise(cursor)) {
      return cursor.then(noop)
    }
    return undefined
  }, {

    before(callback) {
      preprocessing.push(thunkify3(callPropUnary, callback, 'call', this))
      return this
    },

    after(callback) {
      postprocessing.push(thunkify3(callPropUnary, callback, 'call', this))
      return this
    },

    beforeEach(callback) {
      microPreprocessing.push(thunkify3(callPropUnary, callback, 'call', this))
      return this
    },

    afterEach(callback) {
      microPostprocessing.push(thunkify3(callPropUnary, callback, 'call', this))
      return this
    },

    case(...args) {
      const expect = args.pop(),
        boundArgs = args.map(arg => typeof arg == 'function' ? arg.bind(this) : arg)
      if (typeof expect == 'function') {
        for (const func of funcs) {
          operations.push([
            thunkify4(callPropBinary, func, 'apply', this, boundArgs),
            curry4(callPropBinary, expect, 'call', this, __),
            tapSync(thunkify1(log, ` ✓ ${funcSignature(func, boundArgs)} |> ${funcRepr(expect)}`)),
          ].reduce(funcConcat))
        }
      } else {
        for (const func of funcs) {
          operations.push([
            thunkify4(callPropBinary, func, 'apply', this, boundArgs),
            curry2(assertEqual, expect, __),
            tapSync(thunkify1(log, ` ✓ ${funcSignature(func, boundArgs)} -> ${repr(expect)}`)),
          ].reduce(funcConcat))
        }
      }
      return this
    },

    throws(...args) {
      const expect = args.pop(),
        boundArgs = args.map(arg => typeof arg == 'function' ? arg.bind(this) : arg)
      if (typeof expect == 'function') {
        for (const func of funcs) {
          operations.push(function _tryCatch() {
            try {
              const execution = func(...boundArgs)
              if (isPromise(execution)) {
                return execution
                  .then(thunkify1(throwAssertionError, 'did not throw'))
                  .catch(error => {
                    const execution = expect(error, ...boundArgs)
                    if (isPromise(execution)) {
                      return execution.then(funcConcat(
                        tapSync(thunkify1(log, ` ✓ ${funcSignature(func, boundArgs)} throws; ${funcRepr(expect)}`)),
                        noop))
                    }
                    log(` ✓ ${funcSignature(func, boundArgs)} throws; ${funcRepr(expect)}`)
                    return undefined
                  })
              }

            } catch (error) {
              const execution = expect(error, ...boundArgs)
              if (isPromise(execution)) {
                return execution.then(funcConcat(
                  tapSync(thunkify1(log, ` ✓ ${funcSignature(func, boundArgs)} throws; ${funcRepr(expect)}`)),
                  noop))
              }
              log(` ✓ ${funcSignature(func, boundArgs)} throws; ${funcRepr(expect)}`)
              return undefined
            }
            throw AssertionError('did not throw')
          })
        }

      } else {
        for (const func of funcs) {
          operations.push(funcConcat(
            thunkify2(
              assertThrows,
              thunkify4(callPropBinary, func, 'apply', this, boundArgs),
              expect),
            tapSync(thunkify1(log, ` ✓ ${funcSignature(func, boundArgs)} throws ${errorRepr(expect)}`)),
          ))
        }
      }
      return this
    },
  })
}

/**
 * @name testAllAsync
 *
 * @synopsis
 * ```coffeescript [specscript]
 * testAllAsync(tests Array<Test>, index number) -> combinedTest ()=>Promise<>
 * ```
 */
const testAllAsync = async function (tests, index) {
  const length = tests.length
  while (++index < length) {
    await tests[index]()
  }
}

/**
 * @name Test.all
 *
 * @synopsis
 * ```coffeescript [specscript]
 * Test.all(tests Array<Test>) -> combinedTest ()=>{}
 * ```
 */
Test.all = function TestAll(tests) {
  return function testAll() {
    const length = tests.length
    let index = -1
    while (++index < length) {
      const execution = tests[index]()
      if (isPromise(execution)) {
        return execution.then(thunkify2(testAllAsync, tests, index))
      }
    }
    return undefined
  }
}

module.exports = Test
