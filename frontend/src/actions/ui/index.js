import { success, failure } from 'actions'
import * as actionType from 'actions/types'
import { getPayPeriodRange } from 'util/payPeriod'


// If the contextForm includes a range, there must exist a startDate and
// endDate field.
export const submitContextForm = (contextForm) => {
  console.log("ACTION: ", actionType.SET_UI_CONTEXT, contextForm)
  let range
  if (contextForm.startDate && contextForm.endDate) {
    const { startDate, endDate } = contextForm
    range = getPayPeriodRange(startDate, endDate)
    console.log('range', startDate, endDate, range)
  }
  return {
    type: actionType.SET_UI_CONTEXT,
    context: { ...contextForm, range }
  }
}

// Replaces existing grid state with state passed in. 
// Used during updates to structure of grid. 
// NOTE: NOT USED when updating API data that the grid relies on, that happens
// at component level. 
// TODO: Add functionality for backend storage of JSON objects.
export const setGridState = (gridState) => {
  // Since this is currently synchronous, there is no way a "failure(action)" 
  // can occur.
  return { type: success(actionType.SET_GRID_STATE), gridState }
}

