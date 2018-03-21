import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import * as actionType from 'actions/types'
import { DataGrid, PaymentEditor, PaymentFormatter } from 'components/grid'
import { deepCopy } from 'util/helpers'

// TODO: 
// Employees:
// [x] - Map name / position # to account data fields (selectors?)
// [x] - Create salaries object relying on previous salaries
// [x] - Append salaries (somewhere) to figure out loe
// [x] - Conditional rendering of LOE / paid / budget (visual cues)
// [x] - Allow editability of salary data
// [ ] - Allow editability of data via loe.
// Structure:
// [ ] - Header Rows, as a part of context.
// [ ] - Fund Summary Data
// [ ] - Fund Summary View
// [ ] - reducer handled table manipulation
// [ ] - All things structure (processing logic)
// [ ] - Context menu for structure modification

// This component will handle the special 'context', and convert the context
// into the correct proptypes which are passed into the Grid component.
// For now we'll provide a static object as a context, and worry about the
// user handled configuration later.

const defaultPaymentColumn = {
  locked: false,
  isRange: true,
  editable: true,
  editor: PaymentEditor,
  formatter: PaymentFormatter,
  getRowMetaData: row => row,
  width: 100
}

// The container will decide what edit function will be triggered and what
// actions will be called.
class AccountTreeContainer extends React.Component {

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
      return <div>Loading AccountTreeContainer...</div>
    }
    console.log(this.props.headerRows)
    // FIXME: put this in a selector
    let rows = [ ...Object.keys(this.props.headerRows), ...this.props.structure.rows ]
    let data = { ...this.props.headerRows, ...this.props.accounts } 

    //rows={this.props.structure.rows}
    //data={this.props.accounts}
    return <DataGrid
        rows={rows}
        data={data}
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
      headerRows: state.accountTreeView.headerRows,
      //employees: state.accountTreeView.employees, // FIXME: append this to dependentValues
      context: state.accountTreeView.context,
      structure: state.accountTreeView.structure,
    })
}

export default connect(mapStateToProps, mapDispatchToProps)(AccountTreeContainer);

