import { put, takeEvery, call, select } from 'redux-saga/effects'

import { get, success, failure } from 'actions/helpers'
import * as Api from 'actions/types/api'
import * as ApiUrl from 'config/Api'
import { authenticateHeaders, handleErrors } from 'sagas/records'
import param from 'util/param'

// Fetches data from the server and converts the response into a dictionary
// format.
export const queryData = (url, params) => {
  const queryUrl = params ? url + param(params) : url
  return fetch(queryUrl, {
    headers: authenticateHeaders({
      'Content-Type': 'application/json'
    })
  }).then(handleErrors)
    .then(res => res.json())
    .then(data => {
      let obj = {}
      for (var i = 0; i < data.length; i++) { obj[data[i].id] = data[i] }
      return obj
    })
}

export const queryDataaa = (url, params) => {
  const queryUrl = params ? url + param(params) : url
  return fetch(queryUrl, {
    headers: authenticateHeaders({
      'Content-Type': 'application/json'
    })
  }).then(res => res.json())
    .then(data => {
      let obj = {}
      for (var i = 0; i < data.length; i++) { obj[data[i].id] = data[i] }
      return obj
    })
}

export function* onFetchFunds() {
  yield takeEvery(get(Api.FUND), function* fetchFunds(action) {
    try {
      const data = yield call(queryData, ApiUrl.FUNDS)
      yield put({type: success(get(Api.FUND)), data})
    } catch (error) {
      yield put({type: failure(get(Api.FUND)), error})
    }
  })
}

export function* onFetchAccounts() {
  yield takeEvery(get(Api.ACCOUNT), function* fetchAccounts(action) {
    try {
      const data = yield call(queryData, ApiUrl.ACCOUNTS)
      yield put({type: success(get(Api.ACCOUNT)), data})
    } catch (error) {
      yield put({type: failure(get(Api.ACCOUNT)), error})
    }
  })
}

export function* onFetchEmployees() {
  yield takeEvery(get(Api.EMPLOYEE), function* fetchEmployees(action) {
    try {
      const data = yield call(queryData, ApiUrl.EMPLOYEES)
      yield put({type: success(get(Api.EMPLOYEE)), data})
    } catch (error) {
      yield put({type: failure(get(Api.EMPLOYEE)), error})
    }
  })
}

export function* onFetchPayments() {
  yield takeEvery(get(Api.PAYMENT), function* onFetchPayments(action) {
    try {
      const data = yield call(queryData, ApiUrl.PAYMENTS)
      yield put({type: success(get(Api.PAYMENT)), data})
    } catch (error) {
      yield put({type: failure(get(Api.PAYMENT)), error})
    }
  })
}

export function* onFetchSalaries() {
  yield takeEvery(get(Api.SALARY), function* fetchSalaries(action) {
    try {
      const data = yield call(queryData, ApiUrl.SALARIES)
      yield put({type: success(get(Api.SALARY)), data})
    } catch (error) {
      yield put({type: failure(get(Api.SALARY)), error})
    }
  })
}

export function* onFetchFringes() {
  yield takeEvery(get(Api.FRINGE), function* fetchFringes(action) {
    try {
      const data = yield call(queryData, ApiUrl.FRINGES)
      yield put({type: success(get(Api.FRINGE)), data})
    } catch (error) {
      yield put({type: failure(get(Api.FRINGE)), error})
    }
  })
}

export function* onFetchIndirects() {
  yield takeEvery(get(Api.INDIRECT), function* fetchIndirects(action) {
    try {
      const data = yield call(queryData, ApiUrl.INDIRECTS)
      yield put({type: success(get(Api.INDIRECT)), data})
    } catch (error) {
      yield put({type: failure(get(Api.INDIRECT)), error})
    }
  })
}

export function* onFetchTransactionFiles() {
  yield takeEvery(get(Api.TRANSACTION_FILE),
      function* onFetchTransactionFile(action) {
    try {
      const data = yield call(queryData, ApiUrl.TRANSACTION_FILES)
      yield put({type: success(get(Api.TRANSACTION_FILE)), data})
    } catch (error) {
      yield put({type: failure(get(Api.TRANSACTION_FILE)), error})
    }
  })
}

export function* onFetchSalaryFiles() {
  yield takeEvery(get(Api.SALARY_FILE), function* fetchSalaryFiles(action) {
    try {
      const data = yield call(queryData, ApiUrl.SALARY_FILES)
      yield put({type: success(get(Api.SALARY_FILE)), data})
    } catch (error) {
      yield put({type: failure(get(Api.SALARY_FILE)), error})
    }
  })
}

export function* onFetchTransactionMetadata() {
  yield takeEvery(get(Api.TRANSACTION_METADATA),
      function* fetchTransactionMetadata(action) {
    try {
      const { fileKey } = action

      const initialized = yield select(state => 
        state.records[Api.TRANSACTION_METADATA].files[fileKey])

      // Else we load the data.
      const data = yield call(queryData, ApiUrl.TRANSACTION_METADATA,
        fileKey ? { source_file: fileKey } : {})

      yield put({ ...action,
        type: success(get(Api.TRANSACTION_METADATA)), data, fileKey })
    } catch (error) {
      yield put({type: failure(get(Api.TRANSACTION_METADATA)), error})
    }
  })
}

// Export all sagas as default for every module in sagas.
export default [
  onFetchFunds,
  onFetchFringes,
  onFetchAccounts,
  onFetchPayments,
  onFetchSalaries,
  onFetchEmployees,
  onFetchIndirects,
  onFetchSalaryFiles,
  onFetchTransactionFiles,
  onFetchTransactionMetadata,
]

