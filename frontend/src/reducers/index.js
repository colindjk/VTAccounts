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

function createAccountTableData(rootKey, data) {
  const rootNode = data[rootKey]
  var localRootNode = { ...rootNode, children: [] };
  rootNode.children.forEach((childKey) => {
    localRootNode.children.push(createAccountTableData(childKey, data))
  })
  return localRootNode;
}

// Example aggregation, used for testing purposes.
function aggregateTreeData(root, data) {
  if (root.account_level === "transactable") {
    return { total: 1 }
  }
  root.aggregates = { total: 0, }
  root.children.forEach((child) => {
    var childAggregates = aggregateTreeData(child, data)
    root.aggregates.total += childAggregates.total
  })
  return root.aggregates;
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

const records = (state = initialRecordsState, action) => {
  switch(action.type) {
    case actionType.UPDATE_TRANSACTION:
    case actionType.CREATE_TRANSACTION:
      return state
    case success(actionType.FETCH_ACCOUNTS):
      console.log(action.accounts["root"].children)
      return { ...state, accounts: action.accounts,
          rows: action.accounts["root"].children }
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
