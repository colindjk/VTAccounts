import { put, take, takeEvery, all, call, select } from 'redux-saga/effects'

import { success, failure } from 'actions'
import { authenticateHeaders } from 'actions/api'
import * as actionType from 'actions/types'
import * as Api from 'config/Api'
import { param } from 'util/helpers'

// Helper function for storing a payment. See `state structure` in reducers.
export const storePayment = (payments, payment) => {
  // FIXME: Find new solution for the all fund
  const fund = payment.fund ? payment.fund : "All"
  const { date, transactable, id, updated_on } = payment

  console.assert(payments.updated_on !== undefined)
  if (!payments.data[fund]) {
    payments.data[fund] = { data: {}, updated_on }
  }
  if (!payments.data[fund].data[date]) {
    payments.data[fund].data[date] = { data: {}, updated_on }
  }
  if (!payments.data[fund].data[date].data[transactable]) {
    payments.data[fund].data[date].data[transactable] = { data: {}, updated_on }
  }

  payments.data[fund].data[date].data[transactable].data[id] = payment;

  if (payments.data[fund].data[date].data[transactable].updated_on < updated_on) {
    payments.data[fund].data[date].data[transactable].updated_on = updated_on
  }
  if (payments.data[fund].data[date].updated_on < updated_on) {
    payments.data[fund].data[date].updated_on = updated_on
  }
  if (payments.data[fund].updated_on < updated_on) {
    payments.data[fund].updated_on = updated_on
  }
  if (payments.updated_on < updated_on) {
    payments.updated_on = updated_on
  }
}

export const getPayment = (payments, { fund, date, transactable }) => {
  const defaultPayments = { data: {}, updated_on: 0 }

  if (payments.data[fund] !== undefined) {
    if (payments.data[fund].data[date] !== undefined) {
      return payments.data[fund].data[date].data[transactable] || defaultPayments
    }
  }
  return defaultPayments
}

// Made the code here verbose due to the fact that javascript allows 'undefined'
// to be used as a key in a hashmap. The "All" fund uses that functionality,
// so the code here must be this way.
// FIXME: Make it so any combination of fund, date, transactable can be given
export const getTimestamp = (payments, { fund, date, transactable }) => {
  if (payments.data[fund] !== undefined)
  {
    if (date === undefined)
    {
      return payments.data[fund].updated_on
    }
    if (payments.data[fund].data[date] !== undefined)
    {
      if (transactable === undefined)
      {
        return payments.data[fund].data[date].updated_on
      }
      if (payments.data[fund].data[date].data[transactable] !== undefined)
      {
        return payments.data[fund].data[date].data[transactable].updated_on
      }
    }
  }
  // No transactions were found, none have been created since the beginning of time. 
  return 0
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
  return fetch(url, {
    headers: authenticateHeaders({
      'Content-Type': 'application/json'
    })
  }).then((response) => {
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
  // FIXME: Find new solution for the all fund
  // the "All" fund does not mean we're getting all payments, just all aggregations...
  const url = fund !== "All" ? Api.PAYMENTS /* + param({fund})*/ : Api.PAYMENTS_SUMMARY

  console.time('fetch payments');
  return fetch(url, {
      headers: authenticateHeaders({
        'Content-Type': 'application/json'
      })
  }).then((response) => {
    console.timeEnd('fetch payments');
    return response.json()
  })
}

// Provide an optional employee argument query parameter
export const querySalaries = (employee) => {
  var url = Api.SALARIES;
  if (employee) { url = url + param({employee}) }

  console.time('fetch salaries');
  return fetch(url, {
      headers: authenticateHeaders({
        'Content-Type': 'application/json'
      })
  }).then((response) => {
    console.timeEnd('fetch salaries');
    return response.json()
  })
}

export function* onFetchPayments() {
  yield takeEvery(actionType.FETCH_PAYMENTS, function* fetchPayments(action) {
    console.log("go fetch payments");
    try {
      // FIXME: be able to grab specific payments again
      const paymentsArray = yield call(queryPayments)
      var payments = { updated_on: 0, data: {} }
      for (var i = 0; i < paymentsArray.length; i++) {
        storePayment(payments, paymentsArray[i])
      }
      console.log("FETCH PAYMENTS", payments);
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
