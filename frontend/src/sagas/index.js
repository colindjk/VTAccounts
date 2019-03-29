import { all } from 'redux-saga/effects'

import RecordsSagas from 'sagas/records'
import MonitorsSagas from 'sagas/monitors'
import SettingsSagas from 'sagas/settings'

export default function* rootSaga() {
  yield all([]
    .concat(RecordsSagas)
    .concat(MonitorsSagas)
    .concat(SettingsSagas)
    .map(saga => saga())
  )
}

