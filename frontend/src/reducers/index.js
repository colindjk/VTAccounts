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
  return createTableRows(root, param)
}

function createTableRows(root, param) {
  var localRoot = { ...root, children: [] };
  root.children.forEach((child) => {
    localRoot.children.push(createTableRows(child, param))
  })
  return localRoot;
}

// Example aggregation, used for testing purposes.
function aggregateTreeData(root, param) {
  if (root.account_level === "transactable") {
    return { total: 1 }
  }
  root.aggregates = { total: 0, }
  root.children.forEach((child) => {
    var childAggregates = aggregateTreeData(child, param)
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
    case success(actionType.FETCH_RECORDS):
      console.time('createAccountTableData');
      var root = createAccountTableData(action.data, "param")
      console.timeEnd('createAccountTableData');

      console.time('aggregateTreeData');
      aggregateTreeData(root, "param")
      console.timeEnd('aggregateTreeData');

      return { ...state, accounts: root.children }
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
