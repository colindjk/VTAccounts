import { combineReducers } from 'redux'

import * as Api from 'actions/types/api'
import * as Settings from 'actions/types/settings'
import {
  identifyRequestType,
  identifyResultType,
  identifyAction,
  isSuccess,
  success,
  failure,
  get,
} from 'actions/helpers'
import { applyMerge } from 'util/helpers'

import { applyTimestampSet, applyTimestamp } from 'util/timestamp'
import reduceReducers from 'reduce-reducers'

// An initial state object for a set within the "records" state.
const initialRecordState = {
  data: {},
  timestamp: 0,
  initialized: false,
  valid: true, // True until data is corrupted 
  loading: 0, // Number of requests being processed for the given resource
}

// Will be initialized on the successful result of the initApp saga.
const initialRecordsState = {
  [Api.FUND]: { ...initialRecordState, name: Api.FUND },
  [Api.ACCOUNT]: { ...initialRecordState, name: Api.ACCOUNT },
  [Api.EMPLOYEE]: { ...initialRecordState, name: Api.EMPLOYEE },

  [Api.TRANSACTION_FILE]: { ...initialRecordState, name: Api.TRANSACTION_FILE },
  [Api.SALARY_FILE]: { ...initialRecordState, name: Api.SALARY_FILE },

  // Date records, always retreived after flat records.
  [Api.PAYMENT]: { ...initialRecordState, name: Api.PAYMENT },
  [Api.SALARY]: { ...initialRecordState, name: Api.SALARY },
  [Api.FRINGE]: { ...initialRecordState, name: Api.FRINGE },
  [Api.INDIRECT]: { ...initialRecordState, name: Api.INDIRECT },

  [Api.TRANSACTION_METADATA]: {
    ...initialRecordState,
    name: Api.TRANSACTION_METADATA,
    files: {},
  },
}

const isRecordAction = action => initialRecordsState[identifyAction(action)]

// This assumes all records follow a hash storage pattern, and have an "id".
// We can assume that timestamp values will be served in increasing order.
const recordsReducer = (state, action) => {
  if (!isSuccess(action) || !isRecordAction(action)) return state

  const { timestamp, data } = action
  const actionType = identifyAction(action)
  const records = state[actionType]

  switch (identifyRequestType(action)) {
    case "GET":
      const newRecords = applyTimestampSet(timestamp, records, data)
      return { ...state, [actionType]: { ...newRecords, initialized: true } }
    case "PUT":
      const updatedRecords = applyTimestamp(timestamp, records, data)
      return { ...state, [actionType]: updatedRecords }
    case "REMOVE":
      delete records.data[action.data.id]
      return { ...state, [actionType]: { ...records } }
    default:
      return state
  }
}

// Stores information on which parts of the API state are currently loading.
const recordsLoadingReducer = (state, action) => {
  if (!isRecordAction(action)) return state

  const actionType = identifyAction(action)
  const records = state[actionType]
  let { loading, valid } = records

  switch (identifyResultType(action)) {
    case "FAILURE":
      valid = false // Set the valid bit, then fall through.
    case "SUCCESS":
      loading -= 1
      return { ...state, [actionType]: { ...records, loading, valid } }
    default: 
      loading += 1
      return { ...state, [actionType]: { ...records, loading, valid } }
  }
}

// Adds keys that certain records have been queried for.
// if payments are lazily queried, this will mark which funds have been loaded.
const recordsInitializedReducer = (state, action) => {
  switch (action.type) {
    case get(Api.TRANSACTION_METADATA): {
      const { fileKey } = action
      const metadata = state[Api.TRANSACTION_METADATA]
      return {
        ...state,
        [Api.TRANSACTION_METADATA]: {
          ...metadata, files: { ...metadata.files, [fileKey]: false }
        }
      }
    }
    case success(get(Api.TRANSACTION_METADATA)): {
      const { fileKey } = action
      const metadata = state[Api.TRANSACTION_METADATA]
      return {
        ...state,
        [Api.TRANSACTION_METADATA]: {
          ...metadata, files: { ...metadata.files, [fileKey]: true }
        }
      }
    }
    default: return state
  }
}

// Combines reducers related to managing record state.
export const records = reduceReducers(
  recordsReducer,
  recordsLoadingReducer,
  recordsInitializedReducer,
  initialRecordsState,
)


// Constants etc.
const initialUserState = {
  username: null,
  token: null,
  isAuthenticated: false,
  loading: false
}

export const user = (state = initialUserState, action) => {
  switch(action.type) {
    case Api.LOGIN:
      return { ...state, loading: true }
    case success(Api.LOGIN):
      const { username, token, isAuthenticated } = action
      return { username, token, isAuthenticated, loading: false }
    case failure(Api.LOGIN):
      return { ...state, loading: false }
    default:
      return state;
  }
}


// The boolean value for initialized goes here b/c all UI must wait for the app
// to be initialized (outside of the login page).
const initialSettingsState = {
  initialized: false,
  global: {}, // connected components have `props.globalSettings`
  local: {}, // key-value pairs for to map to `props.settings`

  autoInitialized: {}, // key-boolean pairs to determine which names were
                       // provided `initialSettings` so far for a given
                       // component.
  initializedSettings: {}, // key-object pairs { [name]: { ...initialSettings } }

  // These fields are stored server-side.
  saved: {},
  defaults: {} // key-value pairs { [local.name]: settings.name }
}

const settingsShape = {
  data: undefined,
  favorite: false,
  key: undefined,

  // TODO: Store actions that would undo the things.
  past: [],
  future: [],
}

