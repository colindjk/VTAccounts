import React from 'react'
import { connect } from 'react-redux'

import * as actionType from 'actions/types'
import { Grid, PaymentEditor, PaymentFormatter } from 'components/grid'
import { deepCopy } from 'util/helpers'

// This component will handle the special 'context', and convert the context
// into the correct proptypes which are passed into the Grid component.
// For now we'll provide a static object as a context, and worry about the
// user handled configuration later.

const defaultPaymentColumn = {
  locked: false,
  isRange: true,
  editable: true,
  editor: PaymentEditor,
  formatter: ({ value }) => <div>{value.paid}</div>,
  width: 100
}

class GridContainer extends React.Component {

  processColumns() {
    var initColumns = [
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

    return initColumns.concat(this.props.context.range.map(date => ({
      ...defaultPaymentColumn,
      key: date,
      name: date,
    })))
  }

  render() {
    if (!this.props.context) {
      return <div>Loading GridContainer...</div>
    }
    const columns = this.processColumns()

    return <Grid 
        data={this.props.data}
        rows={this.props.rows}
        columns={this.processColumns()}
      />
  }
}

function mapDispatchToProps(dispatch) {
  return ({
    putPayment: payment => {dispatch({ type: actionType.PUT_PAYMENT, payment })}
  })
}

function mapStateToProps(state) {
  return ({
      data: state.accountTreeView.data,
      context: state.accountTreeView.currentContext,
      rows: state.accountTreeView.rows, // Soon to be in state.context.rows or something
    })
}

export default connect(mapStateToProps, mapDispatchToProps)(GridContainer);

