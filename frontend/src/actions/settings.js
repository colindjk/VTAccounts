import { connect } from 'react-redux'

import * as Settings from 'actions/types/settings'

// Higher Order Component which applies settings features to the given connected
// component. Passes props
//
// `settings` state.ui.component[component.name]
// `globalSettings` state.ui.global
//
// -- global or local settings --
// `updateSettings(updates)`
// `resetSettings()`
//
// -- local settings only --
// `saveSettings(settings, name)`
// `loadSettings(name)`

export const initSettings = (dispatch, name, componentName, initialSettings) =>
  dispatch({ type: Settings.INIT, name, componentName, initialSettings })

// For now we'll shallow merge settings
export const updateSettings = (dispatch, name, updates) => 
  dispatch({ type: Settings.UPDATE_LOCAL, name, updates })

// Apply a toggle. 
// applyMap({ columnMetaData: { columnKey: { isValue: value => !value } } })

// Function which can apply a primitive or mapper function to a field within
// the settings tree. 
export const applySettings = (dispatch, name, current, updates) => {
  if (!updates) { return false }
  const iterFields = obj => Object.keys(obj).map(
    key => ({ key, value: obj[key] }))

  const visitField = (base, updateBase, field) => {
    const next = updateBase[field]
    // This way, no matter the state of the current settings, the global
    // settings will not be the cause of a key error. 
    base = typeof base === "object" ? base : {}

    switch (typeof next) {
      case "function": return { ...base, [field]: next(base[field]) }
      case "object": return {
        ...base,
        [field]: iterFields(next).reduce(
          (updated, {key, value}) => ({
            ...updated,
            [key]: visitField(base[field], next, key)[key]
          }), { ...base[field] })
      }
      default:
        return { ...base, [field]: next }
    }
  }

  const settings = visitField(current, { data: updates }, 'data')
  dispatch({ type: Settings.APPLY_LOCAL, name, settings })
  return true
}

// takes a list of arguments pointing to a place in internal state that must
// be toggled. 
export const toggleSettings = (dispatch, name, current, fields) => {
  if (!fields.length) return false

  let base = { data: { [fields[0]]: current.data[fields[0]] } }

  let toggleField = fields.pop()

  // Base will be written to with updated object.
  let toggleObject = fields.reduce((cur, arg) => {
    let next = cur[arg] || {}
    cur[arg] = { ...next }
    return cur[arg]
  }, base.data)

  // Modify the new object.
  toggleObject[toggleField] = !toggleObject[toggleField]

  dispatch({ type: Settings.TOGGLE_LOCAL, name, settings: base })
  return true
}

// `name` for logging purposes.
export const updateGlobalSettings = (dispatch, name, updates) =>
  dispatch({ type: Settings.UPDATE_GLOBAL, name, updates })

export const resetSettings = (dispatch, name) =>
  dispatch({ type: Settings.RESET_LOCAL, name })

export const resetGlobalSettings = (dispatch, name) =>
  dispatch({ type: Settings.RESET_GLOBAL, name })

// Action creators below will return true if successful, and false on not-found error.

// Save the currently-being-viewed settings under `key`.
export const saveSettingsAs = (dispatch, name, key, current, saved) =>
{
  if (!name) return false // no empty / null names.
  const indexOf = saved.findIndex(s => s.key === key)
  const updated = { ...current, key }
  const savedSettings = indexOf === -1 ? [ ...saved, { ...updated } ] :
    Object.assign([ ...saved ], { [indexOf]: { ...updated } })
  dispatch({ type: Settings.SAVE_AS, name, updated, savedSettings })
  return true
}

export const saveSettings = (dispatch, name, current, saved) =>
{
  if (!current.key) return false
  const indexOf = saved.findIndex(s => s.key === current.key)
  const savedSettings = indexOf === -1 ? [ ...saved, current ] :
    Object.assign([ ...saved ], { [indexOf]: current })

  dispatch({ type: Settings.SAVE, name, savedSettings })
  return true
}

