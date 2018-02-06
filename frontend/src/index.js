import './index.css';
import "bootstrap/dist/css/bootstrap.css";
import "font-awesome/css/font-awesome.min.css";

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
  (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  ),
  document.getElementById('root'));

registerServiceWorker();
