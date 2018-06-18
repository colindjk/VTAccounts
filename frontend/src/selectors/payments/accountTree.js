import createCachedSelector, {LruObjectCache, LruMapCache} from 're-reselect';
import { createSelector } from 'reselect'

import store from 'store'
import * as records from 'selectors/records'
import * as forms from 'selectors/forms'
import { deepCopy } from 'util/helpers'
import { getPayPeriodRange } from 'util/payPeriod'

// DataGrid actions will involve a few responsibilities:
// -  Mapping internal state to a format compatible with react-data-grid
// -  Handle updates, grid actions will be the only way to update backend data

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

// Used on the transactions matching the particular transactable, date & fund
const aggregatePayments = (transactablePayments, defaultPayment) => {
  let aggregate = { ...defaultPayment }
  for (var key in transactablePayments) {
    aggregate = combinePayments(transactablePayments[key], { ...aggregate })
  }
  aggregate.count = Object.keys(transactablePayments).length
  return aggregate
}

// We use the `defaultPayment` to figure out which date / fund to access.
const populatePayments = (accountRows, fundDatePayments, defaultPayment) => {
  var accountPayments = {}
  const date = defaultPayment.date

  const visitAccountPayment = (key) => {
    let account = accountRows[key]
    // Base case
    if (account.account_level === 'transactable') {
      let payment = aggregatePayments(fundDatePayments[account.id] || [],
        { ...defaultPayment })
      accountPayments[key] = { ...payment, transactable: key }
      return payment
    }

    // Else populate the childrens values and combine them into your own.
    accountPayments[key] = { ...defaultPayment }
    account.children.forEach(childKey => {
      accountPayments[key] = combinePayments(accountPayments[key], visitAccountPayment(childKey))
    })
    return account[date]
  }

  visitAccountPayment("root")

  return accountPayments
}

// Holds a local copy of the data used by accountTree.
// Replaces slices of the internal accountTree based on cache miss.
// Any time and date__fund__timestamp lands on a cache miss, the necessary
// calculations will be made.
class AccountTreeCache {

  // If called before accounts is initialized... what happens?
  // -> technically that should never happen. 
  constructor() {

    // Stores return value of selector given { fund, date, timestamp } as key.
    // When these values differ from the selector return value, the internal
    // `accountData` variable is written to.
    this.paymentReferences = {}

    // "Selects" aggregation based on the given fund + date, adds timestamp to
    // cache key to verify the latest stored payment.
    this.paymentSelector = createCachedSelector(
      records.getAccounts,
      records.getFunds,
      records.getPayments,
      (state, fund) => fund,
      (state, fund, date) => date,

      // Two possible solutions:
      // [ ] - Side effects to internal state
      // [ ] - Allocate new object and finish w/ mega merge.
      (accounts, funds, payments, fund, date) => {
        // Just handles payments, salaries will be a separate cache. Good.
        var accountData = {}
        
        for (var id in accounts) {
          accountData[id] = {}
          accountData[id][date] = { /* paid, budget, etc. */ }
        }
        return accounts
      }
    )(
      ({ records }, fund, date) => {
        var timestamp = 0
        const { payments } = records
        if (payments[fund] && payments[fund][date]) {
          timestamp = payments[fund][date].timestamp
        }
        const cacheKey = fund + "__" + date + "__" + timestamp
        return cacheKey
      },
    )
  }

  getAccountData(state) {
    if (!this.accountData) {
      this.accountData = deepCopy(records.getAccounts(state))
    }
    return this.accountData
  }

  // Returns data related to the AccountTree DataGrid.
  // { accountData, range }
  // Using this data the component itself can decide on columns etc.
  select(state) {
    var accountData = this.getAccountData(state)
    const context = forms.getAccountTreeContext(state)
    if (!context) return {}

    const { fund } = context
    const range = getPayPeriodRange(context.startDate, context.endDate)

    range.forEach(date => {
      const payments = this.paymentSelector(state, fund, date)
      if (this.paymentReferences[date] !== payments) {
        this.paymentReferences[date] = payments
        for (var key in this.accountData) {
          this.accountData[key][date] = payments[key]
        }
      }
    })

    return this.accountData
  }

}

export default new AccountTreeCache()

