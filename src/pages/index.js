import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { ThemeProvider } from '@mui/material/styles';
import theme from './styles/theme';
import { Global } from '@emotion/react';
import globalStyles from './styles/globalStyles';
import './index.css';

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <Global styles={globalStyles} />
    <App />
  </ThemeProvider>,
  document.getElementById('root')
);
