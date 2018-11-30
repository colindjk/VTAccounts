import React from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import ReactDataGrid from 'react-data-grid'

import { getPaymentValue } from 'components/grid/helpers'

export default class PaymentFormatter extends React.Component { 
  shouldComponentUpdate(nextProps: any) {
    return this.props !== nextProps
  }

  render() {
    const { value } = this.props
    const isVirtual = value.isVirtual || false

    return <div virtual-value={isVirtual.toString()} title={value.rate.toFixed(2)}>{value.rate * 100}%</div>
  }
}


