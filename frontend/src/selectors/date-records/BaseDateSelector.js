import createCachedSelector from 're-reselect'
import { createSelectorCreator } from 'reselect'

import { getEarliestDate } from 'selectors/records'

// Summary of subclasses:
// |------------------+--------------+-----------------|
// | Class            | Records      | Related Records |
// |------------------+--------------+-----------------|
// | PaymentSelector  | accounts     | payments*       |
// | SalarySelector   | employees    | salaries        |
// | IndirectSelector | funds        | indirects       |
// | FringeSelector   | accounts     | fringes         |
// |------------------+--------------+-----------------|
// * LOE Calculations (payment / salary for employees) is done through the
//   DateRangeSelector's `selectDate` wrapper function.
//
// The arguments given to the dateSelector function will be determined by
// subclass implementations.

// Uses `id` as Y-axis and `date` as the X-axis.
export default class DateSelector {

  // Defines at least the cache'd selector.
  constructor() {
    if (new.target === DateSelector) {
      throw new TypeError("Cannot construct DateSelector instances directly");
    }

    const selectorResolver = fn => {
      // Set values to null rather than zero otherwise we won't set `lastResult`
      let lastTimestamp = null
      let lastCount = null
      let lastResult = null
      return (state, a, b) => {
        let curTimestamp = this.getTimestamp(state, a, b)
        let curCount = this.getCount(state, a, b)
        if (curTimestamp !== lastTimestamp || curCount !== lastCount) {
          lastResult = fn(state, a, b) // no `apply`
          lastTimestamp = curTimestamp
          lastCount = curCount
        }
        return lastResult
      }
    }

    // For some reason if I use the spread operator here, `selectorResolver`
    // gets alternating parameters... O.o
    this.cachedDateSelector = createCachedSelector(
      (state, a, b) => state,
      (state, a, b) => a,
      (state, a, b) => b,
      (state, a, b) => this.dateSelector(state, a, b)
    )(
      (state, a, b) => `${a}.${b}`,
      {
        selectorCreator: createSelectorCreator(selectorResolver)
      }
    )
  }

  // Similar to dateSelector, but relies on cached values. 
  selectDate(state, a, b) {
    return this.cachedDateSelector(state, a, b)
  }

  // Must check if null in case no values exist for given keys.
  selectRelatedRecords(state, a, b) {
    return this.groupDateRecords(state).getArray(a, b)
  }

  // It's okay to just return 0 here, all we care about is payments made to the
  // particular transactable or account being viewed. 
  getTimestamp(state, ...args) {
    return this.groupDateRecords(state).get(...args).timestamp
  }

  getCount(state, ...args) {
    return this.groupDateRecords(state).get(...args).count
  }

  getCachedDateSelector() {
    return this.cachedDateSelector
  }

  getEarliestDate(state, a) {
    return getEarliestDate(this.groupDateRecords(state), a)
  }

  // The core function of the DateSelector subclasses. 
  dateSelector(state, a, b) {
    throw TypeError("Unimplemented!")
  }

  groupDateRecords(state) {
    throw TypeError("Unimplemented!")
  }
}

