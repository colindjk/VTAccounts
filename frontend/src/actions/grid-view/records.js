import { put, take, takeEvery, all, call, select, } from 'redux-saga/effects'

import { success, failure } from 'actions';
import { getPayment } from 'actions/sagas';
import * as actionType from 'actions/types';
import { deepCopy } from 'util/helpers'
import { getPayPeriodRange } from 'util/payPeriod'

import { getFundPayments, getAccounts } from 'actions/sagas'

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
  for (let i = 0; i < transactablePayments.length; i++) {
    aggregate = combinePayments(transactablePayments[i], { ...aggregate })
  }
  aggregate.count = transactablePayments.length
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
export function* onSetContext() {
  yield takeEvery(actionType.SET_FUND_CONTEXT, function* setContext(action) {
    const context = action.context
    const fund = context.fund
    const range = getPayPeriodRange(context.startDate, context.endDate)

    const accounts = yield getAccounts()
    const fundPayments = yield getFundPayments(fund)

    let data = deepCopy(accounts)
    range.forEach((date) => {
      populatePayments(data, fundPayments[date] || {},
        { ...defaultAggregates, fund, date })
    })
    // TODO: Use a selector to dynamically add range to columns (in component?)
    yield put ({type: success(actionType.SET_FUND_CONTEXT), ...context, data, range});
  })
}

export default [
  onSetContext,
]

