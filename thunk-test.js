const noop = function () {}

const always = value => function getter() { return value }

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

/**
 * @name assertStrictEqual
 *
 * @synopsis
 * ```coffeescript [specscript]
 * assertStrictEqual(expected any, actual any) -> boolean
 * ```
 */
const assertStrictEqual = function (expected, actual) {
  if (expected !== actual) {
    console.log('expected', expected)
    console.log('actual', actual)
    throw AssertionError('not strict equal')
  }
}

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
    console.log()
    console.log('-- expect:', expected.name)
    console.log('-- actual:', actual.name)
    throw AssertionError('error names are different')
  } else if (actual.message != expected.message) {
    console.log()
    console.log('-- expect:', expected.message)
    console.log('-- actual:', actual.message)
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
      tapSync(thunkify1(console.log, ` ✓ ${argsInspect(args)} throws ...`)),
        noop))
    }
    console.log(` ✓ ${argsInspect(args)} throws ...`)
    return undefined
  }
  throw AssertionError('did not throw')
}

/**
 * @name argsInspect
 *
 * @synopsis
 * ```coffeescript [specscript]
 * argsInspect(args Array) -> argsRepresentation string
 * ```
 */
const argsInspect = args => args.length == 1
  ? `${args[0]}`
  : `(${args.join(', ')})`

/**
 * @name funcInspect
 *
 * @synopsis
 * ```coffeescript [specscript]
 * funcInspect(args Array) -> funcRepresentation string
 * ```
 */
const funcInspect = func => `${func.name || 'callback'}()`

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
    console.log(name)
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
          tapSync(thunkify1(console.log, ` ✓ ${argsInspect(args)} -> ${funcInspect(expected)}`)),
        ].reduce(funcConcat))
      } else {
        operations.push([
          thunkifyArgs(func, args),
          curry2(assertStrictEqual, expected, __),
          tapSync(thunkify1(console.log, ` ✓ ${argsInspect(args)} -> ${expected}`)),
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
                tapSync(thunkify1(console.log, ` ✓ ${argsInspect(args)} throws ...`)),
                noop))
            }
            console.log(` ✓ ${argsInspect(args)} throws ...`)
            return undefined
          }
          throw AssertionError('did not throw')
        })
      } else {
        operations.push(funcConcat(
          thunkify2(assertThrows, thunkifyArgs(func, args), expected),
          tapSync(thunkify1(console.log, ` ✓ ${argsInspect(args)} throws ${expected}`)),
        ))
      }
      return this
    },
  })
}

module.exports = ThunkTest
