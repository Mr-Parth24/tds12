import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from '@mui/material/styles';
import theme from './styles/theme';
import GlobalStyles from './styles/globalStyles'; // ✅ Import as a Component
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ThemeProvider theme={theme}>
    <GlobalStyles /> {/* ✅ Use GlobalStyles as a Component */}
    <App />
  </ThemeProvider>
);
