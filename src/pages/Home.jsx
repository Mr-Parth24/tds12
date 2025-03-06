// src/pages/Home.jsx
import React, { useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Grid, 
  Paper, 
  Fade,
  useTheme,
  Card,
  CardContent,
  Avatar,
  Divider,
  Stack,
  useMediaQuery,
  Chip
} from '@mui/material';
import { Link } from 'react-router-dom';
import CodeIcon from '@mui/icons-material/Code';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import GroupsIcon from '@mui/icons-material/Groups';
import SupportIcon from '@mui/icons-material/Support';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Animation dependency - you'll need to install this: npm install framer-motion
import { motion } from "framer-motion";

const Home = () => {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'));
  const heroRef = useRef(null);
  
  // Animated stats counters
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const counters = document.querySelectorAll('.counter');
          counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000; // 2 seconds
            const increment = target / (duration / 16); // 60fps
            
            let count = 0;
            const updateCount = () => {
              count += increment;
              if (count < target) {
                counter.innerText = Math.ceil(count).toLocaleString();
                requestAnimationFrame(updateCount);
              } else {
                counter.innerText = target.toLocaleString();
              }
            };
            
            updateCount();
          });
          observer.disconnect();
        }
      });
    }, { threshold: 0.5 });
    
    if (heroRef.current) {
      observer.observe(heroRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  const features = [
    { 
      title: 'No-Code API Management', 
      description: 'Create, modify, and manage APIs without writing a single line of code. Our visual builder makes it simple.',
      icon: <CodeIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
    },
    { 
      title: 'Visual API Playground', 
      description: 'Test and simulate API calls in our intuitive visual interface. See results instantly and iterate quickly.',
      icon: <VisibilityIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
    },
    { 
      title: 'Enterprise Security', 
      description: 'Bank-grade security with role-based access control, audit logs, and encryption for your data and APIs.',
      icon: <SecurityIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
    },
    { 
      title: 'Blazing Fast Performance', 
      description: 'Optimized infrastructure ensures your APIs respond in milliseconds, even under heavy load.',
      icon: <SpeedIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
    },
    { 
      title: 'Team Collaboration', 
      description: 'Work together seamlessly with version control, comments, and real-time updates.',
      icon: <GroupsIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
    },
    { 
      title: '24/7 Support', 
      description: 'Our expert team is available around the clock to help you succeed with your API projects.',
      icon: <SupportIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CTO at TechSolutions",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      quote: "TDS API Management transformed how we build and deploy APIs. What used to take weeks now takes hours."
    },
    {
      name: "Michael Chen",
      role: "Lead Developer at DataFlow",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      quote: "The visual interface is a game-changer. Our non-technical team members can now understand and contribute to API design."
    },
    {
      name: "Jessica Taylor",
      role: "Product Manager at InnovateCorp",
      image: "https://randomuser.me/api/portraits/women/64.jpg",
      quote: "Customer satisfaction has increased by 35% since we started using TDS to manage our client-facing APIs."
    }
  ];
  
  return (
    <Box component="main" sx={{ overflow: 'hidden' }}>
      {/* Hero Section */}
      <Box 
        ref={heroRef}
        sx={{ 
          background: 'linear-gradient(135deg, #F68B1F, #6D6E71)',
          color: 'white',
          position: 'relative',
          pt: { xs: 8, md: 12 },
          pb: { xs: 10, md: 16 },
          overflow: 'hidden'
        }}
      >
        {/* Animated background elements */}
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', zIndex: 0 }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <Box
              key={i}
              component={motion.div}
              initial={{ opacity: 0.5, x: Math.random() * 100 - 50, y: Math.random() * 100 - 50 }}
              animate={{ 
                opacity: [0.7, 0.3, 0.7],
                x: [Math.random() * 100, Math.random() * 100 - 50, Math.random() * 100],
                y: [Math.random() * 100, Math.random() * 100 - 50, Math.random() * 100],
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 10 + Math.random() * 20,
                ease: "easeInOut",
              }}
              sx={{
                position: 'absolute',
                width: 40 + Math.random() * 60,
                height: 40 + Math.random() * 60,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                filter: 'blur(8px)',
              }}
            />
          ))}
        </Box>
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Typography 
                  variant="h1" 
                  fontWeight="bold" 
                  fontSize={{ xs: '2.5rem', md: '3.5rem', lg: '4rem' }}
                  lineHeight={1.2}
                  mb={3}
                >
                  Build APIs Without <br/>
                  <Box component="span" sx={{ 
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: '-10px',
                      left: 0,
                      width: '100%',
                      height: '5px',
                      background: 'white',
                      borderRadius: '10px'
                    }
                  }}>
                    Writing Code
                  </Box>
                </Typography>
                
                <Typography variant="h5" mb={4} fontWeight="normal" sx={{ opacity: 0.9 }}>
                  TDS API Management Interface makes creating, testing, and deploying APIs simple for everyone.
                </Typography>
                
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    component={Link} 
                    to="/register" 
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    sx={{ 
                      fontWeight: 'bold', 
                      px: 4,
                      py: 1.75,
                      fontSize: '1.1rem',
                      borderRadius: '12px',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
                      background: 'white',
                      color: '#333',
                      '&:hover': {
                        background: 'white',
                        transform: 'translateY(-5px)',
                        boxShadow: '0 15px 25px rgba(0,0,0,0.25)',
                      }
                    }}
                  >
                    Get Started Free
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="inherit" 
                    component={Link} 
                    to="/login" 
                    size="large"
                    sx={{ 
                      fontWeight: 'bold', 
                      px: 4,
                      py: 1.75,
                      fontSize: '1.1rem',
                      borderRadius: '12px',
                      borderWidth: 2,
                      '&:hover': {
                        borderWidth: 2,
                        transform: 'translateY(-5px)',
                      }
                    }}
                  >
                    Sign In
                  </Button>
                </Stack>
                
                <Box sx={{ mt: 6, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  <Stack>
                    <Typography className="counter" variant="h3" fontWeight="bold" data-target="5000">
                      0
                    </Typography>
                    <Typography variant="body2">Active Users</Typography>
                  </Stack>
                  <Stack>
                    <Typography className="counter" variant="h3" fontWeight="bold" data-target="25000">
                      0
                    </Typography>
                    <Typography variant="body2">APIs Created</Typography>
                  </Stack>
                  <Stack>
                    <Typography className="counter" variant="h3" fontWeight="bold" data-target="99">
                      0
                    </Typography>
                    <Typography variant="body2">% Uptime</Typography>
                  </Stack>
                </Box>
              </motion.div>
            </Grid>
            
            {isLargeScreen && (
              <Grid item md={5}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  <Box sx={{
                    position: 'relative',
                    width: '100%',
                    height: '400px',
                  }}>
                    <Box 
                      component="img" 
                      src="/api-interface-mockup.png" 
                      alt="API Interface"
                      sx={{
                        width: '120%',
                        height: 'auto',
                        maxWidth: 'none',
                        borderRadius: '10px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                        border: '8px solid rgba(255,255,255,0.1)',
                      }}
                    />
                    
                    {/* NOTE: If you don't have an image, you can replace with a nice illustration or code editor mockup */}
                    {/* This is a fallback if image doesn't exist */}
                    <Box 
                      sx={{ 
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '120%',
                        height: '100%',
                        borderRadius: '10px',
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '5rem',
                        fontWeight: 'bold',
                        color: 'rgba(255,255,255,0.2)',
                      }}
                    >
                      {`</>`}
                    </Box>
                  </Box>
                </motion.div>
              </Grid>
            )}
          </Grid>
        </Container>
      </Box>
      
      {/* Company logos - Add your client logos here */}
      <Container maxWidth="lg">
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom fontWeight="medium">
            Trusted by innovative companies worldwide
          </Typography>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 6 }}>
            {['Company 1', 'Company 2', 'Company 3', 'Company 4', 'Company 5'].map((company, index) => (
              <Box 
                key={index} 
                sx={{ 
                  opacity: 0.6, 
                  filter: 'grayscale(100%)',
                  transition: 'all 0.3s',
                  '&:hover': { opacity: 1, filter: 'grayscale(0%)' }
                }}
              >
                {/* Replace with actual company logos */}
                <Typography variant="h6" fontWeight="bold" color="text.secondary">
                  {company}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Container>

      {/* Features Section */}
      <Box sx={{ py: 10, background: '#f8f9fa' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Chip label="FEATURES" color="primary" sx={{ mb: 2 }} />
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              Everything You Need to Create and Manage APIs
            </Typography>
            <Typography variant="subtitle1" sx={{ maxWidth: 700, mx: 'auto', color: 'text.secondary' }}>
              Our comprehensive platform provides all the tools for the complete API lifecycle
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Paper 
                    sx={{ 
                      p: 4, 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 4, 
                      boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': { 
                        transform: 'translateY(-10px)', 
                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                      }
                    }}
                  >
                    <Box 
                      sx={{ 
                        mb: 2, 
                        p: 1.5, 
                        borderRadius: 2, 
                        width: 'fit-content',
                        background: `${theme.palette.primary.main}10`
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ flexGrow: 1 }}>
                      {feature.description}
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      
      {/* How It Works Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Chip label="PROCESS" color="secondary" sx={{ mb: 2 }} />
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            How TDS API Management Works
          </Typography>
          <Typography variant="subtitle1" sx={{ maxWidth: 700, mx: 'auto', color: 'text.secondary' }}>
            A simple 3-step process to create and deploy your APIs
          </Typography>
        </Box>
        
        <Grid container spacing={4} alignItems="center">
          {[
            { 
              step: '01', 
              title: 'Design Your API', 
              description: 'Use our visual interface to create endpoints, define data models, and set up authentication.'
            },
            { 
              step: '02', 
              title: 'Test and Iterate', 
              description: 'Test your API endpoints in our interactive playground. Make changes instantly with real-time feedback.'
            },
            { 
              step: '03', 
              title: 'Deploy and Monitor', 
              description: 'Deploy with one click to our managed cloud or your own infrastructure. Monitor performance in real-time.'
            }
          ].map((item, index) => (
            <Grid item xs={12} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <Box 
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      borderRadius: '50%',
                      background: theme.palette.primary.main,
                      color: 'white',
                      mb: 3
                    }}
                  >
                    {item.step}
                  </Box>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {item.description}
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
      
      {/* Testimonials Section */}
      <Box sx={{ py: 10, background: '#f8f9fa' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Chip label="TESTIMONIALS" color="primary" sx={{ mb: 2 }} />
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              What Our Customers Say
            </Typography>
            <Typography variant="subtitle1" sx={{ maxWidth: 700, mx: 'auto', color: 'text.secondary' }}>
              Join thousands of satisfied users who have transformed their API development process
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card 
                    sx={{ 
                      height: '100%', 
                      borderRadius: 4, 
                      boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                      transition: 'all 0.3s',
                      '&:hover': { 
                        transform: 'translateY(-10px)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Typography variant="body1" paragraph sx={{ fontStyle: 'italic', mb: 3 }}>
                        "{testimonial.quote}"
                      </Typography>
                      <Divider sx={{ mb: 3 }} />
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          src={testimonial.image} 
                          alt={testimonial.name}
                          sx={{ width: 50, height: 50, mr: 2 }}
                        />
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {testimonial.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {testimonial.role}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      
      {/* CTA Section */}
      <Box 
        sx={{ 
          py: 12,
          background: 'linear-gradient(135deg, #F68B1F, #6D6E71)',
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Ready to Transform Your API Development?
          </Typography>
          <Typography variant="h6" sx={{ mb: 5, opacity: 0.9 }}>
            Join thousands of developers who are already building better APIs, faster.
          </Typography>
          
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={3} 
            justifyContent="center"
          >
            <Button 
              variant="contained"
              component={Link}
              to="/register"
              size="large"
              sx={{
                bgcolor: 'white',
                color: theme.palette.primary.main,
                fontWeight: 'bold',
                px: 5,
                py: 1.75,
                fontSize: '1.1rem',
                borderRadius: '12px',
                '&:hover': {
                  bgcolor: 'white',
                  transform: 'translateY(-5px)',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                }
              }}
            >
              Start Building for Free
            </Button>
            <Button 
              variant="outlined"
              color="inherit"
              component={Link}
              to="/login"
              size="large"
              sx={{
                fontWeight: 'bold',
                px: 5,
                py: 1.75,
                fontSize: '1.1rem',
                borderRadius: '12px',
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  transform: 'translateY(-5px)',
                }
              }}
            >
              Sign In
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;