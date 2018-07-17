import createCachedSelector from 're-reselect'
import { getTimestamp } from 'actions/api/fetch'
import * as records from 'selectors/records'

// Summarizes values based on some stuff. 
export const fundSummarySelector = createCachedSelector(
  (state) => records.getPayments,
  (state, fund) => fund,
  (state, fund, date) => date,
  (state, fund, date, timestamp) => timestamp,

  (payments, fund, date, timestamp) => {

    //employeeSalarySelector(employees, prevPayPeriod(date), _timestamp)

    //visitAccountPayment("root")

    console.timeEnd("Loading column")
    return {}
  }
)((state, date) => date, /* INSERT createSelectorCreator(memoizationFn) HERE */)

/*
 * Example:
 * getTimestampCreator = getTimestampCreator(state, 1, "2018-08-24")
 */
const getTimestampCreator = (state, fund, date, transactable) => getTimestamp(state.records.payments, { fund, date, transactable })

export function timestampMemoize(func, getTimestamp) {
  //let lastTimestamp = null
  //let lastResult = null
  
  //// We know that the first parameter passed will be the state?
  //return function () {
    //if (!areArgumentsShallowlyEqual(equalityCheck, lastArgs, arguments)) {
      //// apply arguments instead of spreading for performance.
      //lastResult = func.apply(null, arguments)
    //}

    //lastArgs = arguments
    //return lastResult
  //}
  return null
}

export default class FundSummaryCache {

}

