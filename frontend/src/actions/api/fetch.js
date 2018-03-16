import { put, take, takeEvery, all, call, select } from 'redux-saga/effects'

import { success, failure } from 'actions'
import * as actionType from 'actions/types'
import * as Api from 'config/Api'
import { param } from 'util/helpers'

// Helper function for storing a payment. See `state structure` in reducers.
export const storePayment = (payments, payment) => {
  if (!payments[payment.fund]) {
    payments[payment.fund] = {}
  }
  if (!payments[payment.fund][payment.date]) {
    payments[payment.fund][payment.date] = {}
  }
  if (!payments[payment.fund][payment.date][payment.transactable]) {
    payments[payment.fund][payment.date][payment.transactable] = {} // <- not array
  }
  payments[payment.fund][payment.date][payment.transactable][payment.id] = payment;
}

export const getPayment = (payments, { fund, date, transactable }) => {
  if (payments[fund] !== undefined) {
    if (payments[fund][date] !== undefined) {
      return payments[fund][date][transactable] || {}
    }
  }
  return {}
}

// Helper function for storing a salary
const storeSalary = (salaries, salary) => {
  if (!salary[salary.employee]) { salaries[salary.employee] = {} }
  salary[salary.employee][salary.date] = salary
}

// Fetches data from the server and converts the response into a dictionary
// format.
export const queryData = (url, params) => {
  console.time('fetch data');
  const queryUrl = params ? url + param(params) : url
  return fetch(url).then((response) => {
    console.timeEnd('fetch data');
    return response.json()
  }).then((json_array) => {
    var data = {}
    for (var i = 0; i < json_array.length; i++)
      data[parseInt(json_array[i].id)] = json_array[i]
    return data
  })
}

// Provide an optional fund argument query parameter
const queryPayments = (fund) => {
  var url = Api.PAYMENTS;
  if (fund) { url = url + param({fund}) }
  //if (fund) { url = fund ? url + param({fund}) : url }

  console.time('fetch payments');
  return fetch(url).then((response) => {
    console.timeEnd('fetch payments');
    return response.json()
  })
}

// Provide an optional employee argument query parameter
export const querySalaries = (employee) => {
  var url = Api.SALARIES;
  if (employee) { url = url + param({employee}) }

  console.time('fetch salaries');
  return fetch(url).then((response) => {
    console.timeEnd('fetch salaries');
    return response.json()
  })
}

export function* onFetchPayments() {
  yield takeEvery(actionType.FETCH_PAYMENTS, function* fetchPayments(action) {
    console.log("go fetch payments");
    try {
      const paymentsArray = yield call(queryPayments, action.fund)
      var payments = {}
      for (var i = 0; i < paymentsArray.length; i++) {
        storePayment(payments, paymentsArray[i])
      }
      console.log(payments);
      yield put ({type: success(actionType.FETCH_PAYMENTS), payments});
    } catch (error) {
      yield put ({type: failure(actionType.FETCH_PAYMENTS), error});
    }
  });
}

export function* onFetchSalaries() {
  yield takeEvery(actionType.FETCH_SALARIES, function* fetchSalaries(action) {
    console.log("go fetch salaries");
    try {
      const salaries = yield call(querySalaries, Api.SALARIES)
      yield put ({type: success(actionType.FETCH_SALARIES), salaries});
    } catch (error) {
      yield put ({type: failure(actionType.FETCH_SALARIES), error});
    }
  });
}

export function* onFetchFunds() {
  yield takeEvery(actionType.FETCH_FUNDS, function* fetchFunds(action) {
    console.log("go fetch funds");
    try {
      const funds = yield call(queryData, Api.FUNDS)
      yield put ({type: success(actionType.FETCH_FUNDS), funds});
    } catch (error) {
      yield put ({type: failure(actionType.FETCH_FUNDS), error});
    }
  });
}

// Fetches accounts and provides a root node which will be used to quickly get
// the root nodes for the view.
export function* onFetchAccounts() {
  yield takeEvery(actionType.FETCH_ACCOUNTS, function* fetchAccounts() {
    console.log("go fetch accounts");
    try {
      const accounts = yield call(queryData, Api.ACCOUNTS)
      const rootNodes = Object.keys(accounts)
          .filter((id) => accounts[id].account_level === "account_type")
          .map((id) => parseInt(id))
      const root = { children: rootNodes }

      yield put ({type: success(actionType.FETCH_ACCOUNTS),
        accounts: { ...accounts, root }});
    } catch (error) {
      yield put ({type: failure(actionType.FETCH_ACCOUNTS), error});
    }
  });
}

export function* onFetchEmployees() {
  yield takeEvery(actionType.FETCH_EMPLOYEES, function* fetchEmployees(action) {
    console.log("go fetch employees");
    try {
      const employees = yield call(queryData, Api.EMPLOYEES)
      yield put ({type: success(actionType.FETCH_EMPLOYEES), employees});
    } catch (error) {
      yield put ({type: failure(actionType.FETCH_EMPLOYEES), error});
    }
  });
}

export default [
    onFetchAccounts,
    onFetchPayments,
    onFetchSalaries,
    onFetchFunds,
    onFetchEmployees,
]
