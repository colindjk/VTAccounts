import { param } from 'util/helpers'

const URL="http://localhost:8000/api"

export function url(extension, queryParams) {
  if (queryParams) {
    return URL + extension + param(queryParams)
  } else {
    return URL + extension
  }
}

// Range data
export const PAYMENTS="/payments/"
export const PAYMENTS_SUMMARY="/payments/summary/transactable/"
export const PAYMENTS_FUND_SUMMARY="/payments/summary/fund/"

// 1-to-1 model queries
export const FUNDS="/funds/"
export const ACCOUNT_TREE="/accounts/"
export const EMPLOYEES="/employees/"
