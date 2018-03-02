import { put, take, takeEvery, all, call, select } from 'redux-saga/effects'

import * as actionType from 'actions/types'

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
        method: 'PATCH',
        body: JSON.stringify(data),
        headers: new Headers({
          'Content-Type': 'application/json'
        })
      },
    ).then(response => response.json())
}

// When updating / creating a payment, FOR NOW we could send a GET request to
// the server to retrieve any "related" transactions. These can be passed into
// the `setPayment` method to automatically synch indirect & fringe with the DB.
function* onPutPayment() {
  takeEvery(actionType.PUT_PAYMENT, function* putPayment(action) {
    let payment = action.payment

    // Retrieve potentially multiple transactions -> fail upon multiple. 
    // If none found, submit the payment as a POST
    // If something found, submit the payment as a patch w/ id
  })
}

export default [
  onPutPayment,
]
