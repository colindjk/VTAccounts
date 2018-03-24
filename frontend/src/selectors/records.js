import { createSelector } from 'relesect'

export const getFunds = state => state.records.funds
export const getAccounts = state => state.records.accounts
export const getPayments = state => state.records.accounts

export const getFundPaymentsFactory = fund => state => getPayments(state)[fund]
export const getDatePaymentsFactory = (fund, date) => state => getFundPayments(state)[fund][date]

