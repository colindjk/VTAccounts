// NOTE: This is definitely not kosher to do, but it saves the code from getting
// more complicated. 
import { objectMap } from 'util/helpers'

import * as records from 'selectors/records'

// Note: When a timestamp field is `undefined`, the timestamp === 0 for all
// intents and purposes.

// Timestamp helpers for recordsReducer.
export const applyTimestampSet = (timestamp, records = {}, data) => ({
  ...records, timestamp,
  data: {
    ...records.data,
    ...objectMap(data, record => ({ ...record, timestamp })),
  }
})

export const applyTimestamp = (timestamp, records, data) => ({
  ...records, timestamp,
  data: { ...records.data, [data.id]: { ...data, timestamp } }
})

// This module will be in charge of applying timestamps to server generated
// data. This way calculations happening client side can keep track of what
// data has been updated, and can cache results that have not been recently
// affected. 

// Note: If we face performance issues later on with paymentsGroupBy, this
// function can definitely be changed.
// It works now though.
export const insertAccountTimestamp = (state, data, transactableKey) => {
  // I know this is an anti-pattern, but it saves code complexity. 
  // Also, it properly handles the case where state is not yet initialized. 
  const accounts = records.getAccountData(state)

  const transactable = accounts[transactableKey]
  const timestamp = data[transactableKey].timestamp

  const visitParentTimestamp = (accounts, accountKey) => {
    if (!accountKey || !accounts[accountKey]) return {}
    data[accountKey] = data[accountKey] || { count: 0, timestamp: 0 }
    data[accountKey].count += 1
    data[accountKey].timestamp = Math.max(timestamp, data[accountKey].timestamp)
    visitParentTimestamp(accounts, accounts[accountKey].parent)
  }

  visitParentTimestamp(accounts, transactable.parent)
}
