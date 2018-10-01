
const PAY_PERIOD_DATE_1 = 9
const PAY_PERIOD_DATE_2 = 24

// Helper functions for constructing range table data
const prevPayPeriodDate = function(dmy) {
  var payPeriod = new Date(dmy.valueOf())
  if (payPeriod.getDate() <= 9) {
    payPeriod.setDate(PAY_PERIOD_DATE_2)
    if (payPeriod.getMonth() === 0) {
      payPeriod.setMonth(11)
      payPeriod.setFullYear(payPeriod.getFullYear() - 1)
    } else {
      payPeriod.setMonth(payPeriod.getMonth() - 1)
    }
  } else if (payPeriod.getDate() > 24) {
    payPeriod.setDate(PAY_PERIOD_DATE_2)
  } else {
    payPeriod.setDate(PAY_PERIOD_DATE_1)
  }
  return payPeriod
}

// Helper functions for constructing range table data
const nextPayPeriodDate = function(dmy) {
  var payPeriod = new Date(dmy.valueOf())
  if (payPeriod.getDate() >= 24) {
    payPeriod.setDate(PAY_PERIOD_DATE_1)
    if (payPeriod.getMonth() === 11) {
      payPeriod.setMonth(0)
      payPeriod.setFullYear(payPeriod.getFullYear() + 1)
    } else {
      payPeriod.setMonth(payPeriod.getMonth() + 1)
    }
  } else if (payPeriod.getDate() < 9) {
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
  return toPayPeriodString(prevPayPeriodDate(Date(payPeriod)))
}

export const nextPayPeriod = (payPeriod) => {
  return toPayPeriodString(nextPayPeriodDate(Date(payPeriod)))
}

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

