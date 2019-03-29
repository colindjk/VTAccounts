import createCachedSelector from 're-reselect'
import * as records from 'selectors/records'

import store from 'store'

import { compareDates, prevPayPeriod, minDate } from 'util/date'

import {
  AccountPaymentSelector,
  BaseDateSelector,
} from 'selectors/date-records'

// Large object, but this can be afforded since it doesn't take long to
// calculate.
const combineAggregatedPayments = (a, b) => ({
  // Retain fields for editing purposes
  date: a.date,
  transactable: a.transactable,
  fund: a.fund,

  count:            a.count,
  manualCount:      a.manualCount,
  paid:             a.paid,
  budget:           a.budget,
  manualFringe:     a.manualFringe,
  manualIndirect:   a.manualIndirect,
  importedFringe:   a.importedFringe,
  importedIndirect: a.importedIndirect,
  fringe:           a.fringe,
  indirect:         a.indirect,
  balance:          a.budget - a.paid,

  runningCount:
    a.runningCount                   + b.runningCount,
  runningManualCount:
    a.runningManualCount             + b.runningManualCount,
  runningPaid:
    a.runningPaid                    + b.runningPaid,
  runningBudget:
    a.runningBudget                  + b.runningBudget,
  runningManualFringe:
    a.runningManualFringe            + b.runningManualFringe,
  runningManualIndirect:
    a.runningManualIndirect          + b.runningManualIndirect,
  runningImportedFringe:
    a.runningImportedFringe          + b.runningImportedFringe,
  runningImportedIndirect:
    a.runningImportedIndirect        + b.runningImportedIndirect,
  runningFringe:
    a.runningFringe                  + b.runningFringe,
  runningIndirect:
    a.runningIndirect                + b.runningIndirect,
  runningBalance:
    a.runningBudget - a.runningPaid - a.runningManualFringe - a.runningManualIndirect
  + b.runningBudget - b.runningPaid - b.runningManualFringe - b.runningManualIndirect,
})

const intoAggregatePayment = payment => ({
  ...payment,
  balance: payment.budget - payment.paid,

  runningCount: payment.count,
  runningManualCount: payment.manualCount,
  runningPaid: payment.paid,
  runningBudget: payment.budget,
  runningManualFringe: payment.manualFringe,
  runningManualIndirect: payment.manualIndirect,
  runningImportedFringe: payment.importedFringe,
  runningImportedIndirect: payment.importedIndirect,
  runningFringe: payment.fringe,
  runningIndirect: payment.indirect,
  runningBalance: payment.budget - payment.paid,
})

// Extends AccountPaymentSelector for convenience, still uses the calculations
// from AccountPaymentSelector instances created in `./AccountPaymentSelector`
class AccountBalanceSelector extends BaseDateSelector {

  constructor(account) {
    super()
    this.account = account || "all"
    this.paymentDateSelector = AccountPaymentSelector(this.account)
    this.paymentSelector = this.paymentDateSelector.paymentSelector
  }

  dateSelector(state, id, date) {
    // Note: we could call `super` here, but we'd be recalculating values. 
    let payment = this.paymentDateSelector.selectDate(state, id, date)
    payment = intoAggregatePayment(payment)

    const startDate = this.getEarliestDate(state, id)
    if (compareDates(startDate, date) === 1) {
      return payment
    } else {
      // Make sure to pass `payment` first to have the correct date.
      return combineAggregatedPayments(
        payment,
        this.selectDate(state, id, prevPayPeriod(date)),
      )
    }
  }

  getTimestamp(state, id) {
    return this.groupDateRecords(state).get(id).timestamp
  }

  groupDateRecords(state) {
    return records.groupBy(state, this.paymentSelector, "fund", "date") 
  }
}

// We're going to have to change this.
export default createCachedSelector(
  account => account || "all",
  account => new AccountBalanceSelector(account),
)(
  account => account || "all",
)
