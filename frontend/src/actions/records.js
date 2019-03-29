import { get, put } from 'actions/helpers'
import * as Api from 'actions/types/api'

// The `forceUpdate` will be used when editing from the data integrity tool.
export const putPayment   = data => ({ type: put(Api.PAYMENT), data })
export const putSalary    = data => ({ type: put(Api.SALARY), data })
export const putIndirect  = data => ({ type: put(Api.INDIRECT), data })
export const putFringe    = data => ({ type: put(Api.FRINGE), data })
export const putFund      = data => ({ type: put(Api.FUND), data })
export const putAccount   = data => ({ type: put(Api.ACCOUNT), data })
export const putEmployee  = data => ({ type: put(Api.EMPLOYEE), data })

export const putTransactionFile = 
  data => ({ type: put(Api.TRANSACTION_FILE), data })
export const putSalaryFile = 
  data => ({ type: put(Api.SALARY_FILE), data })

// For this query specifically, a query will not trigger if data has been loaded
// for the given file.
export const fetchTransactionMetadataFor = fileKey => 
  ({ type: get(Api.TRANSACTION_METADATA), fileKey })

// data = { username, password }
export const login = params => ({ type: Api.LOGIN, ...params })

