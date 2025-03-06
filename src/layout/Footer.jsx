import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box component="footer" className="footer" sx={{ textAlign: 'center', padding: 2, backgroundColor: '#f5f5f5' }}>
      <Typography variant="body2">
        &copy; {new Date().getFullYear()} TDS API. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;
