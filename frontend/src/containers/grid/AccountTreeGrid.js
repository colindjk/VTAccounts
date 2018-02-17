import React from 'react'
import ReactDataGrid from 'react-data-grid'
import { connect } from 'react-redux'

import { FETCH_RECORDS } from 'actions/types'

const columns = [
  {
    key: 'name',
    name: 'Name',
    locked: true,
  },
  {
    key: 'code',
    name: 'Code',
    locked: true,
  },
  {
    key: 'aggregates',
    name: 'Number of Transactables',
    locked: true,
    formatter: ({ value }) => <div>{value.total}</div>
  },
];

function arraySubRows(row, expanded) {
  if (!row.children) {
    return [];
  }
  var subRows = row.children.slice(0); // Shallow copy, avoid modifying children
  for (var i = 0; i < row.children.length; i++) {
    if (expanded[row.children[i].id]) {
      subRows.splice(i + 1, 0, ...arraySubRows(row.children[i], expanded));
    }
  }
  return subRows;
}

function numSubRows(row, expanded) {
  if (!row.children) {
    return 0;
  }
  var num = row.children.length;
  for (var i = 0; i < row.children.length; i++) {
    if (expanded[row.children[i].id]) {
      num += numSubRows(row.children[i], expanded);
    }
  }
  return num;
}

export class AccountTreeGrid extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      expanded: {},
      rows: []
    };
  }

  getRows(i) {
    return this.state.rows[i];
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
    if (this.state.expanded && !this.state.expanded[row.id]) {
      this.state.expanded[row.id] = true;
      this.updateSubRowDetails(row.children, row.treeDepth);
      this.state.rows.splice(this.state.rows.indexOf(row) + 1, 0, ...arraySubRows(row, this.state.expanded));
    } else if (this.state.expanded[row.id]) {
      this.state.expanded[row.id] = false;
      this.state.rows.splice(this.state.rows.indexOf(row) + 1, numSubRows(row, this.state.expanded));
    }
    this.setState(this.state);
  }

  // Called when a cellExpand button is clicked, either adds or removes children
  // based on the rows current state.
  onCellExpand(args) {
    let rows = this.state.rows.slice(0);
    let rowKey = args.rowData.id;
    let rowIndex = rows.indexOf(args.rowData);

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
      this.props.fetch();
      return (<div>Loading...</div>)
    }
    if (this.state.rows.length == 0) { this.state.rows = this.props.rows }
    console.log(this.state.rows)
    return (<ReactDataGrid
      enableCellSelect={true}
      columns={columns} // TODO: columns in props?
      rowGetter={this.getRows.bind(this)}
      rowsCount={this.state.rows.length}
      getSubRowDetails={this.getSubRowDetails.bind(this)}
      minHeight={500}
      onCellExpand={this.onCellExpand.bind(this)} />);
  }
}


function mapDispatchToProps(dispatch) {
  return ({
    fetch: () => {dispatch({ type: FETCH_RECORDS })}
  })
}

function mapStateToProps(state) {
  return ({
      rows: state.records.accounts
  })
}

export default connect(mapStateToProps, mapDispatchToProps)(AccountTreeGrid);

