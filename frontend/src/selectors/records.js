import { createSelector } from 'reselect'

export const getFunds = state => state.records.funds
export const getAccounts = state => state.records.accounts
export const getPayments = state => state.records.payments
export const getEmployees = state => state.records.employees

export const getFundPaymentsFactory = fund => state => getPayments(state)[fund]
export const getDatePaymentsFactory = (fund, date) => state => getPayments(state)[fund][date]

/* Example usage: 

const getFundAlphaPayments = getFundPaymentsFactory("Alpha")
const payments = getFundAlphaPayments(state)

 */

