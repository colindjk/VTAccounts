import { combineReducers } from 'redux'

import { success, failure } from 'actions'
import * as actionType from 'actions/types'
import { storePayment } from 'actions/api/fetch'
import React from 'react'

// token : Used for token authentication when communicating with the api.
const tokenInitialState = null;
const token = (state = tokenInitialState, action) => {
  switch(action.type) {
    case actionType.SET_TOKEN:
      return action.data;
    default:
      return state;
  }
}

// records : Results of querying the api cache'd in the store.
const initialRecordsState = {
  initialized: false,
  funds: null,
  accounts: null,
  employees: null,
  // payments = { fund: { date: { transactable: payment, ... }, ... }, ... }
  payments: {},
}

// Records should be loaded on app initilization (except salaries and payments).
const records = (state = initialRecordsState, action) => {
  switch (action.type) {
    // Initialization actions, may have to be triggered again for debugging.
    case success(actionType.INIT_RECORDS):
      console.log({ ...state, initialized: true })
      return { ...state, initialized: true }
    case success(actionType.FETCH_ACCOUNTS):
      return { ...state, accounts: action.accounts }
    case success(actionType.FETCH_FUNDS):
      return { ...state, funds: action.funds }
    case success(actionType.FETCH_EMPLOYEES):
      return { ...state, employees: action.employees }

    case success(actionType.FETCH_PAYMENTS): {
      const payments = { ...state.payments, ...action.payments }
      return { ...state, payments }
    }
    case success(actionType.PUT_PAYMENT): {
      const { payment } = action
      const { payments } = state

      storePayment(payments, payment) // FIXME: Immutability
      return { ...state, payments }
    }
    case success(actionType.PUT_SALARY): {
      const { employee } = action
      const oldEmployees = state.employees
      console.log('Updating employee', { [employee.id]: employee })
      const employees = { ...oldEmployees, [employee.id]: employee }
      return { ...state, employees }
    }
    default:
      return state
  }
}

// grid-view and accountTreeView handle the same data set, may need a refactor.
const accountTreeView = (state = { initialized: false }, action) => {
  switch (action.type) {
    // Sync update cases
    case actionType.INITIALIZE_ACCOUNT_TREE: {
      let { accounts, employees, headerRows, context, structure } = action
      return { initialized: true, accounts, employees, headerRows, context, structure }
    }
    case actionType.UPDATE_ACCOUNT_TREE: {
      let { accounts, headerRows } = action
      return { ...state, accounts, headerRows }
    } 
    case actionType.UPDATE_ACCOUNT_TREE_EMPLOYEES: {
      let { employees } = action
      return { ...state, employees }
    } 
    case actionType.SET_ACCOUNT_TREE_CONTEXT: {
      let { contextForm } = action
      return { ...state, contextForm }
    }
    case success(actionType.SET_ACCOUNT_TREE_CONTEXT): {
      let { accounts, employees, headerRows, context, contextForm, } = action
      return { ...state, accounts, employees, headerRows, context, contextForm }
    }
    case success(actionType.SET_ACCOUNT_TREE_STRUCTURE): {
      let { accounts, structure, structureForm } = action
      return { ...state, accounts, structure, structureForm }
    }
    default:
      return state
  }
}

const summaryView = (state = { funds: [], context: { range: [] } }, action) => {
  switch (action.actionType) {
    case success(actionType.FETCH_FUND_SUMMARY_PAYMENTS): {
      let { funds, range } = action
      return { ...state, funds, context: { range } }
    }
  }
}

const errors = (state = [], action) => {
  if (action.error !== undefined) {
    console.error("SAGAS ERROR: ", action.error.message)
    return [action.error, ...state]
  } else {
    return state
  }
}

const appReducer = combineReducers({
  token, records, accountTreeView, errors
})

const rootReducer = (state, action) => {
  return appReducer(state, action);
}

export default rootReducer;

/* State Structure:
 *
 *  store: {
 *    token,
 *    records: {
 *      funds,
 *      accounts,
 *      employees,
 *      payments: {
 *        fund: {
 *          date: { 
 *            transactable: { transactions },
 *            ...,
 *          }, ...,
 *        }, ...,
 *      },
 *      salaries: {
 *        employee: {
 *          date: {
 *            
 *          }
 *        }
 *      },
 *    },
 *    accountTreeView: {
 *      accounts,
 *      employees,
 *      headerRows,
 *      context: { fund, range }
 *      structure: { rows, expanded }
 *
 *      contextForm: { fund, startDate, endDate }
 *      structureForm: {
 *        reducers: { id: [ flatten XOR filter XOR default ], ... },
 *        defaultStructure: { rows, expanded }
 *      }
 *    }
 *  }
 *
 *  Clarifications:
 *  I refer to objects (initialized as {}) as hashmaps.
 *
 *  Details on the store:
 *  `payments` Essentially a multi-key hashmap
 *  key === { fund, date, transactable }
 *  returns: Aggregated transactions found in innermost hashmap.
 *
 */
