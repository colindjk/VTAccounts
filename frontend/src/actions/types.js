// TODO: Create a set of initialization actions which will run on app startup.
//        The rest of the app can then act like that data will always exist.

/* Actions related to server queries */
export const AUTHENTICATION = "AUTHENTICATION"
export const INIT_RECORDS = "INIT_RECORDS"
export const FETCH_PAYMENTS = "FETCH_PAYMENTS"
export const FETCH_SALARIES = "FETCH_SALARIES"
export const FETCH_FUNDS = "FETCH_FUNDS"
export const FETCH_ACCOUNTS = "FETCH_ACCOUNTS"
export const FETCH_EMPLOYEES = "FETCH_EMPLOYEES"

export const FETCH_INDIRECTS = "FETCH_INDIRECT_RATES"
export const FETCH_FRINGES = "FETCH_FRINGE_RATES"

export const PUT_PAYMENT = "PUT_PAYMENT"
export const PUT_SALARY = "PUT_SALARY"
export const PUT_FRINGE = "PUT_FRINGE"
export const PUT_INDIRECT = "PUT_INDIRECT"

// vv DEPRECATED vv
// Initializes the AccountTreeState.
export const INITIALIZE_ACCOUNT_TREE = "INITIALIZE_ACCOUNT_TREE"

// Sets up intradependent aspects of the AccountTree

export const UPDATE_ACCOUNT_TREE = "UPDATE_ACCOUNT_TREE"
export const UPDATE_ACCOUNT_TREE_EMPLOYEES = "UPDATE_ACCOUNT_TREE_EMPLOYEES"
// ^^ DEPRECATED ^^

export const SET_ACCOUNT_TREE_CONTEXT = "SET_ACCOUNT_TREE_CONTEXT"
export const SET_ACCOUNT_TREE_STRUCTURE = "SET_ACCOUNT_TREE_STRUCTURE"

// User settings related...
export const FETCH_USER_SETTINGS = "FETCH_USER_SETTINGS"
export const PATCH_USER_SETTINGS = "PATCH_USER_SETTINGS"
export const CLONE_USER_SETTINGS = "CLONE_USER_SETTINGS"
export const RESET_USER_SETTINGS = "RESET_USER_SETTINGS"

// Synchronous ui updates.
export const INIT_UI_STATE = "INIT_UI_STATE"
export const SET_UI_CONTEXT = "SET_UI_CONTEXT"

// UPDATE vs PATCH: An update will modify the local
export const SET_GRID_STATE = "SET_STATE_GRID"
// Sends the grid state to the backend to trigger an update/save
export const PUSH_GRID_STATE = "PUSH_STATE_GRID"
export const PULL_GRID_STATE = "PULL_STATE_GRID"

