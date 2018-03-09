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
      value = result
    }

    return <div title={Math.round(result * 100) / 100}>{value}</div>
  }
}

