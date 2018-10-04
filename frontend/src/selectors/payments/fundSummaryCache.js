import createCachedSelector, {LruObjectCache, LruMapCache} from 're-reselect';
import { createSelector } from 'reselect'

import store from 'store'
import * as records from 'selectors/records'
import * as forms from 'selectors/forms'
import { deepCopy } from 'util/helpers'
import { getTimestamp, getPayments } from 'actions/api/fetch'
import { prevPayPeriod, compareDates, getMaxDate } from 'util/payPeriod'

// This module will include some sagas and helpers related to employee data.

const defaultAggregates = { balance: 0, budget: 0, paid: 0, count: 0 }

// Helper function which aggregates two payments together.
const combinePayments = (paymentA, paymentB) => {
  return { 
    ...paymentA,
    paid: paymentA.paid + paymentB.paid,
    budget: paymentA.budget + paymentB.budget,
    balance: (paymentA.budget - paymentA.paid) + (paymentB.budget - paymentB.paid),
    count: paymentA.count || 0 + paymentB.count || 0,
  }
}

// To be used on the array found matching the fund, date, and transactable
const aggregatePayments = (transactablePayments, defaultPayment) => {
  let aggregate = { ...defaultPayment }
  for (var key in transactablePayments) {
    aggregate = combinePayments(transactablePayments[key], { ...aggregate })
  }
  aggregate.count = Object.keys(transactablePayments).length
  return aggregate
}

// Refreshes on request when based on a new range.
// TODO: Verify that recalculations are not occuring unnecessarily.
export default class FundSummaryCache {
  constructor() {
    this.context = undefined
    this.fundData = undefined // Stores a range of data.

    // Calculates a specific funds payment values.
    this.selectFundDatePayments = createCachedSelector(
      (state) => state,
      (state, fund) => fund,
      (state, fund, payments) => payments,
      (state, fund, payments, date) => date,
      (state, fund, payments, date, startDate) => startDate,

      // Note: Timestamp is based on just fund due to balance calculations.
      (state, fund, payments, date, startDate) => getTimestamp(payments, { fund }),

      (state, fund, payments, date, startDate, _timestamp) => {
        let payment = { fund, ...defaultAggregates }
        let fundDatePayments = getPayments(payments, { fund, date })

        for (var id in fundDatePayments) {
          let transactablePayments = fundDatePayments[id].data
          payment = aggregatePayments(transactablePayments, payment)
        }

        if (compareDates(startDate, date) === -1) {
          payment.balance = payment.balance + this.selectFundDatePayments(state, fund, payments, prevPayPeriod(date), startDate).balance
        }
        return payment
      }
    )(
      (state, id, payments, date, startDate, _timestamp) => {
        return `${id}-${date}`
      }
    )
  }

  // Returns payments populated funds as a whole.
  // TODO: Select single fund!!
  selectFunds(state) {
    const { context } = state.ui
    if (!context || context.range === undefined) { return { initialized: false } }

    if (!this.fundData) {
      this.fundData = deepCopy(state.records.funds)
    }

    const { range } = context
    const { funds, payments } = state.records

    for (var id in funds) {
      let fund = this.fundData[id]

      const startDate = (payments.data[id] && payments.data[id].data !== {}) ?
        Object.keys(payments.data[id].data).sort(compareDates)[0] :
        getMaxDate()

      const timestamp = getTimestamp(payments, { fund: fund.id })
      if (fund.updated_on !== timestamp) {
        // FIXME: Get 'latest' timestamp up to a point?
        range.forEach(date => {
          fund[date] = this.selectFundDatePayments(state, fund.id, payments, date, startDate, timestamp)
        })
      }
      fund.updated_on = timestamp
    }
    return { initialized: true, fundData: this.fundData }
  }

}

