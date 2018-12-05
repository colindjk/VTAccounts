import createCachedSelector, {LruObjectCache, LruMapCache} from 're-reselect';
import { createSelector } from 'reselect'

import store from 'store'
import * as records from 'selectors/records'
import * as forms from 'selectors/forms'
import { deepCopy } from 'util/helpers'
import { getTimestamp } from 'actions/api/fetch'
import { prevPayPeriod, compareDates, getMaxDate } from 'util/payPeriod'

// This module will include some sagas and helpers related to employee data.

// Refreshes on request when based on a new range.
export default class IndirectCache {
  constructor() {
    this.context = undefined

    this.indirectData = undefined // Stores a range of data.

    this.selectFundIndirect = createCachedSelector(
      (state) => state,
      (state, id) => id,
      (state, id, indirects) => indirects,
      (state, id, indirects, date) => date,
      (state, id, indirects, date, startDate) => startDate,

      (state, id, indirects) => indirects.updated_on,

      (state, id, indirects, date, startDate, _timestamp) => {
        const virtualIndirect = { id: undefined, date, fund: id, isVirtual: true }
        if (indirects[date]) {
          return { ...indirects[date] }
        }

        if (compareDates(startDate, date) === 1) {
          return { rate: 0, ...virtualIndirect }
        } else {
          return {
            rate: 0,
            ...this.selectFundIndirect(state, id, indirects, prevPayPeriod(date), startDate),
            ...virtualIndirect
          }
        }
      }
    )(
      (_, key, __, date) => {
        return `${key}.${date}`
      }
    )
  }

  // Where indirectData is a copy of funds with indirect rates populated in.
  selectIndirects(state) {
    const { context } = state.ui
    if (!context || context.range === undefined) { return { initialized: false } }

    if (!this.indirectData) {
      this.indirectData = deepCopy(state.records.funds)
    }

    const { range } = context
    const { indirects, funds } = state.records

    for (var id in funds) {
      let fund = this.indirectData[id]
      let fundIndirects = indirects.data[id] || { data: {}, updated_on: 0 }
      const startDate = Object.keys(fundIndirects.data).sort(compareDates)[0] || getMaxDate()

      if (fund.updated_on !== fundIndirects.updated_on) {
        range.forEach(date => {
          fund[date] = this.selectFundIndirect(state, id, fundIndirects.data, date, startDate)
        })
      }
      fund.updated_on = fundIndirects.updated_on
    }
    return { initialized: true, indirectData: this.indirectData }
  }

}

