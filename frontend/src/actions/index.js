import { all } from 'redux-saga/effects'

import * as actionType from 'actions/types';
import GridViewSagas from 'actions/grid-view'
import ApiSagas from 'actions/api'

// Some tips about redux-sagas
// -  take(action) will always "take" the action AFTER reducers. Meaning you
//    can use 'take' as a way to verify that the state has been updated.

export function success(action_type) {
  return action_type + "_SUCCESS"
}

export function failure(action_type) {
  return action_type + "_FAILURE"
}

export default function* rootSaga() {
  yield all([]
    .concat(GridViewSagas)
    .concat(ApiSagas)
    .map(saga => saga())
  )
}

