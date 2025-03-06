// src/components/common/ComingSoon.jsx
import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  useTheme, 
  Container,
  Divider
} from '@mui/material';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { Link } from 'react-router-dom';

const ComingSoon = ({ 
  title = "Coming Soon",
  description = "We're working hard to bring you this feature. Stay tuned for updates!",
  icon = null,
  ctaText = "Back to Dashboard",
  ctaLink = "/dashboard",
  releaseDate = null,
  features = []
}) => {
  const theme = useTheme();

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: '16px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
          border: '1px solid rgba(0,0,0,0.05)'
        }}
      >
        {/* Background pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.02,
            background: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'1.5\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'1.5\'/%3E%3C/g%3E%3C/svg%3E")',
            zIndex: 0,
          }}
        />
        
        <Box 
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center', 
            mb: 3,
            p: 1.5,
            borderRadius: '50%',
            backgroundColor: `${theme.palette.primary.main}10`,
            color: theme.palette.primary.main,
            position: 'relative',
            zIndex: 1
          }}
        >
          {icon || <NewReleasesIcon sx={{ fontSize: 48 }} />}
        </Box>
        
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          fontWeight="bold"
          sx={{ position: 'relative', zIndex: 1 }}
        >
          {title}
        </Typography>
        
        <Typography 
          variant="body1" 
          color="text.secondary" 
          paragraph
          sx={{ 
            position: 'relative', 
            zIndex: 1,
            maxWidth: '600px',
            mx: 'auto',
            mb: 3
          }}
        >
          {description}
        </Typography>
        
        {releaseDate && (
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 1, 
              mb: 3,
              zIndex: 1,
              position: 'relative'
            }}
          >
            <NotificationsActiveIcon color="primary" sx={{ fontSize: 20 }} />
            <Typography variant="subtitle2" fontWeight="medium">
              Estimated Release: {releaseDate}
            </Typography>
          </Box>
        )}
        
        {features.length > 0 && (
          <Box sx={{ mt: 4, position: 'relative', zIndex: 1 }}>
            <Divider sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Planned Features
              </Typography>
            </Divider>
            
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 1,
                maxWidth: '400px',
                mx: 'auto',
                mb: 4
              }}
            >
              {features.map((feature, index) => (
                <Box 
                  key={index}
                  sx={{ 
                    p: 1.5,
                    borderRadius: '8px',
                    backgroundColor: index % 2 === 0 ? 'rgba(0,0,0,0.02)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}
                >
                  {feature.icon || <NewReleasesIcon color="primary" fontSize="small" />}
                  <Typography variant="body2">{feature.text}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
        
        <Button 
          component={Link} 
          to={ctaLink}
          variant="contained" 
          color="primary"
          size="large"
          sx={{ 
            mt: 2,
            position: 'relative',
            zIndex: 1,
            px: 4,
            py: 1.5,
            borderRadius: '8px',
            boxShadow: theme.shadows[3],
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: theme.shadows[6],
            }
          }}
        >
          {ctaText}
        </Button>
      </Paper>
    </Container>
  );
};

export default ComingSoon;