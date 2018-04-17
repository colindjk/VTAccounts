import createCachedSelector from 're-reselect'
import { createSelector } from 'reselect'

import store from 'store'
import * as records from 'selectors/records'
import * as forms from 'selectors/forms'
import { deepCopy } from 'util/helpers'

const makeGetPaymentSummary = state => (fund, date) => account => {
  // Use cached selector to aggregate.
}

// Holds a local copy of the data used by accountTree.
// Replaces slices of the internal accountTree based on cache miss.
// Any time and date + fund lands on a cache miss, the necessary calculations
// will be made.
// Header row calculations will be redone on each change in value, this shouldn't
// be a big deal though.
// We know when a payment changes because the entire 'date' will be changed in
// the internal state (see "reducers/" and "actions/api/put" for more info)
class AccountTreeCache {

  // If called before accounts is initialized... what happens?
  // -> technically that should never happen. 
  constructor() {
    console.log("In constructor!")
    this.payPeriodSelectorFactory = createCachedSelector(
      // each of the functions here will take all the parameters your selector is given
      // they can then return a single paramter so that the final function can simply
      // take those parameters as part of its selector.
      forms.getAccountTreeContextForm,
      records.getAccounts,
      records.getFunds,
      records.getPayments,
      (state, date) => date,
      (contextForm, accounts, funds, payments, date) => {
        console.log("selector", date)
        return accounts
      }
    )(
      (state, date) => {
        console.log("Internalzzz", state, date)

        return banana
      }
    )
  }

  resetAccounts(state) {
    this.accounts = deepCopy(records.getAccounts(state))
  }

  // Checks the internal value for the AccountTreeContext form which determines
  // fund / range.
  select(state) {
    console.log("Params:")
    console.log(this.payPeriodSelectorFactory(state, date))
  }

}

export default new AccountTreeCache()

