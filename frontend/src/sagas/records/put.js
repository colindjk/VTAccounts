import { put, takeEvery, call, select } from 'redux-saga/effects'

import { put as requestPut, success, failure } from 'actions/helpers'
import * as Api from 'actions/types/api'
import * as ApiUrl from 'config/Api'
import { authenticateHeaders, handleErrors } from 'sagas/records'

import { FundPaymentSelector } from 'selectors/date-records'

import * as records from 'selectors/records'

// Using the `pk` field found in the data, construct a URL pertaining to the
// given piece of data, then send a PATCH request to the server.
export const patchData = (url, data, id) => {
  return fetch(url + id + '/',
      {
        method: 'PATCH',
        body: data,
        headers: authenticateHeaders()
      })
    .then(handleErrors)
    .then(response => response.json())
}

// Attempts to create a piece of data, will receive an error if a value already
// exists for the unique identifiers. 
export const postData = (url, data) => {
  return fetch(url, 
      {
        method: 'POST',
        body: data,
        headers: authenticateHeaders()
      })
    .then(handleErrors)
    .then(response => response.json())
}

export const putData = (url, data, pk = 'id') => {
  var submitData = new FormData()
  for (const key in data) { submitData.append(key, data[key]) }
  // Data has pk='id' field, therefore should be an update
  if (data[pk]) {
    return patchData(url, submitData, data[pk])
  } else {
    return postData(url, submitData)
  }
}

class DateRecordError extends Error { }

// The `forceUpdate` will be used when editing from the data integrity tool.
function* onPutPayment() {
  yield takeEvery(requestPut(Api.PAYMENT), function* putPayment(action) {
    const { data, forceUpdate } = action
    try {
      const { fund, date, transactable } = data
      const payments = yield select(state => records
        .groupBy(state, records.getPayments, 'date', 'transactable')
        .getArray(date, transactable).filter(p => p.fund === fund))

      let payment
      if (data.id) {
        const oldPayment = payments.find(({id}) => id === data.id)
        if (!oldPayment) {
          throw new DateRecordError(
            "Invalid payment update: No matching payment found for id " + data.id)
        }
        payment = yield call(putData, ApiUrl.PAYMENTS, data)
      } else if (!forceUpdate) {
        switch (payments.length) {
          case 0: {
            payment = yield call(putData, ApiUrl.PAYMENTS, data)
            break;
          }
          case 1: {
            payment = yield call(putData, ApiUrl.PAYMENTS,
              { ...data, id: payments[0].id })
            break;
          }
          default: throw new DateRecordError(
            "Invalid payment update: multiple payments found for payment: " + payment)
        }
      } else {
        // creating a new transaction from data integrity tool window. 
        throw new DateRecordError("Unimplemented error")
      }

      yield put({ type: success(requestPut(Api.PAYMENT)), data: payment })
    } catch (error) {
      yield put({ type: failure(requestPut(Api.PAYMENT)), data, error })
    }
  })
}

function* onPutSalary() {
  yield takeEvery(requestPut(Api.SALARY), function* putSalary(action) {
    try {
      let { data } = action
      data = yield call(putData, ApiUrl.SALARIES, data)
      yield put({ type: success(requestPut(Api.SALARY)), data })
    } catch (error) {
      yield put({ type: failure(requestPut(Api.SALARY)), error })
    }
  })
}

function* onPutIndirect() {
  yield takeEvery(requestPut(Api.INDIRECT), function* putIndirect(action) {
    try {
      let { data } = action
      data = yield call(putData, ApiUrl.INDIRECTS, data)
      yield put({ type: success(requestPut(Api.INDIRECT)), data })
    } catch (error) {
      yield put({ type: failure(requestPut(Api.INDIRECT)), error })
    }
  })
}

function* onPutFringe() {
  yield takeEvery(requestPut(Api.FRINGE), function* putFringe(action) {
    try {
      let { data } = action
      data = yield call(putData, ApiUrl.FRINGES, data)
      yield put({ type: success(requestPut(Api.FRINGE)), data })
    } catch (error) {
      yield put({ type: failure(requestPut(Api.FRINGE)), error })
    }
  })
}

function* onPutFund() {
  yield takeEvery(requestPut(Api.FUND), function* putFund(action) {
    try {
      let { data } = action
      data = yield call(putData, ApiUrl.FUNDS, data)
      yield put({ type: success(requestPut(Api.FUND)), data })
    } catch (error) {
      yield put({ type: failure(requestPut(Api.FUND)), error })
    }
  })
}

function* onPutAccount() {
  yield takeEvery(requestPut(Api.ACCOUNT), function* putAccount(action) {
    try {
      let { data } = action
      data = yield call(putData, ApiUrl.ACCOUNTS, data)
      yield put({ type: success(requestPut(Api.ACCOUNT)), data })
    } catch (error) {
      yield put({ type: failure(requestPut(Api.ACCOUNT)), error })
    }
  })
}

function* onPutEmployee() {
  yield takeEvery(requestPut(Api.EMPLOYEE), function* putEmployee(action) {
    try {
      let { data } = action
      data = yield call(putData, ApiUrl.EMPLOYEES, data)
      yield put({ type: success(requestPut(Api.EMPLOYEE)), data })
    } catch (error) {
      yield put({ type: failure(requestPut(Api.EMPLOYEE)), error })
    }
  })
}

function* onPutTransactionFile() {
  yield takeEvery(requestPut(Api.TRANSACTION_FILE), function* putFile(action) {
    try {
      let { data } = action
      data = yield call(putData, ApiUrl.TRANSACTION_FILES, data)
      yield put({ type: success(requestPut(Api.TRANSACTION_FILE)), data })
    } catch (error) {
      yield put({ type: failure(requestPut(Api.TRANSACTION_FILE)), error })
    }
  })
}

function* onPutSalaryFile() {
  yield takeEvery(requestPut(Api.SALARY_FILE), function* putFile(action) {
    try {
      let { data } = action
      data = yield call(putData, ApiUrl.SALARY_FILES, data)
      yield put({ type: success(requestPut(Api.SALARY_FILE)), data })
    } catch (error) {
      yield put({ type: failure(requestPut(Api.SALARY_FILE)), error })
    }
  })
}

export default [
  onPutPayment,
  onPutSalary,
  onPutIndirect,
  onPutFringe,
  onPutFund,
  onPutAccount,
  onPutEmployee,
  onPutTransactionFile,
  onPutSalaryFile,
]

