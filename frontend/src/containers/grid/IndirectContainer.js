import React from 'react'
import PropTypes from 'prop-types'
import { editors } from 'react-data-grid'
import { connect } from 'react-redux'

import * as actionType from 'actions/types'
import { DataGrid, RateEditor, RateFormatter } from 'components/grid'
import { deepCopy } from 'util/helpers'

import IndirectCache from 'selectors/payments/indirectCache'

const defaultIndirectColumn = {
  locked: false,
  isRange: true,
  editable: true,
  editor: RateEditor,
  formatter: RateFormatter,
  getRowMetaData: row => row,
  width: 100
}

// The container will decide what edit function will be triggered and what
// actions will be called.
class IndirectContainer extends React.Component {

  processColumns() {
    var initColumns = [
      {
        key: 'name',
        name: 'Name',
        locked: true,
        width: 350,
      },
      {
        key: 'code',
        name: 'Code',
        locked: true,
      },
    ]

    if (!this.props.context) return initColumns

    return initColumns.concat(this.props.context.range.map(date => ({
      ...defaultIndirectColumn,
      key: date,
      name: date,
    })))
  }

  // Will have an object passed as the lone parameter. 
  tryPutIndirect(indirect) {
    console.log("Putting indirect: ", indirect)
    this.props.putIndirect(indirect)
  }

  render() {
    if (!this.props.indirectCache.initialized) {
      return <div>Awaiting context submission...</div>
    }

    return <DataGrid
        data={this.props.indirectCache.indirectData}
        columns={this.processColumns()}
        updateRangeValue={this.tryPutIndirect.bind(this)}
      />
  }
}

function mapDispatchToProps(dispatch) {
  return ({
    putIndirect: indirect => {dispatch({ type: actionType.PUT_INDIRECT, indirect })}
  })
}

function makeMapStateToProps() {
  const indirectCache = new IndirectCache()

  const mapStateToProps = (state, props) => ({
      indirectCache: indirectCache.selectIndirects(state),
      context: state.ui.context,
    })
  return mapStateToProps
}

export default connect(makeMapStateToProps(), mapDispatchToProps)(IndirectContainer);

