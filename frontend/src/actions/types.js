// BEGIN: sync, these actions will be used in sync.js


// BEGIN: async, these actions will be used inside sagas.js
// They are not async themselves, but instead called from within
// async functions.
export const SET_TOKEN = "SET_TOKEN";

// async: fetch, sync: set
export const FETCH_RECORDS = "FETCH_RECORDS";
export const SET_RECORDS = "SET_RECORDS";

export const UPDATE_TRANSACTION = "UPDATE_TRANSACTION";
export const CREATE_TRANSACTION = "CREATE_TRANSACTION";

