import createCachedSelector from 're-reselect'
import * as records from 'selectors/records'

import store from 'store'

import { compareDates, minDate } from 'util/date'

import {
  BaseDateSelector,
  FringeSelector,
  IndirectSelector,
} from 'selectors/date-records'

const aggregatePayment = {
  count: 0,
  manualCount: 0,
  paid: 0,
  budget: 0,
  manualFringe: 0,
  manualIndirect: 0,
  importedFringe: 0,
  importedIndirect: 0,
  fringe: 0,
  indirect: 0,
}

// Stores the `fund` as state, which means side effects, but they're worth it. 
class AccountPaymentSelector extends BaseDateSelector {

  constructor(account) {
    super()
    this.account = account || "all"
    this.paymentSelector = this.account !== "all"
      ? records.getAccountPaymentsCreator(this.account)
      : records.getPayments
  }

  // Given the fund `id` and date, find the running total, recurse for balance.
  // TODO: Test this with unit testing!
  dateSelector(state, id, date) {
    id = id || "all"

    // is_manual
    // -> has_fringe -> rate
    // -> has_indirect -> rate
    // !is_manual
    // -> is_fringe -> total
    // -> is_indirect -> total
    const payments = id === "all"
      ? records.groupBy(state, this.paymentSelector, "date").getArray(date)
      : this.groupDateRecords(state).getArray(id, date)
    const { editable_date } = records.getFundData(state)[id] || {}

    const accountData = records.getAccountData(state)
    // See `backend/api/models.py` for information on `editable_date`.
    const ignoreManual = compareDates(editable_date || minDate, date) >= 0

    let aggPayment = { ...aggregatePayment, date }
    // Assign a transactable id if it's relevant, for editing purposes.
    if (this.account !== "all" 
      && accountData[this.account].account_level === "transactable") {
      aggPayment.transactable = this.account
      aggPayment.fund = id
    }

    // Most efficient for loop. 
    for (var i = 0, len = payments.length; i < len; i++) {
      const {
        transactable,
        is_manual,
        paid,
        budget,
      } = payments[i]

      const transactableRecord = accountData[transactable]

      let fringe = 0, indirect = 0
      if (!is_manual) {
        const { is_fringe, is_indirect } = transactableRecord
        fringe = is_fringe ? paid : 0
        indirect = is_indirect ? paid : 0
        aggPayment.importedFringe += fringe
        aggPayment.importedIndirect += indirect
      } else if (!ignoreManual) {
        const { has_fringe, has_indirect, parent } = transactableRecord
        const { fringe_destination } = accountData[parent]
        fringe = has_fringe
          ? FringeSelector.selectDate(state, fringe_destination, date).rate * paid : 0

        indirect = has_indirect
          ? IndirectSelector.selectDate(state, id, date).rate * paid : 0
        aggPayment.manualFringe += fringe
        aggPayment.manualIndirect += indirect 
        aggPayment.manualCount += 1
      }

      if (!(is_manual && ignoreManual)) {
        aggPayment.count += 1
        aggPayment.paid += paid
        aggPayment.budget += budget
        aggPayment.fringe += fringe
        aggPayment.indirect += indirect
      }
    }

    return aggPayment
  }

  // We'll have to do caching by object reference. 
  getTimestamp(state, id, date) {
    const paymentTimestamp = super.getTimestamp(state, id, date)
    // If it's the "all" fund, we don't care about it's timestamp, since that
    // only refers to a funds manual ignore date. 
    const fund = id && id !== "all" ? records.getFundData(state)[id] : 0
    return Math.max(paymentTimestamp, fund.timestamp)
  }

  groupDateRecords(state) {
    return records.groupBy(state, this.paymentSelector, "fund", "date") 
  }
}

// We're going to have to change this.
export default createCachedSelector(
  account => account || "all",
  account => new AccountPaymentSelector(account),
)(
  account => account || "all",
)
