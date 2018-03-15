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
  // payments = fund: { date: { transactable: payment, ... }, ... }
  payments: {},
  // salaries = { date: { employee:     salary, ... }, ... }
  salaries: {},
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

      storePayment(payments, payment)
      return { ...state, payments }
    }
    case failure("*"):
      console.log(action.error)
    default:
      return state
  }
}

const accountTreeView = (state = { initialized: false }, action) => {
  switch (action.type) {
    // Sync update cases
    case actionType.INITIALIZE_ACCOUNT_TREE: {
      let { accounts, employees, context, structure } = action
      return { initialized: true, accounts, employees, context, structure }
    }
    case actionType.UPDATE_ACCOUNT_TREE: {
      let { accounts } = action
      return { ...state, accounts }
    } 
    case actionType.SET_ACCOUNT_TREE_CONTEXT: {
      let { contextForm } = action
      return { ...state, contextForm }
    }
    case success(actionType.SET_ACCOUNT_TREE_CONTEXT): {
      let { accounts, employees, context, contextForm } = action
      return { ...state, accounts, employees, context, contextForm }
    }
    case success(actionType.SET_ACCOUNT_TREE_STRUCTURE): {
      let { accounts, structure, structureForm } = action
      return { ...state, accounts, structure, structureForm }
    }
    default:
      return state
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
