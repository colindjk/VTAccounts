import { put, take, takeEvery, all, call, select, } from 'redux-saga/effects'

import { success, failure } from 'actions';
import * as actionType from 'actions/types';
import { deepCopy } from 'util/helpers'
import { getPayPeriodRange } from 'util/payPeriod'

import { getPayment, retrieveFundPayments, retrieveAccounts, retrieveEmployees } from 'actions/api'
import { populateSalaries } from 'actions/grid-view/employee'

// TODO: Design the caching strategy
// [ ] - Aggregate one column - cache by account or column?
// [ ] - Figure out filters - how do we filter transactions?
// [ ] - Header rows... some are by column, but balance?
// [ ] - Balance? What do.

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
  var accountPayments = {}
  const date = defaultPayment.date

  const visitAccountPayment = (key) => {
    let account = accountRows[key]
    // Base case
    if (account.account_level === 'transactable') {
      // FIXME: This is super not kosher.
      if (!fundDatePayments || !fundDatePayments.data[account.id]) {
        account[date] = { ...defaultPayment, transactable: key }
        return { ...defaultPayment }
      }
      let payment = aggregatePayments(fundDatePayments.data[account.id].data || {},
        { ...defaultPayment })
      account[date] = { ...payment, transactable: key }
      return payment
    }

    // Else populate the childrens values and combine them into your own.
    account[date] = { ...defaultPayment }
    account.children.forEach(childKey => {
      account[date] = combinePayments(account[date], visitAccountPayment(childKey))
    })
    return account[date]
  }

  visitAccountPayment("root")
}

// Derives header rows from root
const getHeaderRows = (accounts) => {
  const { root } = accounts
  const budget = {
    ...root,
    id: 'budget',
    paymentType: 'budget',
    name: 'Total Budget',
    children: []
  }
  const paid = {
    ...root,
    id: 'paid',
    paymentType: 'paid',
    name: 'Total Paid',
    children: []
  }

  return { budget, paid }
}

// Eventually this function will be triggered automatically... not sure where / when. 
// FIXME: Header rows, etc.
function* initializeAccountTree() {
  const initialized = yield select(state => state.accountTreeView.initialized)
  // Just explode if something's not right. Assertions will soon be tests.
  console.assert(!initialized, 'initializeAccountTree: Tree already initialized')

  const accountRecords = yield retrieveAccounts()
  const employeeRecords = yield retrieveEmployees()
  const accounts = deepCopy(accountRecords)
  const employees = deepCopy(employeeRecords)

  // FIXME? The grid is getting initialized for a split second with these values...
  const context = { fund: null, range: [] }
  const structure = { rows: deepCopy(accounts['root'].children), expanded: {} }
  yield put ({type: actionType.INITIALIZE_ACCOUNT_TREE, headerRows: {}, accounts, employees, context, structure })
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

      // FIXME: Have context form be submitted synchronously, and this function
      //        can act as a response to the succesful submission of the form.
      const contextForm = action.contextForm
      const { fund } = contextForm
      const range = getPayPeriodRange(contextForm.startDate, contextForm.endDate)

      // Since we know the state is initialized, `deepCopy` to force refresh
      const accounts = yield select(state => deepCopy(state.accountTreeView.accounts))
      const fundPayments = yield retrieveFundPayments(fund)

      console.log("fundPayments", fundPayments)

      // BELOW --------------------------------------- SLICE INTO CACHE

      // Populate Payments
      //console.time('set data context');
      range.forEach(date => {
        //console.time('set data context column');
        populatePayments(accounts, fundPayments.data[date],
          { ...defaultAggregates, fund, date })
        //console.timeEnd('set data context column');
      })

      // Populate Salaries => give the entire range? -> previous salaries etc.
      const employeeRecords = yield retrieveEmployees()
      // FIXME: Don't pass accounts here, let selectors rename the given accounts
      //        Also, selectors will replace the employee (int) field with an employee (object)
      const employees = populateSalaries(employeeRecords, range, accounts)
      console.log("EMPLOYEEZUS", employees)

      // TODO: ADD POPULATE HEADER ROWS FUNCTION HERE
      const headerRows = getHeaderRows(accounts)

      //console.timeEnd('set data context');
      const context = { fund, range }

      // ABOVE --------------------------------------- SLICE INTO CACHE


      // FIXME: GET THIS OUT OF HERE
      //console.log(accounts)
      yield put ({type: success(actionType.SET_ACCOUNT_TREE_CONTEXT),
          accounts, employees, headerRows, context, contextForm, });
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
    console.log("onPutPaymentSuccess", action)
    const { payment } = action
    const { fund, date, /*transactable*/ } = payment
    const accounts = yield select(state => deepCopy(state.accountTreeView.accounts))
    const fundPayments = yield retrieveFundPayments(fund)

    populatePayments(accounts, fundPayments.data[date],
      { ...defaultAggregates, fund, date })

    // Update the header rows!
    const headerRows = getHeaderRows(accounts)
    yield put({type: actionType.UPDATE_ACCOUNT_TREE, accounts, headerRows})
  })
}

export function* onPutSalarySuccess() {
  yield takeEvery(success(actionType.PUT_SALARY), function* putPaymentSuccess(action) {
    const { employee } = action
    const oldEmployees = yield select(state => deepCopy(state.accountTreeView.employees))
    const contextForm = yield select(state => deepCopy(state.accountTreeView.contextForm))
    const range = getPayPeriodRange(contextForm.startDate, contextForm.endDate)

    const employees = { ...oldEmployees, ...populateSalaries({ [employee.id]: employee }, range) }

    yield put({type: actionType.UPDATE_ACCOUNT_TREE_EMPLOYEES, employees})
  })
}

export default [
  onSetAccountTreeContext,
  onSetAccountTreeStructure,
  onPutPaymentSuccess,
  onPutSalarySuccess,
]

