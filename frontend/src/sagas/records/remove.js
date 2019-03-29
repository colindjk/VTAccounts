import { put, takeEvery, call } from 'redux-saga/effects'

import { remove, success, failure } from 'actions/helpers'

import * as Api from 'actions/types/api'
import * as ApiUrl from 'config/Api'
import { authenticateHeaders, handleErrors } from 'sagas/records'

// DRS === Date Record Selector
//import * as DRS from 'selectors/date-records'

// TODO: Clear caches when deleting objects. Also, websockets?

export const removeData = (url, data) => {
  return fetch(url, 
    {
      method: 'DELETE',
      body: JSON.stringify(data),
      headers: authenticateHeaders({
        'Content-Type': 'application/json'
      })
    })
    .then(handleErrors)
    .then(response => response.json())
}

// Invalidate FundPaymentSelector action.data.fund && action.data.transactable
export function* onRemovePayment() {
  yield takeEvery(remove(Api.PAYMENT), function* fetchFunds(action) {
    try {
      const data = yield call(removeData, ApiUrl.PAYMENTS, action.data)
      yield put({type: success(remove(Api.PAYMENT)), data})
    } catch (error) {
      yield put({type: failure(remove(Api.PAYMENT)), error})
    }
  })
}

export default [
  onRemovePayment,
]
