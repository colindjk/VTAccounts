import DateSelector from './BaseDateSelector'
import { compareDates, prevPayPeriod } from 'util/date'

import * as records from 'selectors/records'

// Similar to PaymentSelector, but instead selects by fund and includes all 
class SalarySelector extends DateSelector {

  dateSelector(state, id, date) {
    const startDate = this.getEarliestDate(state, id)
    const currentSalary = this.groupDateRecords(state).getArray(id, date)[0]
    if (currentSalary) {
      return { ...currentSalary }
    }

    // No match found.
    const virtualSalary = { id: undefined, date, employee: id, isVirtual: true }
    if (compareDates(startDate, date) === 1) {
      return { total_ppay: 0, ...virtualSalary }
    } else {
      // There's a date before this, find it through recurse.
      return {
        ...this.selectDate(state, id, prevPayPeriod(date)),
        ...virtualSalary // overwrite `id` with null, add `isVirtual`.
      }
    }
  }

  getTimestamp(state, id, date) {
    return super.getTimestamp(state, id)
  }

  groupDateRecords(state) {
    return records.groupBy(state, records.getSalaries, "employee", "date")
  }
}

export default new SalarySelector();
