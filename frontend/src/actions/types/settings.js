// Things to do with the react-data-grid library.

export const INIT_STATE = "INITIALIZE_STATE"

// Update global or local UI settings. There's no init, when the component
// retreives state from the store, a default value will be supplied. This
// default will be passed to the action creator. 
export const UPDATE_LOCAL = "UPDATE_LOCAL_SETTINGS"
export const TOGGLE_LOCAL = "TOGGLE_LOCAL_SETTINGS"
export const APPLY_LOCAL = "APPLY_LOCAL_SETTINGS"
export const UPDATE_GLOBAL = "UPDATE_GLOBAL_SETTINGS"

export const INIT = "INITIALIZE_SETTINGS"
export const SAVE_AS = "SAVE_AS_SETTINGS"
export const SAVE = "SAVE_SETTINGS"
export const LOAD = "LOAD_SETTINGS"
export const LOAD_METADATA = "LOAD_SETTINGS_METADATA"
export const DELETE = "DELETE_SETTINGS"
export const SET_DEFAULT = "SET_DEFAULT_SETTINGS"
export const TOGGLE_FAVORITE = "TOGGLE_FAVORITE_SETTINGS"
export const REORDER = "REORDER_SETTINGS"

export const UNDO = "UNDO_SETTINGS"
export const REDO = "REDO_SETTINGS"

export const RESET_GLOBAL = "RESET_GLOBAL_SETTINGS"
export const RESET_LOCAL = "RESET_LOCAL_SETTINGS"

