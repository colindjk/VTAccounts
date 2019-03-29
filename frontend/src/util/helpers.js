import { insertAccountTimestamp } from 'util/timestamp'

// NOTE: This class will "know" the inner working of groupByHelper
// Allows access to records data based on given fields.
// It's a bit messy but it works.
// This is tested in `src/selectors/date-records/BaseDateSelector.js`
export const groupByHelper = (state, array, ...fields) => {
  let base = { data: {}, timestamp: 0, count: 0, fields: [ ...fields ] }
  let lastField = fields.pop()

  array.forEach(e => {
    const recordTimestamp = e.timestamp
    base.timestamp = Math.max(base.timestamp, recordTimestamp)
    base.count += 1
    let cur = base
    fields.forEach(field => {
      const key = e[field]
      cur.data[key] = cur.data[key] || { data: {}, count: 0, timestamp: 0 }
      cur.data[key].timestamp = Math.max(cur.timestamp, recordTimestamp)
      cur.data[key].count += 1

      // IF we are grouping by the field `transactable`, we know we are accessing
      // accounts, and can therefore do this safely.
      if (field === 'transactable') {
        insertAccountTimestamp(state, cur.data, key)
      }
      cur = cur.data[key]
    })

    let last = cur.data[e[lastField]] || { data: {}, timestamp: 0, count: 0 }
    last.data[e.id] = e
    last.count += 1
    last.timestamp = Math.max(last.timestamp, recordTimestamp)
    cur.data[e[lastField]] = last

    if (lastField === 'transactable') {
      insertAccountTimestamp(state, cur.data, e[lastField])
    }
  })

  return base
}

export const intoArray = obj => Object.keys(obj).map(k => obj[k])
export const objectGroupBy = (state, obj, ...fields) =>
  groupByHelper(state, intoArray(obj), ...fields)

// Little helper for mapping object values.
export const objectMap = (object, fn) => {
  return Object.keys(object || {}).reduce((result, key) => {
    result[key] = fn(object[key])
    return result
  }, {})
}

// We'll do a performance check for groupBy on payments

// Went a little crazy with the spread syntax here... pretty cool though, eh?
export const objectFilter = (object, fn) => Object.keys(object || {})
  .reduce((result, key) => ({
    ...result,
    ...(fn(object[key]) ? {[key]: object[key]} : {})
  }), {})

// Apply and overwrite the initialState with the given state. 
// Always take the state value unless the state value is either undefined, or is
// a primitive when initialState holds an object.
export const applyMerge = (initialState={}, updateState={}) => {

  const visitFields = (init, update) => {
    for (const key in update) {
      if (init[key] !== undefined && typeof init[key] !== typeof update[key]) {
        continue // keep the initialStates value.
      }
      if (typeof update[key] === "object") {
        init[key] = visitFields({ ...(init[key] || {}) }, update[key])
      } else {
        init[key] = update[key]
      }
    }
    return init
  }

  return visitFields({ ...initialState }, updateState)
}

