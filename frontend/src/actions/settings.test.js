import store from 'store'

import * as Settings from 'actions/types/settings'
import { settings as settingsReducer } from 'reducers'
import {
  initSettings,
  updateSettings,
  toggleSettings,
  applySettings,
  updateGlobalSettings,
  resetSettings,
  resetGlobalSettings ,
  saveSettingsAs,
  saveSettings,
  loadSettings,
  deleteSettings,
  setDefaultSettings,
  toggleFavoriteSettings,
  reorderSettings,
} from './settings'

import { success } from 'actions/helpers'

//initSettings(dispatch, name, initialSettings)
//updateSettings(dispatch, name, updates) 
//updateGlobalSettings(dispatch, name, updates)
//resetSettings(dispatch, name)
//resetGlobalSettings(dispatch, name)
//saveSettingsAs(dispatch, name, key, current, saved)
//saveSettings(dispatch, name, current, saved)
//loadSettings(dispatch, name, key, saved)
//deleteSettings(dispatch, name, key, saved)
//setDefaultSettings(dispatch, name, key)

// There is a light at the end of the tunnel, we can test this (relatively) easily
describe('Running setting action', () => {
  const testName = "test name" 
  const testSaved = [
    { data: { value: 1 }, favorite: false, key: 'testKey1' },
    { data: { value: 2 }, favorite: false, key: 'testKey2' },
    { data: { value: 3 }, favorite: false, key: 'testKey3' },
    { data: { value: 4 }, favorite: false, key: 'testKey4' },
  ]
  let testState = undefined

  const dispatch = action => {
    switch (action.type) {
      case Settings.SET_DEFAULT:

      case Settings.TOGGLE_FAVORITE:
      case Settings.SAVE: 
      case Settings.DELETE:
      case Settings.SAVE_AS:
      case Settings.REORDER:
        testState = settingsReducer(testState, 
          { ...action, type: success(action.type) })
        break;
      default:
        testState = settingsReducer(testState, action)
        break;
    }
  }

  beforeEach(() => {
    testState = undefined // Clear the state.
    initSettings(dispatch, testName, "component")
  })

  it('initSettings should initialize settings', () => {
    expect(testState.local).toEqual({ [testName]: { data: {}, favorite: false } })
  })

  it('initSettings should re-init when first given `initialSettings`', () => {
    initSettings(dispatch,
      testName, "component", { value: 1 })
    initSettings(dispatch,
      testName, "component", testState.local[testName])

    expect(testState.local).toEqual({ [testName]: {
      data: { value: 1 }, favorite: false
    } })
    initSettings(dispatch, testName, { value: 2 })
    expect(testState.local).toEqual({ [testName]: {
      data: { value: 1 }, favorite: false
    } })
  })

  it('toggleSettings should flip the correct boolean', () => {
    toggleSettings(dispatch, testName,
      { data: {}, favorite: false }, ['filtered', 'key'])
    expect(testState.local[testName].data).toEqual({ filtered: { key: true } })
    toggleSettings(dispatch, testName,
      testState.local[testName], ['filtered', 'key'])
    expect(testState.local[testName].data).toEqual({ filtered: { key: false } })
  })

  it('applySettings should map nested settings', () => {
    applySettings(dispatch, testName,
      { data: {}, favorite: false }, { a: { b: { c: val => !val } } })
    expect(testState.local[testName].data).toEqual({ a: { b: { c: true } } })
  })

  it('updateSettings should update settings', () => {
    updateSettings(dispatch, testName, { value: 0 })
    expect(testState.local[testName]).toEqual(
      { data: { value: 0 }, favorite: false })
    updateSettings(dispatch, testName, { value2: 2 })
    expect(testState.local[testName]).toEqual(
      { data: { value: 0, value2: 2 }, favorite: false })
  })

  it('updateGlobalSettings should update global settings', () => {
    updateGlobalSettings(dispatch, testName, { value: 0 })
    expect(testState.global).toEqual({ value: 0 })
    updateGlobalSettings(dispatch, testName, { value: 1 })
    expect(testState.global).toEqual({ value: 1 })
    updateGlobalSettings(dispatch, testName, { valueother: 2 })
    expect(testState.global).toEqual({ value: 1, valueother: 2 })
  })

  it('resetSettings should reinitialize settings', () => {
    updateSettings(dispatch, testName, { value: 0 })
    expect(testState.local[testName]).toEqual(
      { data: { value: 0 }, favorite: false })
    resetSettings(dispatch, testName)
    expect(testState.local[testName]).toEqual(
      { data: { }, favorite: false })
  })

  it('resetGlobalSettings should clear out global settings', () => {
    updateGlobalSettings(dispatch, testName, { value: 0 })
    expect(testState.global).toEqual({ value: 0 })
    resetGlobalSettings(dispatch, testName)
    expect(testState.global).toEqual({ })
  })

  // When dealing with `savedSettings`, we don't have to save settings to the
  // state before testing load / delete / default. This is because the state is
  // mapped to these helper functions in the connect function.
  //
  // Later there will be a test to make sure connectSettings properly maps
  // state and dispatch to props. 

  it('saveSettingsAs', () => {
    let result = saveSettingsAs(dispatch, testName,
      "testKey", { data: { value: 0 }, favorite: false }, [])
    expect(result).toBeTruthy()
    expect(testState.saved[testName]).toEqual(
      [ { data: { value: 0 }, favorite: false, key: "testKey" } ])
  })

  it('saveSettings only saves if provided a name', () => {
    let result = saveSettings(dispatch, testName, {}, [])
    expect(result).toBeFalsy()
    result = saveSettings(dispatch, testName, 
      { key: "testName", data: { value: 0 }, favorite: false }, [])
    expect(testState.saved[testName]).toEqual([
      { data: { value: 0 }, favorite: false, key: "testName" }
    ])
  })

  it('loadSettings only works after saving settings', () => {
    let result = loadSettings(
      dispatch, testName, "testKey", [])
    expect(result).toBeFalsy()
    result = loadSettings(
      dispatch, testName, "testKey", [])
  })

  it('deleteSettings', () => {
    let result = deleteSettings(
      dispatch, testName, "testKey", [])
    expect(result).toBeFalsy()
    result = deleteSettings(
      dispatch, testName, "testKey1", testSaved)
    expect(result).toBeTruthy()
    expect(testState.saved[testName]).toEqual([
      { data: { value: 2 }, favorite: false, key: 'testKey2' },
      { data: { value: 3 }, favorite: false, key: 'testKey3' },
      { data: { value: 4 }, favorite: false, key: 'testKey4' },
    ])
  })

  it('setDefaultSettings', () => {
    let result = setDefaultSettings(
      dispatch, testName, "testKey", [])
    expect(result).toBeFalsy()
    setDefaultSettings(dispatch, testName, "testKey3", 
      testSaved)
    expect(testState.defaults[testName]).toEqual("testKey3")
  })

  it('toggleFavoriteSettings should toggle saved settings `favorite`', () => {
    toggleFavoriteSettings(
      dispatch, testName, "testKey1", { key: "not a match" }, testSaved)

    expect(testState.saved[testName]).toEqual([
      { data: { value: 1 }, favorite: true, key: 'testKey1' },
      { data: { value: 2 }, favorite: false, key: 'testKey2' },
      { data: { value: 3 }, favorite: false, key: 'testKey3' },
      { data: { value: 4 }, favorite: false, key: 'testKey4' },
    ])

    toggleFavoriteSettings(
      dispatch, testName, "testKey1", { key: "ignore" },
      testState.saved[testName])
    expect(testState.saved[testName]).toEqual([
      { data: { value: 1 }, favorite: false, key: 'testKey1' },
      { data: { value: 2 }, favorite: false, key: 'testKey2' },
      { data: { value: 3 }, favorite: false, key: 'testKey3' },
      { data: { value: 4 }, favorite: false, key: 'testKey4' },
    ])
  })

  it('toggleFavoriteSettings should update current settings correctly', () => {
    let result = saveSettingsAs(dispatch, testName,
      "testKey", { data: { value: 0 }, favorite: false }, [])
    expect(result).toBeTruthy()
    expect(testState.saved[testName]).toEqual(
      [ { data: { value: 0 }, favorite: false, key: "testKey" } ])

    loadSettings(dispatch, testName, "testKey1", testSaved)
    toggleFavoriteSettings(dispatch,
      testName, "testKey1", { key: "testKey1" }, testSaved)
    expect(testState.local[testName]).toEqual(
      { data: { value: 1 }, favorite: true, key: 'testKey1' }
    )
  })

  it('reorderSettings', () => {
    let result = reorderSettings(dispatch, testName, [], 0, 1)
    expect(result).toBeFalsy()
    result = reorderSettings(dispatch, testName, [], 1, 0)
    expect(result).toBeFalsy()
    reorderSettings(dispatch, testName, testSaved, 1, 0)
    expect(testState.saved[testName]).toEqual([
      { data: { value: 2 }, favorite: false, key: 'testKey2' },
      { data: { value: 1 }, favorite: false, key: 'testKey1' },
      { data: { value: 3 }, favorite: false, key: 'testKey3' },
      { data: { value: 4 }, favorite: false, key: 'testKey4' },
    ])

  })
})

