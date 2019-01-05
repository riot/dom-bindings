/**
 * Safe expression/bindings value evaluation, in case of errors we return a fallback value
 * @param   {Function} fn  - function to evaluate
 * @param   {*}        fallback - a fallback return value
 * @param   {boolean}  debug - if true the error will be logged
 * @returns {*} result of the computation or a fallback value
 */

export default function evalOrFallback(fn, fallback, debug) {
  try {
    return fn()
  } catch (error) {
    if (debug) {
      console.error(debug) // eslint-disable-line
    }

    return fallback
  }
}