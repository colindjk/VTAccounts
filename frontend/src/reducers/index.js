import { combineReducers } from 'redux'

import { success, failure } from 'actions'
import * as actionType from 'actions/types'
import { storePayment } from 'actions/api/fetch'
import React from 'react'

// FIXME: Find a better solution?
import { deepCopy } from 'util/helpers'

// token : Used for token authentication when communicating with the api.
// The token will be based on the currently logged in user. 
const initialUserState = {
  username: null,
  token: null,
  settings: null,
  isAuthenticated: false,
  loading: false
}

const user = (state = initialUserState, action) => {
  switch(action.type) {
    case actionType.AUTHENTICATION:
      return { ...state, loading: true }
    case success(actionType.AUTHENTICATION):
      let { username, token, isAuthenticated, settings } = action
      return { username, token, isAuthenticated, settings, loading: false }
    default:
      return state;
  }
}

// records : Results of querying the api cache'd in the store.
// `updated_on`: server defined value for when value was last updated.
const initialRecordsState = {
  initialized: false,
  funds: null,
  accounts: null,
  employees: null,
  // payments = { fund: { date: { transactable: payment, ... }, ... }, ... }
  payments: { data: {}, updated_on: 0 },
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
      const payments = state.payments

      storePayment(payments, payment) // FIXME: Immutability
      if (payment.associated_transactions) {
        payment.associated_transactions.forEach(associated => storePayment(payments, associated))
      }
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

// Stored by grid.id, which is a hardcoded value unique for each dataGrid.
//  settings: {
//    grids: {
//      accountTree: { (user given) name, filter, flatten, gridState: { expanded, rows } },
//      employeeSalary: { (user given) name, filter, },
//      ..., 
//    }
//  }
const uiInitialState = {
  context: null,
  settings: {
    loading: false,
    data: null,
  },
}

// Context gets continuously updated. Multiple different forms submit to
// context with the following results:
// -> New field gets added to existing context
// -> Current field gets updated to match particular "action.context" field value
// -> Field not contained by "action.context" will remain in the context
const ui = (state = uiInitialState, action) => {
  switch (action.type) {
    case actionType.SET_UI_CONTEXT: {
      let context = { ...state.context, ...action.context }
      console.log("REDUCER: ", context)
      return { ...state, context }
    }
  }
  return state
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

const errors = (state = [], action) => {
  if (action.error !== undefined) {
    console.error("SAGAS ERROR: ", action.error.message, action)
    return [action.error, ...state]
  } else {
    return state
  }
}

const appReducer = combineReducers({
  user, records, ui, errors
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
 *    dataGridView: {
 *      grids: { gridID: gridConfig, ... },
 *       -> gridConfig: {
 *            structure: { filter, flatten,
   *            filterField, flattenField -> Determined by a given field value
 *            }
 *          }
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
