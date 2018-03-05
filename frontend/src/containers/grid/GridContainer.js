import React from 'react'
import { connect } from 'react-redux'

import * as actionType from 'actions/types'
import { Grid, PaymentEditor, /*PaymentFormatter*/ } from 'components/grid'
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

// The container will decide what edit function will be triggered and what
// actions will be called.
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

  // Will have an object passed as the lone parameter. 
  tryPutPayment(payment) {
    this.props.putPayment(payment)
  }

  render() {
    if (!this.props.context) {
      return <div>Loading GridContainer...</div>
    }

    return <Grid
        rows={this.props.structure.rows}
        data={this.props.accounts}
        expanded={this.props.structure.expanded}
        columns={this.processColumns()}
        updateRangeValue={this.tryPutPayment.bind(this)}
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
      accounts: state.accountTreeView.accounts,
      context: state.accountTreeView.context,
      structure: state.accountTreeView.structure,
    })
}

export default connect(mapStateToProps, mapDispatchToProps)(GridContainer);

