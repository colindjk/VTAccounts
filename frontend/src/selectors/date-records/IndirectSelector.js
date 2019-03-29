import * as records from 'selectors/records'
import { compareDates, prevPayPeriod } from 'util/date'

import DateSelector from './BaseDateSelector'

// Similar to PaymentSelector, but instead selects by fund and includes all 
class IndirectSelector extends DateSelector {

  // TODO: Test
  dateSelector(state, id, date) {
    const startDate = this.getEarliestDate(state, id)
    const currentIndirect = this.groupDateRecords(state).getArray(id, date)[0]
    if (currentIndirect) {
      return { ...currentIndirect }
    }

    // No match found.
    const virtualIndirect = { id: undefined, date, fund: id, isVirtual: true }
    if (compareDates(startDate, date) === 1) {
      return { rate: 0.0, ...virtualIndirect }
    } else {
      // There's a date before this, find it through recurse.
      return {
        ...this.selectDate(state, id, prevPayPeriod(date)),
        ...virtualIndirect
      }
    }
  }

  getTimestamp(state, id, date) {
    return super.getTimestamp(state, id)
  }

  groupDateRecords(state) {
    return records.groupBy(state, records.getIndirects, "fund", "date") 
  }
}

export default new IndirectSelector();
