import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import ReactDataGrid from 'react-data-grid';

import { getPaymentValue } from 'components/grid/helpers'

export default class PaymentFormatter extends React.Component { 
  shouldComponentUpdate(nextProps: any) {
    return this.props !== nextProps
  }

  render() {
    const { isLoe, result } = getPaymentValue(this.props)
    var value = ''
    if (isLoe) {
      value = Math.round(result) + '%'
    } else {
      value = Math.round(result)
    }

    return <div title={result.toFixed(2)}>{value}</div>
  }
}

