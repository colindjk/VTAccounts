import { createSelector, createSelectorCreator, defaultMemoize } from 'reselect'
import createCachedSelector from 're-reselect'

import * as Api from 'actions/types/api'
import { SalarySelector } from 'selectors/date-records'
import { rowSelector } from 'selectors/grid' // Possibly relocate this.

import { getPayPeriodRange, compareDates, maxDate } from 'util/date'
import { objectGroupBy, intoArray } from 'util/helpers'

export const getRecordsCreator = slice => state => state.records[slice]

export const getAccounts = state => state.records[Api.ACCOUNT]
export const getFunds = state => state.records[Api.FUND]
export const getEmployees = state => state.records[Api.EMPLOYEE]

export const getPayments = state => state.records[Api.PAYMENT]
export const getSalaries = state => state.records[Api.SALARY]
export const getFringes = state => state.records[Api.FRINGE]
export const getIndirects = state => state.records[Api.INDIRECT]

export const getTransactionMetadata = 
  state => state.records[Api.TRANSACTION_METADATA]

export const getTransactionFiles = state => state.records[Api.TRANSACTION_FILE]
export const getSalaryFiles = state => state.records[Api.SALARY_FILE]

// Basic getters for records state slice. 
export const getAccountData = state => getAccounts(state).data
export const getFundData = state => getFunds(state).data
export const getEmployeeData = state => getEmployees(state).data

export const getPaymentData = state => getPayments(state).data
export const getSalaryData = state => getSalaries(state).data
export const getFringeData = state => getFringes(state).data
export const getIndirectData = state => getIndirects(state).data

export const getTransactionMetadataData = 
  state => state.records[Api.TRANSACTION_METADATA].data

export const getTransactionFileData = state => getTransactionFiles(state).data
export const getSalaryFileData = state => getSalaryFiles(state).data

// Timetamps
export const getAccountTimestamp = state => getAccounts(state).timestamp
export const getFundTimestamp = state => getFunds(state).timestamp
export const getEmployeeTimestamp = state => getEmployees(state).timestamp

export const getPaymentTimestamp = state => getPayments(state).timestamp
export const getSalaryTimestamp = state => getSalaries(state).timestamp
export const getFringeTimestamp = state => getFringes(state).timestamp
export const getIndirectTimestamp = state => getIndirects(state).timestamp

// Loading, occurs during initialization and, more importantly updates to state.
export const isAccountLoading = state => getAccounts(state).loading > 0
export const isFundLoading = state => getFunds(state).loading > 0
export const isEmployeeLoading = state => getEmployees(state).loading > 0

export const isPaymentLoading = state => getPayments(state).loading > 0
export const isSalaryLoading = state => getSalaries(state).loading > 0
export const isFringeLoading = state => getFringes(state).loading > 0
export const isIndirectLoading = state => getIndirects(state).loading > 0

export const isTransactionMetadataLoadingFor = 
  (state, id) => getTransactionMetadata(state).files[id] === false

export const isTransactionFileLoading = 
  state => getTransactionFiles(state).loading > 0
export const isSalaryFileLoading = 
  state => getSalaryFiles(state).loading > 0

export const isAccountInitialized = state => getAccounts(state).initialized
export const isFundInitialized = state => getFunds(state).initialized
export const isEmployeeInitialized = state => getEmployees(state).initialized

export const isPaymentInitialized = state => getPayments(state).initialized
export const isSalaryInitialized = state => getSalaries(state).initialized
export const isFringeInitialized = state => getFringes(state).initialized
export const isIndirectInitialized = state => getIndirects(state).initialized

// Have you requested data, this will stop other metadata from being loaded.
// If metadata is already loaded, the related file will be listed in the
// `files` object withing Metadata state.
export const isTransactionMetadataInitializedFor = 
  (state, id) => !!getTransactionMetadata(state).files[id]

export const isTransactionFileInitialized =
  state => getTransactionFiles(state).initialized