export const loadSettings = (dispatch, name, key, saved) =>
{
  const settings = saved.find(s => s.key === key)
  if (!settings) { return false }
  dispatch({ type: Settings.LOAD, name, settings })
  return true
}

// TODO: handle deleting default
export const deleteSettings = (dispatch, name, key, saved) =>
{
  if (!saved.find(s => s.key === key)) { return false }
  const savedSettings = saved.filter(s => s.key !== key)
  dispatch({ type: Settings.DELETE, name, savedSettings })
  return true
}

export const setDefaultSettings = (dispatch, name, key, saved) =>
{
  if (!saved.find(s => s.key === key)) { return false }
  dispatch({ type: Settings.SET_DEFAULT, name, defaultKey: key })
  return true
}

// Mutations to settings must check to see if the current setting is the one
// being mutated to be consistent.
export const toggleFavoriteSettings = (dispatch, name, key, current, saved) =>
{
  const indexOf = saved.findIndex(s => s.key === key)
  if (indexOf === -1) { return false }
  const settings = saved[indexOf]
  const favorite = !settings.favorite
  const savedSettings = Object.assign([ ...saved ], 
    { [indexOf]: { ...settings, favorite } })

  dispatch({ type: Settings.TOGGLE_FAVORITE, name, savedSettings })
  dispatch(
    { type: Settings.LOAD_METADATA, name, settings: savedSettings[indexOf] })
  return true
}

// Taken from array-move
const arrayMove = (array, oldIndex, newIndex) => {
  if (newIndex >= array.length || oldIndex >= array.length) { return undefined }
  let newArray = [ ...array ]
  // In case the new index is out of range
  newArray.splice(newIndex, 0, newArray.splice(oldIndex, 1)[0]);
  return newArray; // for testing
}

export const reorderSettings = (dispatch, name, saved, indexFrom, indexTo) =>
{
  const savedSettings = arrayMove(saved, indexFrom, indexTo)
  if (!savedSettings) { return false }
  dispatch({ type: Settings.REORDER, name, savedSettings })
  return true
}

export const undoSettings = (dispatch, name) =>
  dispatch({ type: Settings.UNDO, name })

export const redoSettings = (dispatch, name) =>
  dispatch({ type: Settings.REDO, name })

// Notes...
// In order to have default settings that are consistent, I would need to
// modify `connectSettings` to always apply the initialSettings given to
// the state just like `updateSettings(initialSettings)`.
//
// This is because other components could connect to the same settings,
// which could then initialize the settings but without the correct
// `initialSettings` state.
//
// Also, they are `initialSettings` not `defaultSettings` b/c the latter refer
// to user created settings rather than programatically created ones.

// `settings.initialized`
// key-boolean pairs to determine which names were provided with
// `initialSettings`. If a component without `initialSettings`
// connects before one with initialSettings, the previously
// initialized settings must be overwritten by `initialSettings`.
// This is to preserve data integrity inside component props.
// This ALSO means ONLY ONE uniquely named connected component
// should provide `initialSettings`.

// Or should it? with a double key initialization method...
// 
// Here's a thought: make initialized settings based on the component name AND
// the propName. That way each component could get it's own saved slice of
// state which it knows exists. Pretty basic but super helpful.

// Connect settings, provide a default name (usually used for forms).
// TODO: Rework to push data logic to reducers to preserve data integrity. 
//       Currently `currentSettings` is stale if two settings actions get
//       processed one after another. 

// The first time a component has the connectSettings `mergeProps` called, it
// must push it's initialSettings.
// trigger another connection, and thus recurse until the stack explodes. 
// However, by maintaining a global var which marks which components have been
// initialized for a given name, we can see if we're initializing
let isInitializedFor = {} // name, component.name, bool
let dependenciesFor = {}  // name, array<dep>

const NULL_SETTINGS = {} // global null to avoid rerenders. Important lesson.

// Dependencies are based on all components connected to `name`, and are only
// statically defined, since otherwise the depencies list would be
// unnecessarily difficult to manage.  

