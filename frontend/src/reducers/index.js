import { combineReducers } from 'redux';
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
    case actionType.SET_RECORDS:
      //actionType.data
      var state = { ...action.data }
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
