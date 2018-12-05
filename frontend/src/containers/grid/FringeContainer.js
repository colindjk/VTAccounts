import React from 'react'
import PropTypes from 'prop-types'
import { editors } from 'react-data-grid'
import { connect } from 'react-redux'

import * as actionType from 'actions/types'
import { DataGrid, RateEditor, RateFormatter } from 'components/grid'
import { deepCopy } from 'util/helpers'

import FringeCache from 'selectors/payments/fringeCache'

const defaultFringeColumn = {
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
class FringeContainer extends React.Component {

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
      ...defaultFringeColumn,
      key: date,
      name: date,
    })))
  }

  // Will have an object passed as the lone parameter. 
  tryPutFringe(fringe) {
    console.log("Putting fringe: ", fringe)
    this.props.putFringe(fringe)
  }

  render() {
    if (!this.props.fringeCache.initialized) {
      return <div>Awaiting context submission...</div>
    }

    return <DataGrid
        data={this.props.fringeCache.fringeData}
        columns={this.processColumns()}
        updateRangeValue={this.tryPutFringe.bind(this)}
      />
  }
}

function mapDispatchToProps(dispatch) {
  return ({
    putFringe: fringe => {dispatch({ type: actionType.PUT_FRINGE, fringe })}
  })
}

function makeMapStateToProps() {
  const fringeCache = new FringeCache()

  const mapStateToProps = (state, props) => ({
      fringeCache: fringeCache.selectFringes(state),
      context: state.ui.context,
    })
  return mapStateToProps
}

export default connect(makeMapStateToProps(), mapDispatchToProps)(FringeContainer);

