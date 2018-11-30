import { put, take, takeEvery, all, call, select } from 'redux-saga/effects'

import * as actionType from 'actions/types'
import { success, failure } from 'actions'
import * as Api from 'config/Api'
import { querySalaries, getPayment, storePayment } from './fetch'

import { authenticateHeaders } from 'actions/api'

// Using the `pk` field found in the data, construct a URL pertaining to the
// given piece of data, then send a PATCH request to the server.
export const patchData = (url, data, pk = 'id') => {

  return fetch(url + data[pk] + '/',
      {
        method: 'PATCH',
        body: JSON.stringify(data),
        headers: authenticateHeaders({
          'Content-Type': 'application/json'
        })
      },
    ).then(response => response.json())
}

// Attempts to create a piece of data, will receive an error if a value already
// exists for the unique identifiers. 
export const postData = (url, data) => {
  return fetch(url, 
      {
        method: 'POST',
        body: JSON.stringify(data),
        headers: authenticateHeaders({
          'Content-Type': 'application/json'
        })
      },
    ).then(response => response.json())
}

// Attempt to "put" a payment into the database. This function will verify the
// existence of a payment matching the given fund -> pay_period -> transactable.
// Three cases:
// None -> Create
// Unique found -> Patch request
// Multiple found -> Do nothing (for now)
function* onPutPayment() {
  yield takeEvery(actionType.PUT_PAYMENT, function* putPayment(action) {
    try {
      const payment = action.payment
      const payments = yield select(state => state.records.payments)
      const accounts = yield select(state => state.records.accounts)
      const paymentObject = getPayment(payments, payment)

      console.log({paymentObject, payment, payments, accounts})
      switch (Object.keys(paymentObject.data).length) {
        case 0: {
          console.log("NO PAYMENTS FOUND -> POST")
          const postPayment = yield call(postData, Api.PAYMENTS, payment)
          yield put ({type: success(actionType.PUT_PAYMENT), payment: postPayment});
          break
        }
        case 1: {
          console.log("ONE PAYMENT FOUND -> PATCH")
          const patchPayment = yield call(patchData, Api.PAYMENTS, payment)
          console.log("PATCH_PAYMENT", patchPayment)
          yield put ({type: success(actionType.PUT_PAYMENT), payment: patchPayment});
          break
        }
        default:
          console.log("MULTIPLE PAYMENTS FOUND -> VALIDATION ERROR")
          break
      }
    } catch (error) {
      console.log(error)
      yield put({type: failure(actionType.PUT_PAYMENT), error});
    }
  })
}

// Upon success, requests the EMPLOYEE and updates the EMPLOYEE in the store.
// This is done because of the way salaries and stored and used in the view.
function* onPutSalary() {
  yield takeEvery(actionType.PUT_SALARY, function* putSalary(action) {
    try {
      const salary = action.salary
      const salaries = yield select(state => state.records.salaries)

      let updatedSalary = {}
      const { employee, date } = salary
      console.log(salaries.data[employee])
      if (salaries.data[employee] && salaries.data[employee].data[date]) {
        console.log(salaries.data[employee].data[date])
        updatedSalary = yield call(patchData, Api.SALARIES, salary)
      } else {
        updatedSalary = yield call(postData, Api.SALARIES, salary)
      }

      yield put ({type: success(actionType.PUT_SALARY), salary: updatedSalary });
    } catch (error) {
      yield put({type: failure(actionType.PUT_SALARY), error});
    }
  })
}

// Checks the existence of a fringe rate, patch's / post's depending on what's
// found.
function* onPutFringe() {
  yield takeEvery(actionType.PUT_FRINGE, function* putFringe(action) {
    try {
      const fringe = action.fringe
      const fringes = yield select(state => state.records.fringes)
      const { account, date } = fringe

      let updatedFringe
      if (fringes.data[account] && fringes.data[account].data[date]) {
        updatedFringe = yield call(patchData, Api.FRINGES, fringe)
      } else {
        updatedFringe = yield call(postData, Api.FRINGES, fringe)
      }

      // FIXME: Temporary solution for invalid data entry.
      if (!updatedFringe.id) {
        console.log("Fringe value error")
        yield put({type: failure(actionType.PUT_FRINGE), error: updatedFringe});
      } else {
        yield put ({type: success(actionType.PUT_FRINGE), fringe: updatedFringe });
      }
    } catch (error) {
      yield put({type: failure(actionType.PUT_FRINGE), error});
    }
  })
}

function* onPutIndirect() {
  yield takeEvery(actionType.PUT_INDIRECT, function* putIndirect(action) {
    try {
      const indirect = action.indirect
      const indirects = yield select(state => state.records.indirects)
      const { fund, date } = indirect

      let updatedIndirect
      if (indirects.data[fund] && indirects.data[fund].data[date]) {
        console.log("Replacing: ", indirects.data[fund].data[date])
        updatedIndirect = yield call(patchData, Api.INDIRECTS, indirect)
      } else {
        updatedIndirect = yield call(postData, Api.INDIRECTS, indirect)
      }

      yield put ({type: success(actionType.PUT_INDIRECT), indirect: updatedIndirect });
    } catch (error) {
      yield put({type: failure(actionType.PUT_INDIRECT), error});
    }
  })
}

export default [
  onPutPayment,
  onPutSalary,
  onPutFringe,
  onPutIndirect,
]