export const isSalaryFileInitialized = 
  state => getSalaryFiles(state).initialized

// Filters on the data field while keeping track of timestamp, and "name" for
// caching purposes.
const recordsFilter = (obj, fn, name="FILTER") => Object.keys(obj.data || {})
  .reduce((result, key) => {
    if (fn(obj.data[key])) {
      result.data[key] = obj.data[key]
      result.timestamp = Math.max(result.timestamp, obj.data[key].timestamp)
    }
    return result
  }, { ...obj, name: obj.name + "_" + name, data: {} })

// I normally would turn the following two functions into cached selectors,
// however they should only ever get used in one place each. (date-selectors)

// Courier function, run once per fund accessed.
export const getFundPaymentsCreator = fund => createSelector(
  getPayments,
  () => fund,
  (payments, fund) => 
    recordsFilter(payments, payment => payment.fund === fund, "FUND_" + fund)
)

export const getAccountPaymentsCreator = account => createSelector(
  getPayments,
  getAccountData,
  () => account,
  (payments, accountData, accountKey) => {
    const account = accountData[accountKey]
    const filterByAccount = payment => {
      const transactable = accountData[payment.transactable]
      let curAccount = transactable
      while (curAccount) {
        // Note: when comparing keys, use `==`.
        if (curAccount.id == accountKey) return true
        curAccount = accountData[curAccount.parent]
      }
      return false
    }
    return recordsFilter(payments, filterByAccount, "ACCOUNT_" + accountKey)
  }
)

// This will be called separately from the fund filtering function, as 
export const filterBeforeDate = createCachedSelector(
  (dateRecords, date) => dateRecords,
  (dateRecords, date) => date,
  (dateRecords, date) =>
    recordsFilter(dateRecords,
      record => compareDates(record.date, date) !== -1, "DATE_FILTER")
)(
  dateRecords => dateRecords.name
)

// Gets accounts correctly. 
const getAccountsByLevelHelper = (accounts, level) =>
  Object.keys(accounts).filter(key => accounts[key].account_level === level)

// Common operations
export const getAccountTypeKeys = createSelector(
  accounts => accounts, () => "account_type", getAccountsByLevelHelper)
export const getAccountGroupKeys = createSelector(
  accounts => accounts, () => "account_group", getAccountsByLevelHelper)
export const getAccountSubGroupKeys = createSelector(
  accounts => accounts, () => "account_sub_group", getAccountsByLevelHelper)
export const getAccountClassKeys = createSelector(
  accounts => accounts, () => "account_class", getAccountsByLevelHelper)
export const getAccountObjectKeys = createSelector(
  accounts => accounts, () => "account_object", getAccountsByLevelHelper)
export const getAccountKeys = createSelector(
  accounts => accounts, () => "account", getAccountsByLevelHelper)
export const getTransactableKeys = createSelector(
  accounts => accounts, () => "transactable", getAccountsByLevelHelper)

const accountLevelMapper = {
  "account_type": getAccountTypeKeys,
  "account_group": getAccountGroupKeys,
  "account_sub_group": getAccountSubGroupKeys,
  "account_class": getAccountClassKeys,
  "account_object": getAccountObjectKeys,
  "account": getAccountKeys,
  "transactable": getTransactableKeys,
}

// One thing to note, `transactable` level accounts can have payments point to
// them, and must be leaf nodes.
export const getAccountsByLevel = (accounts, level) => {
  return accountLevelMapper[level](accounts)
}

// Returns a set of `id` fields representing fringe destinations.
// Used to get the rows for the fringe table. 
export const getFringeDestinations = createSelector(
  state => getAccountData(state),
  accounts =>
    getAccountsByLevel(accounts, "account").filter(id => accounts[id].is_fringe)
)

// Returns a set of employees where transactable !== undefined
export const getEmployeeTransactables = createSelector(
  getEmployees,
  employees => recordsFilter(employees, e => e.transactable, "TRANSACTABLE")
)

