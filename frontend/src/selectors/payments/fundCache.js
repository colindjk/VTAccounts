import createCachedSelector, {LruObjectCache, LruMapCache} from 're-reselect';
import { createSelector } from 'reselect'

import store from 'store'
import * as records from 'selectors/records'
import * as forms from 'selectors/forms'
import { deepCopy } from 'util/helpers'
import { getTimestamp } from 'actions/api/fetch'

const defaultAggregates = { paid: 0, budget: 0, count: 0 }

// Helper function which aggregates two payments together.
const combinePayments = (paymentA, paymentB) => {
  return { 
    ...paymentA,
    paid: paymentA.paid + paymentB.paid,
    budget: paymentA.budget + paymentB.budget,
    count: paymentA.count || 0 + paymentB.count || 0,
  }
}

// Temporary function which will be deprecated upon update to getTimestamp
const getEmployeeTimestamp = (state, employee, date) => {
  const { payments, funds, accounts, employees } = state.records
  // FIXME: Messy code prone to explosion.
  let transactable = accounts[employees[employee].transactable].id
  let timestamp = 0
  for (var fund in funds) {
    let fundTimestamp = getTimestamp(payments, { fund, transactable, date })
    if (fundTimestamp > timestamp) {
      timestamp = fundTimestamp
    }
  }
  return timestamp
}

// To be used on the array found matching the fund, date, and transactable
// FIXME: Duplicate code
const aggregatePayments = (transactablePayments, defaultPayment) => {
  let aggregate = { ...defaultPayment }
  for (var key in transactablePayments) {
    aggregate = combinePayments(transactablePayments[key], { ...aggregate })
  }
  aggregate.count = Object.keys(transactablePayments).length
  return aggregate
}

// Select takes a range and an account, and aggregate over all payments to the
// account which will be sorted by fund.
export default class FundCache {
  constructor() {
    this.context = undefined
    this.employees = undefined
    this.selectorResults = {}

    this.paymentSelector = createCachedSelector(
      records.getAccounts,
      records.getEmployees,
      records.getFunds,
      records.getPayments,
      (state, employee) => employee,
      (state, employee, date) => date,
      (state, employee, date, timestamp) => timestamp,

      (accounts, employees, funds, payments, employee, date, _timestamp) => {
        let defaultPayment = { ...defaultAggregates, employee, date }
        let paymentsByFund = {}
        const account = accounts[employees[employee].transactable]

        for (const fundKey in funds) {
          let defaultPayment = { ...defaultAggregates, employee, date }
          const fund = funds[fundKey]
          const fundDatePayments = payments.data[fund.id] ? payments.data[fund.id].data[date] : undefined

          const visitAccountFundPayment = (key) => {
            let accountPayment

            // Base case: no payments exist.
            if (!fundDatePayments || !fundDatePayments.data[account.id]) {
              accountPayment = { ...defaultPayment, fund: fundKey, transactable: key }
              paymentsByFund[fundKey] = accountPayment
              return { ...defaultPayment }
            }
            // Otherwise, aggregate data and assign the result to the account hashmap.
            let payment = aggregatePayments(fundDatePayments.data[account.id].data || {},
              { ...defaultPayment })
            accountPayment = { ...payment, fund: fundKey, transactable: key }
            paymentsByFund[fundKey] = accountPayment

            return payment
          }

          visitAccountFundPayment(account.id)
        }

        return paymentsByFund
      }
    )(
      ({ records }, employee, date) => {
        const { payments } = records
        const cacheKey = `${employee}.${date}`

        console.log("Cache: ", cacheKey)

        return cacheKey
      }
    )
  }

  // TODO: regular select which doesn't filter out by employee or transactable.
  // - This

  selectEmployee(state) {

    if (!state.ui.context) { return {} }
    console.log("accountCache context", state.ui.context)

    if (!this.funds) {
      this.funds = deepCopy(state.records.funds)
    }

    const stateContext = state.ui.context
    if (stateContext !== this.context) {
      this.context = stateContext
    }

    const { account, employee, range } = this.context

    if (employee === undefined) { return {} }

    console.log("SELECTOR: ", this.paymentSelector.cache)
    console.log("Results: ", this.selectorResults)
    range.forEach(date => {

      const selectorResult = this.paymentSelector(state, employee, date, getEmployeeTimestamp(state, employee, date))

      // Returns true if account stays the same & no transactions were updated
      if (selectorResult && selectorResult === this.selectorResults[date]) {
        console.log("Cache Hit for: ", employee, date, getEmployeeTimestamp(state, employee, date))
        return
      } else {
        console.log("Cache Miss for: ", employee, date)
      }

      this.selectorResults[date] = selectorResult

      console.time("Storing column")
      for (var id in this.funds) {
        // We have to replace the object at the row level in order for updates
        // to register. Possible fix in ReactDataGrid API.
        this.funds[id] = { ...this.funds[id], [date]: selectorResult[id], }
      }
      console.timeEnd("Storing column")
    })

    console.log("FUNDS", this.funds)
    return deepCopy(this.funds)
  }
}

