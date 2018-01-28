import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactDataGrid from 'react-data-grid';

// For now this will offer some basic functionality, while not touching the
// `render` method.
export default class BaseGrid extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      columns: [],
      rows: []
    };
  }

  getRows(i) {
    let row = this.state.rows[i];
    return row;
  }

};

BaseGrid.propTypes = {
  source: PropTypes.string,
};

