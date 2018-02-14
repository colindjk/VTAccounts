import { put, takeEvery, all, call } from 'redux-saga/effects'

import { success, failure } from 'actions';
import * as actionType from 'actions/types';
import * as Api from 'config/Api'

const fetchData = (url) => {
  return fetch(url).then((response) => { return response.json() })
}

export function* onFetchPayments() {
  yield takeEvery(actionType.FETCH_PAYMENTS, function* fetchRecords() {
    console.log("go fetch");
    try {
      const response = yield call(fetchData, Api.url(Api.ACCOUNT_TREE))
      yield put ({type: success(actionType.FETCH_PAYMENTS), data: response});
    } catch (e) {
      yield put ({type: failure(actionType.FETCH_PAYMENTS), error: e});
    }
  });
}

export function* onCreatePayment() {

}

export function* onUpdatePayment() {

}

export function* onFetchRecords() {
  yield takeEvery(actionType.FETCH_RECORDS, function* fetchRecords() {
    console.log("go fetch");
    try {
      const jsonResponse = yield call(fetchData, Api.url(Api.ACCOUNT_TREE))
      console.log("Pushing action")
      yield put ({type: success(actionType.FETCH_RECORDS), data: jsonResponse});
    } catch (e) {
      yield put ({type: failure(actionType.FETCH_RECORDS), error: e});
      return;
    }
  });
}

// notice how we now only export the rootSaga
// single entry point to start all Sagas at once
export default function* rootSaga() {
  yield all([
      onFetchRecords(),
      onFetchPayments(),
      onCreatePayment(),
      onUpdatePayment(),
  ])
}
