import { createSelector } from 'relesect'

export const getFunds = state => state.records.funds
export const getAccounts = state => state.records.accounts
export const getPayments = state => state.records.accounts

export const getFundPaymentsFactory = fund => state => getPayments(state)[fund]
export const getDatePaymentsFactory = (fund, date) => state => getPayments(state)[fund][date]

/* Example usage: 

const getFundAPayments = getFundPaymentsFactory("A")
const payments = getFundAPayments(state)

 */

