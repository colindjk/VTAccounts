import { param } from 'util/helpers'

const URL="http://localhost:8000/api"

// Range data
export const PAYMENTS=URL + "/payments/"
export const SALARIES=URL + "/salaries/"
export const PAYMENTS_SUMMARY=URL + "/payments/summary/transactable/"
export const PAYMENTS_FUND_SUMMARY=URL + "/payments/summary/fund/"

// 1-to-1 model queries
export const FUNDS=URL + "/funds/"
export const ACCOUNTS=URL + "/accounts/"
export const EMPLOYEES=URL + "/employees/"

// File importing
export const IMPORT_TRANSACTIONS=URL + "/transactions/import/"

