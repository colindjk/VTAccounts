import { put, take, takeEvery, all, call, select } from 'redux-saga/effects'

import * as actionType from 'actions/types'
import { success, failure } from 'actions'
import * as Api from 'config/Api'
import { querySalaries, getPayment, storePayment } from './fetch'

// Using the `pk` field found in the data, construct a URL pertaining to the
// given piece of data, then send a PATCH request to the server.
const patchData = (url, data, pk = 'id') => {

  return fetch(url + data[pk] + '/',
      {
        method: 'PATCH',
        body: JSON.stringify(data),
        headers: new Headers({
          'Content-Type': 'application/json'
        })
      },
    ).then(response => response.json())
}

// Attempts to create a piece of data, will receive an error if a value already
// exists for the unique identifiers. 
const postData = (url, data) => {

  return fetch(url, 
      {
        method: 'POST',
        body: JSON.stringify(data),
        headers: new Headers({
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

      console.log({paymentObject, payment, payments, accounts, paymentObject})
      switch (Object.keys(paymentObject).length) {
        case 0: {
          console.log("NO PAYMENTS FOUND -> POST")
          const postPayment = yield call(postData, Api.PAYMENTS, payment)
          yield put ({type: success(actionType.PUT_PAYMENT), payment: postPayment});
          break
        }
        case 1: {
          console.log("ONE PAYMENT FOUND -> PATCH")
          const patchPayment = yield call(patchData, Api.PAYMENTS, payment)
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
      const employee = yield select(state => state.records.employees[salary.employee])
      const { salaries } = employee
      if (salaries.some(salaryElement => salaryElement.date === salary.date)) {
        const postSalary = yield call(patchData, Api.SALARIES, salary);
      } else {
        const patchSalary = yield call(postData, Api.SALARIES, salary)
      }
      const newSalaries = yield call(querySalaries, salary.employee)
      console.log("NEW SALARIES", newSalaries)
      yield put ({type: success(actionType.PUT_SALARY), employee: { ...employee, salaries: newSalaries } });
    } catch (error) {
      yield put({type: failure(actionType.PUT_PAYMENT), error});
    }
  })
}

export default [
  onPutPayment,
  onPutSalary,
]
