import { payPeriodStart, payPeriodEnd } from 'util/date'

import React from 'react'
import { DateRangePicker } from 'react-dates'
import moment from 'moment'

import { connectSettings } from 'actions/settings'

class MyDateRangePicker extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      focusedInput: undefined
    }
  }

  shouldComponentUpdate({ globalSettings }, nextState) {
    const { startDate, endDate } = this.props.globalSettings
    const { focusedInput } = this.state
    return globalSettings.startDate !== startDate ||
           globalSettings.endDate !== endDate ||
           nextState.focusedInput !== focusedInput
  }

  render() { 
    const {
      globalSettings: { startDate, endDate },
      updateGlobalSettings
    } = this.props

    return (
      <DateRangePicker
        noBorder={false}
        orientation={'horizontal'}
        // TODO: start at fiscal year.
        initialVisibleMonth={() => {
          if (startDate) return startDate
          if (endDate) return endDate
          return moment(new Date()).add(-12, 'months')}
        }
        displayFormat={() => 'YYYY-MM-DD'}
        numberOfMonths={4}
        isOutsideRange={() => false}
        startDate={startDate}
        startDateId="startDate"
        endDate={endDate}
        endDateId="endDate"
        onDatesChange={({startDate, endDate}) => {
            updateGlobalSettings({
              startDate: payPeriodStart(startDate),
              endDate: payPeriodEnd(endDate)
            })}
        }
        focusedInput={this.state.focusedInput}
        onFocusChange={focusedInput => {
          this.setState({ focusedInput })
        }}
      />
    )
  }
}

export default connectSettings(
  MyDateRangePicker,
  { name: "forms_daterangepicker" }
)
