import * as actionType from 'actions/types';

export function success(action_type) {
  return action_type + "_SUCCESS"
}

export function failure(action_type) {
  return action_type + "_FAILURE"
}


export const setToken = (data) => {
  return {
    type: actionType.SET_TOKEN,
    data
  }
}

export const fetchRecords = () => {
  return { type: actionType.FETCH_RECORDS }
}

