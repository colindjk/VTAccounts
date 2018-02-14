import { combineReducers } from 'redux';

import { success, failure } from 'actions';
import * as actionType from 'actions/types';

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

// Occurs every time a different fund is viewed.
function createAccountTableData(children, param) {
  var root = { children: children }
  return createTableRows(root, param).children
}

function createTableRows(root, param) {
  var localRoot = { ...root, children: [] };
  root.children.forEach((child) => {
    if (child.account_level != "transactable") {
      localRoot.children.push(createTableRows(child, param))
    }
  })
  return localRoot;
}

// records : Results of querying the api cache'd in the store.
const initialRecordsState = {
  funds: null,
  accounts: null,
  rangeData: {
    // payments = { date: { transactable: payment, ... }, ... }
    payments: {},
    // salaries = { date: { employee:     salary, ... }, ... }
    salaries: {},
  },
}

const records = (state = initialRecordsState, action) => {
  switch(action.type) {
    case actionType.UPDATE_TRANSACTION:
    case actionType.CREATE_TRANSACTION:
      return state
    case success(actionType.FETCH_RECORDS):
      var accounts = createAccountTableData(action.data, "param")
      console.log("Done: ", accounts)
      console.log("Done: ", state)
      return { ...state, accounts }
    default:
      return state
  }
}

const appReducer = combineReducers({
  token, records,
})

const rootReducer = (state, action) => {
  return appReducer(state, action);
}

export default rootReducer;

/* State Structure:
 *
 *  store: {
 *    token,
 *    appData: {
 *      funds,
 *      accounts,
 *      employees,
 *      rangeData: {
 *        transactions: {
 *          ...,
 *          fundId: {
 *            range: [startDate, endDate],
 *            payments: {
 *              ...,
 *              date: { 
 *                
 *              }
 *              ...
 *            }
 *          },
 *          ...
 *        },
 *        salaries: {
 *          
 *        }
 *      }
 *    }
 *  }
 */
