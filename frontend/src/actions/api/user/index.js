import { put, take, takeEvery, all, call, select } from 'redux-saga/effects'

import { postData } from 'actions/api/put'
import { success, failure } from 'actions'
import * as actionType from 'actions/types'
import * as Api from 'config/Api'
import store from 'store'

// server-side validation (on the fly?)

export function InvalidCredentialsException(message) {
    this.message = message;
    this.name = 'InvalidCredentialsException';
}

// Selector which checks if an authenticated user is logged in.
export function isLoggedIn(state) {
  return store.getState().token == null;
}

export function* onAuthenticate() {
  yield takeEvery(actionType.AUTHENTICATION, function* authenticate(action) {
    try {
      let { username, password } = action.form
      let { token } = yield call(postData, Api.LOGIN, { username, password })
      let isAuthenticated = !!token // FIXME: Add proper token validation
      yield put ({type: success(actionType.AUTHENTICATION), username, token, isAuthenticated: true });
    } catch (error) {
      yield put({type: failure(actionType.AUTHENTICATION), error});
    }
  })
}

export default [
  onAuthenticate,
]
