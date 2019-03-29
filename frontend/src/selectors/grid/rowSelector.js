import createCachedSelector from 're-reselect'
import { createSelectorCreator } from 'reselect'

import store from 'store'

const isoDateRegExp = /^[0-9]{4}-[0-9]{2}-[0-9]{2}?$/;

const selectorResolver = fn => {
  let lastTimestamp = null
  let lastResult = null
  return (state, dateSelector, record) => {
    let cur = dateSelector.getTimestamp(state, record.id) || 0
    if (cur !== lastTimestamp) {
      lastResult = fn(state, dateSelector, record) // no `apply`
      lastTimestamp = cur
    }
    return lastResult
  }
}

// There are no silent updates, since the timestamp is checked via grouped
// records. For payments, this is why there is a second `groupBy` call. 
// The time it takes to do the grouping of payments is less than if the rows
// had to constantly be rerendered. 
const rowSelector = createCachedSelector(
  (state) => state,
  (state, dateSelector) => dateSelector,
  (state, dateSelector, record) => record,
  (state, dateSelector, record) => {
    return new Proxy(record, {
      get: (record, field) => {
        if (field in record) {
          return record[field]
        }
        if (isoDateRegExp.test(field)) {
          return dateSelector.selectDate(state, record.id, field)
        }
      }
    })
  }
)(
  (state, dateSelector, record) =>
  {
    return `${dateSelector.groupDateRecords(state).name}-${record.id}`
  },
  {
    selectorCreator: createSelectorCreator(selectorResolver)
  }
)

export default rowSelector;
