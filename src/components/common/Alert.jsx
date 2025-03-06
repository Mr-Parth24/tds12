import React from 'react';
import { Snackbar, Alert as MuiAlert } from '@mui/material';

const Alert = ({ message, severity, open, onClose }) => {
  return (
    <Snackbar open={open} autoHideDuration={3000} onClose={onClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
      <MuiAlert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </MuiAlert>
    </Snackbar>
  );
};

export default Alert;
