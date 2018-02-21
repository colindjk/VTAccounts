import React from 'react'
import ReactDataGrid from 'react-data-grid'
import { connect } from 'react-redux'

import * as actionType from 'actions/types'

import { deepCopy } from 'util/helpers'

// TODO: Now that we have the basic thing working, get state management into the sagas, 
// And then, make room for on the fly features, and editability!
export class AccountTreeGrid extends React.Component {

  constructor(props) {
    super(props);

    // TODO: Store this stuff in the state via actions, even as a container, there should be no direct state modification.
    this.state = {
      expanded: {},
      rows: []
    };
  }

  arraySubRows(row, expanded) {
    if (!row.children) {
      return [];
    }
    var subRows = row.children.slice(0); // Shallow copy, avoid modifying children
    for (var i = 0; i < row.children.length; i++) {
      if (expanded[row.children[i]]) {
        subRows.splice(i + 1, 0, ...this.arraySubRows(this.props.data[row.children[i]], expanded));
      }
    }
    return subRows;
  }

  numSubRows(row, expanded) {
    if (!row.children) {
      return 0;
    }
    var num = row.children.length;
    for (var i = 0; i < row.children.length; i++) {
      if (expanded[row.children[i]]) {
        num += this.numSubRows(this.props.data[row.children[i]], expanded);
      }
    }
    return num;
  }

  getRows(i) {
    return this.props.data[this.state.rows[i]];
  }

  getSubRowDetails(rowItem) {
    let isExpanded = this.state.expanded[rowItem.id] ? this.state.expanded[rowItem.id] : false;

    // Return the `expandArgs` later used for "onCellExpand".
    return {
      group: rowItem.children.length > 0,
      expanded: isExpanded,
      children: null,
      field: 'name', // Where we put the arrow
      treeDepth: rowItem.treeDepth || 0,
      siblingIndex: rowItem.siblingIndex,
      numberSiblings: rowItem.numberSiblings
    };
  }

  // TODO : Get rid of all of the `this.state` accesses.
  expandCell(row) {
    console.log("expandCell");
    console.log(row.id)
    if (this.state.expanded && !this.state.expanded[row.id]) {
      this.state.expanded[row.id] = true;
      this.updateSubRowDetails(row.children.map((id) => this.props.data[id]), row.treeDepth);
      this.state.rows.splice(this.state.rows.indexOf(row.id) + 1, 0,
        ...this.arraySubRows(row, this.state.expanded));
    } else if (this.state.expanded[row.id]) {
      this.state.expanded[row.id] = false;
      this.state.rows.splice(this.state.rows.indexOf(row.id) + 1,
        this.numSubRows(row, this.state.expanded));
    }
    this.setState(this.state);
  }

  // Called when a cellExpand button is clicked, either adds or removes children
  // based on the rows current state.
  onCellExpand(args) {
    let rows = this.state.rows.slice(0);
    let rowKey = args.rowData.id;
    let rowIndex = rows.indexOf(args.rowData.id);

    if (args.rowData.children) {
      this.expandCell(args.rowData);
      return;
    }
  }

  updateSubRowDetails(subRows, parentTreeDepth) {
    let treeDepth = parentTreeDepth || 0;
    subRows.forEach((sr, i) => {
      sr.treeDepth = treeDepth + 1;
      sr.siblingIndex = i;
      sr.numberSiblings = subRows.length;
    });
  }

  render() {
    if (!this.props.rows) {
      return (<div>Loading...</div>)
    }
    if (this.state.rows.length === 0) { this.state.rows = deepCopy(this.props.rows) }
    //if (this.state.rows.length === 0) {
      //this.state.rows = deepCopy([this.props.data['root']]) }
    console.log(this.state.rows)
    return (<ReactDataGrid
      enableCellSelect={true}
      columns={this.props.columns} // TODO: columns in props?
      rowGetter={this.getRows.bind(this)}
      rowsCount={this.state.rows.length}
      getSubRowDetails={this.getSubRowDetails.bind(this)}
      minHeight={1000}
      onCellExpand={this.onCellExpand.bind(this)} />);
    return (<div>No</div>)
  }
}

function mapDispatchToProps(dispatch) {
  return ({
    putPayments: (payments) => {dispatch({ type: actionType.PUT_PAYMENT, payments })}
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

