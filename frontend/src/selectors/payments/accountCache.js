import createCachedSelector, {LruObjectCache, LruMapCache} from 're-reselect';
import { createSelector } from 'reselect'

import store from 'store'
import * as records from 'selectors/records'
import * as forms from 'selectors/forms'
import { deepCopy } from 'util/helpers'
import { getPayPeriodRange } from 'util/payPeriod'
import { getTimestamp } from 'actions/api/fetch'

const defaultAggregates = { paid: 0, budget: 0, count: 0, }

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
    this.context = undefined

    // selectors = { date: resultOfSelector }
    // This allows us to check the returned object reference to see if we
    // need to update the internal "accounts" object.
    this.selectorResults = {}

    this.accounts = undefined

    this.paymentSelector = createCachedSelector(
      records.getAccounts,
      records.getFunds,
      records.getPayments,
      (state, fund) => fund,
      (state, fund, date) => date,

      (accounts, funds, payments, fund, date) => {
        let defaultPayment = { ...defaultAggregates, fund, date }

        var paymentsByAccount = {}
        const fundDatePayments = payments.data[fund] ? payments.data[fund].data[date] : undefined

        // FIXME: This code is sloppy.
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
        //const timestamp = getTimestamp(payments, { fund, date })
        const timestamp = payments.updated_on
        const cacheKey = fund + "__" + date + "__" + timestamp

        return cacheKey
      },
    )
  }

  // FIXME: Don't rely on accountTreeView
  select(state) {
    if (!state.accountTreeView.initialized) { return {} }

    if (!this.accounts) {
      this.accounts = deepCopy(state.records.accounts)
    }

    const stateContext = state.accountTreeView.context
    if (stateContext !== this.context) {
      this.context = stateContext
    }

    const { fund, range } = this.context

    range.forEach(date => {
      const selectorResult = this.paymentSelector(state, fund, date)

      // Returns true if fund stays the same & no transactions were updated
      if (selectorResult === this.selectorResults[date]) { return }

      this.selectorResults[date] = selectorResult

      for (var id in this.accounts) {
        // We have to replace the object at the row level in order for updates
        // to register. Possible fix in ReactDataGrid API.
        this.accounts[id] = { ...this.accounts[id], [date]: selectorResult[id] }
      }
    })

    return this.accounts
  }

}

