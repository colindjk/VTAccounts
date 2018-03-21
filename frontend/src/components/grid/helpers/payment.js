
export const setPaymentValue = ({ value, dependentValues }, newValue) => { 
  console.log(value)
}

export const getPaymentValue = ({ value, dependentValues }) => { 
  let isLoe = false;
  let result = 0
  if (dependentValues.isEmployee && dependentValues.salaries[value.date].total_ppay !== 0) {
    isLoe = true
    result = (dependentValues[value.date].paid / dependentValues.salaries[value.date].total_ppay) * 100
  } else {
    result = dependentValues[value.date][dependentValues.paymentType || 'paid']
  }
  return { result, isLoe }
}

