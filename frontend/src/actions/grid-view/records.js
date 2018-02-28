import { put, take, takeEvery, all, call, select, } from 'redux-saga/effects'

import { success, failure } from 'actions';
import * as actionType from 'actions/types';
import { deepCopy } from 'util/helpers'
import { getPayPeriodRange } from 'util/payPeriod'

import { getPayment, retrieveFundPayments, retrieveAccounts } from 'actions/api'

// Grid actions will involve a few responsibilities:
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

// To be used on the array found matching the fund, date, and transactable
const aggregatePayments = (transactablePayments, defaultPayment) => {
  let aggregate = { ...defaultPayment }
  for (var key in transactablePayments) {
    aggregate = combinePayments(transactablePayments[key], { ...aggregate })
  }
  aggregate.count = Object.keys(transactablePayments).length
  return aggregate
}

// We use the `defaultPayment` to figure out which date / fund to access.
// I'd like to find a way to make this more functional (no side effects) but
// that just doesn't seem plausible.
const populatePayments = (accountRows, fundDatePayments, defaultPayment) => {
  const date = defaultPayment.date

  const recursePopulatePayments = (key) => {
    let account = accountRows[key]
    if (account.account_level === 'transactable') {
      let payment = aggregatePayments(fundDatePayments[account.id] || [],
        { ...defaultPayment })
      account[date] = { ...payment, transactable: key }
      return payment
    }
    account[date] = { ...defaultPayment }
    account.children.forEach(childKey => {
      account[date] = combinePayments(account[date], recursePopulatePayments(childKey))
    })
    return account[date]
  }

  recursePopulatePayments("root")
}

// Setting the table context follows a similar pattern to lazy registration.
// The key points being,
// -  Check if the current context is viewing the fund requested. 
// -  If not, check if payments are cache'd for the fund requested.
// -  If not, trigger a server request saga, and wait for the return via take()
// TODO: Handle no fund given, invalid range, etc.
export function* onSetAccountTreeContext() {
  yield takeEvery(actionType.SET_ACCOUNT_TREE_CONTEXT, function* setAccountTreeContext(action) {
    try {
      const contextForm = action.contextForm
      const fund = contextForm.fund
      const range = getPayPeriodRange(contextForm.startDate, contextForm.endDate)

      const accounts = yield retrieveAccounts()
      const fundPayments = yield retrieveFundPayments(fund)

      let data = deepCopy(accounts)

      console.log(accounts)
      console.time('set data context');
      range.forEach(date => {
        console.time('set data context column');
        populatePayments(data, fundPayments[date] || {},
          { ...defaultAggregates, fund, date })
        console.timeEnd('set data context column');
      })
      console.timeEnd('set data context');
      const context = { fund, range }
      yield put ({type: success(actionType.SET_ACCOUNT_TREE_CONTEXT), ...context, data, range});
    } catch (error) {
      console.log("Error: ", error.message)
      yield put ({type: failure(actionType.SET_ACCOUNT_TREE_CONTEXT), error});
    }

  })
}

export default [
  onSetContext,
]

