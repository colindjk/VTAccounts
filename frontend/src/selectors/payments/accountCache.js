import createCachedSelector, {LruObjectCache, LruMapCache} from 're-reselect';
import { createSelector } from 'reselect'

// FIXME: Why does this need to be imported?
import store from 'store'

import * as records from 'selectors/records'
import * as forms from 'selectors/forms'
import EmployeeCache from 'selectors/payments/employeeCache'
import FundSummaryCache from 'selectors/payments/fundSummaryCache'
import { deepCopy } from 'util/helpers'
import { getTimestamp } from 'actions/api/fetch'

const defaultAggregates = { paid: 0, budget: 0, count: 0, }

class DatePaymentCacheObject {
  constructor() {
    this.selectorFns = {}
  }

  set(key: any, selectorFn: any) {
    this.selectorFns[key] = selectorFn
  }

  get(key: any) {
    return this.selectorFns[key]
  }

  remove(key: any) {
    delete this.selectorFns[key]
  }

  clear() {
    this.selectorFns = {}
  }

  //isValidCacheKey?(key: any): boolean; // optional
}

// Helper function which aggregates two payments together.
const combinePayments = (paymentA, paymentB) => {
  return { 
    ...paymentA,
    paid: paymentA.paid + paymentB.paid,
    budget: paymentA.budget + paymentB.budget,
    count: paymentA.count || 0 + paymentB.count || 0,
  }
}

// To be used on the array found matching the fund, date, and transactable
const aggregatePayments = (transactablePayments, defaultPayment) => {
  let aggregate = { ...defaultPayment }
  for (var key in transactablePayments) {
    aggregate = combinePayments(transactablePayments[key], { ...aggregate })
  }
  aggregate.count = Object.keys(transactablePayments).length
  return aggregate
}

// An instance of this class will exist for each component. The component will
// then "select" the fund and range.
export default class AccountCache {
  constructor() {
    console.log("INITIALIZING ACCOUNT CACHE")
    this.context = undefined

    // selectors = { date: resultOfSelector }
    // This allows us to check the returned object reference to see if we
    // need to update the internal "accounts" object.
    this.selectorResults = {}

    this.accounts = undefined
    this.employeeCache = new EmployeeCache()

    // Include timestamp as a field so recalculations occur when a timestamp is
    // changed.
    this.paymentSelector = createCachedSelector(
      records.getAccounts,
      records.getFunds,
      records.getPayments,
      (state, fund) => fund,
      (state, fund, date) => date,
      (state, fund, date, timestamp) => timestamp,

      (accounts, funds, payments, fund, date, _timestamp) => {
        let defaultPayment = { ...defaultAggregates, fund, date }

        var paymentsByAccount = {}
        const fundDatePayments = payments.data[fund] ? payments.data[fund].data[date] : undefined

        const visitAccountPayment = (key) => {
          const account = accounts[key]
          let accountPayment

          if (account.account_level === 'transactable') {

            // Base case: no payments exist.
            if (!fundDatePayments || !fundDatePayments.data[account.id]) {
              accountPayment = { ...defaultPayment, transactable: key }
              paymentsByAccount[key] = accountPayment
              return { ...defaultPayment }
            }
            // Otherwise, aggregate data and assign the result to the account hashmap.
            let payment = aggregatePayments(fundDatePayments.data[account.id].data || {},
              { ...defaultPayment })
            accountPayment = { ...payment, transactable: key }
            paymentsByAccount[key] = accountPayment

            return payment
          }

          // Else populate the childrens values and combine them into your own.
          accountPayment = { ...defaultPayment }
          account.children.forEach(childKey => {
            accountPayment = combinePayments(accountPayment, visitAccountPayment(childKey))
          })
          paymentsByAccount[key] = accountPayment
          return accountPayment
        }

        visitAccountPayment("root")
        
        return paymentsByAccount
      }
    )(
      (state, fund, date) => {

        const { records } = state
        const { payments } = records
        const cacheKey = `${fund}.${date}`

        return cacheKey
      },
      {
        cacheObject: new DatePaymentCacheObject()
      }
    )
  }

  selectFundDate(state, fund, date) {
    let { records } = state
    if (records.payments.data === undefined)
    {
      return {}
    }

    let timestamp = getTimestamp(records.payments, { fund, date })
    return this.paymentSelector(state, fund, date, timestamp)
  }

  checkAccounts(state) {
    if (!this.accounts) {
      this.accounts = deepCopy(state.records.accounts)
    }

    var employees = this.employeeCache.selectEmployees(state).employeeData
    for (var id in employees) {
      let employee = employees[id]
      if (employee.transactable) {
        this.accounts[employee.transactable].employee = employee
        this.accounts[employee.transactable].name = employee.first_name + " " + employee.last_name
        this.accounts[employee.transactable].code = employee.position_number
      }
    }
  }

  // Possible fix -> cacheKey === '${fund}.${date}'
  //                 use timestamp as a parameter. 
  select(state) {
    console.time("accountCache")
    const { context } = state.ui
    if (!context || context.fund === undefined) { return { initialized: false } }
    console.log("accountCache context", state.ui.context)

    this.checkAccounts(state)

    const stateContext = state.ui.context
    if (stateContext !== this.context) {
      this.context = stateContext
    }

    const { fund, range } = this.context

    if (fund === undefined) { return {} }

    let results = {}, updated = false
    range.forEach(date => {
      const selectorResult = this.selectFundDate(state, fund, date)

      // Returns true if fund stays the same & no transactions were updated
      if (selectorResult && selectorResult === this.selectorResults[date]) {
        return
      }

      updated = true
      this.selectorResults[date] = selectorResult

      for (var id in this.accounts) {
        this.accounts[id] = { ...this.accounts[id], [date]: selectorResult[id] }
      }
      console.timeEnd("Storing column")
    })

    console.timeEnd("accountCache")
    // By returning a new object every time, 
    return { initialized: true, updated, accounts: this.accounts }
  }

}

