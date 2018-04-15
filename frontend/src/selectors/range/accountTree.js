import createCachedSelector from 're-reselect'
import { createSelector } from 'reselect'

import store from 'store'
import * as records from 'selectors/records'
import * as forms from 'selectors/forms'
import { deepCopy } from 'util/helpers'

const makeGetPaymentSummary = state => (fund, date) => account => {
  // Use cached selector to aggregate.
}

// Holds the cached selector as a field, is responsible for clearing cache
// entries when payment modification / invalidation occurs. 
// Acts as a selector which watches accountTree.context, and returns computed
// data based on the fund and range.
class AccountTreeCache {

  // Takes the state as an argument and copies the accounts into a local variable.
  constructor(state) {
    this.accounts = deepCopy(records.getAccounts(state))
    this.payPeriodSelectorFactory = createCachedSelector(
      records.getAccounts,
      records.getPayments,

    )(
      (state, fund, account, date) => "" + fund.id + "_" + account.id + "_" + date
    )
  }

  resetAccounts() {
    this.accounts = deepCopy(records.getAccounts(state))
  }

  // The magical thing about this selector, is that it keeps the "response"
  // of the previous select so long as the contextMenu remains the same.
  // If no contextMenu change is detected, the fields (dates) in payments[fund]
  // will each be checked, on a change, the selector will merge the results of
  // the calculations with its own internal value. 
  select(state) {

  }

}

// This class will store an internal variable which will pertain to the given
// accountTree used by the AccountTreeContainer and other objects.
// This will return the calculated table. 
// 

export default AccountTreeCache()

