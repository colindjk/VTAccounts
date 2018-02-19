import { all } from 'redux-saga/effects'

import * as actionType from 'actions/types';
import gridSagas from 'actions/gridContext'
import apiSagas from 'actions/sagas'

// Some tips about redux-sagas
// -  take(action) will always "take" the action AFTER reducers. Meaning you
//    can use 'take' as a way to verify that the state has been updated.

export function success(action_type) {
  return action_type + "_SUCCESS"
}

export function failure(action_type) {
  return action_type + "_FAILURE"
}

export const setToken = (data) => {
  return {
    type: actionType.SET_TOKEN,
    data
  }
}

export default function* rootSaga() {
  yield all([]
    .concat(gridSagas)
    .concat(apiSagas)
    .map((saga) => saga())
  )
}

