import { put, take, takeEvery, all, call, select, } from 'redux-saga/effects'

import { success, failure } from 'actions';
import * as actionType from 'actions/types';
import { deepCopy } from 'util/helpers'
import { getPayPeriodRange } from 'util/payPeriod'

import { getPayment, retrieveFundPayments, retrieveAccounts, retrieveEmployees } from 'actions/api'
import { populateSalaries } from 'actions/grid-view/employee'

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

// To be used on the array found matching the fund, date, and transactable
const aggregatePayments = (transactablePayments, defaultPayment) => {
  let aggregate = { ...defaultPayment }
  for (var key in transactablePayments) {
    aggregate = combinePayments(transactablePayments[key], { ...aggregate })
  }
  aggregate.count = Object.keys(transactablePayments).length
  return aggregate
}

// TODO: Make the `view` state subscribe to `form` and `records`.
//        This way, the form / records state will have no knowledge of the view state.
//        The logic will be completely separated!

// We use the `defaultPayment` to figure out which date / fund to access.
// I'd like to find a way to make this more functional (no side effects) but
// that just doesn't seem plausible.
const populatePayments = (accountRows, fundDatePayments, defaultPayment) => {
  const date = defaultPayment.date

  const visitAccountPayment = (key) => {
    let account = accountRows[key]
    if (account.account_level === 'transactable') {
      let payment = aggregatePayments(fundDatePayments[account.id] || [],
        { ...defaultPayment })
      account[date] = { ...payment, transactable: key }
      return payment
    }
    account[date] = { ...defaultPayment }
    account.children.forEach(childKey => {
      account[date] = combinePayments(account[date], visitAccountPayment(childKey))
    })
    return account[date]
  }

  visitAccountPayment("root")
}

// Eventually this function will be triggered automatically... not sure where / when. 
function* initializeAccountTree() {
  const initialized = yield select(state => state.accountTreeView.initialized)
  // Just explode if something's not right. Assertions will soon be tests.
  console.assert(!initialized, 'initializeAccountTree: Tree already initialized')

  const accounts = yield retrieveAccounts()
  var accountTreeAccounts = deepCopy(accounts)
  // TODO: contextChildren, set these with the recursePopulatePayments eventually!!!
  const context = { fund: null, range: [] }
  const structure = { rows: deepCopy(accounts['root'].children), expanded: {} }
  yield put ({type: actionType.INITIALIZE_ACCOUNT_TREE, accounts: accountTreeAccounts, context, structure })
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
      let initialized = yield select(state => state.accountTreeView.initialized)
      if (!initialized) { yield initializeAccountTree() }

      const contextForm = action.contextForm
      const { fund } = contextForm
      const range = getPayPeriodRange(contextForm.startDate, contextForm.endDate)

      // Since we know the state is initialized, `deepCopy` to force refresh
      const accounts = yield select(state => deepCopy(state.accountTreeView.accounts))
      const fundPayments = yield retrieveFundPayments(fund)

      // Populate Payments
      console.time('set data context');
      range.forEach(date => {
        console.time('set data context column');
        populatePayments(accounts, fundPayments[date] || {},
          { ...defaultAggregates, fund, date })
        console.timeEnd('set data context column');
      })

      // Populate Salaries => give the entire range? -> previous salaries etc.
      const employeeRecords = yield retrieveEmployees()
      const employees = populateSalaries(employeeRecords, range, accounts)

      // TODO: ADD POPULATE HEADER ROWS FUNCTION HERE

      console.timeEnd('set data context');
      const context = { fund, range }
      yield put ({type: success(actionType.SET_ACCOUNT_TREE_CONTEXT), accounts, context, contextForm });
    } catch (error) {
      yield put ({type: failure(actionType.SET_ACCOUNT_TREE_CONTEXT), error});
    }

  })
}

export function* onSetAccountTreeStructure() {
  yield takeEvery(actionType.SET_ACCOUNT_TREE_STRUCTURE, function* setAccountTreeContext(action) {
    try {
      let initialized = yield select(state => state.accountTreeView.initialized)
      if (!initialized) { yield initializeAccountTree() }

      const accounts = yield select(state => state.accountTreeView.accounts)
      const { structureForm } = action

      yield put ({type: success(actionType.SET_ACCOUNT_TREE_STRUCTURE),
                  accounts, structureForm, /* structure, */ });
    } catch (error) {
      yield put ({type: failure(actionType.SET_ACCOUNT_TREE_STRUCTURE), error});
    }
  })
}

export function* onPutPaymentSuccess() {
  yield takeEvery(success(actionType.PUT_PAYMENT), function* putPaymentSuccess(action) {
    const { payment } = action
    const { fund, date, /*transactable*/ } = payment
    const accounts = yield select(state => deepCopy(state.accountTreeView.accounts))
    const fundPayments = yield retrieveFundPayments(fund)

    populatePayments(accounts, fundPayments[date] || {},
      { ...defaultAggregates, fund, date })
    yield put({type: actionType.UPDATE_ACCOUNT_TREE, accounts})
  })
}

export default [
  onSetAccountTreeContext,
  onSetAccountTreeStructure,
  onPutPaymentSuccess,
]

