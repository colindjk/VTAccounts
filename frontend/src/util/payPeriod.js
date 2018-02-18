
const PAY_PERIOD_DATE_1 = 9
const PAY_PERIOD_DATE_2 = 24

Date.prototype.toPayPeriodString = function() {
  return this.getFullYear() + '-' + this.getMonth() + '-' + this.getDate()
}

// Helper functions for constructing range table data
Date.prototype.prevPayPeriod = function() {
  var payPeriod = new Date(this.valueOf())
  if (payPeriod.getDate() < 9) {
    payPeriod.setDate(PAY_PERIOD_DATE_2)
    if (payPeriod.getMonth() === 0) {
      payPeriod.setMonth(11)
      payPeriod.setFullYear(payPeriod.getFullYear() - 1)
    } else {
      payPeriod.setMonth(payPeriod.getMonth() - 1)
    }
  } else if (payPeriod.getDate() >= 24) {
    payPeriod.setDate(PAY_PERIOD_DATE_2)
  } else {
    payPeriod.setDate(PAY_PERIOD_DATE_1)
  }
  return payPeriod
}

// Helper functions for constructing range table data
Date.prototype.nextPayPeriod = function() {
  var payPeriod = new Date(this.valueOf())
  if (payPeriod.getDate() > 24) {
    payPeriod.setDate(PAY_PERIOD_DATE_1)
    if (payPeriod.getMonth() === 11) {
      payPeriod.setMonth(0)
      payPeriod.setFullYear(payPeriod.getFullYear() + 1)
    } else {
      payPeriod.setMonth(payPeriod.getMonth() + 1)
    }
  } else if (payPeriod.getDate() <= 9) {
    payPeriod.setDate(PAY_PERIOD_DATE_1)
  } else {
    payPeriod.setDate(PAY_PERIOD_DATE_2)
  }
  return payPeriod
}

Date.prototype.toPayPeriodString = function() {
  return this.getFullYear() + '-' + (this.getMonth() + 1) + '-' + this.getDate()
}

function getPayPeriodRange(startDate, endDate) {
  var range = []
  var cur = startDate.prevPayPeriod()
  var end = endDate.nextPayPeriod()
  
  while (cur < end) {
    range.push(cur.toPayPeriodString())
    cur = cur.nextPayPeriod()
  }
  return range
}