export function connectSettings(component, options={}) {
  const initialSettings = options.initialSettings

  // Selectors pointing to state which must await `[state].initialized === true`
  const dependencies = options.dependencies || []

  // Immutable data related specifically to the component.
  // `componentSettings` isn't serialized, so it can hold functions / components
  const defaultName = options.name

  const mapStateToProps = state => ({ state })
  const mapDispatchToProps = dispatch => ({ dispatch })

  // This is janky but necessary to avoid recursive explosion. 


  // For the sake of convenience, we'll make it okay to call initSettings
  // multiple times. 
  const mergeProps = ({ state }, { dispatch }, ownProps={}) => {
    const propName = ownProps.name
    if (typeof propName !== "string" && typeof defaultName !== "string") {
      return {
        ...ownProps,
        initialized: false,
        settings: initialSettings || NULL_SETTINGS
      }
    }
    const name = propName ? propName : defaultName
    isInitializedFor[name] = isInitializedFor[name] || {}
    dependenciesFor[name] = dependenciesFor[name] || [] // Array of all deps.

    const stateSettings = state.settings.local[name] || {}
    const savedSettings = state.settings.saved[name] || [] // array

    // The `initialized` boolean is based on all components dependencies for a
    // given name.
    if (!isInitializedFor[name][component.name]) {
      dependenciesFor[name] = [ ...dependenciesFor[name], ...dependencies ]
    }
    const dependenciesInitialized = dependenciesFor[name].reduce(
      (isInit, dep) => isInit && dep(state), true)

    // This is to keep track of all `initialSettings` for use in `resetSettings`
    if (!stateSettings.data ||
       (!isInitializedFor[name][component.name] && initialSettings)) {
      initSettings(dispatch, name, component.name, initialSettings)
    }

    let settingsData = stateSettings.data || NULL_SETTINGS
    // This is reflecting what happens in the `init` method.
    const currentSettingsData =
      !isInitializedFor[name][component.name] && initialSettings ?
      { ...settingsData, ...initialSettings } : settingsData

    // Removing this line will cause settings updates to fail.
    isInitializedFor[name][component.name] = true
    return {
      name,

      initialized: stateSettings.data && dependenciesInitialized,
      canUndo: stateSettings.past && stateSettings.past.length > 0,
      canRedo: stateSettings.future && stateSettings.future.length > 0,

      settings: currentSettingsData,
      settingsKey: stateSettings.key,
      globalSettings: state.settings.global,
      savedSettings: state.settings.saved[name] || [],

      updateSettings: updates => updateSettings(dispatch, name, updates),
      applySettings: updates => applySettings(dispatch, name, stateSettings, updates),
      toggleSettings: (...fields) => toggleSettings(dispatch, name,
        stateSettings, fields),
      updateGlobalSettings: updates => updateGlobalSettings(
        dispatch, name, updates),
      resetSettings: () => resetSettings(dispatch, name),
      resetGlobalSettings: () => resetGlobalSettings(dispatch, name),

      // Async actions.
      saveSettingsAs: key => saveSettingsAs(dispatch, name, key,
        stateSettings, savedSettings),
      saveSettings: () => saveSettings(dispatch, name,
        stateSettings, savedSettings),
      loadSettings: key => loadSettings(dispatch, name, key,
        savedSettings),
      deleteSettings: key => deleteSettings(dispatch, name, key,
        savedSettings),

      setDefaultSettings: key => setDefaultSettings(dispatch, name, key,
        savedSettings),
      toggleFavoriteSettings: key => toggleFavoriteSettings(dispatch, name, key,
        stateSettings, savedSettings),
      
      reorderSettings: (from, to) => reorderSettings(dispatch, name,
        savedSettings, from, to),

      undoSettings: () => undoSettings(dispatch, name),
      redoSettings: () => redoSettings(dispatch, name),

      ...ownProps,
    }
  }

  return connect(mapStateToProps, mapDispatchToProps, mergeProps)(component)
}
