import { put, takeEvery, all, call } from 'redux-saga/effects'

import { success, failure } from 'actions';
import * as actionType from 'actions/types';
import * as Api from 'config/Api'

// Fetches data from the server and converts the response into a dictionary
// format.
const fetchData = (url) => {
  console.time('fetch data');
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

export function* onFetchPayments() {
  yield takeEvery(actionType.FETCH_PAYMENTS, function* fetchPayments() {
    console.log("go fetch payments");
    try {
      const payments = yield call(fetchData, Api.PAYMENTS)
      yield put ({type: success(actionType.FETCH_PAYMENTS), payments});
    } catch (e) {
      yield put ({type: failure(actionType.FETCH_PAYMENTS), error: e});
    }
  });
}

export function* onFetchSalaries() {
  yield takeEvery(actionType.FETCH_SALARIES, function* fetchSalaries() {
    console.log("go fetch salaries");
    try {
      const salaries = yield call(fetchData, Api.SALARIES)
      yield put ({type: success(actionType.FETCH_SALARIES), salaries});
    } catch (e) {
      yield put ({type: failure(actionType.FETCH_SALARIES), error: e});
    }
  });
}

export function* onFetchFunds() {
  yield takeEvery(actionType.FETCH_FUNDS, function* fetchFunds() {
    console.log("go fetch funds");
    try {
      const funds = yield call(fetchData, Api.FUNDS)
      yield put ({type: success(actionType.FETCH_FUNDS), funds});
    } catch (e) {
      yield put ({type: failure(actionType.FETCH_FUNDS), error: e});
    }
  });
}

// Fetches accounts and provides a root node which will be used to quickly get
// the root nodes for the view.
export function* onFetchAccounts() {
  yield takeEvery(actionType.FETCH_ACCOUNTS, function* fetchAccounts(action) {
    console.log("go fetch accounts");
    try {
      const accounts = yield call(fetchData, Api.ACCOUNTS)
      console.log("Saga accounts", accounts)
      const rootNodes = Object.keys(accounts)
          .filter((id) => accounts[id].account_level === "account_type")
          .map((id) => parseInt(id))
      console.log("Saga", rootNodes)
      const root = { children: rootNodes }

      yield put ({type: success(actionType.FETCH_ACCOUNTS),
        accounts: { ...accounts, root }});
    } catch (e) {
      console.log(e)
      yield put ({type: failure(actionType.FETCH_ACCOUNTS), error: e});
      return;
    }
  });
}

export function* onFetchEmployees() {
  yield takeEvery(actionType.FETCH_EMPLOYEES, function* fetchEmployees(action) {
    console.log("go fetch employees");
    try {
      const employees = yield call(fetchData, Api.EMPLOYEES)
      yield put ({type: success(actionType.FETCH_EMPLOYEES), employees});
    } catch (e) {
      console.log(e)
      yield put ({type: failure(actionType.FETCH_EMPLOYEES), error: e});
      return;
    }
  });
}

export function* onCreatePayment() {

}

export function* onUpdatePayment() {

}

// notice how we now only export the rootSaga
// single entry point to start all Sagas at once
export default function* rootSaga() {
  yield all([
      onFetchAccounts(),
      onFetchPayments(),
      onFetchSalaries(),
      onFetchFunds(),
      onFetchEmployees(),

      onCreatePayment(),
      onUpdatePayment(),
  ])
}

