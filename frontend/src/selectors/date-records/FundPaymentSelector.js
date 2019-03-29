import createCachedSelector from 're-reselect'
import * as records from 'selectors/records'

import DateSelector from './BaseDateSelector'

const defaultAggregates = { paid: 0, budget: 0, count: 0 }

// Stores the `fund` as state, which means side effects, but they're worth it. 
class PaymentSelector extends DateSelector {

  // PaymentSelector's are created for specific funds, and filter on the given
  // fund for all calculations. 
  constructor(fund) {
    super()
    this.fund = fund || "all"
    this.paymentSelector = this.fund !== "all"
      ? records.getFundPaymentsCreator(this.fund)
      : records.getPayments
  }

  // If transactable, aggregate values, if not aggregate child values.
  dateSelector(state, id, date) {
    const accounts = records.getAccountData(state)
    const account = accounts[id]
    let basePayment = { date, fund: this.fund, ...defaultAggregates }

    // Checked for efficiency, for some reason forEach is faster when checking
    // `selectRelatedRecords`, and a loop is faster for `account.children`.
    if (account.account_level === "transactable") {
      basePayment.transactable = id // necessary for succesful updates.
      this.selectRelatedRecords(state, id, date).forEach(payment => {
        basePayment.paid = basePayment.paid + payment.paid
        basePayment.budget = basePayment.budget + payment.budget
        basePayment.count = basePayment.count + 1
      })
    } else {
      for (var i = 0; i < account.children.length; i++) {
        const payment = this.selectDate(state, account.children[i], date)
        basePayment.paid = basePayment.paid + payment.paid
        basePayment.budget = basePayment.budget + payment.budget
        basePayment.count = basePayment.count + payment.count
      }
    }
    return basePayment
  }

  selectRelatedRecords(state, id, date) {
    return super.selectRelatedRecords(state, date, id)
  }

  // Adjusted so that the PaymentSelector can still fit the standard format of:
  // selectDate()
  getTimestamp(state, id, date) {
    if (id && date) {
      return super.getTimestamp(state, date, id) // Notice the subtle swap.
    }
    if (id) {
      return records.groupBy(state,
        this.paymentSelector, "transactable").get(id).timestamp
    }
    return 0
  }

  getCount(state, id, date) {
    return super.getCount(state, date, id)
  }

  // This is used during getTimestamp to assure record-date level cache granularity.
  groupDateRecords(state) {
    return records.groupBy(state, this.paymentSelector, "date", "transactable")
  }
}

// Note: modules are only ever evaluated once.
export default createCachedSelector(
  fund => fund || "all",
  fund => new PaymentSelector(fund),
)(
  fund => fund || "all"
)
