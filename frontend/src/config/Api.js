import { param } from 'util/helpers'

export const URL="http://localhost:8000/api"
export const LOGIN=URL + "/auth/"

// Range data
export const PAYMENTS=URL + "/payments/"
export const SALARIES=URL + "/salaries/"
export const FRINGES=URL + "/fringes/"
export const INDIRECTS=URL + "/indirects/"

// Summary of payments.
export const PAYMENTS_SUMMARY=URL + "/payments/summary/transactable/"
export const PAYMENTS_FUND_SUMMARY=URL + "/payments/summary/fund/"

// 1-to-1 model queries
export const FUNDS=URL + "/funds/"
export const ACCOUNTS=URL + "/accounts/"
export const EMPLOYEES=URL + "/employees/"

// File importing
export const IMPORT_TRANSACTIONS=URL + "/files/transactions/"
export const IMPORT_SALARIES=URL + "/files/salaries/"

