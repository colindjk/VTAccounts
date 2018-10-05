
export const setPaymentValue = ({ value, dependentValues }, input) => { 
  let isLoe = false
  let result = 0
  let updated = {}
  if (dependentValues.employee && dependentValues.employee[value.date].total_ppay !== 0) {
    isLoe = true
    updated.paid = (input / 100) * dependentValues.employee[value.date].total_ppay
  } else if (value) {
    updated[dependentValues.paymentType || 'paid'] = input
  } else {
    return {}
  }
  return { [value.date]: { ...value, ...updated } }
}

export const getPaymentValue = ({ value, dependentValues }) => { 
  let isLoe = false;
  let result = 0
  if (dependentValues.employee && dependentValues.employee[value.date].total_ppay !== 0) {
    isLoe = true
    result = (dependentValues[value.date].paid / dependentValues.employee[value.date].total_ppay) * 100
  } else if (value) {
    result = dependentValues[value.date][dependentValues.paymentType || 'paid']
  } else {
    return { result: 0, isLoe: false }
  }
  return { result, isLoe }
}