// The result of this selector is a dictionary of transactable keys to
// employee keys.
export const transactableToEmployee = createSelector(
  getAccountData,
  getEmployeeData,
  (accounts, employees) => {
    return intoArray(employees)
      .filter(({transactable}) => transactable) // has transactable
      .reduce((map, e) => ({ ...map, [e.transactable]: e.id }), {})
  }
)

export const getTransactionMetadataFor = createCachedSelector(
  getTransactionMetadata,
  (state, file) => file, // `id` for a file.
  (metadata, file) => {
    const name = Api.TRANSACTION_METADATA + "_" + file
    if (!metadata.files[file]) {
      return { data: {}, initialized: false, name, timestamp: 0 }
    }
    return recordsFilter(metadata, data => data.source_file === file, name)
  }
)(
  (_, fileKey) => fileKey || "undefined"
)

// Wrapper for data returned by `records.groupBy` to ensure a safe get function. 
// Testing can be found in `src/selectors/date-records/BaseDateSelector.test.js`
class GroupBy {
  // `name` can be used by other selectors for caching purposes if necessary.
  constructor(state, selector, fields) {
    this.name = selector(state).name
    this.grouped = objectGroupBy(state, selector(state).data, ...fields)
  }

  // Given a series of fields, try to find the matching data.
  // If no matching data is found, a timestamp of 0 is returned, with empty data
  get(...ids) {
    let cur = this.grouped
    for (let id of ids) {
      if (id && cur.data[id]) {
        cur = cur.data[id]
      } else {
        return { data: {}, count: 0, timestamp: 0 }
      }
    }
    return cur
  }

  // Using `apply` instead of the spread operator saves time.
  getArray(...ids) {
    return intoArray(this.get.apply(this, ids).data)
  }
}

const groupByResolver = fn => {
  let lastTimestamp = null
  let lastResult = null
  return (state, selector, ...fields) => {
    let cur = selector(state).timestamp
    if (cur !== lastTimestamp) {
      lastResult = fn(state, selector, ...fields)
    }
    lastTimestamp = cur
    return lastResult
  }
}

// Given a slice of `state` and `...fields`, return a grouped data structure.
// Note: For testing purposes it should be known this function accesses
//       `store.js` given the `transactable` field.
export const groupBy = createCachedSelector(
  (state, selector, ...fields) => state,
  (state, selector, ...fields) => selector,
  (state, selector, ...fields) => fields,
  (state, selector, fields) => new GroupBy(state, selector, fields)
)(
  (state, selector, ...fields) => fields.reduce(
    (cacheKey, field) => cacheKey + "-" + field, selector(state).name + "_"),
  {
    selectorCreator: createSelectorCreator(groupByResolver)
  }
)

const getEarliestDateResolver = fn => {
  let lastTimestamp = null
  let lastResult = null
  return (grouped, id) => {
    let cur = grouped.get(id).timestamp
    if (cur !== lastTimestamp) {
      lastResult = fn(grouped, id)
    }
    lastTimestamp = cur
    return lastResult
  }
}

// Use a selector here so selectors can rely on the range object reference for
// memoization. 
export const getGlobalDateRange = createSelector(
  state => state.settings.global.startDate,
  state => state.settings.global.endDate,
  (start, end) => start && end ? getPayPeriodRange(start, end) : []
)

// Since we're using selectors for Salaries/Fringes/Indirects this method is 
// necessary to preserve time complexity issues.
export const getEarliestDate = createCachedSelector(
  (grouped) => grouped,
  (grouped, id) => id,
  (grouped, id) => 
    Object.keys(grouped.get(id).data).sort(compareDates)[0] || maxDate
)(
  (grouped, id) => `${grouped.name}-${id}`,
  {
    selectorCreator: createSelectorCreator(getEarliestDateResolver)
  }
)

