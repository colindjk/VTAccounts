import ReactDataGrid from 'react-data-grid'
import PropTypes from 'prop-types';

// With the customizable context, all range data will in some sense be an
// "AccountTable".

// This will be the dumb part of the AccountGrid which just takes in props 
// and displays the data it's given.
export default class AccountGrid extends React.Component {

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

  handleGridRowsUpdated({ fromRow, toRow, updated }) {
    let rows = this.state.rows.slice();

    for (let i = fromRow; i <= toRow; i++) {
      let row = this.getRow(rows[i]);
      for (var key in updated) {
        console.log(updated[key])
        console.log(key, row[key])
      }

    }
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
      rowGetter={this.getRow.bind(this)}
      rowsCount={this.state.rows.length}
      getSubRowDetails={this.getSubRowDetails.bind(this)}
      minHeight={1000}
      onGridRowsUpdated={this.props.handleGridRowsUpdated}
      onCellExpand={this.onCellExpand.bind(this)} />);
    return (<div>No</div>)
  }
}

AccountGrid.propTypes = {
  // Required proptypes.
  columns: PropTypes.array.isRequired,
  rows: PropTypes.array.isRequired,
  data: PropTypes.object.isRequired,
  handleGridRowsUpdated: PropTypes.func,

  // 
  //
};

