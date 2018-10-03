// This module will handle all sagas related to directly calling on the backend
// server. 

// This file will then have async helper functions which will be used in other
// actions as a sort of interface to the backend api.

// Here is how the function naming scheme will work:
//
// Get data
// fetch*     -> Always calls to server, can update data etc.
// retrieve*  -> Checks cache, if missing / dirty, triggers a fetch.
// get*       -> Accesses state and returns found value or undefined / default.
//
// Set data
// put*       -> Using unique information, attempts to find a record matching
//                the given data. IF id is found -> update*, ELSE -> create*
// create*    -> Create a value
// update*    -> So long as an id is included, all other fields included will
//                overwrite those found in the server.

// NOTE: Always use retrieve* (or fetch) for `records`, this way we can easily
// add logic to verify that all records are up-to-date on retrieval.

import { put, take, takeEvery, all, call, select } from 'redux-saga/effects'

import { success, failure } from 'actions'
import * as actionType from 'actions/types'
import store from 'store'

import FetchSagas, * as fetchRecords from './fetch'
import PutSagas, * as putRecords from './put'
import UserSagas from './user'

export const authenticateHeaders = (objectHeaders = {}) => {
  let { isAuthenticated, token } = store.getState().user
  if (isAuthenticated && token) {
    objectHeaders = { ...objectHeaders, Authorization: `Token ${token}` }
  }
  return new Headers({ ...objectHeaders })
}

// Helper function to asynchronously retrieve payments if needed.
export function* retrieveFundPayments(fund) {
  const payments = yield select(state => state.records.payments)
  console.log('RETRIEVE PAYMENTS', payments)
  if (!payments || !payments.data[fund]) {
    yield put({type: actionType.FETCH_PAYMENTS, fund})
    yield take(success(actionType.FETCH_PAYMENTS))
    return yield select(state => state.records.payments.data[fund])
  } else {
    return payments.data[fund]
  }
}

// Due to the nature of getting all payments, this should always force a
// refresh. There's no way to check if we have all payments, theoretically
// new funds could be created in the backend w/out client awareness etc.
// FOR DEBUG PURPOSES ONLY (for now)
export function* retrieveAllPayments() {
  yield put({type: actionType.FETCH_PAYMENTS})
  yield take(success(actionType.FETCH_PAYMENTS))
  return yield select(state => state.records.payments)
}

export function* retrieveSalaries() {
  yield put({type: actionType.FETCH_SALARIES})
  yield take(success(actionType.FETCH_SALARIES))
  return yield select(state => state.records.salaries)
}

// Helper function to asynchronously retrieve payments if needed.
export function* retrieveAccounts() {
  const accounts = yield select(state => state.records.accounts)
  if (!accounts) {
    yield put({type: actionType.FETCH_ACCOUNTS})
    yield take(success(actionType.FETCH_ACCOUNTS))
    return yield select(state => state.records.accounts)
  } else {
    return accounts
  }
}

// Helper function to asynchronously retrieve funds if needed
export function* retrieveFunds() {
  const funds = yield select(state => state.records.funds)
  if (!funds) {
    yield put({type: actionType.FETCH_FUNDS})
    yield take(success(actionType.FETCH_FUNDS))
    return yield select(state => state.records.funds)
  } else {
    return funds
  }
}

// Helper function to asynchronously retrieve funds if needed
export function* retrieveEmployees() {
  const employees = yield select(state => state.records.employees)
  if (!employees) {
    yield put({type: actionType.FETCH_EMPLOYEES})
    yield take(success(actionType.FETCH_EMPLOYEES))
    return yield select(state => state.records.employees)
  } else {
    return employees
  }
}

export function* onInitRecords() {
  yield takeEvery(actionType.INIT_RECORDS, function* putPayment(action) {
    try {
      yield retrieveEmployees()
      yield retrieveAccounts()
      yield retrieveFunds()
      yield retrieveAllPayments()
      yield retrieveSalaries()
      yield put({type: success(actionType.INIT_RECORDS)})
    } catch (error) {
      yield put({type: failure(actionType.INIT_RECORDS), error})
    }
  })
}

export default [onInitRecords]
  .concat(FetchSagas)
  .concat(PutSagas)
  .concat(UserSagas)
