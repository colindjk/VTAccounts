import { put, take, takeEvery, all, select, call } from 'redux-saga/effects'

import { get, put as requestPut, success, failure } from 'actions/helpers'
import * as actionType from 'actions/types'
import * as Settings from 'actions/types/settings'
import * as Api from 'actions/types/api'
import * as ApiUrl from 'config/Api'
// Used for testing
import { FundPaymentSelector, AccountBalanceSelector } from 'selectors/date-records'
import { getPayPeriodRange } from 'util/date'

import getSagas from 'sagas/records/get'
import putSagas, { putData } from 'sagas/records/put'
import removeSagas from 'sagas/records/remove'

import store from 'store'

export const handleErrors = res => {
  if (!res.ok) { throw Error(res.statusText) } else { return res }
}

export const authenticateHeaders = (objectHeaders = {}) => {
  let { isAuthenticated, token } = store.getState().user
  if (isAuthenticated && token) {
    objectHeaders = { ...objectHeaders, Authorization: `Token ${token}` }
  }
  return new Headers({ ...objectHeaders })
}

// Use `takeEvery` in case of failed login attempts.
export function* onLogin() {
  yield takeEvery(Api.LOGIN, function* login(action) {
    try {
      const { username, password } = action
      const { token } = yield call(putData, ApiUrl.LOGIN, { username, password })
      const isAuthenticated = !!token
      yield put({type: success(Api.LOGIN), username, token, isAuthenticated})
    } catch (error) {
      yield put({type: failure(Api.LOGIN)})
    }
  })
}

// One time function to initialize the app.
// TODO: Login page with redirect
// TODO: Implement generic data grid.
// TODO: Connect to component, 
export function* onInitApp() {
  yield take(actionType.INIT_APP)
  try {
    yield put({type: Settings.INIT_STATE})
    take(success(Settings.INIT_STATE))

    yield put({type: get(Api.ACCOUNT)})
    yield put({type: get(Api.FUND)})
    yield put({type: get(Api.EMPLOYEE)})
    yield put({type: get(Api.PAYMENT)})
    yield put({type: get(Api.SALARY)})
    yield put({type: get(Api.FRINGE)})
    yield put({type: get(Api.INDIRECT)})
    yield put({type: get(Api.SALARY_FILE)})
    yield put({type: get(Api.TRANSACTION_FILE)})

    yield all([
      take(success(get(Api.ACCOUNT))),
      take(success(get(Api.FUND))),
      take(success(get(Api.EMPLOYEE))),
      take(success(get(Api.PAYMENT))),
      take(success(get(Api.SALARY))),
      take(success(get(Api.FRINGE))),
      take(success(get(Api.INDIRECT))),
      take(success(get(Api.SALARY_FILE))),
      take(success(get(Api.TRANSACTION_FILE))),
    ])

    yield put({type: success(actionType.INIT_APP)})
  } catch (error) {
    yield put({type: failure(actionType.INIT_APP), error})
  }
}

// This is old code that I am keeping here in case someone wants to run tests
// on data requested from the server. It was very helpful in making sure that
// selectors were updating properly. 
export function* testInitApp() {
  //yield takeEvery(success(actionType.INIT_APP), function* initApp(action) {
  yield takeEvery("DEBUG_SAGA", function* initApp(action) {
    try {
      let state = yield select(state => state)

      const paymentSelector = AccountBalanceSelector()

      getPayPeriodRange("2017-07-09", "2017-08-09").forEach(date => {
        console.log(paymentSelector.selectDate(state, 3, date))
      })
      //console.log(cachedSelector.recomputations())
      const payment = { id: 13, fund: 1, date: "2017-06-25", transactable: 4258,
        paid: 2000.0, budget: 0.0 }
      yield put({type: requestPut(Api.PAYMENT), data: payment})
      yield take(success(requestPut(Api.PAYMENT)))

      state = yield select(state => state)
      getPayPeriodRange("2017-07-09", "2017-07-09").forEach(date => {
        console.log(paymentSelector.selectDate(state, 1, date))
        console.log(paymentSelector.selectDate(state, 2, date))
        console.log(paymentSelector.selectDate(state, 3, date))
      })

    } catch (error) {
      yield put({type: failure(actionType.INIT_APP), error})
    }
  })
}

export default [onLogin, onInitApp, testInitApp]
  .concat(getSagas)
  .concat(putSagas)
  .concat(removeSagas)

