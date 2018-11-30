
export const defaultAggregates = { paid: 0, budget: 0, count: 0, }

// Helper function which aggregates two payments together.
export const combinePayments = (paymentA, paymentB) => {
  return { 
    ...paymentA,
    paid: paymentA.paid + paymentB.paid,
    budget: paymentA.budget + paymentB.budget,
    count: paymentA.count || 0 + paymentB.count || 0,
  }
}

export const isNewContextRange = (state, context) => {
  const stateContext = state.ui.context
  return !(stateContext && context &&
    stateContext.startDate === context.startDate &&
    stateContext.endDate === context.endDate)
}

