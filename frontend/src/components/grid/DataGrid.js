import React from 'react'
import ReactDataGrid from 'react-data-grid'
import PropTypes from 'prop-types'

import { deepCopy } from 'util/helpers'

// This class acts as a wrapper for ReactDataGrid.
export default class DataGrid extends React.Component {

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

  getRow(i) {
    return this.props.data[this.state.rows[i]];
  }

  getSubRowDetails(rowItem) {
    let isExpanded = this.state.expanded[rowItem.id] ?
        this.state.expanded[rowItem.id] : false

    return {
      group: rowItem.children ? rowItem.children.length > 0 : false,
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
    //console.log(row.id)
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

  getColumn(columnKey) {
    for (var i = 0; i < this.props.columns.length; i++) {
      if (columnKey === this.props.columns[i].key) {
        return this.props.columns[i]
      }
    }
  }

  gridRowsUpdated({ fromRow, toRow, updated }) {

    let rows = this.state.rows.slice();

    for (let rowIndex = fromRow; rowIndex <= toRow; rowIndex++) {
      for (var columnKey in updated) {
        const column = this.getColumn(columnKey)
        if (column.isRange) {
          if (this.props.updateRangeValue)
            this.props.updateRangeValue(updated[columnKey])
        } else {
          if (this.props.updateRowValue)
            this.props.updateRowValue(this.getRow(rowIndex), updated)
        }
      }
    }
  }

  defaultRows() {
    var rows = []
    for (var key in this.props.data) {
      rows.push(key)
    }
    return rows
  }

  render() {

    if (this.state.rows.length === 0) {
      this.state.rows = this.props.rows ? deepCopy(this.props.rows) : this.defaultRows()
    }

    return (<ReactDataGrid
      enableRowSelect={this.props.rowSelect}
      enableCellSelect={true}
      columns={this.props.columns} // TODO: columns in props?
      rowGetter={this.getRow.bind(this)}
      rowsCount={this.state.rows.length}
      getSubRowDetails={this.getSubRowDetails.bind(this)}
      minHeight={600}
      onGridRowsUpdated={this.gridRowsUpdated.bind(this)}
      onCellExpand={this.onCellExpand.bind(this)} />);
  }
}

DataGrid.propTypes = {
  // Required proptypes
  columns: PropTypes.array.isRequired,
  headerData: PropTypes.object,
  data: PropTypes.object.isRequired,
  rows: PropTypes.array,
  updateRangeValue: PropTypes.func,
  updateRowValue: PropTypes.func,

  // Optional proptypes... possibly for styling
  toolbar: PropTypes.any
};

