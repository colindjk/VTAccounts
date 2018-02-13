import * as actionType from './types';

export const setToken = (data) => {
  return {
    type: actionType.SET_TOKEN,
    data
  }
}

export const fetchRecords = () => {
  return { type: actionType.FETCH_RECORDS }
}

// When using actions that are async and thus defined in sagas.js, we will add
// `ASYNC_` to the beginning of the type string.
export const updateTransaction = (transaction) => {
  return { type: "ASYNC_" + actionType.UPDATE_TRANSACTION, transaction }
}

