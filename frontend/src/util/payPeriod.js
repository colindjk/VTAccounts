
const PAY_PERIOD_DATE_1 = 10
const PAY_PERIOD_DATE_2 = 25

// Helper functions for constructing range table data
const prevPayPeriodDate = function(dmy) {
  var payPeriod = new Date(dmy.valueOf())
  if (payPeriod.getDate() <= PAY_PERIOD_DATE_1) {
    payPeriod.setDate(PAY_PERIOD_DATE_2)
    if (payPeriod.getMonth() === 0) {
      payPeriod.setMonth(11)
      payPeriod.setFullYear(payPeriod.getFullYear() - 1)
    } else {
      payPeriod.setMonth(payPeriod.getMonth() - 1)
    }
  } else if (payPeriod.getDate() > PAY_PERIOD_DATE_2) {
    payPeriod.setDate(PAY_PERIOD_DATE_2)
  } else {
    payPeriod.setDate(PAY_PERIOD_DATE_1)
  }
  return payPeriod
}

// Helper functions for constructing range table data
const nextPayPeriodDate = function(dmy) {
  var payPeriod = new Date(dmy.valueOf())
  if (payPeriod.getDate() >= PAY_PERIOD_DATE_2) {
    payPeriod.setDate(PAY_PERIOD_DATE_1)
    if (payPeriod.getMonth() === 11) {
      payPeriod.setMonth(0)
      payPeriod.setFullYear(payPeriod.getFullYear() + 1)
    } else {
      payPeriod.setMonth(payPeriod.getMonth() + 1)
    }
  } else if (payPeriod.getDate() < PAY_PERIOD_DATE_1) {
    payPeriod.setDate(PAY_PERIOD_DATE_1)
  } else {
    payPeriod.setDate(PAY_PERIOD_DATE_2)
  }
  return payPeriod
}

const toPayPeriodString = function(dmy) {
  let actualMonth = dmy.getMonth() + 1
  let month = actualMonth < 10 ? '0' + actualMonth : '' + actualMonth
  let date = dmy.getDate() < 10 ? '0' + dmy.getDate() : '' + dmy.getDate()
  return dmy.getFullYear() + '-' + month + '-' + date
}

export const prevPayPeriod = (payPeriod) => {
  return toPayPeriodString(prevPayPeriodDate(Date.parse(payPeriod)))
}

export const nextPayPeriod = (payPeriod) => {
  return toPayPeriodString(nextPayPeriodDate(Date.parse(payPeriod)))
}

// Three cases:
// dateA > dateB => 1
// dateA < dateB => -1
// dateA===dateB => 0
export const compareDates = (dateA, dateB) => {
  if (dateA === dateB) return 0

  // Date Format: YYYY-MM-DD
  let valsA = dateA.split('-').map(str => parseInt(str))
  let valsB = dateB.split('-').map(str => parseInt(str))

  // year  => 0
  // month => 1
  // day   => 2
  if (valsA[0] > valsB[0] ||
      valsA[0] === valsB[0] && valsA[1] > valsB[1] ||
      valsA[0] === valsB[0] && valsA[1] === valsB[1] && valsA[2] > valsB[2])
  {
    return 1
  } else {
    return -1
  }
}

export const getMaxDate = () => ("9999-12-31")
export const getMinDate = () => ("0000-00-00")

// startDate & endDate are strings of format: YYYY-MM-DD
// returns array of format [ "YYYY-MM-DD", ... ] in chronological order.
export function getPayPeriodRange(startDate, endDate) {
  var range = []
  var cur = prevPayPeriodDate(startDate)
  var end = nextPayPeriodDate(endDate)
  
  var i = 0, max = 1000
  while (cur < end) {
    range.push(toPayPeriodString(cur))
    cur = nextPayPeriodDate(cur)
    i++
    if (i == max) return range;
  }
  return range
}

