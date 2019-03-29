
// Given a cell value from a grid, check to see if it is editable
export const isPaymentEditable = 
  payment => payment.transactable && payment.count <= 1 &&
             payment.fund && payment.fund !== "all"

