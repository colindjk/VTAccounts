import createCachedSelector from 're-reselect'
import {
  AccountPaymentSelector,
  AccountBalanceSelector,
  FundPaymentSelector,
  SalarySelector,
  IndirectSelector,
  FringeSelector,
} from 'selectors/date-records'

import * as records from 'selectors/records'

const isoDateRegExp = /^[0-9]{4}-[0-9]{2}-[0-9]{2}?$/;

// Gets a proxy to payments through a fund record, filtered by account.
export const fundSelector = createCachedSelector(
  (state) => state,
  (state, fund) => records.getFundData(state)[fund],
  (state, fund, account) => account || "all",
  (state, fund, accountKey) => {
    // Handle `undefined` or All fund, as the AccountPaymentSelector has the
    // functionality to handle a null fund as "all" funds.
    return new Proxy(fund || {}, {
      get: (fund, field) => {
        if (field === 'employee') {
          const employeeKey = records.transactableToEmployee(state)[accountKey]
          return employeeKey && employeeSelector(state, employeeKey)
        }
        if (field in fund) {
          return fund[field]
        }
        if (isoDateRegExp.test(field)) {
          return AccountBalanceSelector(accountKey).selectDate(state, fund.id, field)
        }
      }
    })
  }
)(
  (state, fund, account) => `${fund}-${account || "all"}`
)

// Gets a proxy to payments through an account record, filtered by fund.
export const accountSelector = createCachedSelector(
  (state) => state,
  (state, account) => records.getAccountData(state)[account],
  (state, account, fund) => fund || "all",
  (state, account, fundKey) => {
    return new Proxy(account, {
      get: (account, field) => {
        if (field === 'employee') {
          const employeeKey = records.transactableToEmployee(state)[account.id]
          return employeeKey && employeeSelector(state, employeeKey)
        }
        if (field in account) {
          return account[field]
        }
        if (isoDateRegExp.test(field)) {
          return FundPaymentSelector(fundKey).selectDate(state, account.id, field)
        }
      }
    })
  }
)(
  (state, account, fund) => `${account}-${fund || "all"}`
)

// Gets a proxy to salaries through an employee record.
export const employeeSelector = createCachedSelector(
  (state) => state,
  (state, employee) => records.getEmployeeData(state)[employee],
  (state, employee) => {
    return new Proxy(employee, {
      get: (employee, field) => {
        if (field in employee) {
          return employee[field]
        }
        if (isoDateRegExp.test(field)) {
          return SalarySelector.selectDate(state, employee.id, field)
        }
      }
    })
  }
)(
  (state, employee) => employee
)

export const fundIndirectSelector = createCachedSelector(
  (state) => state,
  (state, fund) => records.getFundData(state)[fund],
  (state, fund) => {
    return new Proxy(fund, {
      get: (fund, field) => {
        if (field in fund) {
          return fund[field]
        }
        if (isoDateRegExp.test(field)) {
          return IndirectSelector.selectDate(state, fund.id, field)
        }
      }
    })
  }
)(
  (state, fund) => fund
)

// If the 
export const accountFringeSelector = createCachedSelector(
  (state) => state,
  (state, account) => records.getAccountData(state)[account],
  (state, account) => {
    return new Proxy(account, {
      get: (account, field) => {
        if (field in account) {
          return account[field]
        }
        if (isoDateRegExp.test(field)) {
          return FringeSelector.selectDate(state, account.id, field)
        }
      }
    })
  }
)(
  (state, account) => account
)

// Given initialRows, data, and options, provide the final rows. 
// Returns a list of ids
export const selectRows = (initRows, data, options, rowMetaData={}) => {
  let {
    filtered,
    flattened,
    expanded,
    rangeFields, // what range field to show for a given row.
    showAll,
    childrenField,
    //searchParams, // TODO: Allow for nested search functionality.
  } = options

  filtered = filtered || {}
  flattened = flattened || {}
  expanded = expanded || {}

  // searchParams: {
  //   [fieldKey]: [ ...searchStrings ],
  //   ...pairs.
  // }

  // Note: supplied `row` is just the `id` of the record found in `data`.
  const visitRow = (row, treeDepth, siblingIndex) => {
    if (filtered[row] && !showAll) return []

    // FIXME: custom children? custom field?
    rowMetaData[row] = {
      group: (data[row][childrenField] || []).length > 0,
      expanded: !!expanded[row],
      filtered: !!filtered[row],
      flattened: !!flattened[row],
      rangeField: rangeFields[row],
      field: "name", // FIXME
      children: data[row][childrenField] || [],
      treeDepth,
      siblingIndex,
    }

    siblingIndex = flattened[row] && !showAll ? siblingIndex : 0

    // So I need to walk down the tree and continue to return true (show) until
    // their are no children, then return false. That is unless you find a
    // matching term. 

    // TODO: add children.sort(fn).reduce(...
    return expanded[row] || (flattened[row] && !showAll) ?
      (data[row][childrenField] || []).reduce(
      (rows, child) => [
        ...rows,
        ...visitRow(
          child,
          flattened[row] && !showAll ? treeDepth : treeDepth + 1,
          siblingIndex++
        )
      ],
      [ ...(flattened[row] && !showAll ? [] : [row]) ]) : [ row ]
  }
  let siblingIndex = 0
  return {
    rows: initRows.reduce((rows, row) =>
      [ ...rows, ...visitRow(row, 0, siblingIndex++)], []),
    rowMetaData
  }
}

export {default as rowSelector} from './rowSelector'
