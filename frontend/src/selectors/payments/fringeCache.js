import createCachedSelector, {LruObjectCache, LruMapCache} from 're-reselect';
import { createSelector } from 'reselect'

import store from 'store'
import { isNewContextRange } from 'selectors/helpers'
import * as records from 'selectors/records'
import * as forms from 'selectors/forms'
import { deepCopy } from 'util/helpers'
import { getTimestamp } from 'actions/api/fetch'
import { prevPayPeriod, compareDates, getMaxDate } from 'util/payPeriod'

// This module will include cache related to account fringe data.

// Refreshes on request when based on a new range.
export default class FringeCache {
  constructor() {
    this.context = undefined

    this.fringeData = undefined // Stores a range of data.

    this.selectAccountFringes = createCachedSelector(
      (state) => state,
      (state, id) => id,
      (state, id, fringes) => fringes,
      (state, id, fringes, date) => date,
      (state, id, fringes, date, startDate) => startDate,

      (state, id, fringes) => fringes.updated_on,

      (state, id, fringes, date, startDate, _timestamp) => {
        const virtualFringe = { id: undefined, date, account: id, isVirtual: true }
        if (fringes[date]) {
          return { ...fringes[date] }
        }

        if (compareDates(startDate, date) === 1) {
          return { rate: 0, ...virtualFringe }
        } else {
          return {
            rate: 0,
            ...this.selectAccountFringes(state, id, fringes, prevPayPeriod(date), startDate),
            ...virtualFringe
          }
        }
      }
    )(
      (_, key, __, date) => {
        return `${key}.${date}`
      }
    )
  }

  selectFringes(state) {
    const { context } = state.ui
    if (!context || context.range === undefined) { return { initialized: false } }

    const { range } = context
    const { accounts, fringes } = state.records

    const shouldForceUpdate = isNewContextRange(state, this.context)
    this.context = context

    // `fringeData`: List of accounts with fringe data stored
    if (!this.fringeData) {
      let fringeData = {}
      for (var key in fringes.data) {
        fringeData[key] = accounts[key]
      }
      this.fringeData = fringeData
    }

    for (var id in fringes.data) {
      let account = this.fringeData[id]
      let accountFringes = fringes.data[id] || { data: {}, updated_on: 0 }
      const startDate = Object.keys(accountFringes.data).sort(compareDates)[0] || getMaxDate()

      if (account.updated_on !== accountFringes.updated_on || shouldForceUpdate) {
        range.forEach(date => {
          account[date] = this.selectAccountFringes(state, id, accountFringes.data, date, startDate)
        })
      }
      account.updated_on = accountFringes.updated_on
    }
    return { initialized: true, fringeData: this.fringeData }
  }

}

