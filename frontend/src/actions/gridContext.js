import { put, take, takeEvery, all, call, select, } from 'redux-saga/effects'

import { success, failure } from 'actions';
import { getPayment } from 'actions/sagas';
import * as actionType from 'actions/types';
import * as Api from 'config/Api'
import { deepCopy } from 'util/helpers'
import { getPayPeriodRange } from 'util/payPeriod'

// Grid actions will involve a few responsibilities:
// -  Mapping internal state to a format compatible with react-data-grid
// -  Handle updates, grid actions will be the only way to update backend data

const defaultAggregates = { paid: 0, budget: 0, count: 0, }

const combinePayments = (paymentA, paymentB) => {
  return { 
    ...paymentA,
    paid: paymentA.paid + paymentB.paid,
    budget: paymentA.budget + paymentB.budget,
    count: paymentA.count || 0 + paymentB.count || 0,
  }
}

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

    // TODO: Check a field in accounts (i.e. loading, loaded, etc)
    const isAccounts = yield select(state => state.records.accounts)
    if (!isAccounts) {
      yield put({type: actionType.FETCH_ACCOUNTS})
      yield take(success(actionType.FETCH_ACCOUNTS))
    }
    const payments = yield select(state => state.records.payments)
    if (!payments || !payments[fund]) {
      yield put({type: actionType.FETCH_PAYMENTS, fund})
      yield take(success(actionType.FETCH_PAYMENTS))
    }

    const accounts = yield select(state => state.records.accounts)
    const fundPayments = yield select(state => state.records.payments[fund])

    // TODO: Component to handle context for account_table
    console.log('first', accounts)
    let accountRows = deepCopy(accounts)
    range.forEach((date) => {
      console.log(date)
      console.log(fundPayments[date])
      populatePayments(accountRows, fundPayments[date] || {},
        { ...defaultAggregates, fund, date })
    })
    console.log('second', accountRows['root'].children.map(key => accountRows[key]))
    console.log('root', accountRows['root'])
  })
}

export default [
  onSetContext,
]

