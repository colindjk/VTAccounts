// The various action types.

// Below API Endpoint accessors, see 'config/Api.js' for more details.
//
// Note the difference between 'config/Api.js', where the endpoint names are
// plural, here they are singular to clarify the differences.
export const FUND='FUND'
export const ACCOUNT='ACCOUNT'
export const EMPLOYEE='EMPLOYEE'

// Range-able records, these will be organized by their fields
export const PAYMENT='PAYMENT'
export const SALARY='SALARY'
export const FRINGE='FRINGE'
export const INDIRECT='INDIRECT'

// File importing will happen as such
// get -> Retrieve (usually all) files
// put -> POST a file to the destination, thus importing transactions.
// del -> Remove the file from the database, along with 'associated records'.
export const TRANSACTION_FILE='TRANSACTION_FILE'
export const SALARY_FILE='SALARY_FILE'

export const TRANSACTION_METADATA='TRANSACTION_METADATA'

// Below are non data related 
// Unique in that it is retreived from the database. Yeah. 
export const SETTINGS='SETTINGS'

// API Authentication
export const LOGIN='LOGIN'
// Our API does not yet support logging out, so this does not contact the server.
export const LOGOUT='LOGOUT'

