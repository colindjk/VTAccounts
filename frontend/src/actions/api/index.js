// This module will handle all sagas related to directly calling on the backend
// server. 

// This file will then have async helper functions which will be used in other
// actions as a sort of interface to the backend api.

// Here is how the function naming scheme will work:

// Get data
// fetch*     -> Always calls to server, can update data etc.
// retrieve*  -> Checks cache, if missing / dirt, triggers a fetch.
// get*       -> Accesses state and returns undefined or default on value not found.

// Set data
// put*       -> Using unique information, attempts to find a record matching
//                the given data. IF id is found -> update*, ELSE -> create*
// create*    -> Create a value
// update*    -> So long as an id is included, all other fields included will
//                overwrite those found in the server.
import { put, take, takeEvery, all, call, select } from 'redux-saga/effects'

import { success, failure } from 'actions'
import * as actionType from 'actions/types'

import FetchSagas, * as fetchRecords from './fetch'
import PutSagas, * as putRecords from './put'

// Helper function to asynchronously retrieve payments if needed.
export function* retrieveFundPayments(fund) {
  const payments = yield select(state => state.records.payments)
  if (!payments || !payments[fund]) {
    yield put({type: actionType.FETCH_PAYMENTS, fund})
    yield take(success(actionType.FETCH_PAYMENTS))
    return yield select(state => state.records.payments[fund])
  } else {
    return payments[fund]
  }
}

// Retreives the entire slice of state related to payments.
export function* retrieveAllPayments() {
  const payments = yield select(state => state.records.payments)
  if (!payments) {
    yield put({type: actionType.FETCH_PAYMENTS})
    yield take(success(actionType.FETCH_PAYMENTS))
    return yield select(state => state.records.payments)
  } else {
    return payments
  }
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

export default []
  .concat(FetchSagas)
  .concat(PutSagas)
