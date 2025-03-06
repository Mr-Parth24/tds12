import React from 'react';
import { Card as MuiCard, CardContent, Typography } from '@mui/material';
import { styled } from '@mui/system';

const CustomCard = styled(MuiCard)({
  padding: '16px',
  borderRadius: '12px',
  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.15)',
  },
});

const Card = ({ title, children }) => {
  return (
    <CustomCard>
      <CardContent>
        <Typography variant="h6" fontWeight="bold">
          {title}
        </Typography>
        {children}
      </CardContent>
    </CustomCard>
  );
};

export default Card;
