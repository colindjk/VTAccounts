// Temporary function for testing
export const SET_TOKEN = "SET_TOKEN"

// TODO: Create a set of initialization actions which will run on app startup.
//        The rest of the app can then act like that data will always exist.

/* Actions related to server queries */
export const INIT_RECORDS = "INIT_RECORDS"
export const FETCH_PAYMENTS = "FETCH_PAYMENTS"
export const FETCH_SALARIES = "FETCH_SALARIES"
export const FETCH_FUNDS = "FETCH_FUNDS"
export const FETCH_ACCOUNTS = "FETCH_ACCOUNTS"
export const FETCH_EMPLOYEES = "FETCH_EMPLOYEES"

// Summary fetches occur when rendering a page with summary data that is not
// loaded or old.
export const FETCH_FUND_SUMMARY_PAYMENTS = "FETCH_FUND_SUMMARY_PAYMENTS"

export const FETCH_ACCOUNT_TREE = "FETCH_ACCOUNT_TREE"

export const PUT_PAYMENT = "PUT_PAYMENT"
export const PUT_SALARY = "PUT_SALARY"

// Initializes the AccountTreeState.
export const INITIALIZE_ACCOUNT_TREE = "INITIALIZE_ACCOUNT_TREE"

// Sets up intradependent aspects of the AccountTree
export const UPDATE_ACCOUNT_TREE = "UPDATE_ACCOUNT_TREE"
export const UPDATE_ACCOUNT_TREE_EMPLOYEES = "UPDATE_ACCOUNT_TREE_EMPLOYEES"
export const SET_ACCOUNT_TREE_CONTEXT = "SET_ACCOUNT_TREE_CONTEXT"
export const SET_ACCOUNT_TREE_STRUCTURE = "SET_ACCOUNT_TREE_STRUCTURE"

