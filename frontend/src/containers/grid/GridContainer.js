import React from 'react'
import { connect } from 'react-redux'

import * as actionType from 'actions/types'

import { deepCopy } from 'util/helpers'

// This component will handle the special 'context'.
// For now we'll provide a static object as a context, and worry about the
// user handled configuration later.

const tempFunction = (range) => {
  let columns = [
    {
      key: 'name',
      name: 'Name',
      locked: true,
      width: 500
    },
    {
      key: 'code',
      name: 'Code',
      locked: true,
    },
  ];
  return columns.concat(range.map(date => {
    return {
      key: date,
      name: date,
      locked: false,
      isRange: true,
      editable: true,
      editor: PayPeriodEditor,
      formatter: ({ value }) => <div>{value.paid}</div>,
      width: 100
    } },
  ))
}

class AccountGridContainer extends React.Component {

  render() {
    return ()
  }
}

function mapDispatchToProps(dispatch) {
  return ({
    putPayment: payment => {dispatch({ type: actionType.PUT_PAYMENT, payment })}
  })
}

function mapStateToProps(state) {
  return ({
      data: state.view.data,
      rows: state.view.rows, // Soon to be in state.context.rows or something
      columns: state.view.columns
    })
}

export default connect(mapStateToProps, mapDispatchToProps)(AccountTreeGrid);

