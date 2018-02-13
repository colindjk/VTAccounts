import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import ReactDataGrid from 'react-data-grid';

function fetchFromObject(obj, prop) {

    if(typeof obj === 'undefined') {
        return false;
    }

    var _index = prop.indexOf('.')
    if(_index > -1) {
        return fetchFromObject(obj[prop.substring(0, _index)], prop.substr(_index + 1));
    }

    return obj[prop];
}

export default class SubColumnFormatter extends React.Component { 
  shouldComponentUpdate(nextProps: any) {
    return true;
  }

  render() {
    var value = fetchFromObject(
      this.props.dependentValues.row,
      this.props.dependentValues.key);
    return <div title={value}>{value}</div>
  }
}

