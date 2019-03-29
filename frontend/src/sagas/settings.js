import { put, takeEvery, call } from 'redux-saga/effects'

import { success, failure } from 'actions/helpers'
import * as Settings from 'actions/types/settings'
import * as Api from 'actions/types/api'
import * as ApiUrl from 'config/Api'
import { authenticateHeaders } from 'sagas/records'

// Where `settings` is shaped as such
//  settings: {
//    saved: { [component.name]: [ ...savedSettings ] }
//    defaults: { [component.name]: defaultName }
//  }
// Updates to settings can be applied in slices, so we don't need to send the
// whole settings object back to the server every time. Just send the relevant
// updates.
const patchSettings = ({ name, savedSettings, defaultKey }, clientName="react") => {
  let updates = { saved: {}, defaults: {} }
  if (savedSettings) updates.saved[name] = savedSettings
  if (defaultKey) updates.defaults[name] = defaultKey

  return fetch(ApiUrl.SETTINGS + clientName + "/",
      {
        method: 'PATCH',
        body: JSON.stringify({ data: updates }),
        headers: authenticateHeaders({
          'Content-Type': 'application/json'
        })
      },
    ).then(response => response.json())
}

const getSettings = (clientName="react") => {
  return fetch(ApiUrl.SETTINGS + clientName + "/",
      {
        method: 'GET',
        headers: authenticateHeaders({
          'Content-Type': 'application/json'
        })
      },
    ).then(response => response.json())
} 

// TODO: Add action that takes this successful actions results.
// TODO: For the reducer action that takes this result, if a defaultSettings is
//       found, apply to the currently viewed settings. 
function* onInitSettings() {
  yield takeEvery(Settings.INIT_STATE, function* initSettings(action) {
    try {
      const { data } = yield call(getSettings)

      // Make sure we don't get any extra pieces of the settings state that
      // could be used for other applications in the future. 
      const saved = data.saved || {}
      const defaults = data.defaults || {}

      // We can load settings before initializing state. This way we assure that
      // the first settings a component gets will be the default settings.
      for (const name in defaults) {
        const settingsKey = defaults[name]
        const settings = saved[name] ? 
          saved[name].find(({ key }) => key === settingsKey) : undefined

        // Load if found, else leave the settings as they are. 
        if (settings) { yield put({ type: Settings.LOAD, name, settings }) }
      }
      yield put({ type: success(Settings.INIT_STATE), saved, defaults })
    } catch (error) {
      yield put({ type: failure(Api.SETTINGS), error })
    }
  })
}

// What if something is saved before we've written the result? 
// -> It should be fine, the server will remember all updates and the latest
//    settings should always be correct. 
function* onSaveSettings() {
  yield takeEvery(
    [Settings.SAVE, Settings.SAVE_AS, Settings.DELETE, Settings.TOGGLE_FAVORITE,
      Settings.REORDER, Settings.SET_DEFAULT],
    function* saveSettings(action) {
      try {
        yield call(patchSettings, action)
        yield put({ ...action, type: success(action.type) })
      } catch (error) {
        yield put({ type: failure(action.type), error })
      }

    }
  )
}


export default [
  onInitSettings,
  onSaveSettings,
]
