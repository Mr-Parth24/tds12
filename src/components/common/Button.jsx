import React from 'react';
import { Button as MuiButton } from '@mui/material';
import { styled } from '@mui/system';

const CustomButton = styled(MuiButton)(({ theme }) => ({
  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: '#fff',
  fontSize: '1rem',
  fontWeight: 'bold',
  textTransform: 'none',
  padding: '12px 20px',
  borderRadius: '8px',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.05)',
    filter: 'brightness(1.1)',
  },
  '&:active': {
    transform: 'scale(0.98)',
  },
}));

const Button = ({ children, ...props }) => {
  return <CustomButton {...props}>{children}</CustomButton>;
};

export default Button;
