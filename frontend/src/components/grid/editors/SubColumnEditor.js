import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactDataGrid from 'react-data-grid';

import EditorBase from 'react-data-grid/editors/EditorBase';

export default class SimpleTextEditor extends EditorBase {

  render(): ?ReactElement {
    return (<input ref={(node) => this.input = node} type="text" onBlur={this.props.onBlur} className="form-control" defaultValue={this.props.value} />);
  }
}
