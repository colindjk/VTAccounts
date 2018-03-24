import createCachedSelector from 're-reselect';
import * as records from 'selectors/records'

// Holds the cached selector as a field, is responsible for clearing cache
// entries when payment modification / invalidation occurs. 
// Cache by data set? cache by column? by row?
// How do we only update values without doing the all feared mega-merge?
//  - Possibly storing the data in the instance of this class, thus treating the
//    class instance as it's own cache with cache'd calculations.
//  - That first one is fine. 
class AccountTreeCache {
  constructor() {
    this.selectorFactory = createCachedSelector(
      records.getAccounts,

    )
  }


}



export default AccountTreeCache()

