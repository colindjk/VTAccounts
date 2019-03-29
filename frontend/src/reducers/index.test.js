import store from 'store'

// File to test
import rootReducer from './index.js'

import { success, failure, get, put, remove } from 'actions/helpers'
import * as Api from 'actions/types/api'
import { applyTimestampSet, applyTimestamp } from 'util/timestamp'

// TODO: Get mock data from the actual API.

// This is written twice b/c it should not change, but if it does
const initialRecordState = {
  data: {},
  timestamp: 0,
  initialized: false,
  loading: 0, // Number of requests being processed for the given resource
  valid: true,
}

const initialState = {
  records: {
    [Api.FUND]: { ...initialRecordState, name: Api.FUND },
    [Api.ACCOUNT]: { ...initialRecordState, name: Api.ACCOUNT },
    [Api.EMPLOYEE]: { ...initialRecordState, name: Api.EMPLOYEE },

    // Range values
    [Api.PAYMENT]: { ...initialRecordState, name: Api.PAYMENT },
    [Api.SALARY]: { ...initialRecordState, name: Api.SALARY },
    [Api.FRINGE]: { ...initialRecordState, name: Api.FRINGE },
    [Api.INDIRECT]: { ...initialRecordState, name: Api.INDIRECT },

    [Api.TRANSACTION_FILE]: {
      ...initialRecordState, name: Api.TRANSACTION_FILE },
    [Api.SALARY_FILE]: { ...initialRecordState, name: Api.SALARY_FILE },
    [Api.TRANSACTION_METADATA]: {
      ...initialRecordState, name: Api.TRANSACTION_METADATA, files: {} },
  },
  errors: [],
  settings: {
    initialized: false,
    autoInitialized: {},
    initializedSettings: {},
    defaults: {},
    global: {},
    local: {},
    saved: {}
  },
  user: {
    username: null,
    token: null,
    isAuthenticated: false,
    loading: false
  }
}

describe('global state', () => {
  it('should have a certain empty shape', () => {

    expect(rootReducer(undefined, {})).toEqual(
      initialState
    )
  })
})

// Need to run a proper test that checks there is no crash. 
describe('running a "records" action', () => {
  it('should be safely handled if it\'s not in records', () => {
    expect(rootReducer(undefined, {})).toEqual(initialState)
    expect(rootReducer(undefined, { type: "NOTATYPE" })).toEqual(initialState)
    expect(rootReducer(undefined, { type: "GET_NOTATYPE_SUCCESS" })).toEqual(
      initialState)
  })

})

describe('running request results', () => {

})

// This test verifies that the cache'd database records are processed correctly
// by the root reducer. Timestamps are mocked. 
describe('running succesful API requests should update', () => {
  const RealDate = Date

  function mockDate (isoDate) {
    global.Date = class extends RealDate {
      constructor () {
        return new RealDate(isoDate)
      }
    }
  }

  afterEach(() => {
    global.Date = RealDate
  })

  it('`records.accounts` appropriately', () => {
    mockDate('2017-11-25T12:34:56z')
    const timestamp = Date.now()
    let state = rootReducer(undefined, {}) 
    let testState = rootReducer(undefined, {})

  })
})

// NOTE: Due to the nature of timestamps in this application, for testing
//       purposes no mock timestamp needs to be set. All tests verify that
//       updates happened in a particular sequence, which has nothing to do
//       with when tests actually took place.
describe('`records.*.timestamp` should update when', () => {

  it('records are initially retrieved', () => { /* TODO: Implement */ })
  it('records are updated', () => { /* TODO: Implement */ })
  it('records related to `transactions` are updated', () => { /* TODO: Implement */ })
  it('records related to `rates` are updated', () => { /* TODO: Implement */ } )
})

describe('`records.*.loading` should update when requests are made', () => {

})