// 
export const settingsReducer = (state = initialSettingsState, action) => {
  switch (action.type) {
    case success(Settings.INIT_STATE): {
      const { saved, defaults } = action
      return { ...state, saved, defaults, initialized: true }
    }
    // Run once per unique connected name, we can assume it's always run before
    // any other settings related action. Currently connected components not see
    // any change in state unless they're using shared slices of settings state.
    case Settings.INIT: {
      const { local, saved, defaults, autoInitialized } = state
      const { name, componentName, initialSettings } = action
      const defaultKey = defaults[name]
      const hasInitialSettings = !!initialSettings // not not lol
      const initializedSettings = {
        ...state.initializedSettings,
        [name]: applyMerge(state.initializedSettings[name], initialSettings)
      }

      // If already initialized, and no initialSettings supplied...
      // This should actually never happen
      if ((!hasInitialSettings && local[name]) ||
          (autoInitialized[name] && autoInitialized[name][componentName])) {
        return state
      }

      const defaultSettings = (saved[name] || []).find(s => s.key === defaultKey)
      const currentSettings = local[name] || { ...settingsShape, data: {} }
      let settings, data
      if (defaultSettings) {
        data = applyMerge(initializedSettings[name], defaultSettings.data)
        settings = { ...settingsShape, ...defaultSettings, data }
      } else {
        data = applyMerge(initializedSettings[name], currentSettings.data)
        settings = { ...settingsShape, ...currentSettings, data }
      }

      return { ...state,
        local: { ...state.local, [name]: settings },
        initializedSettings,
        autoInitialized: {
          ...state.autoInitialized,
          [name]: {
            ...(state.autoInitialized[name] || {}),
            [componentName]: hasInitialSettings,
          }
        }
      }
    }
    // FIXME: move all updates to reducers to keep relevant state.
    case Settings.UPDATE_LOCAL: {
      const localSettings = state.local[action.name]
      const { updates } = action
      return { ...state, local: { ...state.local, [action.name]:
        {
          ...localSettings,
          data: { ...localSettings.data, ...updates }
        } }
      }
    }
    case Settings.APPLY_LOCAL:
    case Settings.TOGGLE_LOCAL: {
      const { settings } = action
      return { ...state, local: { ...state.local, [action.name]: {
        ...state.local[action.name],
        ...settings,
        data: { ...state.local[action.name].data, ...settings.data }
      } } }
    }
    case Settings.UPDATE_GLOBAL: {
      const { updates } = action
      const global = { ...state.global, ...updates }
      return { ...state, global }
    }
    case Settings.LOAD: {
      const { name, settings } = action
      const { initializedSettings, local } = state
      const data = applyMerge(initializedSettings[name], settings.data)
      return { ...state, local: { ...local, [name]: {
        ...settingsShape, ...settings, data } 
      } }
    }
    case Settings.RESET_GLOBAL: {
      return { ...state, global: {} }
    }
    case Settings.RESET_LOCAL: {
      const { name } = action
      const { initializedSettings } = state

      const settings = {
        ...settingsShape,
        data: initializedSettings[name] || {}
      }

      return { ...state, local: { ...state.local, [name]: settings } }
    }

    // Await success for asynch actions.
    case success(Settings.TOGGLE_FAVORITE):
    case success(Settings.SAVE): 
    case success(Settings.DELETE):
    case success(Settings.SAVE_AS):
    case success(Settings.REORDER): {
      const { name, savedSettings } = action
      return {
        ...state,
        saved: { ...state.saved, [name]: savedSettings }
      }
    }

    // Action creator checks to see if default exists.
    case success(Settings.SET_DEFAULT): {
      const { name, defaultKey } = action
      return {
        ...state,
        defaults: { ...state.defaults, [name]: defaultKey }
      }
    }

    // Purely synchronous function to keep the current settings state updated.
    case Settings.LOAD_METADATA: {
      const { settings: { data, ...metadata }, name } = action

      // Return if metadata doesn't need to be loaded.
      if (metadata.key !== state.local[name].key) { return state }

      return {
        ...state,
        local: { ...state.local, [name]: { ...state.local[name], ...metadata } }
      }
    }

    default:
      return state
  }
}

export const settings = (state, action) => {
  switch (action.type) {
    case Settings.UPDATE_LOCAL:
    case Settings.APPLY_LOCAL:
    case Settings.TOGGLE_LOCAL: {
      const { past, data } = state.local[action.name]
      state = settingsReducer(state, action)
      return { ...state, local: { ...state.local,
        [action.name]: {
          ...state.local[action.name],
          past: [ data, ...past ],
          future: []
        }
      } }
    }
    case Settings.UNDO: {
      const settings = state.local[action.name]
      if (settings.past.length === 0) return state
      const [ data, ...past ] = settings.past
      const future = [ settings.data, ...settings.future ]
      return {
        ...state, local: { ...state.local, [action.name]: { 
          ...settings, past, data, future
        } }
      }
    }
    case Settings.REDO: {
      const settings = state.local[action.name]
      if (settings.future.length === 0) return state
      const [ data, ...future ] = settings.future
      const past = [ settings.data, ...settings.past ]
      return {
        ...state, local: { ...state.local, [action.name]: { 
          ...settings, past, data, future
        } }
      }
    }
    default: return settingsReducer(state, action)
  } 
}

// In order to support undo-ability a second reducer over the settings state
// slice should be created that listens to changes in state.
// Actions will be stored in a stack
//

export const errors = (state = [], action) => {
  if (identifyResultType(action) === "FAILURE") {
    console.error("ERROR: Failed action: ", action.type)
    state = [ ...state, action.error ]
  }
  return state
}

const appReducer = combineReducers({
  records, user, settings, errors
})

const rootReducer = (state, action) => {
  return appReducer(state, action)
}

export default rootReducer
