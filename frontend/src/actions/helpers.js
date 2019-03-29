// General helper functions for actions, which can be used around the app.

// All the types of server requests that this app uses.

export const get = (s) => "GET_" + s
export const put = (s) => "PUT_" + s
export const remove = (s) => "REMOVE_" + s

// The resulting state of a request upon completion.
export const success = (s) => s + "_SUCCESS"
export const failure = (s) => s + "_FAILURE"

// Returns undefined if no request type is identified. 
export const identifyRequestType = action => {
  if (!action || !action.type) return undefined
  switch (action.type.split('_')[0]) {
    case "GET": return "GET"
    case "PUT": return "PUT"
    case "REMOVE": return "REMOVE"
    default:
      return undefined
  }
}

// Returns undefined if no result type is identified. 
export const identifyResultType = action => {
  if (!action || !action.type) return undefined
  let parts = action.type.split("_")
  switch (parts[parts.length - 1]) {
    case "SUCCESS": return "SUCCESS"
    case "FAILURE": return "FAILURE"
    default:
      return undefined
  }
}

export const isSuccess = action => identifyResultType(action) === "SUCCESS"

export const identifyAction = action => {
  if (!action || !action.type) return undefined
  let actionType = action.type
  if (identifyRequestType(action)) {
    actionType = actionType
      .split('_').splice(1).join('_')
  if (identifyResultType(action))
    actionType = actionType
      .split('_').slice(0, -1).join('_')
  }
  return actionType
}
