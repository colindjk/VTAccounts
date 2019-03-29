import * as records from 'selectors/records'
import { compareDates, prevPayPeriod } from 'util/date'

import DateSelector from './BaseDateSelector'

// Similar to PaymentSelector, but instead selects by fund and includes all 
class FringeSelector extends DateSelector {

  // TODO: Test
  dateSelector(state, id, date) {
    const startDate = this.getEarliestDate(state, id)
    const currentFringe = this.groupDateRecords(state).getArray(id, date)[0]
    if (currentFringe) {
      return { ...currentFringe }
    }

    // No match found.
    const virtualFringe = { id: undefined, date, account: id, isVirtual: true }
    if (compareDates(startDate, date) === 1) {
      return { rate: 0.0, ...virtualFringe }
    } else {
      // There's a date before this, find it through recurse.
      return {
        ...this.selectDate(state, id, prevPayPeriod(date)),
        ...virtualFringe
      }
    }
  }

  getTimestamp(state, id, date) {
    return super.getTimestamp(state, id)
  }

  groupDateRecords(state) {
    return records.groupBy(state, records.getFringes, "account", "date") 
  }
}

export default new FringeSelector();
