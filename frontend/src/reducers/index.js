import { combineReducers } from 'redux'

import { success, failure } from 'actions'
import * as actionType from 'actions/types'
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
  funds: null,
  accounts: null,
  employees: null,
  rangeData: {
    // payments = fund: { date: { transactable: payment, ... }, ... }
    payments: {},
    // salaries = { date: { employee:     salary, ... }, ... }
    salaries: {},
  },
}

const initialRecordState = {
  data: {},
  error: null,
  loading: false,
  lastFetched: 0,
}

const records = (state = initialRecordsState, action) => {
  switch(action.type) {
    case actionType.FETCH_ACCOUNTS:
      return { ...state, accounts: { ...initialRecordState, loading: true  } }
    /* TODO: add 'loading' phase in reducer */
    case success(actionType.PUT_PAYMENT):
      return state
    case success(actionType.FETCH_ACCOUNTS):
      return { ...state, accounts: action.accounts }
    case success(actionType.FETCH_FUNDS):
      return { ...state, accounts: action.funds }
    case success(actionType.FETCH_EMPLOYEES):
      return { ...state, accounts: action.funds }
    case success(actionType.FETCH_PAYMENTS):
      return { ...state, payments: action.payments }
    case failure("*"):
      console.log(action.error)
    default:
      return state
  }
}

// MOVE THIS 
const tempFunction = (range) => {
  let columns = [
    {
      key: 'name',
      name: 'Name',
      locked: true,
      width: 500
    },
    {
      key: 'code',
      name: 'Code',
      locked: true,
    },
  ];
  return columns.concat(range.map(date => {
    return {
      key: date,
      name: date,
      locked: false,
      editable: true,
      formatter: ({ value }) => <div>{value.paid}</div>,
      width: 100
    } },
  ))

}

const view = (state = {}, action) => {
  switch(action.type) {
    case success(actionType.SET_FUND_CONTEXT):
      console.log(action)
      return { ...action.context, rows: action.data['root'].children,
        data: action.data, columns: tempFunction(action.range) }
    default:
      return state
  }
}

const appReducer = combineReducers({
  token, records, view,
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
 *    view: {
 *      fund, 
 *      data: {
 *        account: { account_type, ...fields, date: { ... }, date: { ... } }
 *      },
 *      initialColumns: [ { key, name, ... }, ... ]
 *      range: [startDate, endDate], -> Mapped & appended to initialColumns
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
