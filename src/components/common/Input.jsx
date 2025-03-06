import React from 'react';
import { TextField } from '@mui/material';
import { styled } from '@mui/system';

const CustomInput = styled(TextField)({
  width: '100%',
  margin: '8px 0',
  '& label.Mui-focused': {
    color: '#F68B1F',
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#ddd',
    },
    '&:hover fieldset': {
      borderColor: '#F68B1F',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#F68B1F',
    },
  },
});

const Input = ({ label, type = 'text', ...props }) => {
  return <CustomInput label={label} type={type} variant="outlined" {...props} />;
};

export default Input;
