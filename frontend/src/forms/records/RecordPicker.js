import React from 'react'
import { connectSettings } from 'actions/settings'

import * as Api from 'actions/types/api'

import {
  FundPicker,
  EmployeePicker,
  TransactionFilePicker,
} from 'forms/records'

const RecordPicker = ({
  name,
  recordType,
  settings: {
    fund, employee, file
  },
  updateSettings,
}) => {
  switch (recordType) {
    case Api.FUND: 
      return (
        <FundPicker
          currentFund={fund}
          submitFund={fund => updateSettings({ fund }) }
        />
      )
    case Api.EMPLOYEE:
      return (
        <EmployeePicker
          currentEmployee={employee}
          submitEmployee={employee => updateSettings({ employee }) }
        />
      )
    case Api.TRANSACTION_FILE:
      return (
        <TransactionFilePicker
          currentFile={file}
          submitFile={file => updateSettings({ file })}
        />
      )
    default: console.error("Invalid recordType given")
  }
  return <div>Error: Invalid recordType</div>
}


export default connectSettings(RecordPicker)
